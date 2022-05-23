const generateServerSideContext = (req, res, isStaticPage = false) => {
	if (isStaticPage) return { env: process.env, url: req.url };
	return {
		req,
		res,
		cookies: req.cookies,
		url: req.url,
		query: req.query,
		params: req.params,
		env: process.env,
	};
};

export default generateServerSideContext;
