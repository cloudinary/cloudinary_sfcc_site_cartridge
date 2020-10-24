'use strict';

var proxyquire = require('proxyquire').noCallThru().noPreserveCache();
var sinon = require('sinon');

var stubCloudinary = sinon.stub();
var stubRaw = sinon.stub();

function MockProductDecorator() {
    return this;
}

function proxyModel() {
    module.__proto__.superModule = MockProductDecorator; // eslint-disable-line no-proto

    var stubs = {
        stubCloudinary: stubCloudinary,
        stubRaw: stubRaw
    };

    var mocks = proxyquire('../../cartridges/int_cloudinary_sfra/cartridge/models/product/decorators/index', {
        '*/cartridge/models/product/decorators/cloudinary': stubCloudinary
    });

    mocks.raw = stubRaw;

    return {
        mocks: mocks,
        stubs: stubs
    };
}

module.exports = proxyModel();
