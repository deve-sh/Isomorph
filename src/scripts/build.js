const buildCommand = () => {
	const { execSync } = require("child_process");
	execSync("babel ./src --out-dir ./.isomorph", { stdio: "inherit" });
};
module.exports = buildCommand;
