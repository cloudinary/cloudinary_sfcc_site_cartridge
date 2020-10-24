'use strict';

var ISML = require('dw/template/ISML');
var URLUtils = require('dw/web/URLUtils');

var cloudinaryModel = require('*/cartridge/scripts/model/cloudinaryModel');
var cloudinaryConstants = require('*/cartridge/scripts/util/cloudinaryConstants');
var cloudinaryHelper = require('*/cartridge/scripts/helpers/cloudinaryHelpers');

var Cloudinary = {};
var params = request.httpParameterMap;

/**
 * Get content image/url from cloudinary for library content.
 */
Cloudinary.GetContentImage = function () {
    var imgObj = {};
    var imgURL = params.url.stringValue;
    var pageType = params.pageType.stringValue;
    var isUrl = params.isUrl.stringValue ? JSON.parse(params.isUrl.stringValue) : false;

    if (cloudinaryConstants.CLD_ENABLED) {
        imgObj = cloudinaryModel.geContentImageURLByName(imgURL, pageType);
    } else {
        imgObj.imgURL = {
            url: URLUtils.imageURL(URLUtils.CONTEXT_LIBRARY, null, imgURL, null)
        };
    }

    // check if only require image URL then avoid rendering <img> tag
    if (isUrl) {
        ISML.renderTemplate('content/renderContentImageUrl', {
            imgURL: imgObj.imgURL
        });
    } else {
        ISML.renderTemplate('content/renderContentImage', {
            imgURL: imgObj.imgURL
        });
    }
};

/**
 * Get content video from cloudinary for library content.
 */
Cloudinary.GetContentVideo = function () {
    var UUIDUtils = require('dw/util/UUIDUtils');

    var cloudinaryStaticContent = {};
    var videoURL = params.url.stringValue;

    if (cloudinaryConstants.CLD_ENABLED) {
        cloudinaryStaticContent.video = cloudinaryModel.geContentVideoByName(videoURL);
    } else {
        cloudinaryStaticContent.video = {
            videoURL: URLUtils.imageURL(URLUtils.CONTEXT_LIBRARY, null, videoURL, null)
        };
    }

    cloudinaryStaticContent.videoEnabled = cloudinaryHelper.isVideoEnabledForContentLibrary();
    cloudinaryStaticContent.videoPlayerEnabled = cloudinaryHelper.isVideoPlayerEnabledForContentLibrary();
    cloudinaryStaticContent.cloudName = cloudinaryConstants.CLD_CLOUDNAME;
    cloudinaryStaticContent.randomNumber = UUIDUtils.createUUID();
    cloudinaryStaticContent.isEnabled = cloudinaryConstants.CLD_ENABLED;

    ISML.renderTemplate('content/renderContentVideo', {
        cloudinaryStaticContent: cloudinaryStaticContent
    });
};

Cloudinary.GetContentImage.public = true;
Cloudinary.GetContentVideo.public = true;

module.exports = Cloudinary;
