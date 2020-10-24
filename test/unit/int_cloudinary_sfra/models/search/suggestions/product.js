'use strict';

var assert = require('chai').assert;
var sinon = require('sinon');
var proxyquire = require('proxyquire').noCallThru().noPreserveCache();

function MockProduct() {
    return this;
}

describe('Productsuggestions Model', function () {
    module.__proto__.superModule = MockProduct; // eslint-disable-line no-proto

    var cloudinaryConstantsMock = require('../../../../../mocks/utils/cloudinaryConstants');

    var nextProductStub = sinon.stub();
    var urlStub = sinon.stub();

    var variationModel = {
        defaultVariant: {
            getImage: function () {
                return {
                    URL: {
                        toString: function () { return 'image url'; }
                    }
                };
            }
        }
    };

    var product1 = {
        productSearchHit: {
            product: {
                name: 'Content 1',
                ID: 1,
                master: true,
                variationModel: variationModel
            }
        }
    };

    var suggestionsMock = {
        productSuggestions: {
            suggestedProducts: {
                hasNext: function () { return true; },
                next: nextProductStub
            }
        }
    };

    urlStub.onCall(0).returns('url1');
    nextProductStub.onCall(0).returns(product1);

    var ProductSuggestions;

    beforeEach(function () {
        ProductSuggestions = proxyquire('../../../../../../cartridges/int_cloudinary_sfra/cartridge/models/search/suggestions/product.js', {
            '*/cartridge/scripts/model/cloudinaryModel': {
                getProductPrimaryImage: function () {
                    return 'http://some-cld-url';
                }
            },
            '*/cartridge/scripts/util/cloudinaryConstants': cloudinaryConstantsMock,
            'dw/web/URLUtils': { url: urlStub }
        });
    });

    afterEach(function () {
        cloudinaryConstantsMock.CLD_ENABLED = true;
    });

    it('should get cloudinary image', function () {
        ProductSuggestions = new ProductSuggestions(suggestionsMock, 1);
        assert.deepEqual(ProductSuggestions.products[0].cloudinaryProductImage, 'http://some-cld-url');
    });

    it('should not get cloudinary image if cloudinary is disabled', function () {
        cloudinaryConstantsMock.CLD_ENABLED = false;
        ProductSuggestions = new ProductSuggestions(suggestionsMock, 1);
        assert.equal(ProductSuggestions.products, null);
    });
});
