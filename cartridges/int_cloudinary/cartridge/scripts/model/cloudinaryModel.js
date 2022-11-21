'use strict';
/** ****************************************************************************************************
*@file        : File Name - cloudinaryModel
*@description : This is the main cloudinary model script which includes all methods required to serve
*               data in isml templates and different cloudinary widgets like cloudinary Product Gallery
*               Widget and cloudinary Video Player. It internally calls the cloudinary script API to get
*               resources from cloudinary DAM based on the preferences.
*
*@author      : PixelMEDIA
*@created     : 23 April 2020
*********************************************************************************************************/

// API includes
var ProductMgr = require('dw/catalog/ProductMgr');
var logger = require('dw/system/Logger').getLogger('int_cloudinary', 'int_cloudinary');

// script includes
var cloudinaryConstants = require('*/cartridge/scripts/util/cloudinaryConstants');
var cloudinaryHelper = require('*/cartridge/scripts/helpers/cloudinaryHelpers');
var cloudinaryAPI = require('*/cartridge/scripts/api/cloudinaryApi');
var cldTransformationAPI = require('*/cartridge/scripts/api/cloudinaryTranformationApi');

/**
 * Get cloudinary images and Product Gallery Widget options based on preferences.
 *
 * @param {string} productID - product ID
 * @param {Object} params - object holding optional params
 *
 * @returns {string} JSON string holding image assets URLs and widget options
 */
