'use strict';

// Api includes
var logger = require('dw/system/Logger').getLogger('int_cloudinary', 'int_cloudinary');
var CatalogMgr = require('dw/catalog/CatalogMgr');
var ProductMgr = require('dw/catalog/ProductMgr');

// Script includes
var prefs = require('*/cartridge/scripts/util/cloudinaryConstants');

var cloudinary = {};

/**
 * Checks if video is enabled or not, first it will give preference
 * to product if it doesn't find then it will look into custom preferences
 *
 * @param {Product} apiProduct - the DW Product object
 *
 * @returns {boolean} flag indicates if video is enabled or not
 */
cloudinary.isVideoEnabled = function (apiProduct) {
    var isVideoEnabled = false;

    try {
        if ('CLDVideoEnabled' in apiProduct.custom && !empty(apiProduct.custom.CLDVideoEnabled)) {
            isVideoEnabled = apiProduct.custom.CLDVideoEnabled;
        } else {
            isVideoEnabled = prefs.CLD_VIDEO_ENABLED;
        }
    } catch (ex) {
        logger.error('Error occured while getting video preferences : ' + ex);
    }

    return isVideoEnabled;
};

/**
 * Checks if video player is enabled or not, first it will give preference
 * to product if it doesn't find then it will look into custom preferences
 *
 * @param {Product} apiProduct - the DW Product object
 *
 * @returns {boolean} flag indicates if video player is enabled or not
 */
cloudinary.isVideoPlayerEnabled = function (apiProduct) {
    var isVideoPlayerEnabled = false;

    try {
        if ('CLDVideoPlayerEnabled' in apiProduct.custom && !empty(apiProduct.custom.CLDVideoPlayerEnabled)) {
            isVideoPlayerEnabled = apiProduct.custom.CLDVideoPlayerEnabled;
        } else {
            isVideoPlayerEnabled = prefs.CLD_VIDEO_PLAYER_ENABLED;
        }
    } catch (ex) {
        logger.error('Error occured while getting video player preferences : ' + ex);
    }

    return isVideoPlayerEnabled;
};

/**
 * Checks if video is enabled or not, first it will give preference
 * to library if it doesn't find then it will look into custom preferences
 *
 * @returns {boolean} flag indicates if video is enabled or not
 */
cloudinary.isVideoEnabledForContentLibrary = function () {
    var ContentMgr = require('dw/content/ContentMgr');
    var isVideoEnabled = false;
    var library;

    try {
        library = ContentMgr.getSiteLibrary();
        if (!empty(library)) {
            if ('CLDVideoEnabled' in library.custom && !empty(library.custom.CLDVideoEnabled.value)) {
                isVideoEnabled = JSON.parse(library.custom.CLDVideoEnabled.value);
                isVideoEnabled = isVideoEnabled === prefs.CLD_LIBRARY_VIDEO_ENABLED;
            } else {
                isVideoEnabled = prefs.CLD_VIDEO_ENABLED;
            }
        }
    } catch (ex) {
        logger.error('Error occured while getting video preferences for content library : ' + ex);
    }

    return isVideoEnabled;
};

/**
 * Checks if video player is enabled or not, first it will give preference
 * to library if it doesn't find then it will look into custom preferences
 *
 * @returns {boolean} flag indicates if video player is enabled or not
 */
cloudinary.isVideoPlayerEnabledForContentLibrary = function () {
    var ContentMgr = require('dw/content/ContentMgr');
    var isVideoPlayerEnabled = false;
    var library;

    try {
        library = ContentMgr.getSiteLibrary();
        if (!empty(library)) {
            if ('CLDVideoPlayerEnabled' in library.custom && !empty(library.custom.CLDVideoPlayerEnabled.value)) {
                isVideoPlayerEnabled = JSON.parse(library.custom.CLDVideoPlayerEnabled.value);
                isVideoPlayerEnabled = isVideoPlayerEnabled === prefs.CLD_LIBRARY_VIDEO_PLAYER_ENABLED;
            } else {
                isVideoPlayerEnabled = prefs.CLD_VIDEO_PLAYER_ENABLED;
            }
        }
    } catch (ex) {
        logger.error('Error occured while getting video player preferences for content library : ' + ex);
    }

    return isVideoPlayerEnabled;
};

