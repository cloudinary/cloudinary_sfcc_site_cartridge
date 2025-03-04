'use strict';

/**
* Used to get product swatch images from Cloudinary on productDetails hook
*
* @param {Object} doc - doc returned from hook
* @param {Object} product - product
*
* @returns {array} -swatchURLObjs
*/
function getPdpSwatches(doc, product) {
    var cloudinaryAPI = require('*/cartridge/scripts/api/cloudinaryApi');
    var cloudinaryConstants = require('*/cartridge/scripts/util/cloudinaryConstants');
    var cloudinaryHelper = require('*/cartridge/scripts/helpers/cloudinaryHelpers');

    var Logger = require('dw/system/Logger');
    var cldSwatch = [];
    try {
        var swatchURLObjs = [];
        var swatchURLObj;
        var variationAttrID;
        var variationAttrValueID;
        var productID;
        var variantID;
        productID = product.ID || doc.id;
        var variationArray = doc.variationAttributes.length > 0 ? doc.variationAttributes.toArray() : null;

        if (!empty(variationArray)) {
            variationArray.some(function (variationAttr) { // eslint-disable-line
                variationAttrID = variationAttr.id;
                // only consider color attribute for swatch images
                if (cloudinaryConstants.COLOR_ATTR.equals(variationAttrID) && !empty(variationAttr.values)) {
                    var variationAttrArray = variationAttr.values.toArray();
                    variationAttrArray.forEach(function (attributeValue) {
                        // check if swatch image exists in SFCC
                        variationAttrValueID = attributeValue.value;

                        if (cloudinaryConstants.CLD_CARTRIDGE_OPERATION_MODE === cloudinaryConstants.CLD_GET_ASSETS_BY_TAG_NAME_MODE) {
                            if (product.variant) {
                                productID = product.masterProduct.ID;
                            }
                            swatchURLObj = cloudinaryAPI.getProductPrimaryImageURLUsingTagName(productID, {
                                pageType: cloudinaryConstants.PAGE_TYPES.CLD_PDP_SWATCH,
                                isSwatch: true,
                                variationAttrValueID: variationAttrValueID
                            });
                        } else if (cloudinaryConstants.CLD_CARTRIDGE_OPERATION_MODE === cloudinaryConstants.CLD_GET_ASSETS_BY_VIEW_TYPE_MODE) {
                            variantID = cloudinaryHelper.getVariantProductIDByColor(productID, variationAttrValueID);
                            productID = !empty(variantID) ? variantID : productID;
                            swatchURLObjs = cloudinaryAPI.getProductImagesByViewType(productID, cloudinaryConstants.CLD_SWATCH_IMAGES_VIEW_TYPE, cloudinaryConstants.PAGE_TYPES.CLD_PDP_SWATCH);
                            swatchURLObj = swatchURLObjs.length > 0 ? swatchURLObjs[0] : swatchURLObj;
                        } else if (cloudinaryConstants.CLD_CARTRIDGE_OPERATION_MODE === cloudinaryConstants.CLD_GET_ASSETS_BY_AUTO_UPLOAD_MODE) {
                            variantID = cloudinaryHelper.getVariantProductIDByColor(productID, variationAttrValueID);
                            productID = !empty(variantID) ? variantID : productID;
                            swatchURLObjs = cloudinaryAPI.getProductImagesByAutoupload(productID, cloudinaryConstants.PAGE_TYPES.CLD_PDP_SWATCH, cloudinaryConstants.CLD_SWATCH_IMAGES_VIEW_TYPE);
                            swatchURLObj = swatchURLObjs.length > 0 ? swatchURLObjs[0] : swatchURLObj;
                        }

                        if (!empty(swatchURLObj)) {
                            cldSwatch.push({
                                variationAttrValueID: variationAttrValueID,
                                cldUrl: swatchURLObj.url
                            }); // eslint-disable-line
                        }
                    });
                }
            });
        }
    } catch (ex) {
        Logger.error('producthelper~getPdpSwatches -> There is an error while executing the file {0} at: line number {1}: {2}', ex.fileName, ex.lineNumber, ex.toString());
    }
    return cldSwatch;
};