var getCloudinaryImages = function (productID, params) {
    var assets = {};
    var assetPublicID;
    var cldTag = '';
    var colorAttrValueID;
    var cldAssetURLs = [];
    var galleryOptions = {};
    var imageURL;
    var isSwatch = false;
    var mediaAssets = [];
    var pageType;
    var product;
    var prodID = productID;
    var variantID;
    var videoURL;

    try {
        if (cloudinaryConstants.CLD_ENABLED) {
            // initialize optional params
            if (!empty(params)) {
                colorAttrValueID = params.variationAttrValueID;
                pageType = params.pageType;
            }

            product = ProductMgr.getProduct(prodID);

            if (cloudinaryConstants.CLD_GALLERY_ENABLED) {
                galleryOptions = cloudinaryHelper.getCloudinaryGalleryStyles(product);
            }
            // check if product is variant then fetch it's master product
            if (product && (product.variant || product.variationGroup)) {
                product = product.getMasterProduct();
            }

            if (cloudinaryConstants.CLD_GALLERY_ENABLED) {
                galleryOptions.cloudName = cloudinaryConstants.CLD_CLOUDNAME;

                if (cloudinaryConstants.CLD_CARTRIDGE_OPERATION_MODE === cloudinaryConstants.CLD_GET_ASSETS_BY_TAG_NAME_MODE) {
                    cldTag = cloudinaryHelper.getCloudinaryTagName(product);

                    if (!empty(colorAttrValueID)) {
                        cldTag += cloudinaryConstants.HYPHEN + colorAttrValueID;
                    }
                    mediaAssets.push({ tag: cldTag, mediaType: cloudinaryConstants.CLD_IMAGE_RESOURCE_TYPE });
                    mediaAssets.push({ tag: cldTag, mediaType: cloudinaryConstants.CLD_VIDEO_RESOURCE_TYPE });

                    if (cloudinaryConstants.CLD_360_SPINSETS_ENABLED) {
                        mediaAssets.push({ tag: cldTag + cloudinaryConstants.CLD_360_SPIN_SET_TAG_SUFFIX, mediaType: cloudinaryConstants.CLD_SPIN_SET_RESOURCE_TYPE });
                    }

                    if (cloudinaryConstants.CLD_3D_OBJECTS_ENABLED) {
                        mediaAssets.push({ tag: cldTag + cloudinaryConstants.CLD_3D_OBJECT_TAG_SUFFIX_SLASH, mediaType: cloudinaryConstants.CLD_3D_OBJECT_TAG_SUFFIX });
                    }
                } else if (cloudinaryConstants.CLD_CARTRIDGE_OPERATION_MODE === cloudinaryConstants.CLD_GET_ASSETS_BY_VIEW_TYPE_MODE) {
                    if (!empty(colorAttrValueID)) {
                        variantID = cloudinaryHelper.getVariantProductIDByColor(prodID, colorAttrValueID);
                        prodID = !empty(variantID) ? variantID : prodID;
                    }

                    cldAssetURLs = cloudinaryAPI.getProductImagesByViewType(prodID, cloudinaryConstants.CLD_HIGH_RES_IMAGES_VIEW_TYPE, pageType);
                    cldAssetURLs.forEach(function (imgURL) {
                        imageURL = imgURL.url;
                        assetPublicID = imageURL.substring(imageURL.lastIndexOf(cloudinaryConstants.CLD_IMAGE_PATH),
                            imageURL.lastIndexOf(cloudinaryConstants.QUESTION_MARK));
                        if (!empty(assetPublicID)) {
                            mediaAssets.push({ publicId: assetPublicID, mediaType: cloudinaryConstants.CLD_IMAGE_RESOURCE_TYPE });
                        }
                    });
                    // add videos in PGW fetched by viewtype
                    if (cloudinaryConstants.CLD_INCLUDE_VIDEOS_IN_PGW) {
                        cldAssetURLs = cloudinaryAPI.getProductVideosByViewType(prodID);
                        cldAssetURLs.forEach(function (videAsset) {
                            videoURL = videAsset.videoURL.toString();
                            assetPublicID = videoURL.substring(videoURL.lastIndexOf(cloudinaryConstants.CLD_VIDEO_PATH),
                                videoURL.lastIndexOf(cloudinaryConstants.DOT));
                            if (!empty(assetPublicID)) {
                                mediaAssets.push({ publicId: assetPublicID, mediaType: cloudinaryConstants.CLD_VIDEO_RESOURCE_TYPE });
                            }
                        });
                    }
                }
                galleryOptions.mediaAssets = mediaAssets;
                assets = { galleryWidget: { options: galleryOptions } };
            } else {
                if (!empty(colorAttrValueID)) {
                    variantID = cloudinaryHelper.getVariantProductIDByColor(prodID, colorAttrValueID);
                    prodID = !empty(variantID) ? variantID : prodID;
                }

                if (cloudinaryConstants.CLD_CARTRIDGE_OPERATION_MODE === cloudinaryConstants.CLD_GET_ASSETS_BY_TAG_NAME_MODE) {
                    var cld3DEnabled = false;
                    if (cloudinaryConstants.CLD_3D_OBJECTS_ENABLED) {
                        cld3DEnabled = true;
                    }

                    var cld360Enabled = false;
                    if (cloudinaryConstants.CLD_360_SPINSETS_ENABLED) {
                        cld360Enabled = true;
                    }

                    assets.imageURLs = cloudinaryAPI.getProductImagesByTagName(prodID, {
                        pageType: pageType,
                        isSwatch: isSwatch,
                        variationAttrValueID: colorAttrValueID,
                        cld360Tag: cld360Enabled,
                        cld3DTag: cld3DEnabled,
                        setAndBundleImages: params.setAndBundleImages
                    });
                } else if (cloudinaryConstants.CLD_CARTRIDGE_OPERATION_MODE === cloudinaryConstants.CLD_GET_ASSETS_BY_VIEW_TYPE_MODE) {
                    assets.imageURLs = cloudinaryAPI.getProductImagesByViewType(prodID, cloudinaryConstants.CLD_HIGH_RES_IMAGES_VIEW_TYPE, pageType);
                } else if (cloudinaryConstants.CLD_CARTRIDGE_OPERATION_MODE === cloudinaryConstants.CLD_GET_ASSETS_BY_AUTO_UPLOAD_MODE) {
                    assets.imageURLs = cloudinaryAPI.getProductImagesByAutoupload(prodID, pageType, cloudinaryConstants.CLD_HIGH_RES_IMAGES_VIEW_TYPE);
                }
            }
        }
    } catch (ex) {
        logger.error('Error occurred while getting images and options for product with ID: {0}, error: {1}', prodID, ex);
    }

    return assets;
};

/**
 * Get cloudinary vieo and video player options based on preferences.
 *
 * @param {string} productID - product ID
 * @param {Object} currentLocale - Current locale
 *
 * @returns {string} JSON string holding video URL and player options
 */
