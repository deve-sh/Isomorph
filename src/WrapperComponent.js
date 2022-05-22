import InitialDataContextProvider from "./InitialDataContextProvider";

const WrapperComponent = ({ Component, pageProps }) => {
	// On server side: This component simply passes pageProps to the component
	// On client-side: While rendering this component picks up the pageprops from the script tag and passes it to the component.
	return (
		<InitialDataContextProvider initialProps={pageProps}>
			<Component />
		</InitialDataContextProvider>
	);
};

export default WrapperComponent;
