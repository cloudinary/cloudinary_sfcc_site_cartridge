'use strict';

module.exports = function () {
    // Custom Start: Make cart product images responsive //
    $('.minicart').bind('DOMSubtreeModified', function (e) {
        if (e.target.innerHTML.length > 0) {
            if (typeof window.makeCloudinaryImagesResponsive !== 'undefined') {
                window.makeCloudinaryImagesResponsive();
            }
        }
    });
    // Custom End: Make cart product images responsive //
};
