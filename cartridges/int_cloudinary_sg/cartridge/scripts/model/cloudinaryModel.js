'use strict';

var logger = require('dw/system/Logger').getLogger('int_cloudinary', 'int_cloudinary');
var ProductMgr = require('dw/catalog/ProductMgr');

var cloudinaryConstants = require('*/cartridge/scripts/util/cloudinaryConstants');
var cloudinaryHelper = require('*/cartridge/scripts/helpers/cloudinaryHelpers');
var cloudinaryAPI = require('*/cartridge/scripts/api/cloudinaryApi');

var baseCloudinaryModel = module.superModule;

/**
 * Fetch cloudinary swatch images based on the cartridge mode.
 *
 * @param {string} masterProductID - master product ID
 * @param {Object} params - object holding optional params
 *
 * @returns {Object} object holding swatch image URL and required attributes
 *
 */
baseCloudinaryModel.getCloudinaryProductSwatchImage = function (masterProductID, params) {
    var swatchURLObjs = [];
    var swatchURLObj;
    var pageType;
    var product;
    var variantProductID;
    var productID = masterProductID;
    var variationAttrValueID;

    try {
        if (cloudinaryConstants.CLD_ENABLED && !empty(productID)) {
            if (!empty(params)) {
                pageType = params.pageType;
                variationAttrValueID = params.variationAttrValueID;
            }

            product = ProductMgr.getProduct(productID);

            if (cloudinaryConstants.CLD_CARTRIDGE_OPERATION_MODE === cloudinaryConstants.CLD_GET_ASSETS_BY_TAG_NAME_MODE) {
                swatchURLObj = cloudinaryAPI.getProductPrimaryImageURLUsingTagName(productID, {
                    pageType: pageType,
                    isSwatch: true,
                    variationAttrValueID: variationAttrValueID
                });
            } else if (cloudinaryConstants.CLD_CARTRIDGE_OPERATION_MODE === cloudinaryConstants.CLD_GET_ASSETS_BY_VIEW_TYPE_MODE) {
                if (product.master) {
                    variantProductID = cloudinaryHelper.getVariantProductIDByColor(product.ID, variationAttrValueID);
                }
                swatchURLObjs = cloudinaryAPI.getProductImagesByViewType(variantProductID, cloudinaryConstants.CLD_SWATCH_IMAGES_VIEW_TYPE, pageType);
                swatchURLObj = swatchURLObjs.length > 0 ? swatchURLObjs[0] : swatchURLObj;
            } else if (cloudinaryConstants.CLD_CARTRIDGE_OPERATION_MODE === cloudinaryConstants.CLD_GET_ASSETS_BY_AUTO_UPLOAD_MODE) {
                if (product.master) {
                    variantProductID = cloudinaryHelper.getVariantProductIDByColor(product.ID, variationAttrValueID);
                }
                swatchURLObjs = cloudinaryAPI.getProductImagesByAutoupload(variantProductID, pageType, cloudinaryConstants.CLD_SWATCH_IMAGES_VIEW_TYPE);
                swatchURLObj = swatchURLObjs.length > 0 ? swatchURLObjs[0] : swatchURLObj;
            }
        }
    } catch (ex) {
        logger.error('Error occurred while adding cloudinary swatch images to product variation attributes for product with ID: {0}, message: {1} ', productID, ex);
    }

    return swatchURLObj;
};

/**
 * get cloudinary images for product bundle or set.
 *
 * @param {string} productID - product ID
 * @param {Object} params - object holding optional params
 *
 * @returns {Object} object holding image assets URLs and widegt options
 */
