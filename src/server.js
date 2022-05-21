import express from "express";
import React from "react";
import ReactDOM from "react-dom/server";
import WrapperComponent from "./WrapperComponent";

const app = express();

const nullFunction = () => ({});

app.get("*", async (req, res) => {
	const pageRoute = req.url;
	const pageImportPath = `./pages${
		pageRoute.endsWith("/")
			? pageRoute.slice(0, pageRoute.length - 1)
			: pageRoute
	}`;
	let ComponentExports;
	try {
		ComponentExports = await import(pageImportPath);
	} catch {
		// Todo: Add _error or default component file for 404 errors.
		return res.sendStatus(404);
	}
	try {
		const {
			default: ComponentDefault, // The React component
			getPropsFromServerForComponent = nullFunction,
			getComponentMeta = nullFunction,
		} = ComponentExports;
		const context = { url: req.url, req, res };
		let [initialProps, componentMeta] = await Promise.all([
			getPropsFromServerForComponent(context),
			getComponentMeta(context),
		]);
		const componentOutput = ReactDOM.renderToString(
			<WrapperComponent
				Component={ComponentDefault}
				pageMetaData={componentMeta}
				pageProps={initialProps}
			/>
		);
		res.send(`
			<html>
				<head>
					<title>${componentMeta?.title || "App Rendered By Isomorph"}</title>
					<script id="isomorph-data">${JSON.stringify(initialProps)}</script>
				</head>
				<body>
					${componentOutput}
				</body>
			</html>
		`);
	} catch {
		// Todo: Add default _error component page for handling 500 errors too.
		return res.sendStatus(500);
	}
});

app.listen(5000, () => {
	console.log(`app is listening to port 5000`);
});
