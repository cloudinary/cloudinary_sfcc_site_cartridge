'use strict';

var assert = require('chai').assert;
var proxyquire = require('proxyquire').noCallThru().noPreserveCache();

var productMock = { ID: 'someID' };

describe('ProductTile Model', function () {
    var decorators = require('../../../../mocks/productDecoratorsMock');
    var cloudinaryConstantsMock = require('../../../../mocks/utils/cloudinaryConstants');

    var ProductTile;

    beforeEach(function () {
        ProductTile = proxyquire('../../../../../cartridges/int_cloudinary_sfra/cartridge/models/product/productTile', {
            '*/cartridge/models/product/decorators/index': decorators.mocks,
            '*/cartridge/scripts/util/cloudinaryConstants': cloudinaryConstantsMock
        });
    });

    afterEach(function () {
        decorators.stubs.stubCloudinary.reset();
        decorators.stubs.stubRaw.reset();
        cloudinaryConstantsMock.CLD_ENABLED = true;
    });

    it('should call cloudinary', function () {
        var object = {};
        ProductTile = new ProductTile(object, productMock);

        assert.isTrue(decorators.stubs.stubCloudinary.calledOnce);
    });

    it('should not call cloudinary when cloudinary is disabled', function () {
        cloudinaryConstantsMock.CLD_ENABLED = false;
        var object = {};
        ProductTile = new ProductTile(object, productMock);

        assert.isFalse(decorators.stubs.stubCloudinary.calledOnce);
    });

    it('should call raw', function () {
        var object = {};
        ProductTile = new ProductTile(object, productMock);

        assert.isTrue(decorators.stubs.stubRaw.calledOnce);
    });

    it('should not call raw when cloudinary is disabled', function () {
        cloudinaryConstantsMock.CLD_ENABLED = false;
        var object = {};
        ProductTile = new ProductTile(object, productMock);

        assert.isFalse(decorators.stubs.stubRaw.calledOnce);
    });
});