/**
* Used to get product set and bundle images from Cloudinary on productDetails hook
*
* @param {Object} productId - product id of set or bundle product
* @param {Object} params - params
* @param {Object} item - hook product object
* @param {Boolean} isProductBundle - specifies if product is part of set or bundle
*
* @returns {array} -item
*/
function getCloudinaryBundleSetImages(productId, params, item, isProductBundle, isProductSet) {
    var cloudinaryConstants = require('*/cartridge/scripts/util/cloudinaryConstants');
    var cloudinaryModel = require('*/cartridge/scripts/model/cloudinaryModel');

    var ProductMgr = require('dw/catalog/ProductMgr');
    var Logger = require('dw/system/Logger');

    try {

        const cldPageSetting = cloudinaryConstants.CLD_IMAGE_PAGE_TYPE_SETTINGS_OBJECT;
        let cloudinary = {
            isEnabled: cloudinaryConstants.CLD_ENABLED,
            galleryEnabled: cloudinaryConstants.CLD_GALLERY_ENABLED,
            cloudName: cloudinaryConstants.CLD_CLOUDNAME,
            videoEnabled: cloudinaryConstants.CLD_VIDEO_ENABLED,
            videoPlayerEnabled: cloudinaryConstants.CLD_VIDEO_PLAYER_ENABLED,
            pdp: cldPageSetting.pdp.enabled,
            cartEnabled: cldPageSetting.cart.enabled,
            isCheckoutEnabled: cldPageSetting.checkout.enabled,
            miniCartEnabled: cldPageSetting.miniCart.enabled,
            orderConfirmation: cldPageSetting.orderConfirmation.enabled,
            orderHistory: cldPageSetting.orderHistory.enabled,
            cldPgwSuffix: productId
        }

        let imageArray = [];
        var variationArray;

        if (isProductBundle) {
            variationArray = item.product.variationAttributes && item.product.variationAttributes.length > 0 ? item.product.variationAttributes.toArray() : null;
        } else {
            variationArray = item.variationAttributes && item.variationAttributes.length > 0 ? item.variationAttributes.toArray() : null;
        }

        if (variationArray) {

            //Cloudinary swatch images for bundle and set variations
            if (cldPageSetting.cldPdpSwatch.enabled) {
                var productData = ProductMgr.getProduct(productId);
                cloudinary.cldSwatches = getPdpSwatches(isProductBundle ? item.product : item, productData);
            }

            // Cloudinary Mini Cart Images for bundle and set
            if (cldPageSetting.miniCart.enabled) {
                cloudinary.miniCartImage = cloudinaryModel.getProductPrimaryImage(productId, cloudinaryConstants.CLD_HIGH_RES_IMAGES_VIEW_TYPE, {
                    pageType: cloudinaryConstants.PAGE_TYPES.MINI_CART
                });
            }

            getCldVariationImages(variationArray, imageArray, (isProductBundle || isProductSet), params, productId);

        } else {
            let cldImages = cloudinaryModel.getCloudinaryImages(productId, params);

            if (cloudinaryConstants.CLD_GALLERY_ENABLED) {
                cldImages.galleryWidget.options.container = cldImages.galleryWidget.options.container + '-' + productId;
            }
            imageArray.push({ images: cldImages });
        }
        cloudinary.pdpImages = imageArray;

        if (isProductBundle) {
            item.product.c_cloudinary = cloudinary;
            return item;
        }

        item.c_cloudinary = cloudinary;
        return item;
    } catch (ex) {
        Logger.error('producthelper~getCloudinaryBundleSetImages -> There is an error while executing the file {0} at: line number {1}: {2}', ex.fileName, ex.lineNumber, ex.toString());
    }
    return item;
};

/**
* Used to get cloudinary images for variations
*
* @param {Object} variationArray - variation products
* @param {Array} imageArray - imageArray
* @param {Boolean} isProductBundleOrSet - hook product object
* @param {Object} params - params
* @param {String} productId - productId
*
* @returns {array} -imageArray
*/
function getCldVariationImages(variationArray, imageArray, isProductBundleOrSet, params, productId) {
    var cloudinaryConstants = require('*/cartridge/scripts/util/cloudinaryConstants');
    var cloudinaryModel = require('*/cartridge/scripts/model/cloudinaryModel');

    variationArray.some(function (variationAttr) {
        variationAttrID = variationAttr.id;
        if (cloudinaryConstants.COLOR_ATTR.equals(variationAttrID) && !empty(variationAttr.values)) {
            var variationAttrArray = variationAttr.values.toArray();
            variationAttrArray.forEach(function (attributeValue) {
                params.variationAttrValueID = attributeValue.value;
                let attrImg = cloudinaryModel.getCloudinaryImages(productId, params);
                if (cloudinaryConstants.CLD_GALLERY_ENABLED && isProductBundleOrSet) {
                    attrImg.galleryWidget.options.container = attrImg.galleryWidget.options.container + '-' + productId;
                }
                return imageArray.push(
                    {
                        images: attrImg,
                        color: params.variationAttrValueID
                    }
                );
            })
        }
    });
};

module.exports = {
    getPdpSwatches: getPdpSwatches,
    getCloudinaryBundleSetImages: getCloudinaryBundleSetImages,
    getCldVariationImages: getCldVariationImages
};
