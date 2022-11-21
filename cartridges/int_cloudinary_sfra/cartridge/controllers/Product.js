'use strict';

var server = require('server');
var page = module.superModule;

server.extend(page);

var cache = require('*/cartridge/scripts/middleware/cache');
var consentTracking = require('*/cartridge/scripts/middleware/consentTracking');
var cloudinaryConstants = require('*/cartridge/scripts/util/cloudinaryConstants');
var cloudinaryModel = require('*/cartridge/scripts/model/cloudinaryModel');
var cloudinaryHelper = require('*/cartridge/scripts/helpers/cloudinaryHelpers');
var pageMetaData = require('*/cartridge/scripts/middleware/pageMetaData');

/**
 * @typedef ProductDetailPageResourceMap
 * @type Object
 * @property {String} global_availability - Localized string for "Availability"
 * @property {String} label_instock - Localized string for "In Stock"
 * @property {String} global_availability - Localized string for "This item is currently not
 *     available"
 * @property {String} info_selectforstock - Localized string for "Select Styles for Availability"
 */

server.append('Show', cache.applyPromotionSensitiveCache, consentTracking.consent, function (req, res, next) {
    var cloudinary = {};
    var colorAttrValueID;
    var viewData = res.getViewData();
    var product = viewData.product;
    var params = req.querystring;

    // Build cloudinary object
    if (cloudinaryConstants.CLD_ENABLED && product) {
        if (cloudinaryConstants.CLD_IMAGE_PAGE_TYPE_SETTINGS_OBJECT.pdp.enabled) {
            if (product.productType === 'set' || product.productType === 'bundle') {
                product = cloudinaryModel.addCloudinaryImagesToSetAndBundles(product);

                if (product.raw && product.raw.variant) {
                    colorAttrValueID = cloudinaryHelper.fetchVariationAttrValueId(product.id, cloudinaryConstants.COLOR_ATTR);
                }

                if (product.CLDVideoEnabled) {
                    cloudinary.video = cloudinaryModel.getCloudinaryVideo(product.id, req.locale.id);
                }

                cloudinary.images = cloudinaryModel.getCloudinaryImages(product.id, {
                    pageType: cloudinaryConstants.PAGE_TYPES.PDP,
                    variationAttrValueID: colorAttrValueID
                });
            } else {
                // fetch color attr value ID
                if (params && params.variables && params.variables.color && params.variables.color.value) {
                    colorAttrValueID = params.variables.color.value;
                } else {
                    colorAttrValueID = cloudinaryHelper.fetchVariationAttrValueId(product.id, cloudinaryConstants.COLOR_ATTR);
                }

                if (product.CLDVideoEnabled) {
                    cloudinary.video = cloudinaryModel.getCloudinaryVideo(product.id, req.locale.id);
                }

                cloudinary.images = cloudinaryModel.getCloudinaryImages(product.id, {
                    pageType: cloudinaryConstants.PAGE_TYPES.PDP,
                    variationAttrValueID: colorAttrValueID
                });
            }

            cloudinary.isEnabled = cloudinaryConstants.CLD_ENABLED;
            cloudinary.galleryEnabled = cloudinaryConstants.CLD_GALLERY_ENABLED;
            cloudinary.cloudName = cloudinaryConstants.CLD_CLOUDNAME;
            cloudinary.videoEnabled = product.CLDVideoEnabled;
            cloudinary.videoPlayerEnabled = product.CLDVideoPlayerEnabled;
            cloudinary.pdp = cloudinaryConstants.CLD_IMAGE_PAGE_TYPE_SETTINGS_OBJECT.pdp.enabled;
            res.setViewData({ cloudinary: cloudinary, product: product });
        }

        if (cloudinaryConstants.CLD_IMAGE_PAGE_TYPE_SETTINGS_OBJECT.cldPdpSwatch.enabled) {
            // add cloudinary swatch images
            cloudinaryModel.addCloudinaryProductSwatchImage(product, cloudinaryConstants.PAGE_TYPES.CLD_PDP_SWATCH);
            cloudinary.isEnabled = cloudinaryConstants.CLD_ENABLED;
            cloudinary.cloudName = cloudinaryConstants.CLD_CLOUDNAME;
            cloudinary.pdpSwatch = cloudinaryConstants.CLD_IMAGE_PAGE_TYPE_SETTINGS_OBJECT.cldPdpSwatch.enabled;
            res.setViewData({ cloudinary: cloudinary, product: product });
        }
    }

    next();
}, pageMetaData.computedPageMetaData);

