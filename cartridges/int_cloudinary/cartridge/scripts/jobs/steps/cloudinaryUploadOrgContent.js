'use strict';

/**
 * Creates valid paath argument and uploads a single asset
 *
 * @param {string} folder - current processing folder
 * @param {Object} file - current file
 * @returns {boolean} - true/false
 */
function doFile(folder, file) {
    var cloudinarySvc = require('~/cartridge/scripts/service/cldUpload');
    var cloudinaryConstants = require('~/cartridge/scripts/util/cloudinaryConstants');
    var jobStepHelpers = require('~/cartridge/scripts/helpers/jobStepHelpers');
    var cloudinaryUtils = require('~/cartridge/scripts/util/cloudinaryUtils');
    var jobLogger = require('dw/system').Logger.getLogger('Cloudinary', 'UPLOAD');

    var url;

    try {
        if (file.path && cloudinaryUtils.isVideo(file.path, cloudinaryConstants)) {
            folder = cloudinaryConstants.CLD_ORG_CONTENT_VIDEO_PATH;
        } else {
            folder = cloudinaryConstants.CLD_ORG_CONTENT_IMAGE_PATH;
        }

        url = cloudinaryConstants.HOST_NAME + cloudinaryConstants.ORG_CONTENT_DW_URL + file.path;
        jobLogger.info('Now uploading file: {0}', file.getName());
        var assetPublicID = jobStepHelpers.getAssetRelURL(file.toString());
        var changedAssetIds = jobStepHelpers.changePublicIdAndCloudFolder(assetPublicID, folder);
        assetPublicID = changedAssetIds.assetPublicID;
        var svcArgs = jobStepHelpers.getCldUploadSvcArgs();
        jobStepHelpers.uploadFile(cloudinaryConstants, url, null, folder, assetPublicID, null, svcArgs, null);

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
 * @param {string} cloudinaryConstants - organization constants
*/
var processFolder = function (folder, arrFilelist, syncMode, lastJobExecution, cloudinaryUtils, cloudinaryConstants, jobLogger) {
    var counter;
    var file;
    var files = folder.listFiles();
    var filelist = arrFilelist || [];
    counter = files.length;

    while (counter > 0) {
        file = files[counter - 1];
        if (file.isDirectory()) {
            jobLogger.debug('** Now processing folder: {0}', file.getName());
            filelist = processFolder(file, null, syncMode, lastJobExecution, cloudinaryUtils, cloudinaryConstants, jobLogger);
        } else {
            filelist.push(file);
            if (cloudinaryUtils.validFile(file.getName(), cloudinaryConstants)) {
                jobLogger.debug('** Now processing file: {0}', file.getName());
                // If this is a delta job, skip files already processed
                if (syncMode === 'DELTA') {
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

    var cloudinaryConstants = require('~/cartridge/scripts/util/cloudinaryConstants');
    var jobStepHelpers = require('~/cartridge/scripts/helpers/jobStepHelpers');
    var cloudinaryUtils = require('~/cartridge/scripts/util/cloudinaryUtils');
    var jobLogger = require('dw/system').Logger.getLogger('Cloudinary', 'UPLOAD');
    var File = require('dw/io/File');

    var debugCounter = args.debugCounter || 0;
    var orgContentFolder;
    var lastJobExecution = new Date(cloudinaryConstants.CLD_LAST_SYNC);
    var resource;
    var resources;

    try {
        if (cloudinaryConstants.CLD_ENABLED) {
            if (jobStepHelpers.isStepDisabled(args)) {
                return new Status(Status.OK, 'OK', 'Step disabled, skip it...');
            }
            orgContentFolder = new File(cloudinaryConstants.FORWARD_SLASH + File.STATIC + cloudinaryConstants.FORWARD_SLASH);
            resources = orgContentFolder.listFiles();

            if (resources) {
                Transaction.wrap(function () {
                    var runTime = new Date();
                    System.preferences.custom.CLDLastSyncJobExecution = runTime;
                });
                for (var idx = 0; idx < resources.length; idx++) {
                    resource = resources[idx];
                    if (resource.isFile() && cloudinaryUtils.validFile(resource.getName(), cloudinaryConstants)) {
                        // if the job is running in "delta" mode skip already processed files
                        if (args.CLDSyncMode === 'DELTA') {
                            if (resource.lastModified() > lastJobExecution) {
                                doFile(resource.getName(), resource);
                            }
                        } else {
                            doFile(resource.getName(), resource);
                        }
                    } else {
                        processFolder(resource, null, args.CLDSyncMode, lastJobExecution, cloudinaryUtils, cloudinaryConstants, jobLogger);
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
        jobLogger.error('Error occurred while uploading organization static content on cloudinary, error : {0}, {1}, {2}', ex, ex.fileName, ex.lineNumber);
    }
};

module.exports = {
    Start: start
};
