'use strict';

var cloudinaryConstants = require('*/cartridge/scripts/util/cloudinaryConstants');
var cloudinaryModel = require('*/cartridge/scripts/model/cloudinaryModel');
var Logger = require('dw/system/Logger');
var Status = require('dw/system/Status');

exports.modifyGETResponse = function (doc) {
    try {
        if (cloudinaryConstants.CLD_ENABLED) {
            var products = doc.productSuggestions.products.length > 0 ? doc.productSuggestions.products.toArray() : null;

            if (products) {
                var item = null;
                products.forEach(function (key) {
                    item = key;
                    var cloudinaryImage = cloudinaryModel.getProductPrimaryImage(item.productId, cloudinaryConstants.CLD_HIGH_RES_IMAGES_VIEW_TYPE,
                        { pageType: cloudinaryConstants.PAGE_TYPES.SEARCH_SUGGESTIONS });
                    item.c_cloudinary = cloudinaryImage;
                    item.c_cloudinary.suggestionEnabled = cloudinaryConstants.CLD_IMAGE_PAGE_TYPE_SETTINGS_OBJECT.searchSuggestions.enabled;
                    item.c_cloudinary.cloudName = cloudinaryConstants.CLD_CLOUDNAME;
                });
            }
        }
    } catch (ex) {
        Logger.error('searchSuggestion~modifyGETResponse -> There is an error while executing the file {0} at: line number {1}: {2}', ex.fileName, ex.lineNumber, ex.toString());
    }
    return new Status(Status.OK);
};
