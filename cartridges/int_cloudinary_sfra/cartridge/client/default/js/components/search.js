'use strict';

var baseSearch = require('base/components/search');

module.exports = function () {
    baseSearch();
    // Custom Start: Make suggested product images responsive //
    $('.suggestions-wrapper').bind('DOMSubtreeModified', function (e) {
        if (e.target.innerHTML.length > 0) {
            if (typeof window.makeCloudinaryImagesResponsive !== 'undefined') {
                window.makeCloudinaryImagesResponsive();
            }
        }
    });
    // Custom End: Make suggested product images responsive //
};
