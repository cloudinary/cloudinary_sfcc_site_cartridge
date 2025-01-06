'use strict';

var URLUtils = require('dw/web/URLUtils');
var File = require('dw/io/File');

var jobLogger = require('dw/system').Logger.getLogger('Cloudinary', 'UPLOAD');

/**
 * Manipulates asset absolute URL and get relative URL.
 *
 * @param {string} assetURL - asset absolute URL
 * @param {boolean} includeVideoExtension - flag to use video extension
 *
 * @returns {string} asset rel URL
 */
var getAssetRelURL = function (assetURL, includeVideoExtension) {
    var cloudinaryConstants = require('~/cartridge/scripts/util/cloudinaryOrgConstants');

    var endToken;
    var relURL = '';
    var startToken;
    var tempPath = '';

    try {
        startToken = assetURL.lastIndexOf(cloudinaryConstants.FORWARD_SLASH) + 1;
        endToken = assetURL.lastIndexOf(cloudinaryConstants.DOT);
        // check if base path is not configured to '/'
        if ((cloudinaryConstants.IMAGES_BASE_PATH.indexOf(cloudinaryConstants.FORWARD_SLASH) === 0 && cloudinaryConstants.IMAGES_BASE_PATH.length > 1)) {
            if (assetURL.indexOf(cloudinaryConstants.IMAGES_BASE_PATH) > -1) {
                startToken = assetURL.lastIndexOf(cloudinaryConstants.IMAGES_BASE_PATH) + cloudinaryConstants.IMAGES_BASE_PATH.length + 1;
            }
        } else if (assetURL.indexOf(cloudinaryConstants.DEFAULT_DIRECTORY) > -1) {
            tempPath = assetURL.substring(assetURL.lastIndexOf(cloudinaryConstants.DEFAULT_DIRECTORY) + cloudinaryConstants.DEFAULT_DIRECTORY.length);
            startToken = !empty(tempPath)
                ? assetURL.lastIndexOf(tempPath.substring(tempPath.indexOf(cloudinaryConstants.FORWARD_SLASH)))
                : startToken;
        }

        if (includeVideoExtension) {
            relURL = assetURL.substring(startToken);
        } else {
            relURL = assetURL.substring(startToken, endToken);
        }
    } catch (ex) {
        jobLogger.error('Error occurred while getting asset rel URL, absURL: {0}, message: {1} ', assetURL, ex);
    }

    return relURL;
};

/**
 * Find if asset type is video or not.
 *
 * @param {string} url - asset URL
 *
 * @returns {boolean} flag to indicate video type
 */
function isVideo(url, constants) {
    var cloudinaryUtils = require('~/cartridge/scripts/util/cloudinaryOrgUtils');

    var isVideo = false;
    var fileType = url.substring(url.lastIndexOf(constants.DOT) + 1);
    var videoFormats = cloudinaryUtils.getVideoFormats();

    if (!empty(fileType) && videoFormats.indexOf(fileType) > -1) {
        isVideo = true;
    }

    return isVideo;
}

/**
 * Valid file returns boolean based on the extension of the current file
 *
 * @param {string} candidate - the current asset
 * @returns {boolean} - whether or not the file has a valid extension
 */
function validFile(file) {
    var Utils = require('~/cartridge/scripts/util/cloudinaryOrgUtils');
    var cloudinaryOrgConstants = require('~/cartridge/scripts/util/cloudinaryOrgConstants');

    var imageFormats = Utils.getImageFormats();
    var videoFormats = Utils.getVideoFormats();
    var rawFormats = Utils.getRawFormats();
    var fileType = file.substring(file.lastIndexOf(cloudinaryOrgConstants.DOT) + 1);

    if (imageFormats.indexOf(fileType) > -1) {
        return true;
    }
    if (videoFormats.indexOf(fileType) > -1) {
        return true;
    }
    if (rawFormats.indexOf(fileType) > -1) {
        return true;
    }
    return false;
}

