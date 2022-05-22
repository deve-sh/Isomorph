import React from "react";
import ReactDOMServer from "react-dom/server";

const sendBackErrorResponse = async (res, statusCode, error) => {
	const { default: getErrorComponent } = await import("./getErrorComponent");
	const DefaultErrorComponent = () => (
		<>
			<b>{statusCode}</b> | {error}
		</>
	);
	const ErrorComponent = (await getErrorComponent()) || DefaultErrorComponent;
	return res
		.status(statusCode)
		.send(
			ReactDOMServer.renderToString(
				<ErrorComponent error={error} statusCode={statusCode} />
			)
		);
};

export default sendBackErrorResponse;
