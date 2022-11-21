'use strict';

var server = require('server');
var page = module.superModule;

server.extend(page);

var csrfProtection = require('*/cartridge/scripts/middleware/csrf');
var consentTracking = require('*/cartridge/scripts/middleware/consentTracking');

var cloudinaryModel = require('*/cartridge/scripts/model/cloudinaryModel');
var cloudinaryConstants = require('*/cartridge/scripts/util/cloudinaryConstants');

// Main entry point for Checkout
server.append(
    'Begin',
    server.middleware.https,
    consentTracking.consent,
    csrfProtection.generateToken,
    function (req, res, next) {
        var cloudinary = {};
        var orderModel = res.viewData.order;
        var shippings = [];
        var shippingLineItems = [];
        var productLineItemPrimaryImg;

        if (cloudinaryConstants.CLD_ENABLED && orderModel && orderModel.shipping && orderModel.shipping && orderModel.shipping.length > 0) {
            if (cloudinaryConstants.CLD_IMAGE_PAGE_TYPE_SETTINGS_OBJECT.checkout.enabled) {
                shippings = orderModel.shipping;

                shippings.forEach(function (shipping, i) {
                    shippingLineItems = shipping.productLineItems.items;

                    var lineItem;
                    var bundledLineItem;
                    shippingLineItems.forEach(function (li, j) {
                        lineItem = li;
                        if (lineItem.productType === 'bundle') {
                            lineItem.bundledProductLineItems.forEach(function (bli, idx) {
                                bundledLineItem = bli;
                                productLineItemPrimaryImg = cloudinaryModel.getProductPrimaryImage(bundledLineItem.id, cloudinaryConstants.CLD_HIGH_RES_IMAGES_VIEW_TYPE, {
                                    pageType: cloudinaryConstants.PAGE_TYPES.CHECKOUT
                                });

                                if (bundledLineItem.images && productLineItemPrimaryImg) {
                                    bundledLineItem = cloudinaryModel.addCloudinaryProductImage(bundledLineItem, productLineItemPrimaryImg);
                                    lineItem.bundledProductLineItems[idx] = bundledLineItem;
                                }
                            });
                        } else {
                            productLineItemPrimaryImg = cloudinaryModel.getProductPrimaryImage(lineItem.id, cloudinaryConstants.CLD_HIGH_RES_IMAGES_VIEW_TYPE, {
                                pageType: cloudinaryConstants.PAGE_TYPES.CHECKOUT
                            });

                            if (!empty(productLineItemPrimaryImg)) {
                                lineItem = cloudinaryModel.addCloudinaryProductImage(lineItem, productLineItemPrimaryImg);
                            }
                        }
                        // overwite line items
                        shippingLineItems[j] = lineItem;
                    });

                    shippings[i].productLineItems.items = shippingLineItems;
                });

                orderModel.shipping = shippings;
            }
        }

        cloudinary.isEnabled = cloudinaryConstants.CLD_ENABLED;

        res.setViewData({
            order: orderModel,
            cloudinary: cloudinary
        });

        return next();
    }
);


module.exports = server.exports();
