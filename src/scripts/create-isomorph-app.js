#!/usr/bin/env node

const { execSync } = require("child_process");
const fs = require("fs");

function generateError(errorMessage) {
	console.error(errorMessage);
	return process.exit(1);
}

const packageJSONContent = (appName = "") => `{
	"name": "${appName.replace(/\s/g, "_").toLowerCase()}",
	"version": "1.0.0",
	"description": "A project created using Isomorph.",
	"main": "src/pages/index.jsx",
	"scripts": {
	  "dev": "isomorph-web dev",
	  "build": "isomorph-web build",
	  "start": "isomorph-web start"
	},
	"dependencies": {
		"isomorph-web": "^1.3.0"
	},
	"keywords": [],
	"author": "",
	"license": "UNLICENSED"
}`;

const filesToGenerate = [
	{
		name: ".gitignore",
		content: "node_modules\n.env\n.isomorph\n",
	},
	{
		name: "package.json",
		content: ({ appName }) => packageJSONContent(appName),
	},
	{
		name: "src/pages/index.md",
		requiresFolders: ["src", "src/pages"],
		content: ({
			appName,
		}) => `const IndexPage = () => <>Index page for ${appName}</>;

export default IndexPage;`,
	},
];

function generateIsomorphProject() {
	let directoryName = process.argv[2];
	const appName = process.argv[3] || "isomorph-boilerplate";

	if (!directoryName)
		return generateError(
			`Error: Please provide a directory name as the first command line argument.\n` +
				`Example: npx create-isomorph-project directory-name\n`
		);

	directoryName = directoryName.replace("./", "");

	// Create directory for project
	const directory = `./${directoryName}`;

	if (fs.existsSync(directory))
		return generateError(
			"A directory with the specified name already exists. Please remove it first."
		);

	fs.mkdirSync(directory);
	// Write pre-requisite files to the directory.
	for (let file of filesToGenerate) {
		if (file.requiresFolders && file.requiresFolders.length) {
			for (let folder of file.requiresFolders)
				fs.mkdirSync(`${directory}/${folder}`);
		}
		fs.writeFileSync(
			`${directory}/${file.name}`,
			typeof file.content === "function"
				? file.content({ appName, directory })
				: file.content
		);
	}
	execSync(`cd ${directory} && npm install && git init && cd ../`, {
		stdio: "inherit",
	});
	console.log("Successfully generated isomorph project.");
}

generateIsomorphProject();
