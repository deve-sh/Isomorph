import React from "react";

const Component = () => {
	return <>Component rendered as trial page.</>;
};

export const getComponentMeta = () => {
	// Todo: Add link tags, script tags handling for this as well.
	return { title: "Hey there Sample page!" };
};

export default Component;
