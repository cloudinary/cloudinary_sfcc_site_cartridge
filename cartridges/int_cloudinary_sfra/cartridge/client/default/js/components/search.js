'use strict';

var baseSearch = require('base/components/search');

module.exports = function () {
    baseSearch();
    // Custom Start: Make suggested product images responsive //
    const targetNode = document.querySelector('.suggestions-wrapper');
	const config = { childList: true, subtree: true };

	const callback = function () {
		if (targetNode.innerHTML.length > 0 && typeof window.makeCloudinaryImagesResponsive !== 'undefined') {
			window.makeCloudinaryImagesResponsive();
		}
	};

	const observer = new MutationObserver(callback);
	observer.observe(targetNode, config);
    // Custom End: Make suggested product images responsive //
};
