'use strict';

function isVideoEnabled(product) {
    return product.custom.CLDVideoEnabled;
}

function isVideoPlayerEnabled(product) {
    return product.custom.CLDVideoPlayerEnabled;
}

function getVideoPlayerOptions(product) {
    return product.custom.CLDVideoOptions;
}

function getCloudinaryTagName(product) {
    return product.ID;
}

function getImageTransformations(product) {
    return product.custom.CLDImageTransformations;
}

function getVideoTransformations(product) {
    return product.custom.CLDVideoTransformations;
}

function getCloudinaryGalleryStyles(product) {
    return product.custom.CLDGalleryStyles;
}

module.exports = {
    isVideoEnabled: isVideoEnabled,
    isVideoPlayerEnabled: isVideoPlayerEnabled,
    getVideoPlayerOptions: getVideoPlayerOptions,
    getCloudinaryTagName: getCloudinaryTagName,
    getImageTransformations: getImageTransformations,
    getVideoTransformations: getVideoTransformations,
    getCloudinaryGalleryStyles: getCloudinaryGalleryStyles
};
