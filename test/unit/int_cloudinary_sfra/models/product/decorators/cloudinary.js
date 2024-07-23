'use strict';

var assert = require('chai').assert;
var proxyquire = require('proxyquire').noCallThru().noPreserveCache();

var cloudinaryHelpersMock = require('../../../../../mocks/helpers/cloudinaryHelpers');
var cloudinaryConstantsMock = require('../../../../../mocks/utils/cloudinaryConstants');

var productMock = {
    ID: 'someID',
    custom: {
        CLDVideoEnabled: true,
        CLDVideoPlayerEnabled: true,
        CLDVideoOptions: {
            mute: false,
            loop: true
        },
        CLDImageTransformations: 'someImgTransformations',
        CLDVideoTransformations: 'someVideoTransformations',
        CLDGalleryStyles: {
            container: 'someContianer',
            carouselStyle: 'thumbnails'
        }
    }
};

describe('product cloudinary decorator', function () {
    var cloudinary;

    beforeEach(function () {
        cloudinary = proxyquire('../../../../../../cartridges/int_cloudinary_sfra/cartridge/models/product/decorators/cloudinary', {
            '*/cartridge/scripts/helpers/cloudinaryHelpers': cloudinaryHelpersMock,
            '*/cartridge/scripts/util/cloudinaryConstants': cloudinaryConstantsMock
        });
    });

    afterEach(function () {
        cloudinaryConstantsMock.CLD_ENABLED = true;
    });

    it('should have property to say cloudinary is enabled', function () {
        var object = {};
        cloudinary(object, productMock);

        assert.isTrue(object.CLDEnabled);
    });

    it('should have property to say cloudinary is disabled', function () {
        var object = {};
        cloudinaryConstantsMock.CLD_ENABLED = false;

        cloudinary(object, productMock);

        assert.isFalse(object.CLDEnabled);
    });

    it('should have property to say cloudinary video is enabled', function () {
        var object = {};
        cloudinary(object, productMock);

        assert.isTrue(object.CLDVideoEnabled);
    });

    it('should have property to say cloudinary video is disabled', function () {
        var object = {};
        productMock.custom.CLDVideoEnabled = false;

        cloudinary(object, productMock);

        assert.isFalse(object.CLDVideoEnabled);
    });

    it('should have property to say cloudinary video player is enabled', function () {
        var object = {};
        cloudinary(object, productMock);

        assert.isTrue(object.CLDVideoPlayerEnabled);
    });

    it('should have property to say cloudinary video player is disabled', function () {
        var object = {};
        productMock.custom.CLDVideoPlayerEnabled = false;

        cloudinary(object, productMock);

        assert.isFalse(object.CLDVideoPlayerEnabled);
    });

    it('should have property to hold cloudinary video player options', function () {
        var object = {};
        cloudinary(object, productMock);

        assert.deepEqual(object.CLDVideoPlayerOptions, productMock.custom.CLDVideoOptions);
    });

    it('should have property to hold empty cloudinary video player options', function () {
        var object = {};
        productMock.custom.CLDVideoOptions = '';

        cloudinary(object, productMock);

        assert.equal(object.CLDVideoPlayerOptions, '');
    });

    it('should have property to hold product tag name and equal to product ID', function () {
        var object = {};
        cloudinary(object, productMock);

        assert.equal(object.CLDTagName, productMock.ID);
    });

    it('should have property to hold empty product tag name', function () {
        var object = {};
        productMock.ID = '';

        cloudinary(object, productMock);

        assert.equal(object.CLDTagName, '');
    });

    it('should have property to hold image transformations', function () {
        var object = {};
        cloudinary(object, productMock);

        assert.equal(object.CLDImageTransformations, productMock.custom.CLDImageTransformations);
    });

    it('should have property to hold empty image transformations', function () {
        var object = {};
        productMock.custom.CLDImageTransformations = '';

        cloudinary(object, productMock);

        assert.equal(object.CLDImageTransformations, productMock.custom.CLDImageTransformations);
    });

    it('should have property to hold video transformations', function () {
        var object = {};

        cloudinary(object, productMock);

        assert.equal(object.CLDVideoTransformations, productMock.custom.CLDVideoTransformations);
    });

    it('should have property to hold empty video transformations', function () {
        var object = {};
        productMock.custom.CLDVideoTransformations = '';

        cloudinary(object, productMock);

        assert.equal(object.CLDVideoTransformations, productMock.custom.CLDVideoTransformations);
    });

    it('should have property to hold gallery styles', function () {
        var object = {};
        cloudinary(object, productMock);

        assert.deepEqual(object.CLDGalleryStyles, productMock.custom.CLDGalleryStyles);
    });

    it('should have property to hold empty gallery styles', function () {
        var object = {};
        productMock.custom.CLDGalleryStyles = '';

        cloudinary(object, productMock);

        assert.deepEqual(object.CLDGalleryStyles, productMock.custom.CLDGalleryStyles);
    });
});
