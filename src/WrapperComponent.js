import React from "react";

const WrapperComponent = ({ Component, pageProps }) => {
	// On server side: This component simply passes pageProps to the component
	// On client-side: While rendering this component picks up the pageprops from the script tag and passes it to the component.
	return <Component {...pageProps} />;
};

export default WrapperComponent;
