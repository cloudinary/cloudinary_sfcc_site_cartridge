'use strict';

var logger = require('dw/system/Logger').getLogger('int_cloudinary', 'int_cloudinary');
var ProductMgr = require('dw/catalog/ProductMgr');

var cloudinaryConstants = require('*/cartridge/scripts/util/cloudinaryConstants');
var cloudinaryAPI = require('*/cartridge/scripts/api/cloudinaryApi');
var cloudinaryHelper = require('*/cartridge/scripts/helpers/cloudinaryHelpers');

var baseCloudinaryModel = module.superModule;

/**
 * Adds cloudinary swatch image to product model variation attributes.
 *
 * @param {Object} product - product model
 * @param {string} pageType - page type
 *
 */
baseCloudinaryModel.addCloudinaryProductSwatchImage = function (product, pageType) {
    var swatchURLObjs = [];
    var swatchURLObj;
    var variationAttrID;
    var variationAttrValueID;
    var productID;
    var variantID;

    try {
        if (cloudinaryConstants.CLD_ENABLED && !empty(product) && !empty(product.variationAttributes)) {
            productID = product.id;

            product.variationAttributes.some(function (variationAttr, idx) {
                variationAttrID = variationAttr.id;
                // only consider color attribute for swatch images
                if (cloudinaryConstants.COLOR_ATTR.equals(variationAttrID) && !empty(variationAttr.values)) {
                    variationAttr.values.forEach(function (attributeValue, index) {
                        // check if swatch image exists in SFCC
                        variationAttrValueID = attributeValue.id;

                        if (cloudinaryConstants.CLD_CARTRIDGE_OPERATION_MODE === cloudinaryConstants.CLD_GET_ASSETS_BY_TAG_NAME_MODE) {
                            if (product.raw.variant) {
                                productID = product.raw.masterProduct.ID;
                            }
                            swatchURLObj = cloudinaryAPI.getProductPrimaryImageURLUsingTagName(productID, {
                                pageType: pageType,
                                isSwatch: true,
                                variationAttrValueID: variationAttrValueID
                            });
                        } else if (cloudinaryConstants.CLD_CARTRIDGE_OPERATION_MODE === cloudinaryConstants.CLD_GET_ASSETS_BY_VIEW_TYPE_MODE) {
                            if (!empty(product.raw.master)) {
                                variantID = cloudinaryHelper.getVariantProductIDByColor(productID, variationAttrValueID);
                                productID = !empty(variantID) ? variantID : productID;
                            }
                            swatchURLObjs = cloudinaryAPI.getProductImagesByViewType(productID, cloudinaryConstants.CLD_SWATCH_IMAGES_VIEW_TYPE, pageType);
                            swatchURLObj = swatchURLObjs.length > 0 ? swatchURLObjs[0] : swatchURLObj;
                        } else if (cloudinaryConstants.CLD_CARTRIDGE_OPERATION_MODE === cloudinaryConstants.CLD_GET_ASSETS_BY_AUTO_UPLOAD_MODE) {
                            if (!empty(product.raw.master)) {
                                variantID = cloudinaryHelper.getVariantProductIDByColor(productID, variationAttrValueID);
                                productID = !empty(variantID) ? variantID : productID;
                            }
                            swatchURLObjs = cloudinaryAPI.getProductImagesByAutoupload(productID, pageType, cloudinaryConstants.CLD_SWATCH_IMAGES_VIEW_TYPE);
                            swatchURLObj = swatchURLObjs.length > 0 ? swatchURLObjs[0] : swatchURLObj;
                        }

                        if (!empty(swatchURLObj)) {
                            Object.defineProperty(attributeValue.images, cloudinaryConstants.CLD_PRODUCT_SWATCH_IMG, {
                                enumerable: true,
                                value: {
                                    url: swatchURLObj.url,
                                    srcset: swatchURLObj.srcset,
                                    sizes: swatchURLObj.sizes,
                                    isResponsive: swatchURLObj.isResponsive
                                }
                            });
                            // overwrite variation attribute value to add cloudinary swatch images
                            product.variationAttributes[idx].values[index].images = attributeValue.images; // eslint-disable-line
                        }
                    });
                    // terminate the loop
                    return true;
                }
                return false;
            });
        }
    } catch (ex) {
        logger.error('Error occured while adding cloudinary swatch images to product variation attributes for product with ID: {0}, message: {1} ', product.id, ex);
    }
};

/**
 * Add cloudinary images to bundle and set product.
 *
 * @param {Object} product - product model
 *
 * @returns {Object} product model
 */
