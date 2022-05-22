import useInitialData from "../hooks/useInitialData";

const Component = () => {
	const { a, url } = useInitialData();

	return (
		<>
			Props passed from Server: {a} at URL: {url}
		</>
	);
};

export const getPropsOnServer = ({ url }) => {
	return { a: 5, url };
};

export const getPageMeta = () => {
	return {
		title: "Home Page",
		meta: [
			{
				name: "description",
				content: "A simple page generated on the server-side.",
			},
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1.0",
			},
		],
		links: [
			{
				rel: "stylesheet",
				href: "https://cdn.jsdelivr.net/npm/bootstrap@4.3.1/dist/css/bootstrap.min.css",
			},
		],
		scripts: [
			{
				type: "application/ld+json",
				content: '{ type: "entity" }',
			},
		],
	};
};

export default Component;
