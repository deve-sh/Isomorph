const startCommand = () => {
	const { execSync } = require("child_process");
	execSync(`node ./node_modules/isomorph-web/package/server.js`, {
		stdio: "inherit",
	});
};
module.exports = startCommand;
