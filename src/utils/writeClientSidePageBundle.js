const fs = require("fs-extra");
const { resolve } = require("path");

const writePageBundle = (pageImportPath, bundle) => {
	try {
		fs.outputFileSync(
			resolve(process.cwd(), `./.isomorph/page-chunks/${pageImportPath}.js`),
			bundle
		);
		return true;
	} catch (err) {
		console.log(err);
		return false;
	}
};

export default writePageBundle;
