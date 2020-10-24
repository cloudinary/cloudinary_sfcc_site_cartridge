'use strict';

var decorators = require('*/cartridge/models/product/decorators/index');
var cloudinaryConstants = require('*/cartridge/scripts/util/cloudinaryConstants');

var baseProductTile = module.superModule;

/**
 * Decorate product with product tile information
 * @param {Object} product - Product Model to be decorated
 * @param {dw.catalog.Product} apiProduct - Product information returned by the script API
 * @param {string} productType - Product type information
 *
 * @returns {Object} - Decorated product model
 */
module.exports = function productTile(product, apiProduct, productType) {
    baseProductTile.call(this, product, apiProduct, productType);

    if (cloudinaryConstants.CLD_ENABLED) {
        decorators.cloudinary(product, apiProduct);
        decorators.raw(product, apiProduct);
    }

    return product;
};
