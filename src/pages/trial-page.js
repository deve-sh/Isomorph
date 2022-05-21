import React from "react";

const Component = ({ url }) => {
	return <>Component rendered at URL: {url}</>;
};

export const getComponentMeta = () => {
	// Todo: Add link tags, script tags handling for this as well.
	return { title: "Hey there Sample page!" };
};

export default Component;