var getCloudinaryVideo = function (productID, currentLocale) {
    var isVideoEnabled = false;
    var isVideoPlayerEnabled = false;
    var globalTransformations = '';
    var locale = !empty(currentLocale) ? currentLocale : (request && !empty(request.locale)) ? request.locale : '';
    var productCatalogTransformations = '';
    var product;
    var video;
    var videos = {};
    var widgetOptions;

    try {
        if (cloudinaryConstants.CLD_ENABLED) {
            product = ProductMgr.getProduct(productID);
            isVideoEnabled = cloudinaryHelper.isVideoEnabled(product);

            if (isVideoEnabled) {
                globalTransformations = cldTransformationAPI.getGlobalVideoTransformation();
                productCatalogTransformations = cldTransformationAPI.getProductCatalogVideoTransformation(productID);

                if (cloudinaryConstants.CLD_USE_VIDEO_CUSTOM_MAPPING) {
                    video = cloudinaryAPI.getProductVideoByCustomMapping(productID, locale);
                } else if (cloudinaryConstants.CLD_CARTRIDGE_OPERATION_MODE === cloudinaryConstants.CLD_GET_ASSETS_BY_TAG_NAME_MODE) {
                    video = cloudinaryAPI.getProductVideosByTagName(productID);
                    // fetch video present at first position
                    video = video.length > 0 ? video[0] : cloudinaryConstants.EMPTY_STRING;
                } else if (cloudinaryConstants.CLD_CARTRIDGE_OPERATION_MODE === cloudinaryConstants.CLD_GET_ASSETS_BY_VIEW_TYPE_MODE) {
                    video = cloudinaryAPI.getProductVideosByViewType(productID);
                    // fetch video present at first position
                    video = video.length > 0 ? video[0] : cloudinaryConstants.EMPTY_STRING;
                } else if (cloudinaryConstants.CLD_CARTRIDGE_OPERATION_MODE === cloudinaryConstants.CLD_GET_ASSETS_BY_AUTO_UPLOAD_MODE) {
                    var videoObjs = cloudinaryAPI.getProductVideosByAutoupload(productID);
                    // fetch video present at first position
                    videos = videoObjs.length > 0 ? videoObjs[0] : cloudinaryConstants.EMPTY_STRING;
                }

                if (!empty(video)) {
                    videos.videoURL = video.videoURL;
                    videos.videoPoster = video.videoPoster;
                }

                isVideoPlayerEnabled = cloudinaryHelper.isVideoPlayerEnabled(product);
                if (isVideoPlayerEnabled) {
                    widgetOptions = cloudinaryHelper.getVideoPlayerOptions(product);

                    if (!empty(widgetOptions)) {
                        widgetOptions.transformations = (!empty(globalTransformations)
                            ? globalTransformations + cloudinaryConstants.COMMA : cloudinaryConstants.EMPTY_STRING) + productCatalogTransformations;
                        widgetOptions.posterOptions = { publicId: videos.videoPoster };
                        delete videos.videoPoster;
                    }

                    videos.widgetOptions = widgetOptions;
                }
            }
        }
    } catch (ex) {
        logger.error('Error occurred while getting video and options for product with ID: {0}, error: {1}', productID, ex);
    }

    return videos;
};

/**
 * Get cloudinary image URL for static content library.
 *
 * @param {string} imageName - image name
 * @param {string} pageType - page type
 *
 * @returns {Object} object holding image asset URL
 */
var geContentImageURLByName = function (imageName, pageType) {
    var image = {};

    try {
        if (cloudinaryConstants.CLD_ENABLED) {
            image.imgURL = cloudinaryAPI.applyTransformationOnContentImageRelativeURL(imageName, pageType);
        } else {
            logger.debug(cloudinaryConstants.CLD_DISABLED);
        }
    } catch (ex) {
        logger.error('Error occurred while building URL for library image with name: {0}, error: {1}', imageName, ex);
    }

    return image;
};

/**
 * Get cloudinary image URL for static content library.
 *
 * @param {string} url - image absolute URL
 * @param {string} pageType - page type
 *
 * @returns {Object} object holding image asset URL
 */
var geContentImageURLByURL = function (url, pageType) {
    var image = {};

    try {
        if (cloudinaryConstants.CLD_ENABLED) {
            image.url = cloudinaryAPI.applyTransformationOnContentImageAbsoluteURL(url, pageType);
        } else {
            logger.debug(cloudinaryConstants.CLD_DISABLED);
        }
    } catch (ex) {
        logger.error('Error occurred while building URL library image with absolute URL: {0}, error: {1}', url, ex);
    }

    return image;
};

/**
 * Get cloudinary video URL and video player options based on preferences for static library content.
 *
 * @param {string} videoName - video name
 *
 * @returns {Object} object holding video URL and player options
 */
