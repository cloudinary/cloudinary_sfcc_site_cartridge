'use strict';

var assert = require('chai').assert;
var proxyquire = require('proxyquire').noCallThru().noPreserveCache();

var optionsMock = {};
var productMock = { ID: 'someID' };

describe('ProductBundle Model', function () {
    var decorators = require('../../../../mocks/productDecoratorsMock');
    var cloudinaryConstantsMock = require('../../../../mocks/utils/cloudinaryConstants');

    var ProductBundle;

    beforeEach(function () {
        ProductBundle = proxyquire('../../../../../cartridges/int_cloudinary_sfra/cartridge/models/product/productBundle', {
            '*/cartridge/models/product/decorators/index': decorators.mocks,
            '*/cartridge/scripts/util/cloudinaryConstants': cloudinaryConstantsMock
        });
    });

    afterEach(function () {
        cloudinaryConstantsMock.CLD_ENABLED = true;
        decorators.stubs.stubCloudinary.reset();
    });

    it('should call cloudinary', function () {
        var object = {};
        ProductBundle = new ProductBundle(object, productMock, optionsMock);

        assert.isTrue(decorators.stubs.stubCloudinary.calledOnce);
    });

    it('should not call cloudinary if cloudinary is disabled', function () {
        var object = {};
        cloudinaryConstantsMock.CLD_ENABLED = false;
        ProductBundle = new ProductBundle(object, productMock, optionsMock);

        assert.isFalse(decorators.stubs.stubCloudinary.calledOnce);
    });
});
