'use strict';
/** ************************************************************************************************
*@file        : File Name - cloudinaryApi
*@description : This script file is the cloudinary script API which can be used by developers
*               to get different assets for product, catalog and content library.
*               It also includes methods to apply transformations on URLs, URLs could be absolute,
*               relative or even just asset name, you would be getting the fully qualified URL with
*               transformations applied.
*
*@author      : PixelMEDIA
*@created     : 23 April 2020
****************************************************************************************************/

// API includes
var ContentMgr = require('dw/content/ContentMgr');
var ProductMgr = require('dw/catalog/ProductMgr');
var Site = require('dw/system/Site');
var URLUtils = require('dw/web/URLUtils');
var logger = require('dw/system/Logger').getLogger('int_cloudinary', 'int_cloudinary');

// script includes
var cloudinaryConstants = require('*/cartridge/scripts/util/cloudinaryConstants');
var cldFetchResourcesSvc = require('*/cartridge/scripts/service/cldFetchResources');
var cloudinaryHelper = require('*/cartridge/scripts/helpers/cloudinaryHelpers');
var cldTransformationAPI = require('*/cartridge/scripts/api/cloudinaryTranformationApi');
var cloudinaryUtils = require('*/cartridge/scripts/util/cloudinaryUtils');

/**
 * Apply transformations present on different levels(global/catalog/product) on product image absolute URL and build
 * srcset and sizes attributes for the HTML <img> tag.
 *
 * @param {string} productID - product ID
 * @param {string} absURL - image absolute URL
 * @param {string} pageType - page type
 *
 * @returns {Object} object holding transformed URL and srcset attributes
 */
var applyTransformationOnProductImageAbsoluteURL = function (productID, absURL, pageType) {
    var breakpoints;
    var dimensionsStr = '';
    var finalURL = '';
    var srcsetUrl = '';
    var imgGlobalTransformations = '';
    var imgProdCatTransformations = '';
    var imgPageTypeSettings;
    var token;
    var urlFirstPart = '';
    var urlLastPart = '';
    var urlObj = {};

    try {
        if (cloudinaryConstants.CLD_ENABLED) {
            // check if URL is absolute
            if (!empty(absURL) && absURL.indexOf(cloudinaryConstants.IMAGE_UPLOAD_URL_RESOURCE_TYPE) > -1) {
                // check if URL includes image path
                if (absURL.indexOf(cloudinaryConstants.CLD_IMAGE_PATH) > -1) {
                    token = absURL.indexOf(cloudinaryConstants.CLD_IMAGE_PATH);
                    urlFirstPart = absURL.substring(0, token - 1);
                    urlLastPart = absURL.substring(token);
                } else {
                    token = absURL.indexOf(cloudinaryConstants.IMAGE_UPLOAD_URL_RESOURCE_TYPE) + cloudinaryConstants.IMAGE_UPLOAD_URL_RESOURCE_TYPE.length;
                    urlFirstPart = absURL.substring(0, token);
                    urlLastPart = absURL.substring(token + 1);
                }

                if (!empty(urlFirstPart) && !empty(urlFirstPart)) {
                    if (urlFirstPart.lastIndexOf(cloudinaryConstants.FORWARD_SLASH) !== urlFirstPart.length - 1) {
                        urlFirstPart += cloudinaryConstants.FORWARD_SLASH;
                    }

                    // get transformations
                    imgGlobalTransformations = cldTransformationAPI.getGlobalImageTransformation();
                    if (!empty(imgGlobalTransformations)) {
                        imgGlobalTransformations += cloudinaryConstants.FORWARD_SLASH;
                    }

                    imgProdCatTransformations = cldTransformationAPI.getProductCatalogImageTransformation(productID);
                    if (!empty(imgProdCatTransformations)) {
                        imgProdCatTransformations += cloudinaryConstants.FORWARD_SLASH;
                    }
                    // get image setting for page types
                    if (!empty(pageType)) {
                        imgPageTypeSettings = cldTransformationAPI.getImageDimensions(pageType);

                        if (!empty(imgPageTypeSettings)) {
                            urlObj.isResponsive = imgPageTypeSettings.isResponsive;
                            if (cloudinaryConstants.DIMENSIONS_STRING_KEY in imgPageTypeSettings && !empty(imgPageTypeSettings[cloudinaryConstants.DIMENSIONS_STRING_KEY])) {
                                dimensionsStr = imgPageTypeSettings[cloudinaryConstants.DIMENSIONS_STRING_KEY] + cloudinaryConstants.FORWARD_SLASH;
                            }
                            if (cloudinaryConstants.BREAKPOINTS_KEY in imgPageTypeSettings && !empty(imgPageTypeSettings[cloudinaryConstants.BREAKPOINTS_KEY])) {
                                breakpoints = imgPageTypeSettings[cloudinaryConstants.BREAKPOINTS_KEY];
                            }
                        }
                    }

                    // build transformed image URL
                    finalURL = urlFirstPart + imgGlobalTransformations + imgProdCatTransformations + dimensionsStr + urlLastPart;
                    finalURL = cloudinaryHelper.addTrackingQueryParam(finalURL);
                    urlObj.url = finalURL;

                    if (!empty(imgPageTypeSettings) && imgPageTypeSettings.isResponsive) {
                        srcsetUrl = urlFirstPart + imgGlobalTransformations + imgProdCatTransformations + dimensionsStr + urlLastPart;
                    } else {
                        srcsetUrl = urlFirstPart + imgGlobalTransformations + imgProdCatTransformations + urlLastPart;
                    }
                    srcsetUrl = cloudinaryHelper.addTrackingQueryParam(srcsetUrl);
                    // build srcset object
                    if (!empty(breakpoints)) {
                        var srcsetObj = cldTransformationAPI.getImageSrcset(srcsetUrl, breakpoints);
                        if (!empty(srcsetObj)) {
                            if (!empty(srcsetObj.srcset)) {
                                urlObj.srcset = srcsetObj.srcset;
                            }
                            if (!empty(srcsetObj.sizes)) {
                                urlObj.sizes = srcsetObj.sizes;
                            }
                        }
                    }
                }
            }
        }
    } catch (ex) {
        logger.error(cloudinaryConstants.CLD_APPLY_IMG_ABS_URL_TRANSFORM_ERROR, absURL, ex);
    }

    return urlObj;
};

/**
 * Apply transformations present on different levels(global/catalog/product) on product image relative URL and build
 * srcset and sizes attributes for the HTML <img> tag.
 *
 * @param {string} productID - product ID
 * @param {string} relURL - image relative URL or image name
 * @param {string} pageType - page type
 *
 * @returns {Object} object holding transformed URL and srcset attributes
 */
var applyTransformationOnProductImageRelativeURL = function (productID, relURL, pageType) {
    var urlObj = {};
    var relativeURL = relURL;

    try {
        if (cloudinaryConstants.CLD_ENABLED) {
            if (!empty(relativeURL)) {
                // prepend relativeURL with '/'
                if (relativeURL.indexOf(cloudinaryConstants.FORWARD_SLASH) !== 0) {
                    relativeURL = cloudinaryConstants.FORWARD_SLASH + relativeURL;
                }
                // if asset name then prepend with image upload path
                if (relativeURL.indexOf(cloudinaryConstants.CLD_IMAGE_PATH) === -1) {
                    if (cloudinaryConstants.CLD_IMAGE_PATH.indexOf(cloudinaryConstants.FORWARD_SLASH) !== 0) {
                        relativeURL = cloudinaryConstants.FORWARD_SLASH + cloudinaryConstants.CLD_IMAGE_PATH + relativeURL;
                    } else {
                        relativeURL = cloudinaryConstants.CLD_IMAGE_PATH + relativeURL;
                    }
                }
                relativeURL = cloudinaryUtils.replaceSpecialChars(relativeURL);
                var absURL = cloudinaryHelper.getCLDBasePath() + cloudinaryConstants.IMAGE_UPLOAD_URL_RESOURCE_TYPE + relativeURL;
                urlObj = applyTransformationOnProductImageAbsoluteURL(productID, absURL, pageType);
            }
        }
    } catch (ex) {
        logger.error(cloudinaryConstants.CLD_APPLY_IMG_REL_URL_TRANSFORM_ERROR, relativeURL, ex);
    }

    return urlObj;
};

/**
 * Apply transformations present on different levels(global/catalog/product) on product video absolute URL.
 * It also returns the video poster to use in Cloudinary video player.
 *
 * @param {string} productID - product ID
 * @param {string} absURL - video absolute URL
 * @param {string} pageType - page type
 *
 * @returns {Object} object holding transformed video and poster image URL
 */
var applyTransformationOnProductVideoAbsoluteURL = function (productID, absURL) {
    var finalURL = '';
    var token;
    var videoGlobalTransformations = '';
    var videoProdCatTransformations = '';
    var videoPoster = '';
    var urlFirstPart;
    var urlLastPart;

    try {
        if (cloudinaryConstants.CLD_ENABLED) {
            // check if URL is absolute
            if (!empty(absURL) && absURL.indexOf(cloudinaryConstants.VIDEO_UPLOAD_URL_RESOURCE_TYPE) > -1) {
                // check if URL includes video path
                if (absURL.indexOf(cloudinaryConstants.CLD_VIDEO_PATH) > -1) {
                    token = absURL.indexOf(cloudinaryConstants.CLD_VIDEO_PATH);
                    urlFirstPart = absURL.substring(0, token - 1);
                    urlLastPart = absURL.substring(token);
                } else {
                    token = absURL.indexOf(cloudinaryConstants.VIDEO_UPLOAD_URL_RESOURCE_TYPE) + cloudinaryConstants.VIDEO_UPLOAD_URL_RESOURCE_TYPE.length;
                    urlFirstPart = absURL.substring(0, token);
                    urlLastPart = absURL.substring(token + 1);
                }

                if (!empty(urlFirstPart) && !empty(urlLastPart)) {
                    if (urlFirstPart.lastIndexOf(cloudinaryConstants.FORWARD_SLASH) !== urlFirstPart.length - 1) {
                        urlFirstPart += cloudinaryConstants.FORWARD_SLASH;
                    }

                    videoGlobalTransformations = cldTransformationAPI.getGlobalVideoTransformation();
                    if (!empty(videoGlobalTransformations)) {
                        videoGlobalTransformations += cloudinaryConstants.FORWARD_SLASH;
                    }

                    videoProdCatTransformations = cldTransformationAPI.getProductCatalogVideoTransformation(productID);
                    if (!empty(videoProdCatTransformations)) {
                        videoProdCatTransformations += cloudinaryConstants.FORWARD_SLASH;
                    }
                    // build video transformed URL
                    finalURL = urlFirstPart + videoGlobalTransformations + videoProdCatTransformations + urlLastPart;
                    finalURL = cloudinaryHelper.addTrackingQueryParam(finalURL);
                    videoPoster = cloudinaryHelper.getVideoPoster(finalURL);
                }
            }
        }
    } catch (ex) {
        logger.error(cloudinaryConstants.CLD_APPLY_VIDEO_ABS_URL_TRANSFORM_ERROR, absURL, ex);
    }

    return { videoURL: finalURL, videoPoster: videoPoster };
};

