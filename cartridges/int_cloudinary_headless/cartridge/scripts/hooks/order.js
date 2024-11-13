'use strict';

var cloudinaryConstants = require('*/cartridge/scripts/util/cloudinaryConstants');
var cloudinaryModel = require('*/cartridge/scripts/model/cloudinaryModel');
var Logger = require('dw/system/Logger');
var Status = require('dw/system/Status');

exports.modifyGETResponse = function (order, doc) {
    try {
        if (cloudinaryConstants.CLD_ENABLED) {
            var cldPageSetting = cloudinaryConstants.CLD_IMAGE_PAGE_TYPE_SETTINGS_OBJECT;
            var products = doc && doc.productItems && doc.productItems.length > 0 ? doc.productItems.toArray() : null;

            if (!empty(products)) {
                var item = null;
                products.forEach(function (key) {
                    var cloudinary = {};
                    item = key;

                    // Cloudinary Order Confirmation Image Image
                    if (cldPageSetting.orderConfirmation.enabled) {
                        cloudinary.orderConfirmationImage = cloudinaryModel.getProductPrimaryImage(item.productId, cloudinaryConstants.CLD_HIGH_RES_IMAGES_VIEW_TYPE, {
                            pageType: cloudinaryConstants.PAGE_TYPES.ORDER_CONFIRMATION
                        });
                    }
                    cloudinary.orderConfirmationEnabled = cldPageSetting.orderConfirmation.enabled;
                    cloudinary.orderHistoryEnabled = cldPageSetting.orderHistory.enabled;
                    cloudinary.cloudName = cloudinaryConstants.CLD_CLOUDNAME;
                    item.c_cloudinary = cloudinary;
                });
            }
        }
    } catch (ex) {
        Logger.error('basket~modifyPOSTResponse -> There is an error while executing the file {0} at: line number {1}: {2}', ex.fileName, ex.lineNumber, ex.toString());
    }
    return new Status(Status.OK);
};