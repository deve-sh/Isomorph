const fs = require("fs-extra");

const writePageBundle = (pageImportPath, bundle) => {
	try {
		fs.outputFileSync(`.isomorph/page-chunks/${pageImportPath}.js`, bundle);
		return true;
	} catch (err) {
		console.log(err);
		return false;
	}
};

export default writePageBundle;
