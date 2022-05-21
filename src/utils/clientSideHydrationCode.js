const getClientSideHydrationCode = (pageImportPath, initialProps) => `
    import React from 'react';
    import ReactDOM from 'react-dom/client';
    import WrapperComponent from './dist/WrapperComponent';
    import PageComponent from './dist/${pageImportPath}';
    
    const rootElement = document.getElementById("isomorph_root");
    ReactDOM.hydrateRoot(
        rootElement, 
        <WrapperComponent 
            pageProps={${JSON.stringify(initialProps)}} 
            Component={PageComponent} 
        />
    );
`;

export default getClientSideHydrationCode;