/**
 * Apply transformations present on different levels(global/catalog/product) on product video relative URL.
 *
 * @param {string} productID - product ID
 * @param {string} relURL - video relative URL or video name
 *
 * @returns {Object} object holding transformed video and poster image URLs
 */
var applyTransformationOnProductVideoRelativeURL = function (productID, relURL) {
    var finalURL = '';
    var finalURLObj;
    var relativeURL = relURL;

    try {
        if (cloudinaryConstants.CLD_ENABLED) {
            if (!empty(relativeURL)) {
                // prepend relativeURL with '/'
                if (relativeURL.indexOf(cloudinaryConstants.FORWARD_SLASH) !== 0) {
                    relativeURL = cloudinaryConstants.FORWARD_SLASH + relativeURL;
                }
                // if asset name then prepend with image upload path
                if (relativeURL.indexOf(cloudinaryConstants.CLD_VIDEO_PATH) === -1) {
                    relativeURL = cloudinaryConstants.CLD_VIDEO_PATH + relativeURL;
                }
                finalURL = cloudinaryHelper.getCLDBasePath() + cloudinaryConstants.VIDEO_UPLOAD_URL_RESOURCE_TYPE +
                    cloudinaryConstants.FORWARD_SLASH + relativeURL;
                finalURLObj = applyTransformationOnProductVideoAbsoluteURL(productID, finalURL);
            }
        }
    } catch (ex) {
        logger.error(cloudinaryConstants.CLD_APPLY_VIDEO_REL_URL_TRANSFORM_ERROR, relativeURL, ex);
    }

    return finalURLObj;
};

/**
 * Filter image assets based on the product tag name.
 *
 * @param {List} assets - assets list
 * @param {string} tagName - the tag name
 *
 * @returns {array} filteredAssets - filtered assets
 */
var filterAssetsByTagName = function (assets, tagName) {
    var filteredAssets = [];
    for (var idx = 0; idx < assets.length; idx++) {
        var asset = assets[idx];
        if (asset.resource_type === 'image' && asset.tags.indexOf(tagName) > -1) {
            filteredAssets.push(asset);
        }
    }
    return filteredAssets;
};

/**
 * Fetch image assets from Cloudinary based on the product tag name.
 * Sort them according to asset's position specified in metadata and build an
 * array of image assets URLs with transformations applied and also includes
 * srcset and sizes attributes for the HTML <img> tag.
 *
 * @param {string} productID - product ID
 * @param {Object} params - object holding optional params
 *
 * @returns {array} image assets URLs including transformations and srcset/sizes attributes
 */
var getProductImagesByTagName = function (productID, params) {
    var imgAssets = [];
    var imgAssetUrls = [];
    var isSwatch;
    var product;
    var pageType;
    var tagName = '';
    var urlObj;
    var urlObj360;
    var urlObj3D;
    var variationAttrValueID;
    var cld360Tag;
    var cld3DTag;
    var tagName360 = '';
    var tagName3D = '';
    var imgAssets360 = [];
    var imgAssets3D = [];
    var altText;
    var altText360;
    var altText3D;

    try {
        if (cloudinaryConstants.CLD_ENABLED) {
            // initialize optional params
            if (!empty(params)) {
                isSwatch = params.isSwatch;
                variationAttrValueID = params.variationAttrValueID;
                pageType = params.pageType;
                cld360Tag = params.cld360Tag;
                cld3DTag = params.cld3DTag;
            }

            product = ProductMgr.getProduct(productID);

            if (product) {
                // check if product is variant then fetch it's master product
                if (product.variant || product.variationGroup) {
                    product = product.getMasterProduct();
                }

                // fetch product tag name
                tagName = cloudinaryHelper.getCloudinaryTagName(product);

                if (isSwatch) {
                    tagName = tagName + cloudinaryConstants.HYPHEN + variationAttrValueID + cloudinaryConstants.HYPHEN +
                        cloudinaryConstants.CLD_SWATCH_IMAGES_VIEW_TYPE;
                } else {
                    tagName = !empty(variationAttrValueID)
                        ? tagName + cloudinaryConstants.HYPHEN + variationAttrValueID
                        : tagName;
                }

                if (!empty(params.setAndBundleImages) && params.setAndBundleImages.length > 0) {
                    imgAssets = filterAssetsByTagName(params.setAndBundleImages, tagName);
                } else {
                    imgAssets = cldFetchResourcesSvc.fetchResources(tagName, cloudinaryConstants.CLD_IMAGE_RESOURCE_TYPE);
                }

                imgAssets = cloudinaryHelper.sortResourcesByAssetPosition(imgAssets);

                if (!empty(imgAssets)) {
                    var asset = null;
                    for (var idxAssets = 0; idxAssets < imgAssets.length; idxAssets++) {
                        asset = imgAssets[idxAssets];

                        if (!empty(asset.metadata)) {
                            for (var assetIndex = 0; assetIndex < asset.metadata.length; assetIndex++) {
                                if (asset.metadata[assetIndex].label === cloudinaryConstants.CLD_SMD_ALT_TEXT_KEY) {
                                    altText = asset.metadata[assetIndex].value;
                                }
                            }
                        }

                        if (!empty(asset.public_id)) {
                            urlObj = applyTransformationOnProductImageRelativeURL(productID, asset.public_id, pageType);

                            if (!empty(altText)) {
                                urlObj.alt = altText;
                            }

                            if (!empty(urlObj)) {
                                imgAssetUrls.push(urlObj);
                            }
                        }
                    }
                }

                if (cld360Tag) {
                    tagName360 = tagName + cloudinaryConstants.CLD_360_SPIN_SET_TAG_SUFFIX;
                    imgAssets360 = cldFetchResourcesSvc.fetchResources(tagName360, cloudinaryConstants.CLD_IMAGE_RESOURCE_TYPE);
                    imgAssets360 = cloudinaryHelper.sortResourcesByAssetPosition(imgAssets360);

                    if (!empty(imgAssets360)) {
                        var asset360 = null;
                        for (var idx360 = 0; idx360 < imgAssets360.length; idx360++) {
                            asset360 = imgAssets360[idx360];

                            if (!empty(asset360.metadata)) {
                                for (var iMeta = 0; iMeta < asset360.metadata.length; iMeta++) {
                                    if (asset360.metadata[iMeta].label === cloudinaryConstants.CLD_SMD_ALT_TEXT_KEY) {
                                        altText360 = asset360.metadata[iMeta].value;
                                    }
                                }
                            }

                            if (!empty(asset360.public_id)) {
                                urlObj360 = applyTransformationOnProductImageRelativeURL(productID, asset360.public_id, pageType);

                                if (!empty(altText360)) {
                                    urlObj360.alt = altText360;
                                }

                                if (!empty(urlObj360)) {
                                    imgAssetUrls.push(urlObj360);
                                }
                            }
                        }
                    }
                }

                if (cld3DTag) {
                    tagName3D = tagName + cloudinaryConstants.CLD_3D_OBJECT_TAG_SUFFIX_SLASH;
                    imgAssets3D = cldFetchResourcesSvc.fetchResources(tagName3D, cloudinaryConstants.CLD_IMAGE_RESOURCE_TYPE);
                    imgAssets3D = cloudinaryHelper.sortResourcesByAssetPosition(imgAssets3D);

                    if (!empty(imgAssets3D)) {
                        var asset3D = null;
                        for (var idx3D = 0; idx3D < imgAssets3D.length; idx3D++) {
                            asset3D = imgAssets3D[idx3D];

                            if (!empty(asset3D.metadata)) {
                                for (var i3dMeta = 0; i3dMeta < asset3D.metadata.length; i3dMeta++) {
                                    if (asset3D.metadata[i3dMeta].label === cloudinaryConstants.CLD_SMD_ALT_TEXT_KEY) {
                                        altText3D = asset3D.metadata[i3dMeta].value;
                                    }
                                }
                            }

                            if (!empty(asset3D.public_id)) {
                                urlObj3D = applyTransformationOnProductImageRelativeURL(productID, asset3D.public_id, pageType);

                                if (!empty(altText3D)) {
                                    urlObj3D.alt = altText3D;
                                }

                                if (!empty(urlObj3D)) {
                                    imgAssetUrls.push(urlObj3D);
                                }
                            }
                        }
                    }
                }
            }
        } else {
            logger.debug(cloudinaryConstants.CLD_DISABLED);
        }
    } catch (ex) {
        logger.error(cloudinaryConstants.CLD_GET_IMG_ASSETS_URLS_ERROR, productID, ex);
    }

    return imgAssetUrls;
};

/**
 * Fetch video assets from Cloudinary based on the product tag name.
 * Sort them according to asset's position specified in metadata and build an
 * array of video assets URLs with transformations applied.
 *
 * @param {string} productID - product ID
 *
 * @returns {array} video assets URLs including transformations
 */
