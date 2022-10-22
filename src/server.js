import { config } from "dotenv";
config(); // Read and ready environment variables

import express from "express";
import React from "react";
import { renderToString } from "react-dom/server";
import cookieParser from "cookie-parser";
import { outputFile, readFileSync } from "fs-extra";
import { resolve } from "path";

global.React = React; // To be in scope by default for all pages. Without having to import React each time.

// Compilation dependencies, preloaded for faster builds
import WrapperComponent from "./WrapperComponent";
import streamToString from "./utils/streamToString";
import getClientSideHydrationCode from "./utils/clientSideHydrationCode";
import generateServerSideContext from "./utils/generateServerSideContext";
import shouldStaticPageRevalidate from "./utils/staticPageCache";
import generatePageMetaHTML from "./utils/generatePageMetaHTML";
import pageClientSideBundleExists from "./utils/pageClientSideBundleExists";
import writeClientSidePageBundle from "./utils/writeClientSidePageBundle";
import processPublicEnvVars from "./utils/processPublicEnvVars";
import pageFileExists from "./utils/pageFileExists";

const babelConfig = require("../babel.config.json");

const browserify = require("browserify");
const tinyify = require("tinyify");
const envify = require("envify/custom");
const compileCodeToStream = require("string-to-stream");

const app = express();

const nullFunction = () => ({});

app.use(cookieParser());

const isProd = process.env.NODE_ENV === "production";
const isDev = !isProd;

app.use(
	"/chunks",
	express.static(resolve(process.cwd(), "./.isomorph/page-chunks"))
);

app.all("*", async (req, res) => {
	const pageRoute = req.url;
	const pageImportPath = `pages${
		pageRoute.endsWith("/") ? pageRoute + "index" : pageRoute
	}`;
	// Send 404 response if page file does not exist.
	const pageRelativePath = resolve(
		process.cwd(),
		`./.isomorph/${pageImportPath}`
	);
	const pageFilePresent = await pageFileExists(pageRelativePath);
	if (!pageFilePresent) {
		const { default: errorResponse } = await import(
			"./utils/sendBackErrorResponse"
		);
		return errorResponse(res, 404, "Page Not Found");
	}
	try {
		const ComponentExports = await import(pageRelativePath);

		// Handling API Routes
		if (pageRoute.startsWith("/api")) {
			const APIController = ComponentExports.default;
			if (!APIController)
				return errorResponse(res, 404, "No API Controller provided");
			return APIController(req, res);
		}

		const isStaticPage =
			!ComponentExports.getPropsOnServer || ComponentExports.getStaticProps;
		if (isStaticPage && isProd) {
			try {
				// Follow the Stale-While-Revalidate approach, serve the static HTML saved first.
				// Then later on, create the page and store the HTML back to the cache.
				const cachedHtmlContentForStaticPage = readFileSync(
					resolve(
						process.cwd(),
						`./.isomorph/staticpages/${pageImportPath}.html`
					),
					{ encoding: "utf-8" }
				);
				res.send(cachedHtmlContentForStaticPage);
			} catch {}
		}

		const {
			default: ComponentDefault, // The React component
			getPropsOnServer = nullFunction,
			getStaticProps = nullFunction,
			getPageMeta = nullFunction,
		} = ComponentExports;
		const context = generateServerSideContext(req, res, isStaticPage);
		let [initialProps, componentMeta, staticProps] = await Promise.all([
			getPropsOnServer(context),
			getPageMeta(context),
			getStaticProps(context),
		]);

		const shouldRunRestOfTheCode =
			!isStaticPage || isDev
				? true
				: shouldStaticPageRevalidate(
						req.url,
						staticProps?.revalidate || Infinity
				  );

		if (!shouldRunRestOfTheCode) return;

		const initialData = isStaticPage ? staticProps : initialProps;
		const componentOutput = renderToString(
			<WrapperComponent Component={ComponentDefault} pageProps={initialData} />
		);

		// Time to generate the client-side bundle required to rehydrate/re-render the app on the client-side.
		let clientSideBundleString;
		if (isProd) {
			// On Prod, check if there already exists a prebuilt page bundle.
			// In case it does, there's no need to generate a new bundle for the page on each request.
			const alreadyBuiltPageBundle = pageClientSideBundleExists(pageImportPath);
			if (alreadyBuiltPageBundle) clientSideBundleString = true;
		}

		if (!clientSideBundleString) {
			const clientSideHydrationCode =
				getClientSideHydrationCode(pageImportPath);
			let browserifyInstance = browserify()
				.transform("babelify", {
					presets: babelConfig.presets,
					comments: babelConfig.comments,
				})
				.transform(envify({ NODE_ENV: process.env.NODE_ENV }));

			if (isProd) {
				// Tree shaking and minification + bundling of modules in production mode.
				browserifyInstance = browserifyInstance.plugin(tinyify);
			}

			const pageBundle = browserifyInstance
				.add(compileCodeToStream(clientSideHydrationCode))
				.bundle();
			clientSideBundleString = await streamToString(pageBundle);
			writeClientSidePageBundle(pageImportPath, clientSideBundleString);
		}

		const pageHTMLGenerated = `
			<html>
				<head>
					<title>${componentMeta?.title || "App Rendered By Isomorph"}</title>
					<script type="isomorph/data">${JSON.stringify(initialData)}</script>
					${generatePageMetaHTML(componentMeta || {})}
				</head>
				<body>
					<div id="isomorph_root">
						${componentOutput}
					</div>
					<!-- Public environment and browser variables to use later on the client-side if needed -->
					<script type="text/javascript">
						window.process = { 
							browser: true, 
							env: ${JSON.stringify(processPublicEnvVars())} 
						};
					</script>
					<!-- Client Side Rehydration Chunk for the page -->
					<script type="text/javascript" src="/chunks/${pageImportPath}.js"></script>
				</body>
			</html>
		`;

		if (isStaticPage) {
			// Write new HTML generated for this page to cache.
			outputFile(
				resolve(
					process.cwd(),
					`./.isomorph/staticpages/${pageImportPath}.html`
				),
				pageHTMLGenerated
			);
		}
		if (!res.headersSent) return res.send(pageHTMLGenerated);
	} catch (err) {
		if (res.headersSent) return;

		const { default: errorResponse } = await import(
			"./utils/sendBackErrorResponse"
		);
		return errorResponse(res, 500, err.message);
	}
});

const PORT = process.env.PORT || 5432;

app.listen(PORT, () => {
	console.log(`app is listening to port ${PORT}`);
});
