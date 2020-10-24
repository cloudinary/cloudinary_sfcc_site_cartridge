'use strict';
/** ************************************************************************************************
*@file        : File Name - cloudinaryTransformationApi
*@description : This script file behaves as the cloudinary transformation script API which can be used by developers
*               to get different types of transformations for different asset types.
*
*@author      : PixelMEDIA
*@created     : 01 May 2020
****************************************************************************************************/

// API includes
var CatalogMgr = require('dw/catalog/CatalogMgr');
var ProductMgr = require('dw/catalog/ProductMgr');
var logger = require('dw/system/Logger').getLogger('int_cloudinary', 'int_cloudinary');

// script includes
var cloudinaryConstants = require('*/cartridge/scripts/util/cloudinaryConstants');
var cloudinaryHelper = require('*/cartridge/scripts/helpers/cloudinaryHelpers');

/**
 * Fetch the global image transformations specified on site level.
 *
 * @returns {string} global image transformations string
 */
var getGlobalImageTransformation = function () {
    var dropdownValues = '';
    var transformations = '';

    try {
        dropdownValues = cloudinaryHelper.getImgGlobalDropdownValues();

        if (!empty(cloudinaryConstants.CLD_GLOBAL_IMAGE_TRANSFORMATIONS)) {
            transformations = cloudinaryConstants.CLD_GLOBAL_IMAGE_TRANSFORMATIONS;
        }
        if (!empty(dropdownValues) && !empty(transformations)) {
            transformations = dropdownValues + cloudinaryConstants.COMMA + transformations;
        } else {
            transformations = dropdownValues + transformations;
        }
    } catch (ex) {
        logger.error(cloudinaryConstants.CLD_GET_IMG_GLOBAL_TRANSFORM_ERROR, ex);
    }

    return transformations;
};

/**
 * Fetch the global video transformations specified on site level.
 *
 * @returns {string} global video transformations string
 */
var getGlobalVideoTransformation = function () {
    var dropdownValues = '';
    var transformations = '';

    try {
        dropdownValues = cloudinaryHelper.getVideoGlobalDropdownValues();

        if (!empty(cloudinaryConstants.CLD_GLOBAL_VIDEO_TRANSFORMATIONS)) {
            transformations = cloudinaryConstants.CLD_GLOBAL_VIDEO_TRANSFORMATIONS;
        }
        if (!empty(dropdownValues) && !empty(transformations)) {
            transformations = dropdownValues + cloudinaryConstants.COMMA + transformations;
        } else {
            transformations = dropdownValues + transformations;
        }
    } catch (ex) {
        logger.error(cloudinaryConstants.CLD_GET_VIDEO_GLOBAL_TRANSFORM_ERROR, ex);
    }

    return transformations;
};

/**
 * Fetch the image transformations specified on product/catalog level.
 * If transformations are specified at product level then they override
 * transformations specified at catalog level.
 *
 * @param {string} productID - product ID
 *
 * @returns {string} image product/catalog level transformations string
 */
var getProductCatalogImageTransformation = function (productID) {
    var apiProduct;
    var siteCatalog;
    var tempTransformations;
    var transformations = '';

    try {
        apiProduct = ProductMgr.getProduct(productID);
        siteCatalog = CatalogMgr.getSiteCatalog();

        tempTransformations = (!empty(siteCatalog) && 'CLDImageTransformation' in siteCatalog.custom && !empty(siteCatalog.custom.CLDImageTransformation)) ? siteCatalog.custom.CLDImageTransformation : '';
        tempTransformations = (!empty(apiProduct) && 'CLDImageTransformation' in apiProduct.custom && !empty(apiProduct.custom.CLDImageTransformation)) ? apiProduct.custom.CLDImageTransformation : tempTransformations;
        transformations = !empty(tempTransformations) ? tempTransformations : '';
    } catch (ex) {
        logger.error(cloudinaryConstants.CLD_GET_IMG_PROD_CAT_TRANSFORM_ERROR, ex);
    }

    return transformations;
};

/**
 * Fetch the video transformations specified on product/catalog level.
 * If transformations are specified at product level then they override
 * transformations specified at catalog level.
 *
 * @param {string} productID - product ID
 *
 * @returns {string} image product/catalog level transformations string
 */
