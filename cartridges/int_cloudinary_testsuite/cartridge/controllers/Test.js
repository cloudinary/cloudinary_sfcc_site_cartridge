'use strict';

var ISML = require('dw/template/ISML');

var cloudinaryModel = require('*/cartridge/scripts/model/cloudinaryModel');
var cloudinaryConstants = require('*/cartridge/scripts/util/cloudinaryConstants');
var cloudinaryHelper = require('*/cartridge/scripts/helpers/cloudinaryHelpers');
var cloudinaryApi = require('*/cartridge/scripts/api/cloudinaryApi');

var TestHarness = {};

TestHarness.ContentImageRel = function () {
    ISML.renderTemplate('test/cotentImageRel', {
        cartridgeVersion: cloudinaryConstants.SITE_VERSION_FOR_TEST_SUITE
    });
};

TestHarness.ContentImageAbs = function () {
    ISML.renderTemplate('test/cotentImageAbs', {
        cartridgeVersion: cloudinaryConstants.SITE_VERSION_FOR_TEST_SUITE
    });
};

TestHarness.ContentVideoRel = function () {
    ISML.renderTemplate('test/contentVideoRel', {
        cartridgeVersion: cloudinaryConstants.SITE_VERSION_FOR_TEST_SUITE
    });
};

TestHarness.ContentVideoAbs = function () {
    ISML.renderTemplate('test/contentVideoAbs', {
        cartridgeVersion: cloudinaryConstants.SITE_VERSION_FOR_TEST_SUITE
    });
};

TestHarness.CatalogImage = function () {
    ISML.renderTemplate('test/catalogImage', {
        cartridgeVersion: cloudinaryConstants.SITE_VERSION_FOR_TEST_SUITE
    });
};

TestHarness.CatalogVideo = function () {
    ISML.renderTemplate('test/catalogVideo', {
        cartridgeVersion: cloudinaryConstants.SITE_VERSION_FOR_TEST_SUITE
    });
};

TestHarness.ContentImageRelSubmit = function () {
    var cloudinary = {};
    var params = request.httpParameterMap;
    // Build cloudinary object
    if (cloudinaryConstants.CLD_ENABLED) {
        cloudinary.image = cloudinaryModel.geContentImageURLByName(params.relURL.stringValue, params.pageType.stringValue);
    }
    ISML.renderTemplate('test/cotentImageRel', {
        cloudinary: cloudinary,
        cartridgeVersion: cloudinaryConstants.SITE_VERSION_FOR_TEST_SUITE
    });
};

TestHarness.ContentImageAbsSubmit = function () {
    var cloudinary = {};
    var params = request.httpParameterMap;
    // Build cloudinary object
    if (cloudinaryConstants.CLD_ENABLED) {
        cloudinary.image = cloudinaryModel.geContentImageURLByURL(params.absURL.stringValue, params.pageType.stringValue);
    }
    ISML.renderTemplate('test/cotentImageAbs', {
        cloudinary: cloudinary,
        cartridgeVersion: cloudinaryConstants.SITE_VERSION_FOR_TEST_SUITE
    });
};

TestHarness.ContentVideoRelSubmit = function () {
    var cloudinary = {};
    var params = request.httpParameterMap;
    // Build cloudinary object
    if (cloudinaryConstants.CLD_ENABLED) {
        cloudinary.video = cloudinaryModel.geContentVideoByName(params.relURL.stringValue);
    }
    ISML.renderTemplate('test/contentVideoRel', {
        cloudinary: cloudinary,
        cartridgeVersion: cloudinaryConstants.SITE_VERSION_FOR_TEST_SUITE
    });
};

TestHarness.ContentVideoAbsSubmit = function () {
    var cloudinary = {};
    var params = request.httpParameterMap;
    // Build cloudinary object
    if (cloudinaryConstants.CLD_ENABLED) {
        cloudinary.video = cloudinaryModel.geContentVideoByURL(params.absURL.stringValue);
    }
    ISML.renderTemplate('test/contentVideoAbs', {
        cloudinary: cloudinary,
        cartridgeVersion: cloudinaryConstants.SITE_VERSION_FOR_TEST_SUITE
    });
};


