'use strict';

/**
 * @namespace CloudinaryAssets
 */

var ISML = require('dw/template/ISML');

var Cloudinary = {};

Cloudinary.RenderAsset = function () {
    var ContentMgr = require('dw/content/ContentMgr');
    var contentID = request.httpParameterMap.contentId.stringValue;
    var apiContent = ContentMgr.getContent(contentID);
    if (apiContent && apiContent.online === true && apiContent.custom.body) {
        response.setHttpHeader('Access-Control-Allow-Origin', '*');
        ISML.renderTemplate('content/renderCldAsset', {
            content: apiContent.custom.body
        });
    } else {
        return null;
    }
};

Cloudinary.RenderSlots = function () {
    response.setHttpHeader('Access-Control-Allow-Origin', '*');
    ISML.renderTemplate('slots/renderCldSlots');
};

Cloudinary.RenderSlots.public = true;
Cloudinary.RenderAsset.public = true;
module.exports = Cloudinary;
