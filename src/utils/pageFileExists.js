import { existsSync } from "fs-extra";

const pageFileExists = async (pageFilePath) => {
	let pageFilePossibleNames = [
		`${pageFilePath}.js`,
		`${pageFilePath}.ts`,
		`${pageFilePath}.jsx`,
		`${pageFilePath}.tsx`,
	];

	if (!pageFilePath.endsWith("/"))
		pageFilePossibleNames = [
			...pageFilePossibleNames,
			`${pageFilePath}/index.js`,
			`${pageFilePath}/index.ts`,
			`${pageFilePath}/index.jsx`,
			`${pageFilePath}/index.tsx`,
		];

	const checkForFileExistence = (filePath) =>
		new Promise((resolve) => resolve(existsSync(filePath)));

	return (
		await Promise.all(pageFilePossibleNames.map(checkForFileExistence))
	).some((exists) => exists);
};

export default pageFileExists;
