'use strict';

var assert = require('chai').assert;
var proxyquire = require('proxyquire').noCallThru().noPreserveCache();
var sinon = require('sinon');

function MockProductSearch() {
    this.category = { id: 'someID' };
    this.bannerImageUrl = 'http://slot.banner.image.url';

    return this;
}

describe('ProductSearch model', function () {
    var cloudinaryConstantsMock = require('../../../../mocks/utils/cloudinaryConstants');

    var httpParams = {};
    var apiProductSearch = {};

    var ProductSearch;

    beforeEach(function () {
        module.__proto__.superModule = MockProductSearch; // eslint-disable-line no-proto
        global.empty = sinon.stub();

        ProductSearch = proxyquire('../../../../../cartridges/int_cloudinary_sfra/cartridge/models/search/productSearch', {
            '*/cartridge/scripts/util/cloudinaryConstants': cloudinaryConstantsMock,
            '*/cartridge/scripts/api/cloudinaryApi': {
                getCatalogImageAbsURLFromRelURL: function () {
                    return 'http://some-cld-img-url';
                }
            }
        });
    });

    afterEach(function () {
        global.empty.reset();
        cloudinaryConstantsMock.CLD_ENABLED = true;
    });

    it('should get cloudinary banner image URL', function () {
        ProductSearch = new ProductSearch(apiProductSearch, httpParams, 'sorting-rule-1', [], {});
        assert.equal(ProductSearch.cldBannerImage, 'http://some-cld-img-url');
    });

    it('should not get cloudinary banner image URL when cloudinary is disabled', function () {
        cloudinaryConstantsMock.CLD_ENABLED = false;
        ProductSearch = new ProductSearch(apiProductSearch, httpParams, 'sorting-rule-1', [], {});

        assert.equal(ProductSearch.cldBannerImage, null);
    });
});
