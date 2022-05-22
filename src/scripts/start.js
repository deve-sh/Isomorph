const startCommand = () => {
	const { execSync } = require("child_process");
	const { resolve } = require("path");
	execSync(`node ${resolve(process.cwd(), "./.isomorph/server.js")}`, {
		stdio: "inherit",
	});
};
module.exports = startCommand;
