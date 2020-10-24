'use strict';

var assert = require('chai').assert;
var proxyquire = require('proxyquire').noCallThru().noPreserveCache();

function MockProduct() {
    return this;
}

describe('SearchVariationAttribute Model', function () {
    module.__proto__.superModule = MockProduct; // eslint-disable-line no-proto

    var collectionsMock = require('../../../../../mocks/utils/collections');
    var cloudinaryConstantsMock = require('../../../../../mocks/utils/cloudinaryConstants');

    var SearchVariationAttributes;
    var productMock;

    var searchHitMock = {
        getRepresentedVariationValues: function () {
            return [{
                ID: 'testID',
                images: {}
            }];
        }
    };

    beforeEach(function () {
        SearchVariationAttributes = proxyquire('../../../../../../cartridges/int_cloudinary_sfra/cartridge/models/product/decorators/searchVariationAttributes', {
            '*/cartridge/scripts/util/collections': collectionsMock,
            '*/cartridge/scripts/util/cloudinaryConstants': cloudinaryConstantsMock,
            'dw/web/URLUtils': {
                url: function () {
                    return 'http://product-url';
                }
            }
        });

        productMock = {
            variationAttributes: [{
                values: [{}]
            }]
        };
    });

    afterEach(function () {
        cloudinaryConstantsMock.CLD_ENABLED = true;
    });

    it('should have "id", "images" and "url" properties if swatch image is not configured in SFCC and cloudinary is enabled', function () {
        SearchVariationAttributes = new SearchVariationAttributes(productMock, searchHitMock);
        assert.deepEqual(productMock, {
            variationAttributes: [{
                values: [{
                    id: 'testID',
                    images: {},
                    url: 'http://product-url'
                }]
            }]
        });
    });

    it('should have "id", "images" and "url" properties if swatch image is configured in SFCC and cloudinary is enabled', function () {
        productMock.variationAttributes[0].values[0].id = 'testID';
        productMock.variationAttributes[0].values[0].images = {};
        productMock.variationAttributes[0].values[0].url = 'http://product-url';

        SearchVariationAttributes = new SearchVariationAttributes(productMock, searchHitMock);
        assert.deepEqual(productMock, {
            variationAttributes: [{
                values: [{
                    id: 'testID',
                    images: {},
                    url: 'http://product-url'
                }]
            }]
        });
    });

    it('should have "id", "images" and "url" properties if swatch image is configured in SFCC and cloudinary is disabled', function () {
        cloudinaryConstantsMock.CLD_ENABLED = false;
        productMock.variationAttributes[0].values[0].id = 'testID';
        productMock.variationAttributes[0].values[0].images = {};
        productMock.variationAttributes[0].values[0].url = 'http://product-url';

        SearchVariationAttributes = new SearchVariationAttributes(productMock, searchHitMock);
        assert.deepEqual(productMock, {
            variationAttributes: [{
                values: [{
                    id: 'testID',
                    images: {},
                    url: 'http://product-url'
                }]
            }]
        });
    });

    it('should not have "id", "images" and "url" properties if swatch image is not configured in SFCC and cloudinary is disabled', function () {
        cloudinaryConstantsMock.CLD_ENABLED = false;

        SearchVariationAttributes = new SearchVariationAttributes(productMock, searchHitMock);
        assert.isUndefined(productMock.variationAttributes[0].values[0].id);
        assert.isUndefined(productMock.variationAttributes[0].values[0].images);
        assert.isUndefined(productMock.variationAttributes[0].values[0].url);
    });
});