baseCloudinaryModel.getSetBundleImages = function (productID, params) {
    var assets = {};
    var assetPublicID;
    var cldTag = '';
    var variationAttrValueID;
    var cldAssetURLs = [];
    var galleryOptions = {};
    var imageURL;
    var isSwatch = false;
    var mediaAssets = [];
    var pageType;
    var product;
    var subProducts;
    var subProduct;
    var prodID = productID;
    var videoURL;

    try {
        if (cloudinaryConstants.CLD_ENABLED) {
            // initialize optional params
            if (!empty(params)) {
                pageType = params.pageType;
            }

            product = ProductMgr.getProduct(prodID);

            if (product.productSet) {
                subProducts = product.getProductSetProducts();
            } else if (product.bundle) {
                subProducts = product.getBundledProducts();
            }

            galleryOptions.cloudName = cloudinaryConstants.CLD_CLOUDNAME;

            for (var idx = 0; idx < subProducts.size(); idx++) {
                subProduct = subProducts.get(idx);
                prodID = subProduct.ID;

                if (subProduct.variant) {
                    variationAttrValueID = cloudinaryHelper.fetchVariationAttrValueId(subProduct.ID);
                    subProduct = subProduct.master;
                }

                if (cloudinaryConstants.CLD_GALLERY_ENABLED) {
                    galleryOptions = cloudinaryHelper.getCloudinaryGalleryStyles(subProduct);

                    if (cloudinaryConstants.CLD_CARTRIDGE_OPERATION_MODE === cloudinaryConstants.CLD_GET_ASSETS_BY_TAG_NAME_MODE) {
                        cldTag = cloudinaryHelper.getCloudinaryTagName(subProduct);

                        if (!empty(variationAttrValueID)) {
                            cldTag += cloudinaryConstants.HYPHEN + variationAttrValueID;
                        }

                        mediaAssets.push({ tag: cldTag, mediaType: cloudinaryConstants.CLD_IMAGE_RESOURCE_TYPE });
                        mediaAssets.push({ tag: cldTag, mediaType: cloudinaryConstants.CLD_VIDEO_RESOURCE_TYPE });
                        // TODO: remove this commented line after cld resolves issues for spin sets
                    } else if (cloudinaryConstants.CLD_CARTRIDGE_OPERATION_MODE === cloudinaryConstants.CLD_GET_ASSETS_BY_VIEW_TYPE_MODE) {
                        cldAssetURLs = cloudinaryAPI.getProductImagesByViewType(prodID, cloudinaryConstants.CLD_HIGH_RES_IMAGES_VIEW_TYPE, pageType);
                        for (var index = 0; index < cldAssetURLs.length; index++) {
                            imageURL = cldAssetURLs[index].url;
                            assetPublicID = imageURL.substring(imageURL.lastIndexOf(cloudinaryConstants.CLD_IMAGE_PATH),
                                imageURL.lastIndexOf(cloudinaryConstants.QUESTION_MARK));
                            if (!empty(assetPublicID)) {
                                mediaAssets.push({ publicId: assetPublicID, mediaType: cloudinaryConstants.CLD_IMAGE_RESOURCE_TYPE });
                            }
                        }
                        // add videos in PGW fetched by viewtype
                        if (cloudinaryConstants.CLD_INCLUDE_VIDEOS_IN_PGW) {
                            cldAssetURLs = cloudinaryAPI.getProductVideosByViewType(prodID);
                            for (var i = 0; i < cldAssetURLs.length; i++) {
                                videoURL = cldAssetURLs[i].videoURL.toString();
                                assetPublicID = videoURL.substring(videoURL.lastIndexOf(cloudinaryConstants.CLD_VIDEO_PATH),
                                    videoURL.lastIndexOf(cloudinaryConstants.DOT));
                                if (!empty(assetPublicID)) {
                                    mediaAssets.push({ publicId: assetPublicID, mediaType: cloudinaryConstants.CLD_VIDEO_RESOURCE_TYPE });
                                }
                            }
                        }
                    }
                } else if (cloudinaryConstants.CLD_CARTRIDGE_OPERATION_MODE === cloudinaryConstants.CLD_GET_ASSETS_BY_TAG_NAME_MODE) {
                    assets.imageURLs = cloudinaryAPI.getProductImagesByTagName(prodID, {
                        pageType: pageType,
                        isSwatch: isSwatch,
                        variationAttrValueID: variationAttrValueID
                    });
                } else if (cloudinaryConstants.CLD_CARTRIDGE_OPERATION_MODE === cloudinaryConstants.CLD_GET_ASSETS_BY_VIEW_TYPE_MODE) {
                    assets.imageURLs = cloudinaryAPI.getProductImagesByViewType(prodID, cloudinaryConstants.CLD_HIGH_RES_IMAGES_VIEW_TYPE, pageType);
                } else if (cloudinaryConstants.CLD_CARTRIDGE_OPERATION_MODE === cloudinaryConstants.CLD_GET_ASSETS_BY_AUTO_UPLOAD_MODE) {
                    assets.imageURLs = cloudinaryAPI.getProductImagesByAutoupload(prodID, pageType, cloudinaryConstants.CLD_HIGH_RES_IMAGES_VIEW_TYPE);
                }

                if (!empty(mediaAssets)) {
                    galleryOptions.mediaAssets = mediaAssets;
                    assets.galleryWidget = { options: galleryOptions };
                }
            }
        }
    } catch (ex) {
        logger.error('Error occurred while getting images and options for product set or product bundle with ID: {0}, error: {1}', productID, ex);
    }

    return assets;
};

module.exports = baseCloudinaryModel;
