import { existsSync } from "fs-extra";

const pageFileExists = async (pageFilePath) => {
	const pageFilePossibleNames = [
		`${pageFilePath}.js`,
		`${pageFilePath}.ts`,
		`${pageFilePath}.jsx`,
		`${pageFilePath}.tsx`,
	];

	const checkForFileExistence = (filePath) =>
		new Promise((resolve) => resolve(existsSync(filePath)));

	return (
		await Promise.all(pageFilePossibleNames.map(checkForFileExistence))
	).some((exists) => exists);
};

export default pageFileExists;