var getProductCatalogVideoTransformation = function (productID) {
    var apiProduct;
    var siteCatalog;
    var tempTransformations;
    var transformations = '';

    try {
        siteCatalog = CatalogMgr.getSiteCatalog();
        apiProduct = ProductMgr.getProduct(productID);

        tempTransformations = (!empty(siteCatalog) && 'CLDVideoTransformation' in siteCatalog.custom && !empty(siteCatalog.custom.CLDVideoTransformation)) ? siteCatalog.custom.CLDVideoTransformation : '';
        tempTransformations = (!empty(apiProduct) && 'CLDVideoTransformation' in apiProduct.custom && !empty(apiProduct.custom.CLDVideoTransformation)) ? apiProduct.custom.CLDVideoTransformation : tempTransformations;
        transformations = !empty(tempTransformations) ? tempTransformations : '';
    } catch (ex) {
        logger.error(cloudinaryConstants.CLD_GET_VIDEO_PROD_CAT_TRANSFORM_ERROR, ex);
    }

    return transformations;
};

/**
 * Fetch the image transformations specified on the category level.
 * If category doesn't have any image transformations specified then
 * fetch from the root category.
 *
 * @param {string} categoryId - category id
 *
 * @returns {string} category level transformations string
 */
var getCategoryImageTransformation = function (categoryId) {
    var category;
    var siteCatalog;
    var transformations = '';

    try {
        category = CatalogMgr.getCategory(categoryId);
        if (!empty(category) && !empty(category.custom.CLDImageTransformation)) {
            transformations = category.custom.CLDImageTransformation;
        } else {
            siteCatalog = CatalogMgr.getSiteCatalog();
            if (siteCatalog && siteCatalog.root && siteCatalog.root.custom.CLDImageTransformation) {
                transformations = siteCatalog.root.custom.CLDImageTransformation;
            }
        }
    } catch (ex) {
        logger.error(cloudinaryConstants.CLD_GET_IMAGE_CATEGORY_TRANSFORM_ERROR, ex);
    }

    return transformations;
};

/**
 * Fetch the video transformations specified on the category level.
 * If category doesn't have any video transformations specified then
 * fetch from the root category.
 *
 * @param {string} categoryId - category id
 *
 * @returns {string} category level transformations string
 */
var getCategoryVideoTransformation = function (categoryId) {
    var category;
    var siteCatalog;
    var transformations = '';

    try {
        category = CatalogMgr.getCategory(categoryId);
        if (!empty(category) && !empty(category.custom.CLDVideoTransformation)) {
            transformations = category.custom.CLDVideoTransformation;
        } else {
            siteCatalog = CatalogMgr.getSiteCatalog();
            if (siteCatalog && siteCatalog.root && siteCatalog.root.custom.CLDVideoTransformation) {
                transformations = siteCatalog.root.custom.CLDVideoTransformation;
            }
        }
    } catch (ex) {
        logger.error(cloudinaryConstants.CLD_GET_VIDEO_CATEGORY_TRANSFORM_ERROR, ex);
    }

    return transformations;
};

/**
 * Fetch the image transformations specified on the catalog level.
 *
 * @returns {string} catalog level transformations string
 */
var getCatalogImageTransformation = function () {
    var catalog;
    var transformations = '';

    try {
        catalog = CatalogMgr.getSiteCatalog();
        if (!empty(catalog) && !empty(catalog.custom.CLDImageTransformation)) {
            transformations = catalog.custom.CLDImageTransformation;
        }
    } catch (ex) {
        logger.error(cloudinaryConstants.CLD_GET_IMAGE_CATALOG_TRANSFORM_ERROR, ex);
    }

    return transformations;
};

/**
 * Fetch the video transformations specified on the catalog level.
 *
 * @returns {string} catalog level transformations string
 */
var getCatalogVideoTransformation = function () {
    var catalog;
    var transformations = '';

    try {
        catalog = CatalogMgr.getSiteCatalog();
        if (!empty(catalog) && !empty(catalog.custom.CLDVideoTransformation)) {
            transformations = catalog.custom.CLDVideoTransformation;
        }
    } catch (ex) {
        logger.error(cloudinaryConstants.CLD_GET_VIDEO_CATALOG_TRANSFORM_ERROR, ex);
    }

    return transformations;
};

/**
 *  Fetch image dimensions specified on site level.
 *
 * @param {string} pageType - page type defined at site level
 *
 * @returns {Object} object holding image page type settings and dimensions
 */
