'use strict';

var logger = require('dw/system/Logger').getLogger('int_cloudinary', 'int_cloudinary');
var ProductMgr = require('dw/catalog/ProductMgr');

var cloudinaryConstants = require('*/cartridge/scripts/util/cloudinaryConstants');
var cloudinaryHelper = require('*/cartridge/scripts/helpers/cloudinaryHelpers');
var CloudinaryImageModel = require('*/cartridge/scripts/model/cloudinaryImageModel');
var cloudinaryModel = require('*/cartridge/scripts/model/cloudinaryModel');

/**
 * This is used to get cloudinary image for product tile.
 *
 * @param {string} productID - product ID
 * @param {Object} params - optional params
 *
 * @returns {Object} cloudinary image model
 */
var getCloudinaryProductTileImage = function (productID, params) {
    var cldImage;
    var productImg;
    var pageType;
    var product;

    try {
        if (cloudinaryConstants.CLD_ENABLED) {
            // initialize optional params
            if (!empty(params)) {
                pageType = params.pageType;
            }

            product = ProductMgr.getProduct(productID);

            cldImage = cloudinaryModel.getProductPrimaryImage(product.ID, cloudinaryConstants.CLD_HIGH_RES_IMAGES_VIEW_TYPE, {
                pageType: pageType
            });

            if (cldImage) {
                productImg = product.getImage(cloudinaryConstants.CLD_HIGH_RES_IMAGES_VIEW_TYPE, 0);
                if (productImg) {
                    cldImage.title = productImg.title;
                    cldImage.alt = productImg.alt;
                }

                productImg = new CloudinaryImageModel(cldImage);
            }
        }
    } catch (ex) {
        logger.error('Error occurred while product cloudianry image for product ID: {0}, error: {1}', productID, ex);
    }

    return productImg;
};

/**
 * This is used to get cloudinary images for color variations attribute values.
 *
 * @param {string} productID - product ID
 * @param {Object} params - optional params
 *
 * @returns {dw.util.ArrayList} list holding color variation attribute values
 */
var getCloudinaryColorVariationAttrValues = function (productID, params) {
    var ArrayList = require('dw/util/ArrayList');

    var cldImage;
    var cldSwatchImage;
    var colorVariationAttr;
    var colorVariationAttrValues;
    var colorVariationAttrValue;
    var product;
    var pageType;
    var pid = productID;
    var productVariationModel;
    var selectableColorValue;
    var selectableColorValues;

    try {
        if (cloudinaryConstants.CLD_ENABLED && cloudinaryConstants.CLD_ENABLE_SWATCH_ON_PLP) {
            // initialize optional params
            if (!empty(params)) {
                pageType = params.pageType;
            }

            product = ProductMgr.getProduct(pid);
            productVariationModel = product.variationModel;

            if (productVariationModel) {
                colorVariationAttr = productVariationModel.getProductVariationAttribute(cloudinaryConstants.COLOR_ATTR);
                if (colorVariationAttr) {
                    colorVariationAttrValues = productVariationModel.getFilteredValues(colorVariationAttr);
                }

                if (colorVariationAttrValues && colorVariationAttrValues.size() > 1) {
                    selectableColorValues = new ArrayList();
                    for (var idx = 0; idx < colorVariationAttrValues.size(); idx++) {
                        colorVariationAttrValue = colorVariationAttrValues.get(idx);
                        if (product.variant) {
                            pid = cloudinaryHelper.getVariantProductIDByColor(product.masterProduct.ID, colorVariationAttrValue.ID);
                        } else {
                            pid = cloudinaryHelper.getVariantProductIDByColor(product.ID, colorVariationAttrValue.ID);
                        }

                        cldImage = cloudinaryModel.getProductPrimaryImage(pid, cloudinaryConstants.CLD_HIGH_RES_IMAGES_VIEW_TYPE, {
                            pageType: pageType
                        });

                        cldSwatchImage = cloudinaryModel.getProductPrimaryImage(pid, cloudinaryConstants.CLD_SWATCH_IMAGES_VIEW_TYPE, {
                            pageType: pageType
                        });

                        if (cldSwatchImage && cldImage) {
                            var attrValueImage = colorVariationAttrValue.getImage(cloudinaryConstants.CLD_HIGH_RES_IMAGES_VIEW_TYPE);
                            var attrValueSwatchImage = colorVariationAttrValue.getImage(cloudinaryConstants.CLD_SWATCH_IMAGES_VIEW_TYPE);

                            if (attrValueImage) {
                                cldImage.title = attrValueImage.title;
                                cldImage.alt = attrValueImage.alt;
                            }

                            if (attrValueSwatchImage) {
                                cldSwatchImage.title = attrValueSwatchImage.title;
                                cldSwatchImage.alt = attrValueSwatchImage.alt;
                            }

                            cldImage = new CloudinaryImageModel(cldImage);
                            cldSwatchImage = new CloudinaryImageModel(cldSwatchImage);

                            selectableColorValue = {
                                cldThumbnailImage: cldImage,
                                cldSwatchImage: cldSwatchImage,
                                value: colorVariationAttrValue.value,
                                displayValue: colorVariationAttrValue.displayValue
                            };
                        }
                        selectableColorValues.add(selectableColorValue);
                    }
                }
            }
        }
    } catch (ex) {
        logger.error('Error occurred while getting cloudianry color variation attribute values for product ID: {0}, error: {1}', pid, ex);
    }

    return selectableColorValues;
};

module.exports = {
    getCloudinaryProductTileImage: getCloudinaryProductTileImage,
    getCloudinaryColorVariationAttrValues: getCloudinaryColorVariationAttrValues
};
