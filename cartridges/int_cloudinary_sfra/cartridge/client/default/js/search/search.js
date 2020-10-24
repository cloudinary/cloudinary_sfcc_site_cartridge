'use strict';

var baseSearch = require('base/search/search');

/**
 * Update sort option URLs from Ajax response
 *
 * @param {string} response - Ajax response HTML code
 * @return {undefined}
 */
function updateSortOptions(response) {
    var $tempDom = $('<div>').append($(response));
    var sortOptions = $tempDom.find('.grid-footer').data('sort-options').options;
    sortOptions.forEach(function (option) {
        $('option.' + option.id).val(option.url);
    });
}

baseSearch.showMore = function () {
    // Show more products
    $('.container').off('click').on('click', '.show-more button', function (e) {
        e.stopPropagation();
        var showMoreUrl = $(this).data('url');

        e.preventDefault();

        $.spinner().start();
        $(this).trigger('search:showMore', e);
        $.ajax({
            url: showMoreUrl,
            data: { selectedUrl: showMoreUrl },
            method: 'GET',
            success: function (response) {
                $('.grid-footer').replaceWith(response);
                updateSortOptions(response);
                // Custom start: update cloudinary responsive images
                if (typeof window.makeCloudinaryImagesResponsive !== 'undefined') {
                    window.makeCloudinaryImagesResponsive();
                }
                // Custom end: update cloudinary responsive images
                $.spinner().stop();
            },
            error: function () {
                $.spinner().stop();
            }
        });
    });
};

module.exports = baseSearch;