var getProductVideosByTagName = function (productID) {
    var asset;
    var assetRelURL;
    var assetURL;
    var product;
    var tagName;
    var videoAssets = [];
    var videoAssetUrls = [];

    try {
        if (cloudinaryConstants.CLD_ENABLED) {
            product = ProductMgr.getProduct(productID);

            if (product) {
                if (product.variant || product.variationGroup) {
                    product = product.getMasterProduct();
                }
                // fetch product tag name
                tagName = cloudinaryHelper.getCloudinaryTagName(product);

                videoAssets = cldFetchResourcesSvc.fetchResources(tagName, cloudinaryConstants.CLD_VIDEO_RESOURCE_TYPE);
                videoAssets = cloudinaryHelper.sortResourcesByAssetPosition(videoAssets);

                if (!empty(videoAssets)) {
                    for (var idx = 0; idx < videoAssets.length; idx++) {
                        asset = videoAssets[idx];
                        if (!empty(asset.public_id)) {
                            assetRelURL = asset.public_id + cloudinaryConstants.DOT + asset.format;
                            assetURL = applyTransformationOnProductVideoRelativeURL(productID, assetRelURL);
                            if (!empty(assetURL)) {
                                videoAssetUrls.push(assetURL);
                            }
                        }
                    }
                }
            }
        }
    } catch (ex) {
        logger.error(cloudinaryConstants.CLD_GET_VIDEO_ASSETS_URLS_ERROR, productID, ex);
    }

    return videoAssetUrls;
};

/**
 * Fetch raw assets from Cloudinary based on the product tag name.
 * Sort them according to asset's position specified in the metadata and build an
 * array of raw assets URLs.
 *
 * @param {string} productID - product ID
 * @param {string} resourceType - raw or image
 *
 * @returns {array} raw assets URLs
 */
var getProductRawDataByTagName = function (productID, resourceType) {
    var product;
    var rawAssets = [];
    var tagName;

    try {
        if (cloudinaryConstants.CLD_ENABLED) {
            product = ProductMgr.getProduct(productID);
            if (product) {
                // fetch product tag name
                tagName = cloudinaryHelper.getCloudinaryTagName(product);

                rawAssets = cldFetchResourcesSvc.fetchResources(tagName, resourceType);
                rawAssets = cloudinaryHelper.sortResourcesByAssetPosition(rawAssets);
            }
        }
    } catch (ex) {
        logger.error(cloudinaryConstants.CLD_GET_RAW_ASSETS_URLS_ERROR, productID, ex);
    }

    return rawAssets;
};

/**
 * This is the local method used by other methods to process common logic for library content.
 * It applies transformations on both image and video library assets.
 *
 * @param {string} relURL - relative URL for either image or video
 * @param {string} urlType - URL type (video/image)
 * @param {string} dimensionsStr - dimensions for image (optional)
 *
 * @returns {string} final transformed URL
 */
function applyTransformationOnContent(relURL, urlType, dimensionsStr) {
    var contentImgPath = '';
    var finalURL = '';
    var globalTransformations = '';
    var libraryTransformations = '';
    var uploadResourceType = '';
    var siteLibrary;
    var currentSite;
    var libraryID = '';
    var dimensionsStrVal = dimensionsStr;

    try {
        if (!empty(relURL)) {
            if (cloudinaryConstants.CLD_CARTRIDGE_CONTENT_OPERATION_MODE === cloudinaryConstants.CLD_GET_ASSETS_BY_VIEW_TYPE_MODE) {
                contentImgPath = cloudinaryHelper.removeLeadingAndTrailingSlashes(cloudinaryConstants.CLD_CONTENT_IMAGE_PATH);

                // see if assigned library is private or shared
                siteLibrary = ContentMgr.getSiteLibrary();
                currentSite = Site.getCurrent();
                libraryID = siteLibrary.ID === cloudinaryConstants.PRIVATE_LIBRARY ? currentSite.ID : siteLibrary.ID;
                if (!empty(libraryID)) {
                    libraryID = cloudinaryConstants.FORWARD_SLASH + libraryID;
                }
            }

            if (urlType === cloudinaryConstants.CONTENT_TYPE_IMG) {
                globalTransformations = cldTransformationAPI.getGlobalImageTransformation();
                if (!empty(globalTransformations)) {
                    globalTransformations += cloudinaryConstants.FORWARD_SLASH;
                }

                libraryTransformations = cldTransformationAPI.getContentLibraryImageTransformation();
                if (!empty(libraryTransformations)) {
                    libraryTransformations += cloudinaryConstants.FORWARD_SLASH;
                }
                uploadResourceType = cloudinaryConstants.IMAGE_UPLOAD_URL_RESOURCE_TYPE + cloudinaryConstants.FORWARD_SLASH;
            } else if (urlType === cloudinaryConstants.CONTENT_TYPE_VIDEO) {
                globalTransformations = cldTransformationAPI.getGlobalVideoTransformation();
                if (!empty(globalTransformations)) {
                    globalTransformations += cloudinaryConstants.FORWARD_SLASH;
                }

                libraryTransformations = cldTransformationAPI.getContentLibraryVideoTransformation();
                if (!empty(libraryTransformations)) {
                    libraryTransformations += cloudinaryConstants.FORWARD_SLASH;
                }
                uploadResourceType = cloudinaryConstants.VIDEO_UPLOAD_URL_RESOURCE_TYPE + cloudinaryConstants.FORWARD_SLASH;
            }

            if (empty(dimensionsStrVal)) {
                dimensionsStrVal = '';
            }

            if (cloudinaryConstants.CLD_CARTRIDGE_CONTENT_OPERATION_MODE === cloudinaryConstants.CLD_GET_ASSETS_BY_AUTO_UPLOAD_MODE) {
                finalURL = cloudinaryHelper.getCLDBasePath() + uploadResourceType + globalTransformations + libraryTransformations +
                    dimensionsStrVal + cloudinaryConstants.CLD_AUTOUPLOAD_MAPPING + relURL;
            } else if (cloudinaryConstants.CLD_CARTRIDGE_CONTENT_OPERATION_MODE === cloudinaryConstants.CLD_GET_ASSETS_BY_VIEW_TYPE_MODE) {
                finalURL = cloudinaryHelper.getCLDBasePath() + uploadResourceType + globalTransformations +
                    libraryTransformations + dimensionsStrVal + contentImgPath + libraryID + relURL;
            }
            // replace spaces in URL
            finalURL = finalURL.replace(cloudinaryConstants.URL_EMPTY_SPACES_REGEX, cloudinaryConstants.URL_EMPTY_SPACES_REPLACE);
            finalURL = cloudinaryHelper.addTrackingQueryParam(finalURL);
        }
    } catch (ex) {
        logger.error(cloudinaryConstants.CLD_APPLY_CONTENT_REL_URL_TRANSFORM_ERROR, relURL, ex);
    }

    return finalURL;
}

/**
 * Apply transformations on library content image relative URL and build srcset and size attributes for
 * the HTML <img> tag.
 *
 * @param {string} relURL - image relative URL
 * @param {string} pageType - page type
 *
 * @returns {Object} object holding transformed URL and srcset attributes
 */
var applyTransformationOnContentImageRelativeURL = function (relURL, pageType) {
    var breakpoints;
    var dimensionsStr = '';
    var finalURL = '';
    var srcsetUrl = '';
    var imgPageTypeSettings;
    var urlObj = {};
    var relativeURL = relURL;

    try {
        if (cloudinaryConstants.CLD_ENABLED) {
            if (!empty(relativeURL)) {
                if (cloudinaryConstants.CLD_CARTRIDGE_CONTENT_OPERATION_MODE === cloudinaryConstants.CLD_GET_ASSETS_BY_AUTO_UPLOAD_MODE) {
                    var absURL = URLUtils.absImage(URLUtils.CONTEXT_LIBRARY, null, relativeURL, null);
                    if (!empty(absURL)) {
                        relativeURL = absURL.relative();
                    }
                } else if (cloudinaryConstants.CLD_CARTRIDGE_CONTENT_OPERATION_MODE === cloudinaryConstants.CLD_GET_ASSETS_BY_VIEW_TYPE_MODE) {
                    relativeURL = relativeURL.replace(cloudinaryConstants.DEFAULT_DIRECTORY, cloudinaryConstants.EMPTY_STRING);
                    // prepend relativeURL with '/'
                    if (relativeURL.indexOf(cloudinaryConstants.FORWARD_SLASH) !== 0) {
                        relativeURL = cloudinaryConstants.FORWARD_SLASH + relativeURL;
                    }
                    relativeURL = cloudinaryUtils.replaceSpecialChars(relativeURL);
                }
                // get image setting for page types
                if (!empty(pageType)) {
                    imgPageTypeSettings = cldTransformationAPI.getImageDimensions(pageType);

                    if (!empty(imgPageTypeSettings)) {
                        urlObj.isResponsive = imgPageTypeSettings.isResponsive;
                        if (cloudinaryConstants.DIMENSIONS_STRING_KEY in imgPageTypeSettings && !empty(imgPageTypeSettings[cloudinaryConstants.DIMENSIONS_STRING_KEY])) {
                            dimensionsStr = imgPageTypeSettings[cloudinaryConstants.DIMENSIONS_STRING_KEY] + cloudinaryConstants.FORWARD_SLASH;
                        }
                        if (cloudinaryConstants.BREAKPOINTS_KEY in imgPageTypeSettings && !empty(imgPageTypeSettings[cloudinaryConstants.BREAKPOINTS_KEY])) {
                            breakpoints = imgPageTypeSettings[cloudinaryConstants.BREAKPOINTS_KEY];
                        }
                    }
                }

                finalURL = applyTransformationOnContent(relativeURL, cloudinaryConstants.CONTENT_TYPE_IMG, dimensionsStr);
                urlObj.url = finalURL;
                if (!empty(imgPageTypeSettings) && imgPageTypeSettings.isResponsive) {
                    srcsetUrl = applyTransformationOnContent(relativeURL, cloudinaryConstants.CONTENT_TYPE_IMG, dimensionsStr);
                } else {
                    srcsetUrl = applyTransformationOnContent(relativeURL, cloudinaryConstants.CONTENT_TYPE_IMG, cloudinaryConstants.EMPTY_STRING);
                }

                // build srcset object
                if (!empty(breakpoints)) {
                    var srcsetObj = cldTransformationAPI.getImageSrcset(srcsetUrl, breakpoints);
                    if (!empty(srcsetObj)) {
                        if (!empty(srcsetObj.srcset)) {
                            urlObj.srcset = srcsetObj.srcset;
                        }
                        if (!empty(srcsetObj.sizes)) {
                            urlObj.sizes = srcsetObj.sizes;
                        }
                    }
                }
            }
        }
    } catch (ex) {
        logger.error(cloudinaryConstants.CLD_APPLY_CONTENT_IMG_REL_URL_TRANSFORM_ERROR, relativeURL, ex);
    }

    return urlObj;
};