/**
 * function for uploading images to Cloudinary
 *
 * @param {Object} cloudinarySvc - the service
 * @param {Object} asset - asset object to parse
 * @param {string} tags - all tags defined for asset
 * @param {string} assignedFolder - folder of asset
 * @param {Object} chunkObj - the chunk file data
 * @returns {Object} files to be logged
 */
function uploadFiles(cloudinarySvc, asset, tags, assignedFolder, chunkObj, metadata, assetPublicID) {
    var cloudinaryOrgConstants = require('~/cartridge/scripts/util/cloudinaryOrgConstants');
    var cloudinaryUtils = require('~/cartridge/scripts/util/cloudinaryOrgUtils');
    var uploadResult;
    var args = {};
    args.cloudinaryFolder = assignedFolder;
    args.tags = tags;
    args.assetPublicID = assetPublicID;

    if (!empty(metadata)) {
        args.metadata = metadata;
    }

    var servicePrefs = cloudinaryUtils.buildUploadServicePrefs(cloudinaryOrgConstants);
    args.servicePrefs = servicePrefs;

    args.file = asset.toString();
    uploadResult = cloudinarySvc.uploadAsset(args);

    if (!uploadResult.ok) {
        jobLogger.debug('Upload failed for file : {0}, message : {1}', asset, uploadResult.message);
    } else {
        jobLogger.debug(uploadResult.message);
    }

}

/**
 * It's used to change the public ID and folder if they include special characters.
 *
 * @param {string} cldAssetPublicID - cloudinary asset public ID
 * @param {string} cldAssetFolder - cloudinary asset folder
 * @param {boolean} isProductAsset - flag to indicate if product asset
 *
 * @returns {Object} - object holding public id and folder
*/
var changePublicIdAndCloudFolder = function (cldAssetPublicID, cldAssetFolder, isProductAsset) {
    var cloudinaryUtils = require('~/cartridge/scripts/util/cloudinaryOrgUtils');
    var cloudinaryConstants = require('~/cartridge/scripts/util/cloudinaryOrgConstants');

    var assetPublicID = cldAssetPublicID;
    var cldFolder = cldAssetFolder;
    var fileChangedStatus = false;
    var isIncludeSpecialChars;
    var isProdAsset = isProductAsset;

    if (!empty(assetPublicID)) {
        if (!isProdAsset) {
            assetPublicID = assetPublicID.substring(assetPublicID.lastIndexOf(cloudinaryConstants.FORWARD_SLASH) + 1);
        }
        isIncludeSpecialChars = cloudinaryUtils.isIncludeSpecialChars(assetPublicID);
        if (isIncludeSpecialChars) {
            assetPublicID = cloudinaryUtils.replaceSpecialChars(assetPublicID);
            fileChangedStatus = true;
        }
    }

    if (!empty(cldFolder)) {
        isIncludeSpecialChars = cloudinaryUtils.isIncludeSpecialChars(cldFolder);
        if (isIncludeSpecialChars) {
            cldFolder = cloudinaryUtils.replaceSpecialChars(cldFolder);
        }
    }

    return { assetPublicID: assetPublicID, cldFolder: cldFolder, fileChangedStatus: fileChangedStatus };
};

/**
 * Creates valid paath argument and uploads a single asset
 *
 * @param {string} folder - current processing folder
 * @param {Object} file - current file
 * @returns {boolean} - true/false
 */
