'use strict';

var URLUtils = require('dw/web/URLUtils');

var collections = require('*/cartridge/scripts/util/collections');
var cloudinaryConstants = require('*/cartridge/scripts/util/cloudinaryConstants');

var ATTRIBUTE_NAME = 'color';
var seachVariationAttributesBase = module.superModule;

module.exports = function (object, hit) {
    seachVariationAttributesBase = seachVariationAttributesBase.call(this, object, hit);
    var colors = hit.getRepresentedVariationValues(ATTRIBUTE_NAME);

    if (cloudinaryConstants.CLD_ENABLED && object.variationAttributes[0] && object.variationAttributes[0].values[0] &&
        'id' in object.variationAttributes[0].values[0] === false) {
        Object.defineProperty(object.variationAttributes[0], 'values', {
            enumerable: true,
            value: collections.map(colors, function (color) {
                return {
                    id: color.ID,
                    images: {},
                    url: URLUtils.url(
                        'Product-Show',
                        'pid',
                        hit.productID,
                        'dwvar_' + hit.productID + '_color',
                        color.value
                    ).toString()
                };
            })
        });
    }
};
