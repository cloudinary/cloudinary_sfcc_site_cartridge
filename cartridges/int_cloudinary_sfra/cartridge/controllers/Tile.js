'use strict';

var server = require('server');
var page = module.superModule;

server.extend(page);

var cache = require('*/cartridge/scripts/middleware/cache');
var cloudinaryConstants = require('*/cartridge/scripts/util/cloudinaryConstants');

server.append('Show', cache.applyPromotionSensitiveCache, function (req, res, next) {
    var cloudinaryModel = require('*/cartridge/scripts/model/cloudinaryModel');
    var cloudinary = {};
    var pageType = req.querystring.pageType;
    var pageTypeSwatches = req.querystring.pageTypeSwatches;
    var product = res.viewData.product;
    var productPrimaryImg;

    if (cloudinaryConstants.CLD_ENABLED && product) {
        if (cloudinaryConstants.CLD_IMAGE_PAGE_TYPE_SETTINGS_OBJECT.plp.enabled) {
            productPrimaryImg = cloudinaryModel.getProductPrimaryImage(product.id, cloudinaryConstants.CLD_HIGH_RES_IMAGES_VIEW_TYPE, {
                pageType: pageType
            });

            if (!empty(productPrimaryImg)) {
                cloudinaryModel.addCloudinaryProductImage(product, productPrimaryImg);
            }

            if (!empty(productPrimaryImg.altText)) {
                cloudinary.altText = productPrimaryImg.altText;
            }
            cloudinary.isEnabled = cloudinaryConstants.CLD_ENABLED;
            cloudinary.galleryEnabled = cloudinaryConstants.CLD_GALLERY_ENABLED;
            cloudinary.cloudName = cloudinaryConstants.CLD_CLOUDNAME;
            cloudinary.videoEnabled = product.CLDVideoEnabled;
            cloudinary.videoPlayerEnabled = product.CLDVideoPlayerEnabled;
            res.setViewData({ cloudinary: cloudinary });
        }

        // add cloudinary swatch images
        if (cloudinaryConstants.CLD_ENABLE_SWATCH_ON_PLP && cloudinaryConstants.CLD_IMAGE_PAGE_TYPE_SETTINGS_OBJECT.cldPlpSwatch.enabled) {
            cloudinaryModel.addCloudinaryProductSwatchImage(product, pageTypeSwatches);
            cloudinary.isEnabled = cloudinaryConstants.CLD_ENABLED;
            cloudinary.cloudName = cloudinaryConstants.CLD_CLOUDNAME;
            res.setViewData({ cloudinary: cloudinary });
        }
    }

    next();
});

module.exports = server.exports();
