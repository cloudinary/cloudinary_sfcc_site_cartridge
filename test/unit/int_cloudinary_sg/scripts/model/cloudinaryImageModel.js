'use strict';

var assert = require('chai').assert;
var proxyquire = require('proxyquire').noCallThru().noPreserveCache();

var imageModelMock = {
    alt: 'image-alt-text',
    title: 'image-title-text',
    srcset: 'image-srcset',
    sizes: 'image-sizes',
    isResponsive: true,
    displayValue: 'image-display-value',
    value: 'swatch-attr-value',
    url: 'image-url'
};

describe('CloudinaryImage Model', function () {
    var CloudinaryImageModel;

    before(function () {
        CloudinaryImageModel = proxyquire('../../../../../cartridges/int_cloudinary_sg/cartridge/scripts/model/cloudinaryImageModel', {});
    });

    it('should have all attributes which are passed', function () {
        CloudinaryImageModel = new CloudinaryImageModel(imageModelMock);

        assert.equal(imageModelMock.alt, CloudinaryImageModel.alt);
        assert.equal(imageModelMock.title, CloudinaryImageModel.title);
        assert.equal(imageModelMock.srcset, CloudinaryImageModel.srcset);
        assert.equal(imageModelMock.sizes, CloudinaryImageModel.sizes);
        assert.equal(imageModelMock.isResponsive, CloudinaryImageModel.isResponsive);
        assert.equal(imageModelMock.displayValue, CloudinaryImageModel.displayValue);
        assert.equal(imageModelMock.value, CloudinaryImageModel.value);
        assert.equal(imageModelMock.url, CloudinaryImageModel.getURL());
    });
});
