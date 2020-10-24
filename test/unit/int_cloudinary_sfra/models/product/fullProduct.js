'use strict';

var assert = require('chai').assert;
var proxyquire = require('proxyquire').noCallThru().noPreserveCache();

var optionsMock = {};
var productMock = { ID: 'someID' };

function MockProduct() {
    return this;
}

describe('FullProduct Model', function () {
    module.__proto__.superModule = MockProduct; // eslint-disable-line no-proto

    var decorators = require('../../../../mocks/productDecoratorsMock');
    var cloudinaryConstantsMock = require('../../../../mocks/utils/cloudinaryConstants');

    var FullProduct;

    beforeEach(function () {
        FullProduct = proxyquire('../../../../../cartridges/int_cloudinary_sfra/cartridge/models/product/fullProduct', {
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
        FullProduct = new FullProduct(object, productMock, optionsMock);

        assert.isTrue(decorators.stubs.stubCloudinary.calledOnce);
    });

    it('should not call cloudinary if cloudinary is disabled', function () {
        var object = {};
        cloudinaryConstantsMock.CLD_ENABLED = false;
        FullProduct = new FullProduct(object, productMock, optionsMock);

        assert.isFalse(decorators.stubs.stubCloudinary.calledOnce);
    });
});
