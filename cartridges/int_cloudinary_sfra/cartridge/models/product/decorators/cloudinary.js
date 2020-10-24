'use strict';

module.exports = function (object, product) {
    var cloudinaryHelper = require('*/cartridge/scripts/helpers/cloudinaryHelpers');
    var cloudinaryConstants = require('*/cartridge/scripts/util/cloudinaryConstants');

    Object.defineProperty(object, 'CLDVideoEnabled', {
        enumerable: true,
        value: cloudinaryHelper.isVideoEnabled(product)
    });
    Object.defineProperty(object, 'CLDVideoPlayerEnabled', {
        enumerable: true,
        value: cloudinaryHelper.isVideoPlayerEnabled(product)
    });
    Object.defineProperty(object, 'CLDVideoPlayerOptions', {
        enumerable: true,
        value: cloudinaryHelper.getVideoPlayerOptions(product)
    });
    Object.defineProperty(object, 'CLDTagName', {
        enumerable: true,
        value: cloudinaryHelper.getCloudinaryTagName(product)
    });
    Object.defineProperty(object, 'CLDImageTransformations', {
        enumerable: true,
        value: cloudinaryHelper.getImageTransformations(product)
    });
    Object.defineProperty(object, 'CLDVideoTransformations', {
        enumerable: true,
        value: cloudinaryHelper.getVideoTransformations(product)
    });
    Object.defineProperty(object, 'CLDGalleryStyles', {
        enumerable: true,
        value: cloudinaryHelper.getCloudinaryGalleryStyles(product)
    });
    Object.defineProperty(object, 'CLDEnabled', {
        enumerable: true,
        value: cloudinaryConstants.CLD_ENABLED
    });
};