/**
 * Apply transformations on library content image absolute URL and build srcset and size attributes for
 * the HTML <img> tag.
 *
 * @param {string} absURL - image absolute URLs
 * @param {string} pageType - page type
 *
 * @returns {Object} object holding transformed URL and srcset attributes
 */
var applyTransformationOnContentImageAbsoluteURL = function (absURL, pageType) {
    var breakpoints;
    var dimensionsStr = '';
    var finalURL = '';
    var srcsetUrl = '';
    var imgPageTypeSettings;
    var relURL = '';
    var urlObj = {};

    try {
        if (cloudinaryConstants.CLD_ENABLED) {
            if (!empty(absURL)) {
                if (cloudinaryConstants.CLD_CARTRIDGE_CONTENT_OPERATION_MODE === cloudinaryConstants.CLD_GET_ASSETS_BY_AUTO_UPLOAD_MODE) {
                    relURL = absURL.substring(absURL.indexOf(cloudinaryConstants.DW_STATIC_URL_REFERENCE));
                } else if (cloudinaryConstants.CLD_CARTRIDGE_CONTENT_OPERATION_MODE === cloudinaryConstants.CLD_GET_ASSETS_BY_VIEW_TYPE_MODE) {
                    relURL = absURL.substring(absURL.indexOf(cloudinaryConstants.DEFAULT_DIRECTORY) + cloudinaryConstants.DEFAULT_DIRECTORY.length);
                    relURL = relURL.substring(relURL.indexOf(cloudinaryConstants.FORWARD_SLASH));
                    relURL = cloudinaryUtils.replaceSpecialChars(relURL);
                }

                // get image setting for page types
                if (!empty(pageType)) {
                    imgPageTypeSettings = cldTransformationAPI.getImageDimensions(pageType);

                    if (!empty(imgPageTypeSettings)) {
                        urlObj.isResponsive = imgPageTypeSettings.isResponsive;
                        if (cloudinaryConstants.DIMENSIONS_STRING_KEY in imgPageTypeSettings && !empty(imgPageTypeSettings[cloudinaryConstants.DIMENSIONS_STRING_KEY])) {
                            dimensionsStr = imgPageTypeSettings[cloudinaryConstants.DIMENSIONS_STRING_KEY] + cloudinaryConstants.FORWARD_SLASH;
                        }
                        if (cloudinaryConstants.BREAKPOINTS_KEY in imgPageTypeSettings && !empty(imgPageTypeSettings[cloudinaryConstants.BREAKPOINTS_KEY])) {
                            breakpoints = imgPageTypeSettings[cloudinaryConstants.BREAKPOINTS_KEY];
                        }
                    }
                }

                // build transformed image URL
                finalURL = applyTransformationOnContent(relURL, cloudinaryConstants.CONTENT_TYPE_IMG, dimensionsStr);
                urlObj.url = finalURL;

                if (!empty(imgPageTypeSettings) && imgPageTypeSettings.isResponsive) {
                    srcsetUrl = applyTransformationOnContent(relURL, cloudinaryConstants.CONTENT_TYPE_IMG, dimensionsStr);
                } else {
                    srcsetUrl = applyTransformationOnContent(relURL, cloudinaryConstants.CONTENT_TYPE_IMG, cloudinaryConstants.EMPTY_STRING);
                }

                // build srcset object
                if (!empty(breakpoints)) {
                    var srcsetObj = cldTransformationAPI.getImageSrcset(srcsetUrl, breakpoints);
                    if (!empty(srcsetObj)) {
                        if (!empty(srcsetObj.srcset)) {
                            urlObj.srcset = srcsetObj.srcset;
                        }
                        if (!empty(srcsetObj.sizes)) {
                            urlObj.sizes = srcsetObj.sizes;
                        }
                    }
                }
            }
        }
    } catch (ex) {
        logger.error(cloudinaryConstants.CLD_APPLY_CONTENT_IMG_ABS_URL_TRANSFORM_ERROR, absURL, ex);
    }

    return urlObj;
};

/**
 * Apply transformations on library content video relative URL. It also returns the video poster image to use
 * in Cloudianry video player.
 *
 * @param {string} relURL - video relative URL
 *
 * @returns {string} transformed video URL
 */
var applyTransformationOnContentVideoRelativeURL = function (relURL) {
    var finalURL = '';
    var videoPoster = '';
    var relativeURL = relURL;

    try {
        if (cloudinaryConstants.CLD_ENABLED) {
            if (!empty(relativeURL)) {
                if (cloudinaryConstants.CLD_CARTRIDGE_CONTENT_OPERATION_MODE === cloudinaryConstants.CLD_GET_ASSETS_BY_AUTO_UPLOAD_MODE) {
                    var absURL = URLUtils.absImage(URLUtils.CONTEXT_LIBRARY, null, relativeURL, null);
                    if (!empty(absURL)) {
                        relativeURL = absURL.relative();
                    }
                } else if (cloudinaryConstants.CLD_CARTRIDGE_CONTENT_OPERATION_MODE === cloudinaryConstants.CLD_GET_ASSETS_BY_VIEW_TYPE_MODE) {
                    relativeURL = relativeURL.replace(cloudinaryConstants.DEFAULT_DIRECTORY, cloudinaryConstants.EMPTY_STRING);
                    // prepend relativeURL with '/'
                    if (relativeURL.indexOf(cloudinaryConstants.FORWARD_SLASH) !== 0) {
                        relativeURL = cloudinaryConstants.FORWARD_SLASH + relativeURL;
                    }
                    relativeURL = cloudinaryUtils.replaceSpecialChars(relativeURL);
                }
                // build transformed video URL
                finalURL = applyTransformationOnContent(relativeURL, cloudinaryConstants.CONTENT_TYPE_VIDEO, null);
                videoPoster = cloudinaryHelper.getVideoPoster(finalURL);
            }
        }
    } catch (ex) {
        logger.error(cloudinaryConstants.CLD_APPLY_CONTENT_VIDEO_REL_URL_TRANSFORM_ERROR, relativeURL, ex);
    }

    return { videoURL: finalURL, videoPoster: videoPoster };
};


/**
 * Apply transformations on library content video absolute URL. It also returns the video poster image to use
 * in Cloudianry video player.
 *
 * @param {string} absURL - video absolute URL
 *
 * @returns {string} transformed video URL
 */
var applyTransformationOnContentVideoAbsoluteURL = function (absURL) {
    var finalURL = '';
    var relURL = '';
    var videoPoster = '';

    try {
        if (cloudinaryConstants.CLD_ENABLED) {
            if (!empty(absURL)) {
                if (cloudinaryConstants.CLD_CARTRIDGE_CONTENT_OPERATION_MODE === cloudinaryConstants.CLD_GET_ASSETS_BY_AUTO_UPLOAD_MODE) {
                    relURL = absURL.substring(absURL.indexOf(cloudinaryConstants.DW_STATIC_URL_REFERENCE));
                } else if (cloudinaryConstants.CLD_CARTRIDGE_CONTENT_OPERATION_MODE === cloudinaryConstants.CLD_GET_ASSETS_BY_VIEW_TYPE_MODE) {
                    relURL = absURL.substring(absURL.indexOf(cloudinaryConstants.DEFAULT_DIRECTORY) + cloudinaryConstants.DEFAULT_DIRECTORY.length);
                    relURL = relURL.substring(relURL.indexOf(cloudinaryConstants.FORWARD_SLASH));
                    relURL = cloudinaryUtils.replaceSpecialChars(relURL);
                }
                // build transformed video URL
                finalURL = applyTransformationOnContent(relURL, cloudinaryConstants.CONTENT_TYPE_VIDEO, null);
                videoPoster = cloudinaryHelper.getVideoPoster(finalURL);
            }
        }
    } catch (ex) {
        logger.error(cloudinaryConstants.CLD_APPLY_CONTENT_VIDEO_ABS_URL_TRANSFORM_ERROR, absURL, ex);
    }

    return { videoURL: finalURL, videoPoster: videoPoster };
};

/**
 * Build product images URLs by using Cloudinary auto-upload feature with transformation applied along with srcset and sizes
 * attributes for the HTML <img> tag.
 *
 * @param {string} productID - product ID
 * @param {string} pageType - page type (optional)
 * @param {string} viewType - viewType
 *
 * @returns {array} image assets URLs including transformations
 */
var getProductImagesByAutoupload = function (productID, pageType, viewType) {
    var imgAssetUrls = [];
    var imgBaseURL;
    var imgURL;
    var productImages = [];
    var product;
    var urlObj;

    try {
        if (cloudinaryConstants.CLD_ENABLED && cloudinaryConstants.CLD_CARTRIDGE_OPERATION_MODE === cloudinaryConstants.CLD_GET_ASSETS_BY_AUTO_UPLOAD_MODE) {
            product = ProductMgr.getProduct(productID);

            if (product) {
                imgBaseURL = cloudinaryHelper.getCLDBasePath() + cloudinaryConstants.IMAGE_UPLOAD_URL_RESOURCE_TYPE + cloudinaryConstants.FORWARD_SLASH +
                    cloudinaryConstants.CLD_AUTOUPLOAD_MAPPING;
                productImages = product.getImages(viewType);
                if (!empty(productImages)) {
                    for (var idx = 0; idx < productImages.length; idx++) {
                        imgURL = imgBaseURL + productImages.get(idx).URL.toString();
                        urlObj = applyTransformationOnProductImageAbsoluteURL(productID, imgURL, pageType);
                        if (!empty(urlObj)) {
                            imgAssetUrls.push(urlObj);
                        }
                    }
                }
            }
        }
    } catch (ex) {
        logger.error(cloudinaryConstants.CLD_GET_AUTO_UPLOAD_IMAGES_URLS_ERROR, productID, ex);
    }

    return imgAssetUrls;
};

