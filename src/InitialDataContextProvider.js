import React, { createContext, useRef } from "react";

export const InitialDataContext = createContext({});

const InitialDataContextProvider = ({ initialProps, children }) => {
	let initialData = useRef({ ...(initialProps || {}) });

	if (!initialProps && typeof window !== "undefined") {
		try {
			// On the client, read from the script tag created on the server side with initial props.
			const dataScriptTag = document.querySelector(
				'script[type="isomorph/data"]'
			);
			if (dataScriptTag)
				initialData.current = JSON.parse(dataScriptTag.innerHTML);
		} catch {
			console.error(
				"Invalid data passed from the server, please check your data loader hooks or file a bug."
			);
		}
	}

	return (
		<InitialDataContext.Provider value={initialData.current}>
			{children}
		</InitialDataContext.Provider>
	);
};

export default InitialDataContextProvider;
