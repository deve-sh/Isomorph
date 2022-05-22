const generateAttributesHTML = (entity) => {
	let attributeHTML = "";
	for (let attribute of Object.keys(entity)) {
		attributeHTML += `${attribute}="${entity[attribute]}"`;
	}
	return attributeHTML;
};

const generatePageMetaHTML = (pageMeta = {}) => {
	const metaTags = pageMeta?.meta || [];
	const linkTags = pageMeta?.links || [];
	const scriptTags = pageMeta?.scripts || [];

	let generatedHTML = "";

	for (let i = 0; i < metaTags.length; i++)
		generatedHTML += `<meta ${generateAttributesHTML(metaTags[i])} />`;

	for (let i = 0; i < linkTags.length; i++)
		generatedHTML += `<link ${generateAttributesHTML(linkTags[i])}></link>`;

	for (let i = 0; i < scriptTags.length; i++) {
		// No additional attributes
		const {
			content = "",
			id = "",
			className = "",
			type = "text/javascript",
		} = scriptTags[i];
		generatedHTML += `<script id="${id}" class="${className}" type="${type}">${content}</script>`;
	}

	return generatedHTML;
};

export default generatePageMetaHTML;
