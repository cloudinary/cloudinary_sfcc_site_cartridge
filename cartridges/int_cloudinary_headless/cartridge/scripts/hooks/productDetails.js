'use strict';
var cloudinaryConstants = require('*/cartridge/scripts/util/cloudinaryConstants');
var cloudinaryModel = require('*/cartridge/scripts/model/cloudinaryModel');
var Logger = require('dw/system/Logger');
var productHelper = require('*/cartridge/scripts/helpers/productHelper');
var Status = require('dw/system/Status');
var UUIDUtils = require('dw/util/UUIDUtils');

exports.modifyGETResponse = function (product, doc) {
    try {
        if (cloudinaryConstants.CLD_ENABLED) {
            var cldPageSetting = cloudinaryConstants.CLD_IMAGE_PAGE_TYPE_SETTINGS_OBJECT;
            var cloudinary = {};
            var params = {
                pageType: cloudinaryConstants.PAGE_TYPES.PDP,
                variationAttrValueID: product.custom.color
            };

            // Get the Cloudinary porduct gallery Image
            var cloudinaryImage = cloudinaryModel.getCloudinaryImages(product.ID, params);
            if (cloudinaryImage) {
                cloudinary.cloudinaryImage = cloudinaryImage;
            }

            // Cloudinary Product Video
            if (cloudinaryConstants.CLD_VIDEO_ENABLED) {
                cloudinary.video = cloudinaryModel.getCloudinaryVideo(product.ID, request.locale);
                cloudinary.randomNumber = UUIDUtils.createUUID();
            }

            // Cloudinary PDP Swatches
            if (cldPageSetting.cldPdpSwatch.enabled) {
                if (!empty(doc) && !empty(doc.variationAttributes)) {
                    cloudinary.cldSwatchs = productHelper.getPdpSwatches(doc, product);
                }
            }

            // Cloudinary Mini Cart Image
            if (cldPageSetting.miniCart.enabled) {
                cloudinary.miniCartImage = cloudinaryModel.getProductPrimaryImage(product.ID, cloudinaryConstants.CLD_HIGH_RES_IMAGES_VIEW_TYPE, {
                    pageType: cloudinaryConstants.PAGE_TYPES.MINI_CART
                });
            }

            // Cloudinary Cart Image
            if (cldPageSetting.cart.enabled) {
                var productLineItemPrimaryImg = cloudinaryModel.getProductPrimaryImage(product.ID, cloudinaryConstants.CLD_HIGH_RES_IMAGES_VIEW_TYPE, {
                    pageType: cloudinaryConstants.PAGE_TYPES.CART
                });
                cloudinary.cartImage = productLineItemPrimaryImg;
            }

            // Cloudinary Checkout Image
            if (cldPageSetting.checkout.enabled) {
                cloudinary.checkoutImage = cloudinaryModel.getProductPrimaryImage(product.ID, cloudinaryConstants.CLD_HIGH_RES_IMAGES_VIEW_TYPE, {
                    pageType: cloudinaryConstants.PAGE_TYPES.CHECKOUT
                });
            }

            // Cloudinary Order Confirmation Image Image
            if (cldPageSetting.orderConfirmation.enabled || cldPageSetting.orderHistory.enabled) {
                cloudinary.orderConfirmationImage = cloudinaryModel.getProductPrimaryImage(product.ID, cloudinaryConstants.CLD_HIGH_RES_IMAGES_VIEW_TYPE, {
                    pageType: cloudinaryConstants.PAGE_TYPES.ORDER_CONFIRMATION
                });
            }

            cloudinary.pdpSwatch = cldPageSetting.cldPdpSwatch.enabled;
            cloudinary.images = cloudinaryModel.getCloudinaryImages(product.ID, params);
            cloudinary.productId = product.ID;
            cloudinary.isEnabled = cloudinaryConstants.CLD_ENABLED;
            cloudinary.galleryEnabled = cloudinaryConstants.CLD_GALLERY_ENABLED;
            cloudinary.cloudName = cloudinaryConstants.CLD_CLOUDNAME;
            cloudinary.videoEnabled = cloudinaryConstants.CLD_VIDEO_ENABLED;
            cloudinary.videoPlayerEnabled = cloudinaryConstants.CLD_VIDEO_PLAYER_ENABLED;
            cloudinary.pdp = cldPageSetting.pdp.enabled;
            cloudinary.cartEnabled = cldPageSetting.cart.enabled;
            cloudinary.isCheckoutEnabled = cldPageSetting.checkout.enabled;
            cloudinary.miniCartEnabled = cldPageSetting.miniCart.enabled;
            cloudinary.orderConfirmation = cldPageSetting.orderConfirmation.enabled;
            cloudinary.orderHistory = cldPageSetting.orderHistory.enabled;
            doc.c_cloudinary = cloudinary; // eslint-disable-line
        }
    } catch (ex) {
        Logger.error('productDetails~modifyGETResponse -> There is an error while executing the file {0} at: line number {1}: {2}', ex.fileName, ex.lineNumber, ex.toString());
    }

    return new Status(Status.OK);
};
