const processPublicEnvVars = () => {
	const envList = {};
	for (let key in process.env) {
		if (process.env.hasOwnProperty(key))
			if (key.startsWith("ISOMORPH_PUBLIC_")) envList[key] = process.env[key];
	}
	return envList;
};

export default processPublicEnvVars;