/**
 * Build product videos URLs by using Cloudinary auto-upload feature with transformation applied.
 *
 * @param {string} productID - product ID
 *
 * @returns {array} array of objects holding video and poster images transformed URLs
 */
var getProductVideosByAutoupload = function (productID) {
    var productVideos = [];
    var product;
    var videoAssets = [];
    var videoBaseURL;
    var videoURL;
    var videoURLObj;

    try {
        if (cloudinaryConstants.CLD_ENABLED && cloudinaryConstants.CLD_CARTRIDGE_OPERATION_MODE === cloudinaryConstants.CLD_GET_ASSETS_BY_AUTO_UPLOAD_MODE) {
            product = ProductMgr.getProduct(productID);

            if (product) {
                videoBaseURL = cloudinaryHelper.getCLDBasePath() + cloudinaryConstants.VIDEO_UPLOAD_URL_RESOURCE_TYPE + cloudinaryConstants.FORWARD_SLASH +
                    cloudinaryConstants.CLD_AUTOUPLOAD_MAPPING;
                productVideos = product.getImages(cloudinaryConstants.VIDEO_VIEW_TYPE);
                if (!empty(productVideos)) {
                    for (var idx = 0; idx < productVideos.length; idx++) {
                        videoURL = videoBaseURL + productVideos.get(idx).URL.toString();
                        videoURLObj = applyTransformationOnProductVideoAbsoluteURL(productID, videoURL);
                        if (!empty(videoURLObj)) {
                            videoAssets.push(videoURLObj);
                        }
                    }
                }
            }
        }
    } catch (ex) {
        logger.error(cloudinaryConstants.CLD_GET_AUTO_UPLOAD_VIDEOS_URLS_ERROR, productID, ex);
    }

    return videoAssets;
};


/**
* Get product images using view types in catalog that reside in SFCC, build cld URLs with transformations applied
* and srcset/sizes attributes for the HTML <img> tag.
*
* @param {string} productID - product ID
* @param {string} viewType - view type to fetch images
* @param {string} pageType - page type (optional)
*
* @returns {array} array of objects holding transformed image URLs and html attributes
*/
var getProductImagesByViewType = function (productID, viewType, pageType) {
    var imgRelURL;
    var imgAssetUrls = [];
    var productImgs = [];
    var product;
    var urlObj;

    try {
        if (cloudinaryConstants.CLD_ENABLED) {
            product = ProductMgr.getProduct(productID);

            if (product) {
                productImgs = product.getImages(viewType);
                if (!empty(productImgs)) {
                    for (var idx = 0; idx < productImgs.length; idx++) {
                        imgRelURL = cloudinaryHelper.getAssetRelURL(productImgs.get(idx).getAbsURL().toString());
                        imgRelURL = cloudinaryUtils.replaceSpecialChars(imgRelURL);
                        urlObj = applyTransformationOnProductImageRelativeURL(productID, imgRelURL, pageType);
                        if (!empty(urlObj)) {
                            imgAssetUrls.push(urlObj);
                        }
                    }
                }
            }
        }
    } catch (ex) {
        logger.error(cloudinaryConstants.CLD_GET_IMG_URLS_BY_VIEW_TYPE_ERROR, productID, ex);
    }

    return imgAssetUrls;
};

/**
 * Get product videos using view types in catalog that reside in SFCC, build cld URLs with transformations applied.
 *
 * @param {string} productID - product ID
 * @param {string} viewType - view type to fetch images
 *
 * @returns {array} array of objects holding video and poster images transformed URLs
 */
var getProductVideosByViewType = function (productID) {
    var productvideos = [];
    var product;
    var videoAssets = [];
    var videoURL;
    var videoURLObj;

    try {
        if (cloudinaryConstants.CLD_ENABLED) {
            product = ProductMgr.getProduct(productID);

            if (product) {
                productvideos = product.getImages(cloudinaryConstants.VIDEO_VIEW_TYPE);
                if (!empty(productvideos)) {
                    for (var idx = 0; idx < productvideos.length; idx++) {
                        videoURL = cloudinaryHelper.getAssetRelURL(productvideos.get(idx).getAbsURL().toString(), true);
                        videoURL = cloudinaryUtils.replaceSpecialChars(videoURL);
                        videoURLObj = applyTransformationOnProductVideoRelativeURL(productID, videoURL);
                        if (!empty(videoURLObj)) {
                            videoAssets.push(videoURLObj);
                        }
                    }
                }
            }
        }
    } catch (ex) {
        logger.error(cloudinaryConstants.CLD_GET_VIDEO_URLS_BY_VIEW_TYPE_ERROR, productID, ex);
    }

    return videoAssets;
};

/**
* Private method used by other exported methods to process logic for building
* product image URLs based on structured mata data and tag name.
*
* @param {string} smdKeyValue - structured metadata value to add in the URL
* @param {string} productID - product ID
* @param {Object} params - parameters
*
* @returns {Object} object holding URL and srcset/sizes attributes
*/
function getProductImgURLUsingSMDAndTagName(smdKeyValue, productID, params) {
    var breakpoints;
    var cldSMDEndpoint;
    var cldSMDSrcsetEndpoint = '';
    var dimensionsStr = '';
    var globalImgTransformations = '';
    var isSwatch;
    var imgPageTypeSettings;
    var prodCatImgTransformations = '';
    var pageType;
    var product;
    var srcsetUrl = '';
    var tagName;
    var urlObj = {};
    var variationAttrValueID;
    var smdData = smdKeyValue.split(':');

    try {
        product = ProductMgr.getProduct(productID);
        if (product && (product.variant || product.variationGroup)) {
            product = product.getMasterProduct();
        }

        cldSMDEndpoint = cloudinaryConstants.CLD_SMD_ENDPOINT;
        cldSMDEndpoint = cloudinaryHelper.addTrackingQueryParam(cldSMDEndpoint);

        // initialize optional params
        if (!empty(params)) {
            isSwatch = params.isSwatch;
            variationAttrValueID = params.variationAttrValueID;
            pageType = params.pageType;
        }

        if (!empty(cldSMDEndpoint)) {
            // fetch transformations
            globalImgTransformations = cldTransformationAPI.getGlobalImageTransformation();
            prodCatImgTransformations = cldTransformationAPI.getProductCatalogImageTransformation(productID);

            // get image setting for page types
            if (!empty(pageType)) {
                imgPageTypeSettings = cldTransformationAPI.getImageDimensions(pageType);
                if (!empty(imgPageTypeSettings)) {
                    urlObj.isResponsive = imgPageTypeSettings.isResponsive;
                    if (cloudinaryConstants.DIMENSIONS_STRING_KEY in imgPageTypeSettings && !empty(imgPageTypeSettings[cloudinaryConstants.DIMENSIONS_STRING_KEY])) {
                        dimensionsStr = imgPageTypeSettings[cloudinaryConstants.DIMENSIONS_STRING_KEY];
                    }

                    if (cloudinaryConstants.BREAKPOINTS_KEY in imgPageTypeSettings && !empty(imgPageTypeSettings[cloudinaryConstants.BREAKPOINTS_KEY])) {
                        breakpoints = imgPageTypeSettings[cloudinaryConstants.BREAKPOINTS_KEY];
                    }
                }
            }

            // replace placehoders in endpoint
            if (!empty(smdData[0])) {
                cldSMDEndpoint = cldSMDEndpoint.replace(cloudinaryConstants.CLD_SMD_KEY_PLACEHOLDER, smdData[0]);
            } else {
                cldSMDEndpoint = cldSMDEndpoint.replace(cloudinaryConstants.FORWARD_SLASH + cloudinaryConstants.CLD_SMD_KEY_VALUE_PLACEHOLDER,
                    cloudinaryConstants.EMPTY_STRING);
            }

            if (!empty(smdData[1])) {
                cldSMDEndpoint = cldSMDEndpoint.replace(cloudinaryConstants.CLD_SMD_VALUE_PLACEHOLDER, smdData[1]);
            } else {
                cldSMDEndpoint = cldSMDEndpoint.replace(cloudinaryConstants.FORWARD_SLASH + cloudinaryConstants.CLD_SMD_VALUE_PLACEHOLDER,
                    cloudinaryConstants.EMPTY_STRING);
            }

            if (!empty(globalImgTransformations)) {
                cldSMDEndpoint = cldSMDEndpoint.replace(cloudinaryConstants.CLD_SITE_TRANSFORMS_PLACEHOLDER, globalImgTransformations);
            } else {
                cldSMDEndpoint = cldSMDEndpoint.replace(cloudinaryConstants.FORWARD_SLASH + cloudinaryConstants.CLD_SITE_TRANSFORMS_PLACEHOLDER,
                    cloudinaryConstants.EMPTY_STRING);
            }

            if (!empty(prodCatImgTransformations)) {
                cldSMDEndpoint = cldSMDEndpoint.replace(cloudinaryConstants.CLD_PRODCAT_TRANSFORMS_PLACEHOLDER, prodCatImgTransformations);
            } else {
                cldSMDEndpoint = cldSMDEndpoint.replace(cloudinaryConstants.FORWARD_SLASH + cloudinaryConstants.CLD_PRODCAT_TRANSFORMS_PLACEHOLDER,
                    cloudinaryConstants.EMPTY_STRING);
            }

            if (!empty(product)) {
                tagName = cloudinaryHelper.getCloudinaryTagName(product);

                if (isSwatch) {
                    tagName = tagName + cloudinaryConstants.HYPHEN + variationAttrValueID +
                        cloudinaryConstants.HYPHEN + cloudinaryConstants.CLD_SWATCH_IMAGES_VIEW_TYPE;
                } else {
                    tagName = !empty(variationAttrValueID)
                        ? tagName + cloudinaryConstants.HYPHEN + variationAttrValueID
                        : tagName;
                }

                cldSMDEndpoint = cldSMDEndpoint.replace(cloudinaryConstants.CLD_TAG_PLACEHOLDER, tagName);
            } else {
                cldSMDEndpoint = cldSMDEndpoint.replace(cloudinaryConstants.FORWARD_SLASH + cloudinaryConstants.CLD_TAG_PLACEHOLDER,
                    cloudinaryConstants.EMPTY_STRING);
            }
            cldSMDSrcsetEndpoint = cldSMDEndpoint;

            if (!empty(dimensionsStr)) {
                cldSMDEndpoint = cldSMDEndpoint.replace(cloudinaryConstants.CLD_DIMENSIONS_PLACEHOLDER, dimensionsStr);

                cldSMDSrcsetEndpoint = !empty(imgPageTypeSettings) && imgPageTypeSettings.isResponsive ?
                    cldSMDSrcsetEndpoint.replace(cloudinaryConstants.CLD_DIMENSIONS_PLACEHOLDER, dimensionsStr) :
                    cldSMDSrcsetEndpoint.replace(cloudinaryConstants.FORWARD_SLASH + cloudinaryConstants.CLD_DIMENSIONS_PLACEHOLDER,
                        cloudinaryConstants.EMPTY_STRING);
            } else {
                cldSMDEndpoint = cldSMDEndpoint.replace(cloudinaryConstants.FORWARD_SLASH + cloudinaryConstants.CLD_DIMENSIONS_PLACEHOLDER,
                    cloudinaryConstants.EMPTY_STRING);

                cldSMDSrcsetEndpoint = cldSMDSrcsetEndpoint.replace(cloudinaryConstants.FORWARD_SLASH + cloudinaryConstants.CLD_DIMENSIONS_PLACEHOLDER,
                    cloudinaryConstants.EMPTY_STRING);
            }

            if (cldSMDEndpoint.indexOf(cloudinaryConstants.FORWARD_SLASH) === 0) {
                cldSMDEndpoint = cldSMDEndpoint.substring(1);
                cldSMDSrcsetEndpoint = cldSMDSrcsetEndpoint.substring(1);
            }

            urlObj.url = cloudinaryHelper.getCLDBasePath() + cldSMDEndpoint;
            srcsetUrl = cloudinaryHelper.getCLDBasePath() + cldSMDSrcsetEndpoint;

            // build srcset object
            if (!empty(breakpoints)) {
                var srcsetObj = cldTransformationAPI.getImageSrcset(srcsetUrl, breakpoints);
                if (!empty(srcsetObj)) {
                    if (!empty(srcsetObj.srcset)) {
                        urlObj.srcset = srcsetObj.srcset;
                    }
                    if (!empty(srcsetObj.sizes)) {
                        urlObj.sizes = srcsetObj.sizes;
                    }
                }
            }
        }
    } catch (ex) {
        logger.error(cloudinaryConstants.CLD_GET_SMD_URL_ERROR, productID, ex);
    }

    return urlObj;
}


