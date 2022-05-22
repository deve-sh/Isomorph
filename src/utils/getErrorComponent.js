const getErrorComponent = async () => {
	try {
		const { default: ErrorComponent } = await import("../pages/_error");
		return ErrorComponent;
	} catch {
		return null; // No error component present.
	}
};

export default getErrorComponent;
