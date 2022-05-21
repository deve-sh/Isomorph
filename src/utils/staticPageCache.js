const staticPagesRevalidationCache = {
	// [path] -> lastRevalidation
};

/**
 * Function to check whether a static page should revalidate or not. Also updates the cache entry for the specified path.
 * @param {String} path : URL/pathname of the static page
 * @param {Number} revalidationInterval : Revalidation Interval in seconds for the static page.
 * @returns {Boolean} Whether the page should revalidate or not.
 */
const shouldPageRevalidate = (path, revalidationInterval) => {
	let pageEntryInCache = staticPagesRevalidationCache[path];
	if (!pageEntryInCache) {
		staticPagesRevalidationCache[path] = new Date();
		return true; // Has to be revalidated and cached
	}
	const now = new Date().getTime();
	if ((now - pageEntryInCache[path].getTime()) / 1000 > revalidationInterval) {
		// Time since last revalidation is more than the revalidation interval
		staticPagesRevalidationCache[path] = new Date(now);
		return true;
	}
	return false; // No revalidation needed yet.
};

export default shouldPageRevalidate;
