'use strict';
var baseDetail = require('base/product/detail');
var cloudinary = require('../cloudinary/cloudinary');

baseDetail.updateAttribute = function () {
    $('body').on('product:afterAttributeSelect', function (e, response) {
        // custom start: update cloudinary PGW
        cloudinary.updateCloudinaryGalleryWidget(response.data.cloudinary);
        // custom end: update cloudinary PGW
        if ($('.product-detail>.bundle-items').length) {
            response.container.data('pid', response.data.product.id);
            response.container.find('.product-id').text(response.data.product.id);
        } else if ($('.product-set-detail').eq(0)) {
            response.container.data('pid', response.data.product.id);
            response.container.find('.product-id').text(response.data.product.id);
        } else {
            $('.product-id').text(response.data.product.id);
            $('.product-detail:not(".bundle-item")').data('pid', response.data.product.id);
        }
    });
};

module.exports = baseDetail;
