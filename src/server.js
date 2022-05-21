import express from "express";
import React from "react";
import ReactDOM from "react-dom/server";
import cookieParser from "cookie-parser";

// Compilation dependencies, preloaded for faster builds
import WrapperComponent from "./WrapperComponent";
import streamToString from "./utils/streamToString";
import getClientSideHydrationCode from "./utils/clientSideHydrationCode";
import generateServerSideContext from "./utils/generateServerSideContext";

const browserify = require("browserify");
const tinyify = require("tinyify");
const { transform: compileES6Code } = require("@babel/core");
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
		const {
			default: ComponentDefault, // The React component
			getPropsOnServer = nullFunction,
			getComponentMeta = nullFunction,
		} = ComponentExports;
		const context = generateServerSideContext(req, res);
		let [initialProps, componentMeta] = await Promise.all([
			getPropsOnServer(context),
			getComponentMeta(context),
		]);
		const componentOutput = ReactDOM.renderToString(
			<WrapperComponent
				Component={ComponentDefault}
				pageMetaData={componentMeta}
				pageProps={initialProps}
			/>
		);

		const clientSideHydrationCode = getClientSideHydrationCode(
			pageImportPath,
			initialProps
		);
		const { code: compiledClientSideHydrationCode } = compileES6Code(
			clientSideHydrationCode
		);

		let browserifyInstance = browserify();

		if (process.env.NODE_ENV === "production") {
			// Tree shaking and minification + bundling of modules in production mode.
			browserifyInstance = browserifyInstance.plugin(tinyify);
		}

		const pageBundle = browserifyInstance
			.add(compileCodeToStream(compiledClientSideHydrationCode))
			.bundle();
		const bundleString = await streamToString(pageBundle);

		res.send(`
			<html>
				<head>
					<title>${componentMeta?.title || "App Rendered By Isomorph"}</title>
					<script type="isomorph/data">${JSON.stringify(initialProps)}</script>
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
		`);
	} catch (err) {
		console.log(err);
		// Todo: Add default _error component page for handling 500 errors too.
		return res.sendStatus(500);
	}
});

app.listen(5000, () => {
	console.log(`app is listening to port 5000`);
});