baseCloudinaryModel.addCloudinaryImagesToSetAndBundles = function (product) {
    var subProducts = [];
    var subProductCldImgs;
    var colorAttrValueID;
    var productModel = product;

    try {
        if (productModel.productType === 'set') {
            subProducts = productModel.individualProducts;
        } else if (productModel.productType === 'bundle') {
            subProducts = productModel.bundledProducts;
        }

        var setAndBundleImages = baseCloudinaryModel.searchProductSetAndBundleImagesByTags(ProductMgr.getProduct(productModel.id));

        subProducts.forEach(function (subProduct, index) {
            if (subProduct.raw && subProduct.raw.variant) {
                colorAttrValueID = cloudinaryHelper.fetchVariationAttrValueId(subProduct.id, cloudinaryConstants.COLOR_ATTR);
            }

            subProductCldImgs = baseCloudinaryModel.getCloudinaryImages(subProduct.id, {
                pageType: cloudinaryConstants.PAGE_TYPES.PDP,
                variationAttrValueID: colorAttrValueID,
                setAndBundleImages: setAndBundleImages
            });

            // overwrite cld PGW container id
            if (subProductCldImgs && subProductCldImgs.galleryWidget && subProductCldImgs.galleryWidget.options &&
                subProductCldImgs.galleryWidget.options.container) {
                if (subProduct.raw && subProduct.raw.variant) {
                    subProductCldImgs.galleryWidget.options.container = subProductCldImgs.galleryWidget.options.container +
                    cloudinaryConstants.HYPHEN + subProduct.raw.masterProduct.ID + cloudinaryConstants.HYPHEN + subProduct.id;
                } else {
                    subProductCldImgs.galleryWidget.options.container = subProductCldImgs.galleryWidget.options.container +
                    cloudinaryConstants.HYPHEN + subProduct.id;
                }
            }

            if (!empty(subProductCldImgs)) {
                Object.defineProperty(subProduct.images, cloudinaryConstants.CLD_PRODUCT_IMGS, {
                    enumerable: true,
                    value: subProductCldImgs
                });
            }

            // add cloudinary swatch images
            baseCloudinaryModel.addCloudinaryProductSwatchImage(subProduct, cloudinaryConstants.PAGE_TYPES.CLD_PDP_SWATCH);

            if (productModel.productType === 'set') {
                productModel.individualProducts[index] = subProduct;
            } else if (productModel.productType === 'bundle') {
                productModel.bundledProducts[index] = subProduct;
            }

            colorAttrValueID = null;
        });
    } catch (ex) {
        logger.error('Error occured while adding set/bundled product cloudinary images, product: {0}, message: {1} ', productModel.id, ex);
    }

    return productModel;
};

/**
 * Update product variation attributes to add query param in case of product set and bundle.
 *
 * @param {Object} product - product model
 * @param {string} cloudinaryPGWContainerSuffix - PGW container suffix
 *
 * @returns {Object} product model
 */
baseCloudinaryModel.updateProductVariationAttrUrl = function (product, cloudinaryPGWContainerSuffix) {
    var productVariationAttrs;
    var productVariationAttrValues;
    var productModel = product;

    try {
        if (productModel && productModel.variationAttributes) {
            productVariationAttrs = productModel.variationAttributes;

            productVariationAttrs.forEach(function (productVariationAttr, index) {
                productVariationAttrValues = productVariationAttr.values;
                productVariationAttrValues.forEach(function (attrValue, idx) {
                    var attributeVal = attrValue;
                    if (!empty(attributeVal.url)) {
                        attributeVal.url += cloudinaryConstants.CLD_QUERY_PARAM_FOR_SET_AND_BUNDLE;
                        attributeVal.url += cloudinaryConstants.CLD_QURY_PARAM_FOR_PGW_CONTAINER_SUFFIX + cloudinaryPGWContainerSuffix;
                        productVariationAttrValues[idx] = attributeVal;
                    }
                });
                productVariationAttrs[index].values = productVariationAttrValues;
            });
            productModel.variationAttributes = productVariationAttrs;
        }
    } catch (ex) {
        logger.error('Error occured while updating product variation attribute value url to add query param for bundle or set product: {0}, message: {1} ', productModel.id, ex);
    }

    return productModel;
};

/**
 * Add cloudinary image along with sizes and srcset attributes to product model.
 *
 * @param {Object} product - product model
 * @param {Object} cldProductImage - object holding image url and srcset/size attributes
 *
 * @returns {Object} product model
 */
baseCloudinaryModel.addCloudinaryProductImage = function (product, cldProductImage) {
    if (!empty(product) && !empty(cldProductImage)) {
        Object.defineProperty(product.images, cloudinaryConstants.CLD_PRODUCT_IMG, {
            enumerable: true,
            value: {
                url: cldProductImage.url,
                srcset: cldProductImage.srcset,
                sizes: cldProductImage.sizes,
                isResponsive: cldProductImage.isResponsive
            }
        });
    }

    return product;
};

baseCloudinaryModel.updateProductCarouselImages = function (cldAssets, product) {
    var productModel = product;
    var cldImages = cldAssets.imageURLs;
    for (var idx = 0; idx < cldImages.length; idx++) {
        var asset = cldImages[idx];
        productModel.images.large[idx].url = asset.url;
        productModel.images.large[idx].absURL = asset.url;
        productModel.images.small[idx].url = asset.url;
        productModel.images.small[idx].absURL = asset.url;
    }
    return productModel;
};

module.exports = baseCloudinaryModel;
