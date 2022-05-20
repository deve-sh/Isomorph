import express from "express";
import React from "react";
import ReactDOM from "react-dom/server";
import WrapperComponent from "./WrapperComponent";
import * as ComponentExports from "./ReactComponent";

const app = express();

app.get("*", async (req, res) => {
	const ComponentDefault = ComponentExports.default; // The React component
	const getPropsFromServerForComponent = ComponentExports.getPropsOnServer;
	let initialProps = {};
	if (getPropsFromServerForComponent) {
		initialProps =
			(await getPropsFromServerForComponent({ url: req.url })) || {};
	}
	const componentOutput = ReactDOM.renderToString(
		<WrapperComponent Component={ComponentDefault} pageProps={initialProps} />
	);
	res.send(`
	<html>
		<head>
			<title>App Rendered By Isomorph</title>
			<script id="isomorph-data">${JSON.stringify(initialProps)}</script>
		</head>
		<body>
			${componentOutput}
		</body>
	</html>`);
});

app.listen(5000, () => {
	console.log(`app is listening to port 5000`);
});