TestHarness.CatalogImageSubmit = function () {
    var URLUtils = require('dw/web/URLUtils');
    var catalogMgr = require('dw/catalog/CatalogMgr');

    var cloudinary = {};
    var params = request.httpParameterMap;
    var relURL = params.relURL.stringValue;
    // Build cloudinary object
    if (cloudinaryConstants.CLD_ENABLED) {
        if (cloudinaryConstants.CLD_CARTRIDGE_CONTENT_OPERATION_MODE === cloudinaryConstants.CLD_GET_ASSETS_BY_AUTO_UPLOAD_MODE) {
            var absURL = URLUtils.absStatic(URLUtils.CONTEXT_CATALOG, catalogMgr.getSiteCatalog().ID, relURL);
            relURL = absURL.relative();
        }
        cloudinary.image = cloudinaryApi.getCatalogImageAbsURLFromRelURL(relURL, params.categoryId.stringValue,
            params.pageType.stringValue);
    }

    ISML.renderTemplate('test/catalogImage', {
        cloudinary: cloudinary,
        cartridgeVersion: cloudinaryConstants.SITE_VERSION_FOR_TEST_SUITE
    });
};

TestHarness.CatalogVideoSubmit = function () {
    var URLUtils = require('dw/web/URLUtils');
    var catalogMgr = require('dw/catalog/CatalogMgr');

    var cloudinary = {};
    var params = request.httpParameterMap;
    var relURL = params.relURL.stringValue;
    // Build cloudinary object
    if (cloudinaryConstants.CLD_ENABLED) {
        if (cloudinaryConstants.CLD_CARTRIDGE_CONTENT_OPERATION_MODE === cloudinaryConstants.CLD_GET_ASSETS_BY_AUTO_UPLOAD_MODE) {
            var absURL = URLUtils.absStatic(URLUtils.CONTEXT_CATALOG, catalogMgr.getSiteCatalog().ID, relURL);
            relURL = absURL.relative();
        }
        cloudinary.image = cloudinaryApi.getCatalogVideoAbsURLFromRelURL(relURL, params.categoryId.stringValue);
    }

    ISML.renderTemplate('test/catalogVideo', {
        cloudinary: cloudinary,
        cartridgeVersion: cloudinaryConstants.SITE_VERSION_FOR_TEST_SUITE
    });
};

TestHarness.Image = function () {
    ISML.renderTemplate('test/image', {
        cartridgeVersion: cloudinaryConstants.SITE_VERSION_FOR_TEST_SUITE
    });
};

TestHarness.ImageSubmit = function () {
    var cloudinary = {};
    var params = request.httpParameterMap;
    var variationAttrValueID;
    // Build cloudinary object
    if (cloudinaryConstants.CLD_ENABLED) {
        if (params.pageType.stringValue.equalsIgnoreCase(cloudinaryConstants.PAGE_TYPES.PLP)) {
            cloudinary.image = cloudinaryModel.getProductPrimaryImage(params.productID.stringValue, cloudinaryConstants.CLD_HIGH_RES_IMAGES_VIEW_TYPE, {
                pageType: params.pageType.stringValue
            });
        } else {
            variationAttrValueID = cloudinaryHelper.fetchVariationAttrValueId(params.productID.stringValue);
            cloudinary.images = cloudinaryModel.getCloudinaryImages(params.productID.stringValue, {
                pageType: params.pageType.stringValue, variationAttrValueID: variationAttrValueID
            });
        }
    }
    ISML.renderTemplate('test/image', {
        cloudinary: cloudinary,
        cartridgeVersion: cloudinaryConstants.SITE_VERSION_FOR_TEST_SUITE
    });
};

TestHarness.ProductPrimaryImage = function () {
    ISML.renderTemplate('test/productPrimaryImage', {
        cartridgeVersion: cloudinaryConstants.SITE_VERSION_FOR_TEST_SUITE
    });
};

TestHarness.ProductCustomPositionImage = function () {
    ISML.renderTemplate('test/productCustomPositionImage', {
        cartridgeVersion: cloudinaryConstants.SITE_VERSION_FOR_TEST_SUITE
    });
};

