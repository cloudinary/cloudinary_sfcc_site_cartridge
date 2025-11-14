'use strict';

var Cloudinary = {};
var params = request.httpParameterMap;

/**
 * Get content image/url from cloudinary for library content.
 */
Cloudinary.GetContentImage = function () {
    var cloudinaryModel = require('*/cartridge/scripts/model/cloudinaryModel');
    var cloudinaryConstants = require('*/cartridge/scripts/util/cloudinaryConstants');
    var ISML = require('dw/template/ISML');

    var imgObj = {};
    var imgURL = params.url.stringValue;
    var pageType = params.pageType.stringValue;
    var isUrl = params.isUrl.stringValue ? JSON.parse(params.isUrl.stringValue) : false;
    var contentAttributes = params.attributes ? params.attributes.stringValue : '';
    var removeQuotes = contentAttributes && contentAttributes.slice(-1) === '"' ? contentAttributes.substring(0, contentAttributes.length - 1) : contentAttributes;
    contentAttributes = removeQuotes && removeQuotes[0] === '"' ? removeQuotes.substring(1) : removeQuotes;
    var altText = params.altText ? params.altText.stringValue : '';

    if (cloudinaryConstants.CLD_ENABLED) {
        imgObj = cloudinaryModel.geContentImageURLByName(imgURL, pageType);
    } else {
        var URLUtils = require('dw/web/URLUtils');
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
            imgURL: imgObj.imgURL,
            contentAttributes: contentAttributes,
            altText: altText
        });
    }
};

/**
 * Get content video from cloudinary for library content.
 */
Cloudinary.GetContentVideo = function () {
    var UUIDUtils = require('dw/util/UUIDUtils');
    var cloudinaryModel = require('*/cartridge/scripts/model/cloudinaryModel');
    var cloudinaryConstants = require('*/cartridge/scripts/util/cloudinaryConstants');
    var cloudinaryHelper = require('*/cartridge/scripts/helpers/cloudinaryHelpers');
    var ISML = require('dw/template/ISML');

    var cloudinaryStaticContent = {};
    var videoURL = params.url.stringValue;
    var configs = params.config;

    if(!empty(configs) && !empty(configs.value)) {
        configs = configs.value.replace(';', ',');
    }

    if (cloudinaryConstants.CLD_ENABLED) {
        cloudinaryStaticContent.video = cloudinaryModel.geContentVideoByName(videoURL, configs);
    } else {
        var URLUtils = require('dw/web/URLUtils');
        cloudinaryStaticContent.video = {
            videoURL: URLUtils.imageURL(URLUtils.CONTEXT_LIBRARY, null, videoURL, null)
        };
    }

    cloudinaryStaticContent.videoEnabled = cloudinaryHelper.isVideoEnabledForContentLibrary();
    cloudinaryStaticContent.videoPlayerEnabled = cloudinaryHelper.isVideoPlayerEnabledForContentLibrary();
    cloudinaryStaticContent.cloudName = cloudinaryConstants.CLD_CLOUDNAME;
    cloudinaryStaticContent.randomNumber = UUIDUtils.createUUID();
    cloudinaryStaticContent.isEnabled = cloudinaryConstants.CLD_ENABLED;
    cloudinaryStaticContent.domain = cloudinaryConstants.CLD_BASE_PATH.match(/^(?:https?:\/\/)?([^\/]+)/)[1];

    ISML.renderTemplate('content/renderContentVideo', {
        cloudinaryStaticContent: cloudinaryStaticContent
    });
};

Cloudinary.GetContentImage.public = true;
Cloudinary.GetContentVideo.public = true;

module.exports = Cloudinary;
