import { resolve } from "path";

const getErrorComponent = async () => {
	try {
		const { default: ErrorComponent } = await import(
			resolve(process.cwd(), "./src/pages/_error")
		);
		return ErrorComponent;
	} catch {
		return null; // No error component present.
	}
};

export default getErrorComponent;