/**
* Private method used by other exported methods to process logic for building
* product image URLs based on structured mata data and tag name.
*
* @param {string} smdKey - structured metadata key to add in the URL
* @param {string} smdValue - structured metadata value to add in the URL
* @param {string} productID - product ID
* @param {Object} params - parameters
* @param {string} params.pageType - plp page type
*
* @returns {Object} object holding URL and srcset/sizes attributes
*/
function getProductCustomImageUrlByPosition(smdKey, smdValue, productID, params) {
    var breakpoints;
    var cldSMDEndpoint;
    var cldSMDSrcsetEndpoint = '';
    var dimensionsStr = '';
    var globalImgTransformations = '';
    var imgPageTypeSettings;
    var prodCatImgTransformations = '';
    var pageType;
    var product;
    var srcsetUrl = '';
    var tagName;
    var urlObj = {};

    try {
        product = ProductMgr.getProduct(productID);
        if (product && (product.variant || product.variationGroup)) {
            product = product.getMasterProduct();
        }

        cldSMDEndpoint = cloudinaryConstants.CLD_SMD_ENDPOINT_GALLERY_POSITION;
        cldSMDEndpoint = cloudinaryHelper.addTrackingQueryParam(cldSMDEndpoint);

        // initialize optional params
        if (!empty(params)) {
            pageType = params.pageType;
        }

        if (!empty(cldSMDEndpoint)) {
            // fetch transformations
            globalImgTransformations = cldTransformationAPI.getGlobalImageTransformation();
            prodCatImgTransformations = cldTransformationAPI.getProductCatalogImageTransformation(productID);

            // get image setting for page types
            if (!empty(pageType)) {
                imgPageTypeSettings = cldTransformationAPI.getImageDimensions(pageType);
                if (!empty(imgPageTypeSettings)) {
                    urlObj.isResponsive = imgPageTypeSettings.isResponsive;
                    if (cloudinaryConstants.DIMENSIONS_STRING_KEY in imgPageTypeSettings && !empty(imgPageTypeSettings[cloudinaryConstants.DIMENSIONS_STRING_KEY])) {
                        dimensionsStr = imgPageTypeSettings[cloudinaryConstants.DIMENSIONS_STRING_KEY];
                    }

                    if (cloudinaryConstants.BREAKPOINTS_KEY in imgPageTypeSettings && !empty(imgPageTypeSettings[cloudinaryConstants.BREAKPOINTS_KEY])) {
                        breakpoints = imgPageTypeSettings[cloudinaryConstants.BREAKPOINTS_KEY];
                    }
                }
            }

            // replace placehoders in endpoint
            if (!empty(smdKey)) {
                cldSMDEndpoint = cldSMDEndpoint.replace(cloudinaryConstants.CLD_SMD_KEY_PLACEHOLDER, smdKey);
            } else {
                cldSMDEndpoint = cldSMDEndpoint.replace(cloudinaryConstants.FORWARD_SLASH + cloudinaryConstants.CLD_SMD_KEY_VALUE_PLACEHOLDER,
                    cloudinaryConstants.EMPTY_STRING);
            }

            if (!empty(smdValue)) {
                cldSMDEndpoint = cldSMDEndpoint.replace(cloudinaryConstants.CLD_SMD_VALUE_PLACEHOLDER, smdValue);
            } else {
                cldSMDEndpoint = cldSMDEndpoint.replace(cloudinaryConstants.FORWARD_SLASH + cloudinaryConstants.CLD_SMD_VALUE_PLACEHOLDER,
                    cloudinaryConstants.EMPTY_STRING);
            }

            if (!empty(globalImgTransformations)) {
                cldSMDEndpoint = cldSMDEndpoint.replace(cloudinaryConstants.CLD_SITE_TRANSFORMS_PLACEHOLDER, globalImgTransformations);
            } else {
                cldSMDEndpoint = cldSMDEndpoint.replace(cloudinaryConstants.FORWARD_SLASH + cloudinaryConstants.CLD_SITE_TRANSFORMS_PLACEHOLDER,
                    cloudinaryConstants.EMPTY_STRING);
            }

            if (!empty(prodCatImgTransformations)) {
                cldSMDEndpoint = cldSMDEndpoint.replace(cloudinaryConstants.CLD_PRODCAT_TRANSFORMS_PLACEHOLDER, prodCatImgTransformations);
            } else {
                cldSMDEndpoint = cldSMDEndpoint.replace(cloudinaryConstants.FORWARD_SLASH + cloudinaryConstants.CLD_PRODCAT_TRANSFORMS_PLACEHOLDER,
                    cloudinaryConstants.EMPTY_STRING);
            }

            if (!empty(product)) {
                tagName = cloudinaryHelper.getCloudinaryTagName(product);
                cldSMDEndpoint = cldSMDEndpoint.replace(cloudinaryConstants.CLD_TAG_PLACEHOLDER, tagName);
            } else {
                cldSMDEndpoint = cldSMDEndpoint.replace(cloudinaryConstants.FORWARD_SLASH + cloudinaryConstants.CLD_TAG_PLACEHOLDER,
                    cloudinaryConstants.EMPTY_STRING);
            }
            cldSMDSrcsetEndpoint = cldSMDEndpoint;

            if (!empty(dimensionsStr)) {
                cldSMDEndpoint = cldSMDEndpoint.replace(cloudinaryConstants.CLD_DIMENSIONS_PLACEHOLDER, dimensionsStr);

                cldSMDSrcsetEndpoint = !empty(imgPageTypeSettings) && imgPageTypeSettings.isResponsive ?
                    cldSMDSrcsetEndpoint.replace(cloudinaryConstants.CLD_DIMENSIONS_PLACEHOLDER, dimensionsStr) :
                    cldSMDSrcsetEndpoint.replace(cloudinaryConstants.FORWARD_SLASH + cloudinaryConstants.CLD_DIMENSIONS_PLACEHOLDER,
                        cloudinaryConstants.EMPTY_STRING);
            } else {
                cldSMDEndpoint = cldSMDEndpoint.replace(cloudinaryConstants.FORWARD_SLASH + cloudinaryConstants.CLD_DIMENSIONS_PLACEHOLDER,
                    cloudinaryConstants.EMPTY_STRING);

                cldSMDSrcsetEndpoint = cldSMDSrcsetEndpoint.replace(cloudinaryConstants.FORWARD_SLASH + cloudinaryConstants.CLD_DIMENSIONS_PLACEHOLDER,
                    cloudinaryConstants.EMPTY_STRING);
            }

            if (cldSMDEndpoint.indexOf(cloudinaryConstants.FORWARD_SLASH) === 0) {
                cldSMDEndpoint = cldSMDEndpoint.substring(1);
                cldSMDSrcsetEndpoint = cldSMDSrcsetEndpoint.substring(1);
            }

            urlObj.url = cloudinaryHelper.getCLDBasePath() + cldSMDEndpoint;
            srcsetUrl = cloudinaryHelper.getCLDBasePath() + cldSMDSrcsetEndpoint;

            // build srcset object
            if (!empty(breakpoints)) {
                var srcsetObj = cldTransformationAPI.getImageSrcset(srcsetUrl, breakpoints);
                if (!empty(srcsetObj)) {
                    if (!empty(srcsetObj.srcset)) {
                        urlObj.srcset = srcsetObj.srcset;
                    }
                    if (!empty(srcsetObj.sizes)) {
                        urlObj.sizes = srcsetObj.sizes;
                    }
                }
            }
        }
    } catch (ex) {
        logger.error(cloudinaryConstants.CLD_GET_SMD_URL_ERROR, productID, ex);
    }

    return urlObj;
}