/**
 * Retrieves the video player options stored either on product custom attribute
 * or in custom preference. It gives preference to product if options specified
 * otherwise it will fetch from custom preference.
 *
 * @param {Product} apiProduct - the DW Product object
 *
 * @returns {Object} video player options object
 */
cloudinary.getVideoPlayerOptions = function (apiProduct) {
    var videoPlayeroptions = {};

    try {
        if ('CLDVideoOptions' in apiProduct.custom && !empty(apiProduct.custom.CLDVideoOptions)) {
            videoPlayeroptions = JSON.parse(apiProduct.custom.CLDVideoOptions);
        } else if (!empty(prefs.CLD_VIDEO_OPTIONS)) {
            videoPlayeroptions = JSON.parse(prefs.CLD_VIDEO_OPTIONS);
        }
    } catch (ex) {
        logger.error('Error occured while getting video player options : ' + ex);
    }

    return videoPlayeroptions;
};

/**
 * Retrieves the gallery styles either from site preference or product
 * if styles are specified on product level then it returns them otherwise
 * it returns styles stored in site preference
 *
 * @param {Product} apiProduct - the DW Product object
 *
 * @returns {Object} Cloudinary gallery styles object
 */
cloudinary.getCloudinaryGalleryStyles = function (apiProduct) {
    var stylesObj = {};

    try {
        if ('CLDGalleryStyles' in apiProduct.custom && !empty(apiProduct.custom.CLDGalleryStyles)) {
            stylesObj = JSON.parse(apiProduct.custom.CLDGalleryStyles);
        } else {
            stylesObj = JSON.parse(prefs.CLD_GALLERY_STYLES);
        }
    } catch (ex) {
        logger.error('Error occured while retreiving cloudinary gallery styles : ' + ex);
    }

    return stylesObj;
};

/**
 * Retrieves the tag name for gallery either from site preference or product
 * if tag name is specified on product level then it returns it otherwise
 * it returns tag name stored in site preference
 *
 * @param {Product} apiProduct - the DW Product object
 *
 * @returns {string} tagName - Cloudinary gallery tag name
 */
cloudinary.getCloudinaryTagName = function (apiProduct) {
    var tagName = '';

    try {
        if ('CLDTagName' in apiProduct.custom && !empty(apiProduct.custom.CLDTagName)) {
            tagName = apiProduct.custom.CLDTagName;
        } else {
            var productAttributeName = prefs.CLD_PRODUCT_ATTRIBUTE_FOR_TAGS;
            if (productAttributeName in apiProduct && !empty(apiProduct[productAttributeName])) {
                tagName = apiProduct[productAttributeName];
            } else if (productAttributeName in apiProduct.custom && !empty(apiProduct.custom[productAttributeName])) {
                tagName = apiProduct.custom[productAttributeName];
            }
        }
    } catch (ex) {
        logger.error('Error occured while retreiving cloudinary gallery tag name : ' + ex);
    }

    return tagName;
};

/**
 * Find an object from array based on the key provided as external ID
 *
 * @param {array} objArray - given objects array
 * @param {string} key - external ID
 *
 * @returns {Object} object
 */
cloudinary.findObjectByExternalId = function (objArray, key) {
    var obj;

    try {
        if (!empty(key)) {
            for (var idx = 0; idx < objArray.length; idx++) {
                obj = objArray[idx];
                if ((key).equalsIgnoreCase(obj.external_id)) {
                    break;
                }
            }
        }
    } catch (e) {
        logger.error('Error occured while finding object in objects array for key {0}, Error: {1}', key, e);
    }

    return obj;
};

/**
 * Sort cloudinary resources in ascending order based on the
 * value present in metadata field called SFCC_gallery_position
 *
 * @param {array} resources - resources returned by cloudinary api
 *
 * @returns {array} Sorted resources
 */
