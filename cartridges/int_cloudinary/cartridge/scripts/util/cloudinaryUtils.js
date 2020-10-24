'use strict';

var MessageDigest = require('dw/crypto/MessageDigest');
var cloudinaryConstants = require('*/cartridge/scripts/util/cloudinaryConstants');

/**
 * This method creates the request object.
 * @param {string} requestObj - The request object
 * @param {string} apiSecret -api secret
 *
 * @returns {string} result - The API service response (JSON)
 */
function buildSignature(requestObj, apiSecret) {
    if (empty(apiSecret)) {
        return false;
    }
    var hasher = new MessageDigest(MessageDigest.DIGEST_SHA_256);
    var fieldsArray = [];
    var fields;
    var unhashed;
    var signature;

    /*eslint-disable*/
    for (var key in requestObj) {
        if (requestObj.hasOwnProperty(key)) {
            if (empty(requestObj[key])) {
                delete requestObj[key];
            } else {
                fieldsArray.push(key + '=' + requestObj[key]);
            }
        }
    }
    /*eslint-enable*/

    fields = fieldsArray.sort().join('&');
    unhashed = fields + apiSecret;
    signature = hasher.digest(unhashed);
    return signature;
}

/**
 * Returns valid image file formats
 * zip extension used for uploading 3D models that are zipped
 *
 * @returns {array} valid formats
 */
function getImageFormats() {
    return [
        'ai', 'gif', 'webp', 'bmp', 'eps', 'ps', 'ept', 'eps3', 'flif', 'gif', 'heif', 'heic', 'ico', 'jpg', 'jpeg', 'jpe', 'jp2', 'wdp', 'jxr', 'hdp', 'pdf', 'png', 'svg', 'tga', 'tif', 'tiff', 'zip'
    ];
}

/**
 * Returns valid video file formats
 *
 * @returns {array} valid formats
 */
function getVideoFormats() {
    return [
        'avi', 'mpeg', 'mp4', 'flv', 'mov', 'mkv', 'mpg', '3gp', 'mpv', 'wmv', 'ogv', 'webm', 'm3u8', 'ts', 'm2ts', 'mts', 'mpeg', '3gp', '3g2'
    ];
}

/**
 * Returns valid raw file formats
 *
 * @returns {array} valid formats
 */
function getRawFormats() {
    return [
        'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'pdf', 'txt', 'csv', 'zip'
    ];
}

/**
 * Returns array of special characters.
 *
 * @returns {array} valid formats
 */
function getSpecialChars() {
    return [
        '!', '@', '#', '$', '%', '^', '*'
    ];
}

/**
 * Valid file returns boolean based on the extension of the current file
 *
 * @param {string} file - the current asset
 * @param {Object} constantsObj - object holding constants
 * @returns {boolean} whether or not the file has a valid extension
 */
function validFile(file, constantsObj) {
    var imageFormats = getImageFormats();
    var videoFormats = getVideoFormats();
    var rawFormats = getRawFormats();
    var result = false;
    var fileType = file.substring(file.lastIndexOf(constantsObj.DOT) + 1);

    if (imageFormats.indexOf(fileType) > -1) {
        result = true;
    }
    if (videoFormats.indexOf(fileType) > -1) {
        result = true;
    }
    if (rawFormats.indexOf(fileType) > -1) {
        result = true;
    }

    return result;
}

/**
 * Find if asset type is video or not.
 *
 * @param {string} url - asset URL
 * @param {Object} constantsObj - constants object
 *
 * @returns {boolean} flag to indicate video type
 */
function isVideo(url, constantsObj) {
    var status = false;
    var fileType = url.substring(url.lastIndexOf(constantsObj.DOT) + 1);
    var videoFormats = getVideoFormats();

    if (!empty(fileType) && videoFormats.indexOf(fileType) > -1) {
        status = true;
    }

    return status;
}