TestHarness.ProductPrimaryImageSubmit = function () {
    var cloudinary = {};
    var params = request.httpParameterMap;
    // Build cloudinary object
    if (cloudinaryConstants.CLD_ENABLED) {
        cloudinary.image = cloudinaryModel.getProductPrimaryImage(params.productID.stringValue,
            params.viewType.stringValue, { pageType: params.pageType.stringValue });
    }
    ISML.renderTemplate('test/productPrimaryImage', {
        cloudinary: cloudinary,
        cartridgeVersion: cloudinaryConstants.SITE_VERSION_FOR_TEST_SUITE
    });
};

TestHarness.ProductCustomPositionImageSubmit = function () {
    var cloudinary = {};
    var params = request.httpParameterMap;
    // Build cloudinary object
    if (cloudinaryConstants.CLD_ENABLED) {
        cloudinary.image = cloudinaryModel.getPLPCustomImage(params.productID.stringValue, params.position.stringValue);
    }
    ISML.renderTemplate('test/productCustomPositionImage', {
        cloudinary: cloudinary,
        cartridgeVersion: cloudinaryConstants.SITE_VERSION_FOR_TEST_SUITE
    });
};

TestHarness.Raw = function () {
    ISML.renderTemplate('test/raw', {
        cartridgeVersion: cloudinaryConstants.SITE_VERSION_FOR_TEST_SUITE
    });
};

TestHarness.RawSubmit = function () {
    var cloudinary = {};
    var params = request.httpParameterMap;
    // Build cloudinary object
    if (cloudinaryConstants.CLD_ENABLED) {
        cloudinary.raw = cloudinaryApi.getProductRawDataByTagName(params.productID.stringValue);
    }
    ISML.renderTemplate('test/raw', {
        cloudinary: cloudinary,
        cartridgeVersion: cloudinaryConstants.SITE_VERSION_FOR_TEST_SUITE
    });
};

TestHarness.Start = function () {
    ISML.renderTemplate('test/index', {
        isIndex: true,
        cartridgeVersion: cloudinaryConstants.SITE_VERSION_FOR_TEST_SUITE
    });
};

TestHarness.Video = function () {
    ISML.renderTemplate('test/video', {
        cartridgeVersion: cloudinaryConstants.SITE_VERSION_FOR_TEST_SUITE
    });
};

TestHarness.VideoSubmit = function () {
    var cloudinary = {};
    var params = request.httpParameterMap;
    // Build cloudinary object
    if (cloudinaryConstants.CLD_ENABLED) {
        cloudinary.video = cloudinaryModel.getCloudinaryVideo(params.productID.stringValue, request.locale);
    }
    ISML.renderTemplate('test/video', {
        cloudinary: cloudinary,
        cartridgeVersion: cloudinaryConstants.SITE_VERSION_FOR_TEST_SUITE
    });
};

// Make methods public to accept web requests
TestHarness.ContentImageRel.public = true;
TestHarness.ContentImageAbs.public = true;
TestHarness.ContentVideoRel.public = true;
TestHarness.ContentVideoAbs.public = true;
TestHarness.CatalogImage.public = true;
TestHarness.CatalogVideo.public = true;
TestHarness.ContentImageRelSubmit.public = true;
TestHarness.ContentImageAbsSubmit.public = true;
TestHarness.ContentVideoRelSubmit.public = true;
TestHarness.ContentVideoAbsSubmit.public = true;
TestHarness.CatalogImageSubmit.public = true;
TestHarness.CatalogVideoSubmit.public = true;
TestHarness.Image.public = true;
TestHarness.ImageSubmit.public = true;
TestHarness.ProductPrimaryImage.public = true;
TestHarness.ProductCustomPositionImage.public = true;
TestHarness.ProductPrimaryImageSubmit.public = true;
TestHarness.ProductCustomPositionImageSubmit.public = true;
TestHarness.Raw.public = true;
TestHarness.RawSubmit.public = true;
TestHarness.Start.public = true;
TestHarness.Video.public = true;
TestHarness.VideoSubmit.public = true;

module.exports = TestHarness;