cloudinary.sortResourcesByAssetPosition = function (resources) {
    var comparison;
    var metadataObj1;
    var metadataObj2;

    try {
        if (resources) {
            resources.sort(function (resource1, resource2) {
                comparison = 0;
                if (!empty(resource1.metadata) && !empty(resource2.metadata)) {
                    metadataObj1 = cloudinary.findObjectByExternalId(resource1.metadata, prefs.CLD_SMD_GALLERY_POSITION_KEY);
                    metadataObj2 = cloudinary.findObjectByExternalId(resource2.metadata, prefs.CLD_SMD_GALLERY_POSITION_KEY);
                    if (!empty(metadataObj1) && !empty(metadataObj2)) {
                        if (metadataObj1.value > metadataObj2.value) {
                            comparison = 1;
                        } else if (metadataObj1.value < metadataObj2.value) {
                            comparison = -1;
                        }
                    }
                }
                return comparison;
            });
        }
    } catch (ex) {
        logger.error('Error occured while sorting cloudinary resources : ' + ex);
    }

    return resources;
};

/**
 * Retrieves image transformations from product custom attirbute if specified otherwise
 * look-up into product catlog custom attribute and fetch transformations from there
 *
 * @param {Product} apiProduct - the DW product object
 *
 * @returns {string} trnaformations string
 */
cloudinary.getImageTransformations = function (apiProduct) {
    var siteCatalog;
    var tempTransformations;
    var transformations = '';

    try {
        siteCatalog = CatalogMgr.getSiteCatalog();
        tempTransformations = (!empty(siteCatalog) && 'CLDImageTransformation' in siteCatalog.custom && !empty(siteCatalog.custom.CLDImageTransformation)) ? siteCatalog.custom.CLDImageTransformation : '';
        tempTransformations = (!empty(apiProduct) && 'CLDImageTransformation' in apiProduct.custom && !empty(apiProduct.custom.CLDImageTransformation)) ? apiProduct.custom.CLDImageTransformation : tempTransformations;
        transformations = !empty(tempTransformations) ? tempTransformations : '';
    } catch (ex) {
        logger.error('Error occured while fetching image transformations : ' + ex);
    }

    return transformations;
};

/**
 * Retrieves video transformations from product custom attirbute if specified otherwise
 * look-up into product catlog custom attribute and fetch transformations from there
 *
 * @param {Product} apiProduct - the DW product object
 *
 * @returns {string} trnaformations string
 */
cloudinary.getVideoTransformations = function (apiProduct) {
    var siteCatalog;
    var tempTransformations;
    var transformations = '';

    try {
        siteCatalog = CatalogMgr.getSiteCatalog();
        tempTransformations = (!empty(siteCatalog) && 'CLDVideoTransformation' in siteCatalog.custom && !empty(siteCatalog.custom.CLDVideoTransformation)) ? siteCatalog.custom.CLDVideoTransformation : '';
        tempTransformations = (!empty(apiProduct) && 'CLDVideoTransformation' in apiProduct.custom && !empty(apiProduct.custom.CLDVideoTransformation)) ? apiProduct.custom.CLDVideoTransformation : tempTransformations;
        transformations = !empty(tempTransformations) ? tempTransformations : '';
    } catch (ex) {
        logger.error('Error occured while fetching video transformations : ' + ex);
    }

    return transformations;
};

/**
 * Fetch values from different pereferences for transfromations format, quality and dpr(Device pixel ratio)
 * agaisnt image, prepend with appropriate prefixes and build a comma separted string.
 *
 * @returns {string} string value holding global level format, quality, dpr
 */
cloudinary.getImgGlobalDropdownValues = function () {
    var globalDropdownValues = [];
    var valuesString = '';

    try {
        var globalImgTranformFormat = prefs.CLD_GLOBAL_IMAGE_TRANSFORM_FORMAT;
        if (!empty(globalImgTranformFormat) && globalImgTranformFormat !== 'null' && globalImgTranformFormat.value !== 'null') {
            globalDropdownValues.push(prefs.FORMAT_PREFIX + globalImgTranformFormat);
        }

        var globalImgQuality = prefs.CLD_GLOBAL_IMAGE_QUALITY;
        if (!empty(globalImgQuality) && globalImgQuality !== 'null' && globalImgQuality.value !== 'null') {
            globalDropdownValues.push(prefs.QUALITY_PREFIX + globalImgQuality);
        }

        var globalImgDpr = prefs.CLD_GLOBAL_IMAGE_DPR;
        if (!empty(globalImgDpr) && globalImgDpr !== 'null' && globalImgDpr.value !== 'null') {
            globalDropdownValues.push(prefs.DPR_PREFIX + globalImgDpr);
        }

        if (!empty(globalDropdownValues)) {
            valuesString = globalDropdownValues.join();
        }
    } catch (ex) {
        logger.error('Error occured while fetching and building global drop down values [Image transformation format, Image quality, Image DPR] : ' + ex);
    }

    return valuesString;
};

