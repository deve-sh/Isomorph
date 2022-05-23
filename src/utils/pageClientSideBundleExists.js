const fs = require("fs-extra");

const pageClientSideBundleExists = (pageImportPath) => {
	try {
		return fs.existsSync(`.isomorph/page-chunks/${pageImportPath}.js`);
	} catch {
		return false;
	}
};

export default pageClientSideBundleExists;