/**
 * Get product primary image URL based on structured mata data and tag name with transformations
 * applied. It uses SMD endpoint configured in custom preferences and replace all place holders with
 * actual values. It also returns attributes for image responsiveness e.g srcset/sizes.
 *
 * @param {string} productID - product ID
 * @param {Object} params - object holding optional params
 *
 * @returns {Object} object holding URL and srcset attributes
 */
var getProductPrimaryImageURLUsingTagName = function (productID, params) {
    var smdKeyWithValue;
    var urlObj;

    try {
        smdKeyWithValue = cloudinaryConstants.CLD_SMD_KEY + cloudinaryConstants.COLON + cloudinaryConstants.CLD_SMD_VALUE;
        urlObj = getProductImgURLUsingSMDAndTagName(smdKeyWithValue, productID, params);
    } catch (ex) {
        logger.error(cloudinaryConstants.CLD_GET_PRODUCT_PRIMARY_IMG_URL_ERROR, productID, ex);
    }

    return urlObj;
};

/**
 * Get product image URL for specific position in SFCC based on structured meta data and tag name with transformations
 * applied. It uses SMD endpoint configured in custom preferences and replace all place holders with actual values. It
 * also returns attributes for image responsiveness e.g srcset/sizes.
 *
 * @param {string} position - position of the image
 * @param {string} productID - product ID
 * @param {Object} params - parameters
 *
 * @returns {Object} object holding URL and srcset attributes
 */
var getProductCustomImageURLUsingTagName = function (position, productID, params) {
    var smdKey;
    var smdValue;
    var urlObj;

    try {
        smdKey = cloudinaryConstants.CLD_SMD_GALLERY_POSITION_KEY;
        smdValue = position;
        urlObj = getProductCustomImageUrlByPosition(smdKey, smdValue, productID, params);
    } catch (ex) {
        logger.error(cloudinaryConstants.CLD_GET_PRODUCT_IMG_URL_BY_POSITION_ERROR, productID, ex);
    }

    return urlObj;
};

/**
 * Get product video URL based on the custom mapping path configured in site preferences.
 * It reads the path mapping scheme from custom prefrences, replace the placeholders with
 * actual values and build the fully qualified Cloudinary URL with transformations applied.
 *
 * @param {string} productID - product ID
 * @param {string} currentLocale - current locale
 *
 * @returns {Object} object holding custom mapping video and poster URLs
 */
var getProductVideoByCustomMapping = function (productID, currentLocale) {
    var colorAttrID;
    var finalURL;
    var product;
    var sizeAttrID;
    var tempUrl;

    try {
        if (cloudinaryConstants.CLD_ENABLED && cloudinaryConstants.CLD_USE_VIDEO_CUSTOM_MAPPING) {
            product = ProductMgr.getProduct(productID);

            if (product) {
                tempUrl = cloudinaryConstants.CLD_VIDEO_CUSTOM_MAP_PATH.replace(cloudinaryConstants.SKU_CUSTOM_MAPPING_PACEHOLDER, productID);
                tempUrl = tempUrl.replace(cloudinaryConstants.LOCALE_CUSTOM_MAPPING_PACEHOLDER, currentLocale);
                tempUrl = tempUrl.replace(cloudinaryConstants.NAME_CUSTOM_MAPPING_PACEHOLDER,
                    !empty(product.name) ? product.name : cloudinaryConstants.EMPTY_STRING);

                // replace color and size attribute value IDs
                colorAttrID = cloudinaryHelper.fetchVariationAttrValueId(productID, cloudinaryConstants.COLOR_ATTR);
                if (!empty(colorAttrID)) {
                    tempUrl = tempUrl.replace(cloudinaryConstants.COLOR_CUSTOM_MAPPING_PACEHOLDER, colorAttrID);
                } else {
                    tempUrl = tempUrl.replace(cloudinaryConstants.COLOR_CUSTOM_MAPPING_PACEHOLDER + cloudinaryConstants.UNDER_SCORE, cloudinaryConstants.EMPTY_STRING);
                }

                sizeAttrID = cloudinaryHelper.fetchVariationAttrValueId(productID, cloudinaryConstants.SIZE_ATTR);
                if (!empty(sizeAttrID)) {
                    tempUrl = tempUrl.replace(cloudinaryConstants.SIZE_CUSTOM_MAPPING_PLACEHOLDER, sizeAttrID);
                } else {
                    tempUrl = tempUrl.replace(cloudinaryConstants.SIZE_CUSTOM_MAPPING_PLACEHOLDER + cloudinaryConstants.UNDER_SCORE, cloudinaryConstants.EMPTY_STRING);
                }

                finalURL = cloudinaryHelper.getCLDBasePath() + cloudinaryConstants.VIDEO_UPLOAD_URL_RESOURCE_TYPE + cloudinaryConstants.FORWARD_SLASH +
                    cloudinaryConstants.CLD_VIDEO_PATH + cloudinaryConstants.FORWARD_SLASH + tempUrl;

                if (cloudinaryConstants.CLD_CUSTOM_MAPPING_VIDEO_FORMAT.indexOf(cloudinaryConstants.DOT) === 0) {
                    finalURL += cloudinaryConstants.CLD_CUSTOM_MAPPING_VIDEO_FORMAT;
                } else {
                    finalURL += cloudinaryConstants.DOT + cloudinaryConstants.CLD_CUSTOM_MAPPING_VIDEO_FORMAT;
                }

                finalURL = finalURL.replace(cloudinaryConstants.URL_EMPTY_SPACES_REGEX, cloudinaryConstants.URL_EMPTY_SPACES_REPLACE);
                finalURL = applyTransformationOnProductVideoAbsoluteURL(productID, finalURL);
            }
        }
    } catch (ex) {
        logger.error(cloudinaryConstants.CLD_GET_PRODUCT_CUSTOM_MAPPING_VIDEO_URL_ERROR, productID, ex);
    }

    return finalURL;
};


/**
 * Get catalog image URL from relative path with transformations applied and srcset/sizes attributes
 * for the HTML <img> tag to make it responsive.
 *
 * @param {string} relURL - image relative URL
 * @param {string} categoryId - category id (optional)
 * @param {string} pageType - page type (optional)
 *
 * @returns {Object} object holding transformed URL and srcset attribtues
 */
var getCatalogImageAbsURLFromRelURL = function (relURL, categoryId, pageType) {
    var breakpoints;
    var catalogImgPath;
    var dimensionsStr = '';
    var finalURL = '';
    var srcsetUrl = '';
    var imgGlobalTransformations = '';
    var imgCategoryTransformations = '';
    var imgCatalogTransformations = '';
    var imgPageTypeSettings;
    var isJsAutomateResponsivenessEnabled = false;
    var relativeURL = relURL;
    var urlObj = {};

    try {
        if (cloudinaryConstants.CLD_ENABLED) {
            catalogImgPath = cloudinaryHelper.removeLeadingAndTrailingSlashes(cloudinaryConstants.CLD_CATALOG_IMAGE_PATH);

            if (cloudinaryConstants.CLD_CARTRIDGE_CONTENT_OPERATION_MODE === cloudinaryConstants.CLD_GET_ASSETS_BY_VIEW_TYPE_MODE) {
                if (!empty(relativeURL) && relativeURL.indexOf(cloudinaryConstants.DEFAULT_DIRECTORY) > -1) {
                    relativeURL = relativeURL.substring(relativeURL.lastIndexOf(cloudinaryConstants.DEFAULT_DIRECTORY) + cloudinaryConstants.DEFAULT_DIRECTORY.length);
                    relativeURL = relativeURL.substring(relativeURL.indexOf(cloudinaryConstants.FORWARD_SLASH));
                    relativeURL = cloudinaryUtils.replaceSpecialChars(relativeURL);
                }
            }

            // get trnsformations
            imgGlobalTransformations = cldTransformationAPI.getGlobalImageTransformation();
            if (!empty(imgGlobalTransformations)) {
                imgGlobalTransformations += cloudinaryConstants.FORWARD_SLASH;
            }

            imgCatalogTransformations = cldTransformationAPI.getCatalogImageTransformation();
            if (!empty(imgCatalogTransformations)) {
                imgCatalogTransformations += cloudinaryConstants.FORWARD_SLASH;
            }

            if (!empty(categoryId)) {
                imgCategoryTransformations = cldTransformationAPI.getCategoryImageTransformation(categoryId);
                if (!empty(imgCategoryTransformations)) {
                    imgCategoryTransformations += cloudinaryConstants.FORWARD_SLASH;
                }
            }

            // get image setting for page types
            if (!empty(pageType)) {
                imgPageTypeSettings = cldTransformationAPI.getImageDimensions(pageType);

                if (!empty(imgPageTypeSettings)) {
                    urlObj.isResponsive = imgPageTypeSettings.isResponsive;
                    if (cloudinaryConstants.DIMENSIONS_STRING_KEY in imgPageTypeSettings && !empty(imgPageTypeSettings[cloudinaryConstants.DIMENSIONS_STRING_KEY])) {
                        dimensionsStr = imgPageTypeSettings[cloudinaryConstants.DIMENSIONS_STRING_KEY] + cloudinaryConstants.FORWARD_SLASH;
                    }
                    if (cloudinaryConstants.BREAKPOINTS_KEY in imgPageTypeSettings && !empty(imgPageTypeSettings[cloudinaryConstants.BREAKPOINTS_KEY])) {
                        breakpoints = imgPageTypeSettings[cloudinaryConstants.BREAKPOINTS_KEY];
                    }
                    isJsAutomateResponsivenessEnabled = imgPageTypeSettings.isResponsive;
                }
            }

            if (cloudinaryConstants.CLD_CARTRIDGE_CONTENT_OPERATION_MODE === cloudinaryConstants.CLD_GET_ASSETS_BY_VIEW_TYPE_MODE) {
                finalURL = cloudinaryHelper.getCLDBasePath() + cloudinaryConstants.IMAGE_UPLOAD_URL_RESOURCE_TYPE + cloudinaryConstants.FORWARD_SLASH +
                    imgGlobalTransformations + imgCatalogTransformations + imgCategoryTransformations + dimensionsStr + catalogImgPath + relativeURL;
                srcsetUrl = cloudinaryHelper.getCLDBasePath() + cloudinaryConstants.IMAGE_UPLOAD_URL_RESOURCE_TYPE + cloudinaryConstants.FORWARD_SLASH +
                    imgGlobalTransformations + imgCatalogTransformations + imgCategoryTransformations + (isJsAutomateResponsivenessEnabled ? dimensionsStr : cloudinaryConstants.EMPTY_STRING) + catalogImgPath + relativeURL;
            } else if (cloudinaryConstants.CLD_CARTRIDGE_CONTENT_OPERATION_MODE === cloudinaryConstants.CLD_GET_ASSETS_BY_AUTO_UPLOAD_MODE) {
                finalURL = cloudinaryHelper.getCLDBasePath() + cloudinaryConstants.IMAGE_UPLOAD_URL_RESOURCE_TYPE + cloudinaryConstants.FORWARD_SLASH + imgGlobalTransformations +
                    imgCatalogTransformations + imgCategoryTransformations + dimensionsStr + cloudinaryConstants.CLD_AUTOUPLOAD_MAPPING + relativeURL;
                srcsetUrl = cloudinaryHelper.getCLDBasePath() + cloudinaryConstants.IMAGE_UPLOAD_URL_RESOURCE_TYPE + cloudinaryConstants.FORWARD_SLASH + imgGlobalTransformations +
                    imgCatalogTransformations + imgCategoryTransformations + (isJsAutomateResponsivenessEnabled ? dimensionsStr : cloudinaryConstants.EMPTY_STRING) + cloudinaryConstants.CLD_AUTOUPLOAD_MAPPING + relativeURL;
            }

            finalURL = cloudinaryHelper.addTrackingQueryParam(finalURL);
            urlObj.url = finalURL;

            srcsetUrl = cloudinaryHelper.addTrackingQueryParam(srcsetUrl);

            // build srcset object
            if (!empty(breakpoints)) {
                var srcsetObj = cldTransformationAPI.getImageSrcset(srcsetUrl, breakpoints);
                if (!empty(srcsetObj)) {
                    if (!empty(srcsetObj.srcset)) {
                        urlObj.srcset = srcsetObj.srcset;
                    }
                    if (!empty(srcsetObj.sizes)) {
                        urlObj.sizes = srcsetObj.sizes;
                    }
                }
            }
        }
    } catch (ex) {
        logger.error(cloudinaryConstants.CLD_GET_CATALOG_IMAGE_ERROR, relativeURL, ex);
    }

    return urlObj;
};