/**
 * Fetch values from different pereferences for transfromations format, quality and dpr(Device pixel ratio)
 * agaisnt video, prepend with appropriate prefixes and build a comma separted string.
 *
 * @returns {string} string value holding global level format, quality, dpr
 */
cloudinary.getVideoGlobalDropdownValues = function () {
    var globalDropdownValues = [];
    var valuesString = '';

    try {
        var globalVideoTranformFormat = prefs.CLD_GLOBAL_VIDEO_TRANSFORM_FORMAT;
        if (!empty(globalVideoTranformFormat) && globalVideoTranformFormat !== 'null' && globalVideoTranformFormat.value !== 'null') {
            globalDropdownValues.push(prefs.FORMAT_PREFIX + globalVideoTranformFormat);
        }

        var globalVideoQuality = prefs.CLD_GLOBAL_VIDEO_QUALITY;
        if (!empty(globalVideoQuality) && globalVideoQuality !== 'null' && globalVideoQuality.value !== 'null') {
            globalDropdownValues.push(prefs.QUALITY_PREFIX + globalVideoQuality);
        }

        if (!empty(globalDropdownValues)) {
            valuesString = globalDropdownValues.join();
        }
    } catch (ex) {
        logger.error('Error occured while fetching and building global drop down values [Video transformation format, video quality, video DPR] : ' + ex);
    }

    return valuesString;
};

/**
 * Fetch image page type settings from global site level preferences
 * against the provided page type
 *
 * @param {string} pageType - page type
 *
 * @returns {Object} page type settings object
 */
cloudinary.getPagetypeSettings = function (pageType) {
    var settings;

    try {
        if (!empty(pageType) && !empty(prefs.CLD_IMAGE_PAGE_TYPE_SETTINGS)) {
            var globalPageTypeSettings = JSON.parse(prefs.CLD_IMAGE_PAGE_TYPE_SETTINGS);
            if (!empty(globalPageTypeSettings) && pageType in globalPageTypeSettings) {
                settings = globalPageTypeSettings[pageType];
            }
        }
    } catch (ex) {
        logger.error('Error occured while fetching page type settings: ' + ex);
    }

    return settings;
};

/**
 * Retrieves the video player options stored either on content library custom attribute
 * or in custom preference. It gives preference to library if options specified
 * otherwise it will fetch from custom preference.
 *
 * @returns {Object} video player options object
 */
cloudinary.getContentVideoPlayerOptions = function () {
    var ContentMgr = require('dw/content/ContentMgr');
    var library;
    var videoPlayeroptions = {};

    try {
        library = ContentMgr.getSiteLibrary();
        if (!empty(library)) {
            if ('CLDVideoOptions' in library.custom && !empty(library.custom.CLDVideoOptions)) {
                videoPlayeroptions = JSON.parse(library.custom.CLDVideoOptions);
            } else if (!empty(prefs.CLD_VIDEO_OPTIONS)) {
                videoPlayeroptions = JSON.parse(prefs.CLD_VIDEO_OPTIONS);
            }
        }
    } catch (ex) {
        logger.error('Error occured while getting video player options for cotent library video: ' + ex);
    }

    return videoPlayeroptions;
};

/**
 * Manipulates asset absolute URL and get relative URL
 *
 * @param {string} assetURL - asset absolute URL
 * @param {boolean} includeVideoExtension - include video extension
 *
 * @returns {string} asset rel URL
 */