var getImageDimensions = function (pageType) {
    var dimensions = { isResponsive: false };
    var imgGlobalSettings;

    try {
        imgGlobalSettings = cloudinaryHelper.getPagetypeSettings(pageType);
        if (!empty(imgGlobalSettings)) {
            if (cloudinaryConstants.RESPONSIVE_KEY in imgGlobalSettings && imgGlobalSettings[cloudinaryConstants.RESPONSIVE_KEY]) {
                dimensions.isResponsive = imgGlobalSettings[cloudinaryConstants.RESPONSIVE_KEY];
                if (cloudinaryConstants.RESPONSIVE_DIMENSIONS_KEY in imgGlobalSettings && !empty(imgGlobalSettings[cloudinaryConstants.RESPONSIVE_DIMENSIONS_KEY])) {
                    dimensions.dimensionsString = imgGlobalSettings[cloudinaryConstants.RESPONSIVE_DIMENSIONS_KEY];
                }
            } else {
                if (cloudinaryConstants.DIMENSIONS_KEY in imgGlobalSettings && !empty(imgGlobalSettings[cloudinaryConstants.DIMENSIONS_KEY])) {
                    dimensions.dimensionsString = imgGlobalSettings[cloudinaryConstants.DIMENSIONS_KEY];
                }
                if (cloudinaryConstants.BREAKPOINTS_KEY in imgGlobalSettings && !empty(imgGlobalSettings[cloudinaryConstants.BREAKPOINTS_KEY])) {
                    dimensions.breakpoints = imgGlobalSettings[cloudinaryConstants.BREAKPOINTS_KEY];
                }
            }
        }
    } catch (ex) {
        logger.error(cloudinaryConstants.CLD_GET_IMG_DIMENSIONS_ERROR, ex);
    }

    return dimensions;
};


/**
 * Build srcset and sizes attributes for HTML <img> tag to make it responsive.
 *
 * @param {string} url - absolute URL
 * @param {Object} breakpoints - object holding all breakpoints defined at site level
 *
 * @returns {Object} object holding srcset values
 */
var getImageSrcset = function (url, breakpoints) {
    var imgSrcset = { text: '', clearSrcset: '' };
    var srcsetSizes = breakpoints;

    try {
        if (!empty(srcsetSizes) && Object.keys(srcsetSizes).length > 0) {
            // check if given url is valid
            if (!empty(url) && (url.indexOf(cloudinaryConstants.CLD_IMAGE_PATH) > -1 || url.indexOf(cloudinaryConstants.CLD_CONTENT_IMAGE_PATH) > -1 ||
                url.indexOf(cloudinaryConstants.CLD_VIDEO_PATH) > -1 || url.indexOf(cloudinaryConstants.CLD_AUTOUPLOAD_MAPPING) > -1 ||
                url.indexOf(cloudinaryConstants.IMAGE_LIST_URL_RESOURCE_TYPE) > -1 || url.indexOf(cloudinaryConstants.CLD_CATALOG_IMAGE_PATH) > -1)) {
                var comma = cloudinaryConstants.COMMA_WITH_SPACE;
                var chImageUrl;
                var clearSrcset = '';
                var dimensions;
                var height;
                var keys = Object.keys(srcsetSizes);
                var sizesText = '';
                var token;
                var urlSize;
                var urlFirstPart = '';
                var urlLastPart = '';
                var width;
                // separate out url in parts
                if (!empty(url)) {
                    // if content library asset URL
                    if (url.indexOf(cloudinaryConstants.CLD_CONTENT_IMAGE_PATH) > -1) {
                        token = url.indexOf(cloudinaryConstants.CLD_CONTENT_IMAGE_PATH);
                        urlFirstPart = url.substring(0, token - 1);
                        urlLastPart = url.substring(token);
                    // if asset's cloudinary custom built URL
                    } else if (url.indexOf(cloudinaryConstants.CLD_IMAGE_PATH) > -1) {
                        token = url.indexOf(cloudinaryConstants.CLD_IMAGE_PATH);
                        urlFirstPart = url.substring(0, token - 1);
                        urlLastPart = url.substring(token);
                    // if list delivery URL
                    } else if (url.indexOf(cloudinaryConstants.IMAGE_LIST_URL_RESOURCE_TYPE) > -1) {
                        token = url.lastIndexOf(cloudinaryConstants.FORWARD_SLASH);
                        urlFirstPart = url.substring(0, token);
                        urlLastPart = url.substring(token + 1);
                    // if catalog asset
                    } else if (url.indexOf(cloudinaryConstants.CLD_CATALOG_IMAGE_PATH) > -1) {
                        token = url.indexOf(cloudinaryConstants.CLD_CATALOG_IMAGE_PATH);
                        urlFirstPart = url.substring(0, token - 1);
                        urlLastPart = url.substring(token);
                    // if asset's auto-upload URL
                    } else {
                        token = url.indexOf(cloudinaryConstants.IMAGE_UPLOAD_URL_RESOURCE_TYPE) + cloudinaryConstants.IMAGE_UPLOAD_URL_RESOURCE_TYPE.length;
                        urlFirstPart = url.substring(0, token);
                        urlLastPart = url.substring(token + 1);
                    }

                    if (!empty(urlFirstPart)) {
                        urlFirstPart += cloudinaryConstants.FORWARD_SLASH;
                    }
                }

                for (var i = 0; i < keys.length; i++) {
                    dimensions = [];
                    width = srcsetSizes[keys[i]].width ? cloudinaryConstants.WIDTH_PREFIX + srcsetSizes[keys[i]].width : '';
                    height = srcsetSizes[keys[i]].height ? cloudinaryConstants.HEIGHT_PREFIX + srcsetSizes[keys[i]].height : '';

                    if (!empty(width)) {
                        dimensions.push(width);
                    }
                    if (!empty(height)) {
                        dimensions.push(height);
                    }
                    if (i === keys.length - 1) {
                        comma = cloudinaryConstants.EMPTY_STRING;
                    }

                    urlSize = dimensions.join(cloudinaryConstants.COMMA);
                    if (!empty(urlSize)) {
                        urlSize += cloudinaryConstants.FORWARD_SLASH;
                    }
                    chImageUrl = urlFirstPart + urlSize + urlLastPart;
                    clearSrcset = clearSrcset + chImageUrl + comma;
                    if (!empty(srcsetSizes[keys[i]].style)) {
                        sizesText = sizesText + srcsetSizes[keys[i]].style + comma;
                    }
                }
                imgSrcset.sizes = sizesText;
                imgSrcset.srcset = clearSrcset;
            }
        }
    } catch (ex) {
        logger.error(cloudinaryConstants.CLD_GET_IMG_SRCSET_ERROR, url, ex);
    }

    return imgSrcset;
};