/**
 * Build service preferences gathered from the file which is provided as argument.
 *
 * @param {Object} constantsObj - constants object
 *
 * @returns {Object} object holding service preferences
 */
function buildUploadServicePrefs(constantsObj) {
    var data = {};

    data.CLD_APIKEY = constantsObj.CLD_APIKEY;
    data.CLD_CLOUDNAME = constantsObj.CLD_CLOUDNAME;
    data.CLD_MISSING_KEY = constantsObj.CLD_MISSING_KEY;
    data.CLD_APISECRET = constantsObj.CLD_APISECRET;
    data.CLD_MISSING_PARAM = constantsObj.CLD_MISSING_PARAM;
    data.CLD_UPLOAD_PRESET = constantsObj.CLD_UPLOAD_PRESET;
    data.CLD_UPLOAD_SVC = constantsObj.CLD_UPLOAD_SVC;
    data.CLD_UPLOAD_SVC_CRED = constantsObj.CLD_REST_SERVICE_CREDENTIALS;
    data.CLD_GENERAL_ERROR = constantsObj.CLD_GENERAL_ERROR;
    data.CONTENT_TYPE_VIDEO = constantsObj.CONTENT_TYPE_VIDEO;
    data.CONTENT_TYPE_IMAGE = constantsObj.CONTENT_TYPE_IMG;
    data.CONTENT_TYPE_RAW = constantsObj.CONTENT_TYPE_RAW;
    data.FORWARD_SLASH = constantsObj.FORWARD_SLASH;
    data.UPLOAD_ENDPOINT = constantsObj.UPLOAD_ENDPOINT;
    data.POST_METHOD = constantsObj.POST_METHOD;
    data.DOT = constantsObj.DOT;
    data.TAGS_ENDPOINT = constantsObj.TAGS_ENDPOINT;

    return data;
}

/**
 * Get asset type
 *
 * @param {string} file - file asset
 * @param {Object} constantsObj - constants object
 *
 * @returns {Object} object holding service preferences
 */
function getAssetType(file, constantsObj) {
    var imageFormats = getImageFormats();
    var videoFormats = getVideoFormats();
    var rawFormats = getRawFormats();
    var fileType = file.substring(file.lastIndexOf(constantsObj.DOT) + 1);
    var type;

    if (videoFormats.indexOf(fileType) > -1) {
        type = constantsObj.CONTENT_TYPE_VIDEO;
    }
    if (imageFormats.indexOf(fileType) > -1) {
        type = constantsObj.CONTENT_TYPE_IMAGE;
    }
    if (rawFormats.indexOf(fileType) > -1) {
        type = constantsObj.CONTENT_TYPE_RAW;
    }

    return type;
}

/**
 * Returns array of special characters.
 *
 * @param {string} path - original path
 * @param {Object} constantsObj - constants object
 *
 * @returns {string} changed path
 */
function isIncludeSpecialChars(path) {
    var result = false;

    if (!empty(path)) {
        result = cloudinaryConstants.CLD_PUBLIC_ID_SPECIAL_CHARS_REGEX.test(path);
    }

    return result;
}

/**
 * Returns array of special characters.
 *
 * @param {string} originalPath - original path
 *
 * @returns {string} changed path
 */
function replaceSpecialChars(originalPath) {
    var path = originalPath;
    if (!empty(path)) {
        path = path.replace(cloudinaryConstants.CLD_PUBLIC_ID_SPECIAL_CHARS_REGEX, '_');
    }

    return path;
}

module.exports = {
    buildSignature: buildSignature,
    getImageFormats: getImageFormats,
    getVideoFormats: getVideoFormats,
    getRawFormats: getRawFormats,
    getSpecialChars: getSpecialChars,
    validFile: validFile,
    isVideo: isVideo,
    buildUploadServicePrefs: buildUploadServicePrefs,
    getAssetType: getAssetType,
    replaceSpecialChars: replaceSpecialChars,
    isIncludeSpecialChars: isIncludeSpecialChars
};