var geContentVideoByName = function (videoName) {
    var videos = {};

    try {
        if (cloudinaryConstants.CLD_ENABLED) {
            var isvideoEnabled = cloudinaryHelper.isVideoEnabledForContentLibrary();
            if (isvideoEnabled) {
                var globalTransformations = cldTransformationAPI.getGlobalVideoTransformation();

                var libraryTransformations = cldTransformationAPI.getContentLibraryVideoTransformation();

                var video = cloudinaryAPI.applyTransformationOnContentVideoRelativeURL(videoName);
                videos.videoURL = video.videoURL;

                var isvideoPlayerEnabled = cloudinaryHelper.isVideoPlayerEnabledForContentLibrary();
                if (isvideoPlayerEnabled) {
                    var widgetOptions = cloudinaryHelper.getContentVideoPlayerOptions();
                    if (!empty(widgetOptions)) {
                        widgetOptions.transformations = (!empty(globalTransformations) ? globalTransformations + cloudinaryConstants.COMMA : '') + libraryTransformations;
                        widgetOptions.posterOptions = { publicId: video.videoPoster };
                    }
                    videos.widgetOptions = widgetOptions;
                } else {
                    videos.videoPoster = video.videoPoster;
                }
            } else {
                logger.debug(cloudinaryConstants.CLD_VIDEO_DISABLED);
            }
        } else {
            logger.debug(cloudinaryConstants.CLD_DISABLED);
        }
    } catch (ex) {
        logger.error('Error occurred while building library video URL and options for video with name: {0}, error: {1}', videoName, ex);
    }

    return videos;
};

/**
 * Get cloudinary video URL and video player options based on preferences for static library content.
 *
 * @param {string} url - video absolute URL
 *
 * @returns {Object} object holding video URL and player options
 */
var geContentVideoByURL = function (url) {
    var videos = {};

    try {
        if (cloudinaryConstants.CLD_ENABLED) {
            var isvideoEnabled = cloudinaryHelper.isVideoEnabledForContentLibrary();
            if (isvideoEnabled) {
                var globalTransformations = cldTransformationAPI.getGlobalVideoTransformation();

                var libraryTransformations = cldTransformationAPI.getContentLibraryVideoTransformation();

                var video = cloudinaryAPI.applyTransformationOnContentVideoAbsoluteURL(url);
                videos.videoURL = video.videoURL;

                var isvideoPlayerEnabled = cloudinaryHelper.isVideoPlayerEnabledForContentLibrary();
                if (isvideoPlayerEnabled) {
                    var widgetOptions = cloudinaryHelper.getContentVideoPlayerOptions();
                    if (!empty(widgetOptions)) {
                        widgetOptions.transformations = (!empty(globalTransformations) ? globalTransformations + cloudinaryConstants.COMMA : '') + libraryTransformations;
                        widgetOptions.posterOptions = { publicId: video.videoPoster };
                    }
                    videos.widgetOptions = widgetOptions;
                } else {
                    videos.videoPoster = video.videoPoster;
                }
            } else {
                logger.debug(cloudinaryConstants.CLD_VIDEO_DISABLED);
            }
        } else {
            logger.debug(cloudinaryConstants.CLD_DISABLED);
        }
    } catch (ex) {
        logger.error('Error occurred while building library video URL and options for video with absolute URL: {0}, error: {1}', url, ex);
    }

    return videos;
};

/**
 * Get plp primary image along with srcset and sizes attributes.
 *
 * @param {string} productID - product ID
 * @param {string} viewType - media view type
 * @param {string} params - object holding optional params
 *
 * @returns {Object} object holding image URL and srcset attributes
 */