/**
 * Get catalog video URL from relative path with transformations applied.
 *
 * @param {string} relURL - video relative URL
 * @param {string} categoryId - category id (optional)
 *
 * @returns {Object} object holding transformed URL
 */
var getCatalogVideoAbsURLFromRelURL = function (relURL, categoryId) {
    var catalogImgPath;
    var finalURL = '';
    var videoRelativeURL = relURL;
    var videoGlobalTransformations = '';
    var videoCategoryTransformations = '';
    var videoCatalogTransformations = '';
    var videoPoster;

    try {
        if (cloudinaryConstants.CLD_ENABLED) {
            catalogImgPath = cloudinaryHelper.removeLeadingAndTrailingSlashes(cloudinaryConstants.CLD_CATALOG_IMAGE_PATH);

            if (cloudinaryConstants.CLD_CARTRIDGE_CONTENT_OPERATION_MODE === cloudinaryConstants.CLD_GET_ASSETS_BY_VIEW_TYPE_MODE) {
                if (!empty(videoRelativeURL)) {
                    if (videoRelativeURL.indexOf(cloudinaryConstants.FORWARD_SLASH) !== 0) {
                        videoRelativeURL = cloudinaryConstants.FORWARD_SLASH + videoRelativeURL;
                    }

                    if (videoRelativeURL.indexOf(cloudinaryConstants.DEFAULT_DIRECTORY) > -1) {
                        videoRelativeURL = videoRelativeURL.substring(videoRelativeURL.lastIndexOf(cloudinaryConstants.DEFAULT_DIRECTORY) + cloudinaryConstants.DEFAULT_DIRECTORY.length);
                        videoRelativeURL = videoRelativeURL.substring(videoRelativeURL.indexOf(cloudinaryConstants.FORWARD_SLASH));
                    }
                }
            }

            // get trnsformations
            videoGlobalTransformations = cldTransformationAPI.getGlobalVideoTransformation();
            if (!empty(videoGlobalTransformations)) {
                videoGlobalTransformations += cloudinaryConstants.FORWARD_SLASH;
            }

            videoCatalogTransformations = cldTransformationAPI.getCatalogVideoTransformation();
            if (!empty(videoCatalogTransformations)) {
                videoCatalogTransformations += cloudinaryConstants.FORWARD_SLASH;
            }

            if (!empty(categoryId)) {
                videoCategoryTransformations = cldTransformationAPI.getCategoryVideoTransformation(categoryId);
                if (!empty(videoCategoryTransformations)) {
                    videoCategoryTransformations += cloudinaryConstants.FORWARD_SLASH;
                }
            }

            finalURL = cloudinaryHelper.getCLDBasePath() + cloudinaryConstants.VIDEO_UPLOAD_URL_RESOURCE_TYPE + cloudinaryConstants.FORWARD_SLASH +
                videoGlobalTransformations + videoCatalogTransformations + videoCategoryTransformations + catalogImgPath + videoRelativeURL;

            if (cloudinaryConstants.CLD_CARTRIDGE_CONTENT_OPERATION_MODE === cloudinaryConstants.CLD_GET_ASSETS_BY_VIEW_TYPE_MODE) {
                finalURL = cloudinaryHelper.getCLDBasePath() + cloudinaryConstants.VIDEO_UPLOAD_URL_RESOURCE_TYPE + cloudinaryConstants.FORWARD_SLASH +
                    videoGlobalTransformations + videoCatalogTransformations + videoCategoryTransformations + catalogImgPath + videoRelativeURL;
            } else if (cloudinaryConstants.CLD_CARTRIDGE_CONTENT_OPERATION_MODE === cloudinaryConstants.CLD_GET_ASSETS_BY_AUTO_UPLOAD_MODE) {
                finalURL = cloudinaryHelper.getCLDBasePath() + cloudinaryConstants.VIDEO_UPLOAD_URL_RESOURCE_TYPE + cloudinaryConstants.FORWARD_SLASH + videoGlobalTransformations +
                    videoCatalogTransformations + videoCategoryTransformations + catalogImgPath + cloudinaryConstants.FORWARD_SLASH + cloudinaryConstants.CLD_AUTOUPLOAD_MAPPING + videoRelativeURL;
            }

            finalURL = cloudinaryHelper.addTrackingQueryParam(finalURL);
            videoPoster = cloudinaryHelper.getVideoPoster(finalURL);
        }
    } catch (ex) {
        logger.error(cloudinaryConstants.CLD_GET_CATALOG_VIDEO_ERROR, videoRelativeURL, ex);
    }

    return { videoURL: finalURL, videoPoster: videoPoster };
};

/**
 * This method is used to fetch resources based on tag names query
 * @param {string} tagsSearchQuery - tags search query
 * @param {List} withFields - fields which will be returned with assets
 *
 * @returns {Object} assets - object holding array of resources
 */
var searchCLDResourcesByTags = function (tagsSearchQuery, withFields) {
    var cldSearchResources = require('*/cartridge/scripts/service/cldSearchResources');
    var assets = cldSearchResources.searchResources(tagsSearchQuery, withFields);
    return assets;
};

module.exports = {
    applyTransformationOnProductImageAbsoluteURL: applyTransformationOnProductImageAbsoluteURL,
    applyTransformationOnProductImageRelativeURL: applyTransformationOnProductImageRelativeURL,
    applyTransformationOnProductVideoAbsoluteURL: applyTransformationOnProductVideoAbsoluteURL,
    applyTransformationOnProductVideoRelativeURL: applyTransformationOnProductVideoRelativeURL,
    getProductImagesByTagName: getProductImagesByTagName,
    getProductVideosByTagName: getProductVideosByTagName,
    getProductRawDataByTagName: getProductRawDataByTagName,
    applyTransformationOnContentImageRelativeURL: applyTransformationOnContentImageRelativeURL,
    applyTransformationOnContentImageAbsoluteURL: applyTransformationOnContentImageAbsoluteURL,
    applyTransformationOnContentVideoRelativeURL: applyTransformationOnContentVideoRelativeURL,
    applyTransformationOnContentVideoAbsoluteURL: applyTransformationOnContentVideoAbsoluteURL,
    getProductImagesByAutoupload: getProductImagesByAutoupload,
    getProductVideosByAutoupload: getProductVideosByAutoupload,
    getProductImagesByViewType: getProductImagesByViewType,
    getProductVideosByViewType: getProductVideosByViewType,
    getProductPrimaryImageURLUsingTagName: getProductPrimaryImageURLUsingTagName,
    getProductCustomImageURLUsingTagName: getProductCustomImageURLUsingTagName,
    getCatalogImageAbsURLFromRelURL: getCatalogImageAbsURLFromRelURL,
    getCatalogVideoAbsURLFromRelURL: getCatalogVideoAbsURLFromRelURL,
    getProductVideoByCustomMapping: getProductVideoByCustomMapping,
    searchCLDResourcesByTags: searchCLDResourcesByTags,
    filterAssetsByTagName: filterAssetsByTagName
};
