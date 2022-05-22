import express from "express";
import React from "react";
import { renderToString } from "react-dom/server";
import cookieParser from "cookie-parser";
import { outputFile, readFileSync } from "fs-extra";

// Compilation dependencies, preloaded for faster builds
import WrapperComponent from "./WrapperComponent";
import streamToString from "./utils/streamToString";
import getClientSideHydrationCode from "./utils/clientSideHydrationCode";
import generateServerSideContext from "./utils/generateServerSideContext";
import shouldStaticPageRevalidate from "./utils/staticPageCache";

const babelConfig = require("../babel.config.json");

const browserify = require("browserify");
const tinyify = require("tinyify");
const compileCodeToStream = require("string-to-stream");

const app = express();

const nullFunction = () => ({});

app.use(cookieParser());

app.get("*", async (req, res) => {
	const pageRoute = req.url;
	const pageImportPath = `pages${
		pageRoute.endsWith("/") ? pageRoute + "index" : pageRoute
	}`;
	let ComponentExports;
	try {
		ComponentExports = await import(`./${pageImportPath}`);
	} catch {
		// Todo: Add _error or default component file for 404 errors.
		return res.sendStatus(404);
	}
	try {
		const isStaticPage =
			!ComponentExports.getPropsOnServer || ComponentExports.getStaticProps;
		if (isStaticPage) {
			try {
				// Follow the Stale-While-Revalidate approach, serve the static HTML saved first.
				// Then later on, create the page and store the HTML back to the cache.
				const cachedHtmlContentForStaticPage = readFileSync(
					`./dist/staticpages/${pageImportPath}.html`,
					{ encoding: "utf-8" }
				);
				res.send(cachedHtmlContentForStaticPage);
			} catch {}
		}

		const {
			default: ComponentDefault, // The React component
			getPropsOnServer = nullFunction,
			getStaticProps = nullFunction,
			getComponentMeta = nullFunction,
		} = ComponentExports;
		const context = generateServerSideContext(req, res);
		let [initialProps, componentMeta, staticProps] = await Promise.all([
			getPropsOnServer(context),
			getComponentMeta(context),
			getStaticProps(context),
		]);

		const shouldRunRestOfTheCode = !isStaticPage
			? true
			: shouldStaticPageRevalidate(
					req.url,
					staticProps?.revalidate || Infinity
			  );

		if (!shouldRunRestOfTheCode) return;

		const initialData = isStaticPage ? staticProps : initialProps;
		const componentOutput = renderToString(
			<WrapperComponent
				Component={ComponentDefault}
				pageMetaData={componentMeta}
				pageProps={initialData}
			/>
		);

		const clientSideHydrationCode = getClientSideHydrationCode(pageImportPath);
		let browserifyInstance = browserify().transform("babelify", {
			presets: babelConfig.presets,
			comments: babelConfig.comments,
		});

		if (process.env.NODE_ENV === "production") {
			// Tree shaking and minification + bundling of modules in production mode.
			browserifyInstance = browserifyInstance.plugin(tinyify);
		}

		const pageBundle = browserifyInstance
			.add(compileCodeToStream(clientSideHydrationCode))
			.bundle();
		const bundleString = await streamToString(pageBundle);

		const pageHTMLGenerated = `
			<html>
				<head>
					<title>${componentMeta?.title || "App Rendered By Isomorph"}</title>
					<script type="isomorph/data">${JSON.stringify(initialData)}</script>
				</head>
				<body>
					<div id="isomorph_root">
						${componentOutput}
					</div>
					<script type="text/javascript">
						${bundleString}
					</script>
				</body>
			</html>
		`;

		if (isStaticPage) {
			// Write new HTML generated for this page to cache.
			outputFile(
				`./dist/staticpages/${pageImportPath}.html`,
				pageHTMLGenerated
			);
		}
		if (!res.headersSent) return res.send(pageHTMLGenerated);
	} catch {
		// Todo: Add default _error component page for handling 500 errors too.
		if (!res.headersSent) return res.sendStatus(500);
	}
});

app.listen(5000, () => {
	console.log(`app is listening to port 5000`);
});
