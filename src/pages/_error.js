import React from "react";

const ErrorComponent = ({ statusCode, error }) => {
	return (
		<>
			<h4>{statusCode}</h4>
			<br />
			{error}
		</>
	);
};

export default ErrorComponent;
