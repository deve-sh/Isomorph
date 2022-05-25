const devCommand = () => {
	const { execSync } = require("child_process");
	const packageBase = "./node_modules/isomorph-web";
	const runConcurrently = "concurrently";
	const compileWithBabel = `babel --config-file ${packageBase}/babel.config.json --watch ./src --out-dir ./.isomorph`;
	const runNodemon = `nodemon ${packageBase}/package/server.js`;
	execSync(`${runConcurrently} "${compileWithBabel}" "${runNodemon}"`, {
		stdio: "inherit",
	});
};
module.exports = devCommand;
