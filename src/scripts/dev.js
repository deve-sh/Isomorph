const devCommand = () => {
	const { execSync } = require("child_process");
	const { resolve } = require("path");
	execSync(
		`concurrently "babel --watch ${resolve(
			process.cwd(),
			"./src"
		)} --out-dir ${resolve(process.cwd(), "./.isomorph")}" "nodemon ${resolve(
			process.cwd(),
			"./.isomorph/server.js"
		)}"`,
		{ stdio: "inherit" }
	);
};
module.exports = devCommand;
