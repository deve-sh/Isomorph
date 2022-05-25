const startCommand = () => {
	const { execSync } = require("child_process");
	const packageBase = "./node_modules/isomorph-web";
	execSync(`node ${packageBase}/package/server.js`, {
		stdio: "inherit",
	});
};
module.exports = startCommand;