cloudinary.getAssetRelURL = function (assetURL, includeVideoExtension) {
    var endToken;
    var relURL = '';
    var startToken;
    var tempPath = '';

    try {
        startToken = assetURL.lastIndexOf(prefs.FORWARD_SLASH) + 1;
        endToken = assetURL.lastIndexOf(prefs.DOT);
        // check if base path is not configured to '/'
        if ((prefs.IMAGES_BASE_PATH.indexOf(prefs.FORWARD_SLASH) === 0 && prefs.IMAGES_BASE_PATH.length > 1)) {
            if (assetURL.indexOf(prefs.IMAGES_BASE_PATH) > -1) {
                startToken = assetURL.lastIndexOf(prefs.IMAGES_BASE_PATH) + prefs.IMAGES_BASE_PATH.length + 1;
            }
        } else if (assetURL.indexOf(prefs.DEFAULT_DIRECTORY) > -1) {
            tempPath = assetURL.substring(assetURL.lastIndexOf(prefs.DEFAULT_DIRECTORY) + prefs.DEFAULT_DIRECTORY.length);
            startToken = !empty(tempPath)
                ? assetURL.lastIndexOf(tempPath.substring(tempPath.indexOf(prefs.FORWARD_SLASH)))
                : startToken;
        }

        if (includeVideoExtension) {
            relURL = assetURL.substring(startToken);
        } else {
            relURL = assetURL.substring(startToken, endToken);
        }
    } catch (ex) {
        logger.error('Error occured while getting asset rel URL, absURL: {0}, message: {1} ', assetURL, ex);
    }

    return relURL;
};

/**
 * Fetch cloudinary base path to construct URLs manually.
 *
 * @returns {string} cloudinary base path
 */
cloudinary.getCLDBasePath = function () {
    var cldBasePath = prefs.CLD_BASE_PATH;

    if (!empty(cldBasePath) && cldBasePath.lastIndexOf(prefs.FORWARD_SLASH) !== (cldBasePath.length - 1)) {
        cldBasePath += prefs.FORWARD_SLASH;
    }

    return cldBasePath;
};

/**
 * Gets the poster image for specific video.
 *
 * @param {string} videoURL - video URL
 *
 * @returns {string} poster image URL
 */
cloudinary.getVideoPoster = function (videoURL) {
    var cloudinaryUtils = require('*/cartridge/scripts/util/cloudinaryUtils');
    var fileType;
    var posterImg = '';
    var videoFormates = cloudinaryUtils.getVideoFormats();

    try {
        if (!empty(videoURL)) {
            if (videoURL.indexOf(prefs.QUESTION_MARK) > -1) {
                fileType = videoURL.substring(videoURL.lastIndexOf(prefs.DOT) + 1, videoURL.lastIndexOf(prefs.QUESTION_MARK));
            } else {
                fileType = videoURL.substring(videoURL.lastIndexOf(prefs.DOT) + 1);
            }

            if (videoFormates.indexOf(fileType) > -1) {
                posterImg = videoURL.replace(prefs.DOT + fileType, prefs.VIDEO_POSTER_IMAGE_TYPE);
            } else if (videoURL.indexOf(prefs.QUESTION_MARK) > -1) {
                posterImg = videoURL.replace(prefs.QUESTION_MARK, prefs.VIDEO_POSTER_IMAGE_TYPE + prefs.QUESTION_MARK);
            } else {
                posterImg = videoURL + prefs.VIDEO_POSTER_IMAGE_TYPE;
            }
        }
    } catch (ex) {
        logger.error('Error occured while getting video poster image, video URL: {0}, message: {1} ', videoURL, ex);
    }

    return posterImg;
};

/**
 * Append cloudinary tracking query param with delivery URLs.
 *
 * @param {string} url - asset absolute URL
 *
 * @returns {string} url with query param
 */
cloudinary.addTrackingQueryParam = function (url) {
    var assetAbsolURL = '';

    try {
        if (!empty(url)) {
            assetAbsolURL = url + prefs.QUESTION_MARK + prefs.CLD_TRACKING_PARAM;
        }
    } catch (ex) {
        logger.error('Error occured while adding tracking query param in delivery URL, URL: {0}, message: {1} ', url, ex);
        assetAbsolURL = url;
    }

    return assetAbsolURL;
};

/**
 * Fetch variation attribute value ID for variant product.
 *
 * @param {string} variantProductID - variant product ID
 * @param {string} variationAttr - variation attribute
 *
 * @returns {string} variation attr value ID
 */