server.append('Variation', function (req, res, next) {
    var cloudinary = {};
    var cldAssets;
    var colorAttrValueID;
    var params = req.querystring;
    var viewData = res.getViewData();
    var product = viewData.product;

    if (cloudinaryConstants.CLD_ENABLED && product) {
        // fetch color attr value ID
        if (params && params.variables && params.variables.color && params.variables.color.value) {
            colorAttrValueID = params.variables.color.value;
        }

        cldAssets = cloudinaryModel.getCloudinaryImages(product.id, {
            pageType: cloudinaryConstants.PAGE_TYPES.PDP,
            variationAttrValueID: colorAttrValueID
        });

        if (!cloudinaryConstants.CLD_GALLERY_ENABLED) {
            product = cloudinaryModel.updateProductCarouselImages(cldAssets, product);
        }

        if (cldAssets && cldAssets.galleryWidget && cldAssets.galleryWidget.options &&
            cldAssets.galleryWidget.options.mediaAssets) {
            cloudinary.galleryWidget = cldAssets.galleryWidget;
            var cloudinaryPGWContainerSuffix = params.cloudinaryPGWContainerSuffix;

            var containerSuffix = product.raw.variant ? (product.raw.masterProduct.ID + '-' + product.raw.ID) : product.raw.ID;
            cloudinaryPGWContainerSuffix = !empty(cloudinaryPGWContainerSuffix) ? cloudinaryPGWContainerSuffix : containerSuffix;
            cloudinary.cloudinaryPGWContainerSuffix = cloudinaryPGWContainerSuffix;

            if (!empty(params.isBundleOrSet) && JSON.parse(params.isBundleOrSet)) {
                product = cloudinaryModel.updateProductVariationAttrUrl(product, cloudinaryPGWContainerSuffix);
                cloudinary.galleryWidget.options.container = cldAssets.galleryWidget.options.container + cloudinaryConstants.HYPHEN + cloudinaryPGWContainerSuffix;
            }
        }

        cloudinary.isCLDEnabled = cloudinaryConstants.CLD_ENABLED;
        cloudinary.isGalleryEnabled = cloudinaryConstants.CLD_GALLERY_ENABLED;
    }

    res.setViewData({ cloudinary: cloudinary });
    next();
});

server.append('ShowQuickView', cache.applyPromotionSensitiveCache, function (req, res, next) {
    var cloudinary;
    var viewData = res.getViewData();
    var product = viewData.product;

    cloudinary = viewData.cloudinary || {};

    if (cloudinaryConstants.CLD_ENABLED && product) {
        if (cloudinaryConstants.CLD_IMAGE_PAGE_TYPE_SETTINGS_OBJECT.quickview.enabled) {
            if (product.productType === 'set' || product.productType === 'bundle') {
                product = cloudinaryModel.addCloudinaryImagesToSetAndBundles(product);
                cloudinary.isSetBundle = true;
                res.setViewData({ product: product });
            } else {
                cloudinary.images = cloudinaryModel.getCloudinaryImages(product.id, {
                    pageType: cloudinaryConstants.PAGE_TYPES.QUICK_VIEW
                });
                // add cloudinary swatch images
                cloudinaryModel.addCloudinaryProductSwatchImage(product, cloudinaryConstants.PAGE_TYPES.CLD_PDP_SWATCH);
            }
        }
    }

    cloudinary.isEnabled = cloudinaryConstants.CLD_ENABLED;
    cloudinary.quickViewEnabled = cloudinaryConstants.CLD_IMAGE_PAGE_TYPE_SETTINGS_OBJECT.quickview.enabled;
    cloudinary.galleryEnabled = cloudinaryConstants.CLD_GALLERY_ENABLED;
    cloudinary.cloudName = cloudinaryConstants.CLD_CLOUDNAME;

    res.setViewData({ cloudinary: cloudinary });

    next();
});

module.exports = server.exports();