function doFile(folder, file) {
    var cloudinarySvc = require('~/cartridge/scripts/service/cldOrgUpload');
    var cloudinaryOrgConstants = require('~/cartridge/scripts/util/cloudinaryOrgConstants');
    var url;

    try {
        if (file.path && isVideo(file.path, cloudinaryOrgConstants)) {
            folder = cloudinaryOrgConstants.CLD_ORG_CONTENT_VIDEO_PATH;
        } else {
            folder = cloudinaryOrgConstants.CLD_ORG_CONTENT_IMAGE_PATH;
        }

        // if (folder.lastIndexOf(cloudinaryOrgConstants.FORWARD_SLASH) != folder.length - 1) {
        //     folder =  folder + cloudinaryOrgConstants.FORWARD_SLASH;
        // }

        // path = file.getFullPath().toString().replace(cloudinaryOrgConstants.FORWARD_SLASH + File.STATIC, '');
        // path = path.replace('default/', '');
        // path = path.replace('//', '/');

        url = cloudinaryOrgConstants.HOST_NAME + cloudinaryOrgConstants.ORG_CONTENT_DW_URL + file.path;
        jobLogger.info('Now uploading file: {0}', file.getName());
        var assetPublicID = getAssetRelURL(file.toString());
        var changedAssetIds = changePublicIdAndCloudFolder(assetPublicID, folder);
        assetPublicID = changedAssetIds.assetPublicID;
        uploadFiles(cloudinarySvc, url, null, folder, null, null, assetPublicID);

        return true;
    } catch (err) {
        jobLogger.error('Processing failure: {0}', err);
        return false;
    }
}

/**
 * Loops over folder/file list recursively and uploads each asset
 *
 * @param {Object} folder - the current folder
 * @param {array} arrFilelist - list of files (optional)
 * @param {string} syncMode - full/delta
 * @param {string} cloudinaryOrgConstants - organization constants
*/
var processFolder = function (folder, arrFilelist, syncMode, lastJobExecution) {
    var counter;
    var file;
    var files = folder.listFiles();
    var filelist = arrFilelist || [];
    counter = files.length;

    while (counter > 0) {
        file = files[counter - 1];
        if (file.isDirectory()) {
            jobLogger.debug('** Now processing folder: {0}', file.getName());
            filelist = processFolder(file, null, syncMode, lastJobExecution);
        } else {
            filelist.push(file);
            if (validFile(file.getName())) {
                jobLogger.debug('** Now processing file: {0}', file.getName());
                // If this is a delta job, skip files already processed
                if (syncMode === 'delta') {
                    if (file.lastModified() > lastJobExecution) {
                        doFile(folder.getFullPath(), file);
                    }
                } else {
                    doFile(folder.getFullPath(), file);
                }
            }
        }
        counter--;
    }
};

/**
 * Job's starting point uploads all image, video and raws
 * present at organization level into Cloudinary DAM
 *
 * @param {Object} args - arguments (executionMode, debugCount)
 */
function start(args) {
    var System = require('dw/system/System');
    var Transaction = require('dw/system/Transaction');

    var cloudinaryOrgConstants = require('~/cartridge/scripts/util/cloudinaryOrgConstants');
    var debugCounter = args.debugCounter || 0;
    var orgContentFolder;
    var lastJobExecution = new Date(cloudinaryOrgConstants.CLD_LAST_SYNC);
    var resource;
    var resources;

    try {
        if (cloudinaryOrgConstants.CLD_ENABLED) {
            orgContentFolder = new File(cloudinaryOrgConstants.FORWARD_SLASH + File.STATIC + cloudinaryOrgConstants.FORWARD_SLASH);
            resources = orgContentFolder.listFiles();

            if (resources) {
                Transaction.wrap(function () {
                    var runTime = new Date();
                    System.preferences.custom.CLDLastSyncJobExecution = runTime;
                });
                for (var idx = 0; idx < resources.length; idx++) {
                    resource = resources[idx];
                    if (resource.isFile() && validFile(resource.getName())) {
                        // if the job is running in "delta" mode skip already processed files
                        if (args.syncMode === 'delta') {
                            if (resource.lastModified() > lastJobExecution) {
                                doFile(folder.getName(), resource, lastJobExecution);
                            }
                        } else {
                            doFile(folder.getName(), resource, lastJobExecution);
                        }
                    } else {
                        processFolder(resource, null, args.syncMode, lastJobExecution);
                    }

                    if (debugCounter !== 0) {
                        debugCounter--;
                        if (debugCounter === 0) {
                            break;
                        }
                    }
                }
            };
        } else {
            jobLogger.error('Cloudinary is disabled currently at organization level');
        }
    } catch (ex) {
        jobLogger.error('Error occurred while uploading organization static content on cloudinary, error : {0}, {1}', ex, ex.fileName);
    }
};

module.exports = {
    Start: start
};