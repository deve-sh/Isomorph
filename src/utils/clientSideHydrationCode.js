const getClientSideHydrationCode = (pageImportPath) => `
    import React from 'react';
    import ReactDOM from 'react-dom/client';

    window.React = React;
    
    import WrapperComponent from './node_modules/isomorph-web/package/WrapperComponent';
    import PageComponent from './.isomorph/${pageImportPath}';
    
    // Can use hydrate as well, but I want to keep the DOM on the client side fresh to remove any rendering inconsistencies that could creep in.
    const rootElement = document.getElementById("isomorph_root");
    const root = ReactDOM.createRoot(rootElement);
    root.render(<WrapperComponent Component={PageComponent} />);
`;

export default getClientSideHydrationCode;
