const buildCommand = () => {
	const { execSync } = require("child_process");
	execSync(
		`babel ${resolve(process.cwd(), "./src")} --out-dir ${resolve(
			process.cwd(),
			"./.isomorph"
		)}" "nodemon ${resolve(process.cwd(), "./.isomorph/server.js")}`,
		{ stdio: "inherit" }
	);
};
module.exports = buildCommand;
