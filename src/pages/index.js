import React from "react";

const Component = ({ a, url }) => {
	return (
		<>
			Props passed from Server: {a} at URL: {url}
		</>
	);
};

export const getPropsOnServer = ({ url }) => {
	return { a: 5, url };
};

export default Component;