/**
 * Fetch the image transformations specified on the library level.
 *
 * @returns {string} image library level transformations string
 */
var getContentLibraryImageTransformation = function () {
    var ContentMgr = require('dw/content/ContentMgr');
    var staticLibrary;
    var transformations = '';

    try {
        staticLibrary = ContentMgr.getSiteLibrary();
        if (!empty(staticLibrary) && staticLibrary.custom.CLDImageTransformations) {
            transformations = staticLibrary.custom.CLDImageTransformations;
        }
    } catch (ex) {
        logger.error(cloudinaryConstants.CLD_GET_IMG_LIBRARY_TRANSFORM_ERROR, ex);
    }

    return transformations;
};

/**
 * Fetch the video transformations specified on the library level.
 *
 * @returns {string} video library level transformations string
 */
var getContentLibraryVideoTransformation = function () {
    var ContentMgr = require('dw/content/ContentMgr');
    var staticLibrary;
    var transformations = '';

    try {
        staticLibrary = ContentMgr.getSiteLibrary();
        if (!empty(staticLibrary) && staticLibrary.custom.CLDVideoTransformations) {
            transformations = staticLibrary.custom.CLDVideoTransformations;
        }
    } catch (ex) {
        logger.error(cloudinaryConstants.CLD_GET_VIDEO_LIBRARY_TRANSFORM_ERROR, ex);
    }

    return transformations;
};

module.exports = {
    getGlobalImageTransformation: getGlobalImageTransformation,
    getGlobalVideoTransformation: getGlobalVideoTransformation,
    getProductCatalogImageTransformation: getProductCatalogImageTransformation,
    getProductCatalogVideoTransformation: getProductCatalogVideoTransformation,
    getCategoryImageTransformation: getCategoryImageTransformation,
    getCategoryVideoTransformation: getCategoryVideoTransformation,
    getCatalogImageTransformation: getCatalogImageTransformation,
    getCatalogVideoTransformation: getCatalogVideoTransformation,
    getImageSrcset: getImageSrcset,
    getContentLibraryImageTransformation: getContentLibraryImageTransformation,
    getContentLibraryVideoTransformation: getContentLibraryVideoTransformation,
    getImageDimensions: getImageDimensions
};