cloudinary.fetchVariationAttrValueId = function (variantProductID, variationAttr) {
    var productVariationAttr;
    var productVariationAttrValue;
    var productVariationAttrValueId;
    var productVariationModel;
    var variantProduct;

    try {
        variantProduct = ProductMgr.getProduct(variantProductID);
        if (!empty(variantProduct)) {
            productVariationModel = variantProduct.variationModel;

            if (variationAttr === prefs.COLOR_ATTR) {
                productVariationAttr = productVariationModel.getProductVariationAttribute(prefs.COLOR_ATTR);
            } else if (variationAttr === prefs.SIZE_ATTR) {
                productVariationAttr = productVariationModel.getProductVariationAttribute(prefs.SIZE_ATTR);
            }

            if (!empty(productVariationModel) && !empty(productVariationAttr)) {
                productVariationAttrValue = productVariationModel.getVariationValue(variantProduct, productVariationAttr);

                if (!empty(productVariationAttrValue)) {
                    productVariationAttrValueId = productVariationAttrValue.ID;
                }
            }
        }
    } catch (ex) {
        logger.error('Error occured while fetching variation attribute value ID for product with ID : {0}, message: {1} ', variantProduct.ID, ex);
    }

    return productVariationAttrValueId;
};

/**
 * Fetch variant product ID based on color variation attribute value.
 *
 * @param {string} productID - product ID
 * @param {Object} colorAttrValueId - Color attribute value
 *
 * @returns {string} variant product ID
 */
cloudinary.getVariantProductIDByColor = function (productID, colorAttrValueId) {
    var HashMap = require('dw/util/HashMap');

    var attributesFilterMap;
    var masterProduct;
    var productVariationModel;
    var variationProducts;
    var variantProductId;

    try {
        masterProduct = ProductMgr.getProduct(productID);
        if (!empty(masterProduct) && !empty(colorAttrValueId)) {
            attributesFilterMap = new HashMap();
            attributesFilterMap.put(prefs.COLOR_ATTR, colorAttrValueId);
            productVariationModel = masterProduct.variationModel;
            variationProducts = productVariationModel.getVariants(attributesFilterMap);

            if (!empty(variationProducts) && variationProducts.length > 0) {
                variantProductId = variationProducts[0].ID;
            }
        }
    } catch (ex) {
        logger.error('Error occured while fetching variat by color variation attribute value, product: {0}, color attribute value ID: {1}, message: {2} ',
            productID, colorAttrValueId, ex);
    }

    return variantProductId;
};

/**
 * Remove leading and trailing slashed from URL.
 *
 * @param {string} url - asset URL
 *
 * @returns {string} assetURL
 */
cloudinary.removeLeadingAndTrailingSlashes = function (url) {
    var assetURL = url;

    try {
        if (!empty(assetURL)) {
            if (assetURL.charAt(0) === prefs.FORWARD_SLASH) {
                assetURL = assetURL.substring(1);
            }
            if (assetURL.charAt(assetURL.length - 1) === prefs.FORWARD_SLASH) {
                assetURL = assetURL.substring(0, (assetURL.length - 1));
            }
        }
    } catch (ex) {
        logger.error('Error occured while removing leading and trailing slashes from URL, URL: {0}, message: {1} ', assetURL, ex);
    }

    return assetURL;
};

cloudinary.generateTagsQuery = function (productsList) {
    var query = '';
    for (var i = 0; i < productsList.length; i++) {
        var product = productsList[i];
        var variationAttrValueID = '';
        if (product.variant) {
            variationAttrValueID = cloudinary.fetchVariationAttrValueId(product.ID, prefs.COLOR_ATTR);
        }

        if (product.variant || product.variationGroup) {
            product = product.getMasterProduct();
        }

        var tagName = cloudinary.getCloudinaryTagName(product);

        tagName = !empty(variationAttrValueID)
            ? (tagName + prefs.HYPHEN + variationAttrValueID)
            : tagName;

        if (i !== 0) {
            query += ' OR ';
        }
        query = query + 'tags=' + tagName;
    }
    return query;
};

module.exports = cloudinary;

