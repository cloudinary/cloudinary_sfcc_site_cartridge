'use strict';

exports.modifyPOSTResponse = function (basket, doc) {
    var cloudinaryConstants = require('*/cartridge/scripts/util/cloudinaryConstants');
    var cloudinaryModel = require('*/cartridge/scripts/model/cloudinaryModel');
    var Logger = require('dw/system/Logger');
    var Status = require('dw/system/Status');
    try {
        if (cloudinaryConstants.CLD_ENABLED) {
            var cldPageSetting = cloudinaryConstants.CLD_IMAGE_PAGE_TYPE_SETTINGS_OBJECT;
            var products = doc && doc.productItems && doc.productItems.length > 0 ? doc.productItems.toArray() : null;

            if (products) {
                var item = null;
                products.forEach(function (key) {
                    var cloudinary = {};
                    item = key;

                    // Cloudinary Mini Cart Image
                    if (cldPageSetting.miniCart.enabled) {
                        cloudinary.miniCartImage = cloudinaryModel.getProductPrimaryImage(item.productId, cloudinaryConstants.CLD_HIGH_RES_IMAGES_VIEW_TYPE, {
                            pageType: cloudinaryConstants.PAGE_TYPES.MINI_CART
                        });
                    }

                    // Cloudinary Cart Image
                    if (cldPageSetting.cart.enabled) {
                        var productLineItemPrimaryImg = cloudinaryModel.getProductPrimaryImage(item.productId, cloudinaryConstants.CLD_HIGH_RES_IMAGES_VIEW_TYPE, {
                            pageType: cloudinaryConstants.PAGE_TYPES.CART
                        });
                        cloudinary.cartImage = productLineItemPrimaryImg;
                    }

                    // Cloudinary Checkout Image
                    if (cldPageSetting.checkout.enabled) {
                        cloudinary.checkoutImage = cloudinaryModel.getProductPrimaryImage(item.productId, cloudinaryConstants.CLD_HIGH_RES_IMAGES_VIEW_TYPE, {
                            pageType: cloudinaryConstants.PAGE_TYPES.CHECKOUT
                        });
                    }

                    cloudinary.miniCartEnabled = cldPageSetting.miniCart.enabled;
                    cloudinary.cartEnabled = cldPageSetting.cart.enabled;
                    cloudinary.checkoutEnabled = cldPageSetting.checkout.enabled;
                    cloudinary.cloudName = cloudinaryConstants.CLD_CLOUDNAME;
                    cloudinary.plpEnabled = cldPageSetting.plp.enabled;
                    item.c_cloudinary = cloudinary;
                });
            }
        }
    } catch (ex) {
        Logger.error('basket~modifyPOSTResponse -> There is an error while executing the file {0} at: line number {1}: {2}', ex.fileName, ex.lineNumber, ex.toString());
    }
    return new Status(Status.OK);
};