import React from "react";
import useInitialData from "../hooks/useInitialData";

const Component = () => {
	const { a, url } = useInitialData();

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
