const devCommand = () => {
	const { execSync } = require("child_process");
	const runConcurrently = "concurrently";
	const compileWithBabel = "babel --watch ./src --out-dir ./.isomorph";
	const runNodemon = "nodemon ./.isomorph/server.js";
	execSync(`${runConcurrently} "${compileWithBabel}" "${runNodemon}"`, {
		stdio: "inherit",
	});
};
module.exports = devCommand;