var getProductPrimaryImage = function (productID, viewType, params) {
    var isSwatch = false;
    var productPrimaryImg;
    var productImgs = [];
    var product;
    var pid = productID;
    var pageType;
    var variationAttrValueID;

    try {
        if (cloudinaryConstants.CLD_ENABLED) {
            // initialize optional params
            if (!empty(params)) {
                pageType = params.pageType;
            }

            if (viewType === cloudinaryConstants.CLD_SWATCH_IMAGES_VIEW_TYPE) {
                isSwatch = true;
            }

            if (cloudinaryConstants.CLD_CARTRIDGE_OPERATION_MODE === cloudinaryConstants.CLD_GET_ASSETS_BY_TAG_NAME_MODE) {
                product = ProductMgr.getProduct(pid);
                if (product.variant) {
                    variationAttrValueID = cloudinaryHelper.fetchVariationAttrValueId(product.ID, cloudinaryConstants.COLOR_ATTR);
                    pid = product.masterProduct.ID;
                }
                productPrimaryImg = cloudinaryAPI.getProductPrimaryImageURLUsingTagName(pid, {
                    pageType: pageType,
                    isSwatch: isSwatch,
                    variationAttrValueID: variationAttrValueID
                });
                if (!empty(product.custom.CLDAltTextForImages)) {
                    productPrimaryImg.altText = product.custom.CLDAltTextForImages;
                }
            } else if (cloudinaryConstants.CLD_CARTRIDGE_OPERATION_MODE === cloudinaryConstants.CLD_GET_ASSETS_BY_VIEW_TYPE_MODE) {
                productImgs = cloudinaryAPI.getProductImagesByViewType(pid, viewType, pageType);
                productPrimaryImg = productImgs.length > 0 ? productImgs[0] : productPrimaryImg;
            } else if (cloudinaryConstants.CLD_CARTRIDGE_OPERATION_MODE === cloudinaryConstants.CLD_GET_ASSETS_BY_AUTO_UPLOAD_MODE) {
                productImgs = cloudinaryAPI.getProductImagesByAutoupload(pid, pageType, viewType);
                productPrimaryImg = productImgs.length > 0 ? productImgs[0] : productPrimaryImg;
            }
        }
    } catch (ex) {
        logger.error('Error occurred while getting primary image for product with ID: {0}, error: {1}', pid, ex);
    }

    return productPrimaryImg;
};

/**
 * Get plp image based on the custom index position along with srcset and sizes attributes.
 *
 * @param {string} productID - product ID
 * @param {string} position - image position
 *
 * @returns {Object} object holding image URL and srcset attributes
 */
var getPLPCustomImage = function (productID, position) {
    var plpImg;

    try {
        if (cloudinaryConstants.CLD_ENABLED) {
            plpImg = cloudinaryAPI.getProductCustomImageURLUsingTagName(position, productID, { pageType: cloudinaryConstants.PAGE_TYPES.PLP });
        }
    } catch (ex) {
        logger.error('Error occurred while getting custom position image for product with ID: {0}, error: {1}', productID, ex);
    }

    return plpImg;
};

/**
 * This method used to fetch resources based on tag names of individual products
 * @param {Object} product - the product object
 * @param {List} withFields - fields which will be returned with assets
 *
 * @returns {Object} images - object holding array of resources
 */
var searchProductSetAndBundleImagesByTags = function (product, withFields) {
    var images = [];

    if (!empty(product) && cloudinaryConstants.CLD_ENABLED && !cloudinaryConstants.CLD_GALLERY_ENABLED
            && cloudinaryConstants.CLD_CARTRIDGE_OPERATION_MODE === cloudinaryConstants.CLD_GET_ASSETS_BY_TAG_NAME_MODE) {
        var subProducts = [];
        if (product.productSet) {
            subProducts = product.productSetProducts;
        } else if (product.bundle) {
            subProducts = product.bundledProducts;
        }
        var tagsSearchQuery = cloudinaryHelper.generateTagsQuery(subProducts);

        images = cloudinaryAPI.searchCLDResourcesByTags(tagsSearchQuery, withFields);
    }

    return images;
};

/**
* This method used to fetch product from product_id
* @param {string} productID - the product id
* @param {Object} currentLocale - Current locale
* @param {string} viewType - the view type
*
* @returns {Object} images - object holding array of resources
*/
var getProductImageByIDAndViewType = function (productID, currentLocale, viewType) {
    var productFetch;
    var productImages;

    productFetch = ProductMgr.getProduct(productID);
    productImages = productFetch.getImages(viewType);
    return productImages;
};

module.exports = {
    getCloudinaryImages: getCloudinaryImages,
    getCloudinaryVideo: getCloudinaryVideo,
    geContentImageURLByName: geContentImageURLByName,
    geContentImageURLByURL: geContentImageURLByURL,
    geContentVideoByName: geContentVideoByName,
    geContentVideoByURL: geContentVideoByURL,
    getProductPrimaryImage: getProductPrimaryImage,
    getPLPCustomImage: getPLPCustomImage,
    searchProductSetAndBundleImagesByTags: searchProductSetAndBundleImagesByTags,
    getProductImageByIDAndViewType: getProductImageByIDAndViewType
};
