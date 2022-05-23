const generateServerSideContext = (req, res) => {
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
