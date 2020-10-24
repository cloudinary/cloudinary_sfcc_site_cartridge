'use strict';

/**
 * This model is used to send data to view pages.
 *
 * @param {Object} cloudinaryImage - cloudinary image object
 */
function CloudinaryImageModel(cloudinaryImage) {
    this.alt = cloudinaryImage.alt;
    this.title = cloudinaryImage.title;
    this.srcset = cloudinaryImage.srcset;
    this.sizes = cloudinaryImage.sizes;
    this.isResponsive = cloudinaryImage.isResponsive;
    this.displayValue = cloudinaryImage.displayValue;
    this.value = cloudinaryImage.value;
    this.getURL = function () {
        return cloudinaryImage.url;
    };
}

module.exports = CloudinaryImageModel;
