/**
 * Updates product gallery widget for variant products
 */
module.exports = {
    updateCloudinaryGalleryWidget: function (cloudinary) {
        if (cloudinary && cloudinary.isCLDEnabled && cloudinary.isGalleryEnabled && cloudinary.galleryWidget && cloudinary.galleryWidget.options
            && cloudinary.galleryWidget.options.mediaAssets && cloudinary.galleryWidget.options.mediaAssets.length > 0) {
            if (typeof cldGallery !== 'undefined' && cldGallery) { // eslint-disable-line no-undef
                cldGallery.update(cloudinary.galleryWidget.options); // eslint-disable-line no-undef
            }
        }
    }
};
