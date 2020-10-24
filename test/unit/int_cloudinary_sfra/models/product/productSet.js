'use strict';

var assert = require('chai').assert;
var proxyquire = require('proxyquire').noCallThru().noPreserveCache();

var optionsMock = {};
var productMock = { ID: 'someID' };

describe('ProductSet Model', function () {
    var decorators = require('../../../../mocks/productDecoratorsMock');
    var cloudinaryConstantsMock = require('../../../../mocks/utils/cloudinaryConstants');

    var ProductSet;

    beforeEach(function () {
        ProductSet = proxyquire('../../../../../cartridges/int_cloudinary_sfra/cartridge/models/product/productSet', {
            '*/cartridge/models/product/decorators/index': decorators.mocks,
            '*/cartridge/scripts/util/cloudinaryConstants': cloudinaryConstantsMock
        });
    });

    afterEach(function () {
        decorators.stubs.stubCloudinary.reset();
        cloudinaryConstantsMock.CLD_ENABLED = true;
    });

    it('should call cloudinary', function () {
        var object = {};
        ProductSet = new ProductSet(object, productMock, optionsMock);

        assert.isTrue(decorators.stubs.stubCloudinary.calledOnce);
    });

    it('should not call cloudinary when cloudinary is disabled', function () {
        var object = {};
        cloudinaryConstantsMock.CLD_ENABLED = false;
        ProductSet = new ProductSet(object, productMock, optionsMock);

        assert.isFalse(decorators.stubs.stubCloudinary.calledOnce);
    });
});
