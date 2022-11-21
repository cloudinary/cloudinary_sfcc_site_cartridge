'use strict';

var server = require('server');
var page = module.superModule;

server.extend(page);

var csrfProtection = require('*/cartridge/scripts/middleware/csrf');
var consentTracking = require('*/cartridge/scripts/middleware/consentTracking');

var cloudinaryModel = require('*/cartridge/scripts/model/cloudinaryModel');
var cloudinaryConstants = require('*/cartridge/scripts/util/cloudinaryConstants');

server.append(
    'Show',
    server.middleware.https,
    consentTracking.consent,
    csrfProtection.generateToken,
    function (req, res, next) {
        var cloudinary = {};
        var lineItems = res.viewData.items;
        var productLineItemPrimaryImg;

        if (cloudinaryConstants.CLD_ENABLED && lineItems && lineItems.length > 0) {
            if (cloudinaryConstants.CLD_IMAGE_PAGE_TYPE_SETTINGS_OBJECT.cart.enabled) {
                var lineItem;
                var bundledLineItem;
                lineItems.forEach(function (li, index) {
                    lineItem = li;
                    if (lineItem.productType === 'bundle') {
                        lineItem.bundledProductLineItems.forEach(function (bli, idx) {
                            bundledLineItem = bli;
                            productLineItemPrimaryImg = cloudinaryModel.getProductPrimaryImage(bundledLineItem.id, cloudinaryConstants.CLD_HIGH_RES_IMAGES_VIEW_TYPE, {
                                pageType: cloudinaryConstants.PAGE_TYPES.CART });

                            if (bundledLineItem.images && productLineItemPrimaryImg) {
                                bundledLineItem = cloudinaryModel.addCloudinaryProductImage(bundledLineItem, productLineItemPrimaryImg);
                                lineItem.bundledProductLineItems[idx] = bundledLineItem;
                            }
                        });
                    } else {
                        productLineItemPrimaryImg = cloudinaryModel.getProductPrimaryImage(lineItem.id, cloudinaryConstants.CLD_HIGH_RES_IMAGES_VIEW_TYPE, {
                            pageType: cloudinaryConstants.PAGE_TYPES.CART
                        });

                        if (!empty(productLineItemPrimaryImg)) {
                            lineItem = cloudinaryModel.addCloudinaryProductImage(lineItem, productLineItemPrimaryImg);
                        }
                    }
                    // overwite line item object
                    lineItems[index] = lineItem;
                });
            }
        }

        cloudinary.isEnabled = cloudinaryConstants.CLD_ENABLED;

        res.setViewData({
            items: lineItems,
            cloudinary: cloudinary
        });

        next();
    });

server.append('MiniCartShow', function (req, res, next) {
    var cloudinary = {};
    var lineItems = res.viewData.items;
    var productLineItemPrimaryImg;

    if (cloudinaryConstants.CLD_ENABLED && lineItems && lineItems.length > 0) {
        if (cloudinaryConstants.CLD_IMAGE_PAGE_TYPE_SETTINGS_OBJECT.miniCart.enabled) {
            var lineItem;
            var bundledLineItem;
            lineItems.forEach(function (li, index) {
                lineItem = li;
                if (lineItem.productType === 'bundle') {
                    lineItem.bundledProductLineItems.forEach(function (bli, idx) {
                        bundledLineItem = bli;
                        productLineItemPrimaryImg = cloudinaryModel.getProductPrimaryImage(bundledLineItem.id, cloudinaryConstants.CLD_HIGH_RES_IMAGES_VIEW_TYPE, {
                            pageType: cloudinaryConstants.PAGE_TYPES.MINI_CART });

                        if (bundledLineItem.images && productLineItemPrimaryImg) {
                            bundledLineItem = cloudinaryModel.addCloudinaryProductImage(bundledLineItem, productLineItemPrimaryImg);
                            lineItem.bundledProductLineItems[idx] = bundledLineItem;
                        }
                    });
                } else {
                    productLineItemPrimaryImg = cloudinaryModel.getProductPrimaryImage(lineItem.id, cloudinaryConstants.CLD_HIGH_RES_IMAGES_VIEW_TYPE, {
                        pageType: cloudinaryConstants.PAGE_TYPES.MINI_CART
                    });

                    if (!empty(productLineItemPrimaryImg)) {
                        lineItem = cloudinaryModel.addCloudinaryProductImage(lineItem, productLineItemPrimaryImg);
                    }
                }
                // overwite line item object
                lineItems[index] = lineItem;
            });
        }
    }

    cloudinary.isEnabled = cloudinaryConstants.CLD_ENABLED;

    res.setViewData({
        items: lineItems,
        cloudinary: cloudinary
    });

    next();
});

module.exports = server.exports();
