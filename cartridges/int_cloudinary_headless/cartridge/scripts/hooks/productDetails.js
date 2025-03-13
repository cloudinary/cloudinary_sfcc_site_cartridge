'use strict';

exports.modifyGETResponse = function (product, doc) {
    var cloudinaryConstants = require('*/cartridge/scripts/util/cloudinaryConstants');
    var cloudinaryModel = require('*/cartridge/scripts/model/cloudinaryModel');
    var Logger = require('dw/system/Logger');
    var productHelper = require('*/cartridge/scripts/helpers/productHelper');
    var Status = require('dw/system/Status');
    var UUIDUtils = require('dw/util/UUIDUtils');
    try {
        if (cloudinaryConstants.CLD_ENABLED) {
            var cldPageSetting = cloudinaryConstants.CLD_IMAGE_PAGE_TYPE_SETTINGS_OBJECT;

            // Cloudinary plp images for recommendation tile
            var cloudinary = cloudinaryModel.getProductPrimaryImage(product.ID,
                cloudinaryConstants.CLD_HIGH_RES_IMAGES_VIEW_TYPE, { pageType: cloudinaryConstants.PAGE_TYPES.PLP });
            cloudinary.c_autoResponsiveDimensions = cldPageSetting.plp.autoResponsiveDimensions;
            cloudinary.plpEnabled = cldPageSetting.plp.enabled;

            var params = {
                pageType: cloudinaryConstants.PAGE_TYPES.PDP,
                variationAttrValueID: product.custom.color
            };

            var cloudinaryPDPImages = [];

            // Get Cloudinary images for bundle or set master product and its variations
            if (product.bundle || product.productSet) {
                let bundleProducts;
                if (doc.bundledProducts && doc.bundledProducts.length > 0) {
                    bundleProducts = doc.bundledProducts.toArray();
                } else if (doc.setProducts && doc.setProducts.length > 0) {
                    bundleProducts = doc.setProducts.toArray();
                }
                if (bundleProducts) {
                    bundleProducts.some(function (bundleItem, index) {
                        const productId = bundleItem.id || bundleItem.product.ID;
                        params.variationAttrValueID = null;
                        productHelper.getCloudinaryBundleSetImages(productId, params, bundleItem, product.bundle, product.productSet);
                    })
                }
            } else {
                var variationArray = doc.variationAttributes && doc.variationAttributes.length > 0 ? doc.variationAttributes.toArray() : null;
                if (variationArray) {
                    productHelper.getCldVariationImages(variationArray, cloudinaryPDPImages, false, params, product.ID)
                }
            }

            // Get Cloudinary images for master product
            cloudinaryPDPImages.push({ images: cloudinaryModel.getCloudinaryImages(product.ID, params) })

            // Get the Cloudinary product gallery Image
            if (cloudinaryPDPImages) {
                cloudinary.pdpImages = cloudinaryPDPImages;
            }

            // Cloudinary Product Video
            if (cloudinaryConstants.CLD_VIDEO_ENABLED) {
                cloudinary.video = cloudinaryModel.getCloudinaryVideo(product.ID, request.locale);
                cloudinary.randomNumber = UUIDUtils.createUUID();
            }

            // Cloudinary PDP Swatches
            if (cldPageSetting.cldPdpSwatch.enabled) {
                if (!empty(doc) && !empty(doc.variationAttributes)) {
                    cloudinary.cldSwatches = productHelper.getPdpSwatches(doc, product);
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
            cloudinary.productId = product.ID;
            cloudinary.isEnabled = cloudinaryConstants.CLD_ENABLED;
            cloudinary.galleryEnabled = cloudinaryConstants.CLD_GALLERY_ENABLED;
            cloudinary.cloudName = cloudinaryConstants.CLD_CLOUDNAME;
            cloudinary.videoEnabled = cloudinaryConstants.CLD_VIDEO_ENABLED;
            cloudinary.videoPlayerEnabled = cloudinaryConstants.CLD_VIDEO_PLAYER_ENABLED;
            cloudinary.pdp = cldPageSetting.pdp.enabled;
            cloudinary.cartEnabled = cldPageSetting.cart.enabled;
            cloudinary.isResponsive = cldPageSetting.plp.automateResponsivenessWithJS;
            cloudinary.isCheckoutEnabled = cldPageSetting.checkout.enabled;
            cloudinary.miniCartEnabled = cldPageSetting.miniCart.enabled;
            cloudinary.orderConfirmation = cldPageSetting.orderConfirmation.enabled;
            cloudinary.orderHistory = cldPageSetting.orderHistory.enabled;
            cloudinary.domain = cloudinaryConstants.CLD_BASE_PATH.match(/^(?:https?:\/\/)?([^\/]+)/)[1];
            doc.c_cloudinary = cloudinary; // eslint-disable-line
        }
    } catch (ex) {
        Logger.error('productDetails~modifyGETResponse -> There is an error while executing the file {0} at: line number {1}: {2}', ex.fileName, ex.lineNumber, ex.toString());
    }

    return new Status(Status.OK);
};
