'use strict';

// API includes
var jobLogger = require('dw/system').Logger.getLogger('Cloudinary', 'UPLOAD');
var File = require('dw/io/File');
var Status = require('dw/system/Status');

var changedFilesCount = 0;

module.exports.Start = function (args) {
    var Site = require('dw/system/Site');
    var CatalogMgr = require('dw/catalog/CatalogMgr');
    var Transaction = require('dw/system/Transaction');

    var cloudinaryConstants = require('*/cartridge/scripts/util/cloudinaryConstants');
    var cloudinaryUtils = require('*/cartridge/scripts/util/cloudinaryUtils');
    var jobStepHelpers = require('*/cartridge/scripts/helpers/jobStepHelpers');

    var asset;
    var assetPublicID;
    var assetOriginalPublicID;
    var assetsLimit = 0;
    var catalogFolder;
    var changedAssetIds;
    var isAssetUploaded = false;
    var isFileChanged = false;
    var lastJobExecution = new Date(cloudinaryConstants.CLD_CATALOG_CONTENT_JOB_LAST_EXECUTION_DATE);
    var metadata = null;
    var resource;
    var resources;
    var siteCatalog = CatalogMgr.getSiteCatalog();
    var tags = null;

    if (!cloudinaryConstants.CLD_ENABLED) {
        return new Status(Status.ERROR, 'ERROR', 'Cloudinary is disabled currently');
    }

    if (jobStepHelpers.isStepDisabled(args)) {
        return new Status(Status.OK, 'OK', 'Step disabled, skip it...');
    }

    // load input Parameters
    var executionMode = args.CLDJobExecutionMode;
    var numberOfAssets = args.CLDNumberOfAssets;
    var notificationEmail = args.CLDAssetRenameReportEmail;
    var syncMode = args.CLDSyncMode;

    if (!empty(executionMode) && cloudinaryConstants.DEBUG_EXECUTION_MODE.equals(executionMode)) {
        if (empty(numberOfAssets)) {
            return new Status(Status.ERROR, 'ERROR', 'Missing mandatory job parameter "CLDNumberOfAssets" when Debug mode is enabled');
        }
    }

    try {
        if (!empty(siteCatalog)) {
            catalogFolder = new File(cloudinaryConstants.FORWARD_SLASH + File.CATALOGS + cloudinaryConstants.FORWARD_SLASH +
                siteCatalog.ID);
            resources = catalogFolder.listFiles();

            var svcArgs = jobStepHelpers.getCldUploadSvcArgs();

            for (var idx = 0; idx < resources.length; idx++) {
                resource = resources[idx];

                // in case of debug mode terminate loop if assets limit exceeded
                if (cloudinaryConstants.DEBUG_EXECUTION_MODE === executionMode && assetsLimit === numberOfAssets) {
                    break;
                }

                if (resource.isFile() && cloudinaryUtils.validFile(resource.getName(), cloudinaryConstants)) {
                    asset = jobStepHelpers.buildLibraryAssetURL(resource, resource.getName());

                    // check asset total size limit
                    if (resource.length() > cloudinaryConstants.ASSET_UPLOAD_SIZE_LIMIT_BYTES) {
                        jobStepHelpers.logAssetLargerThanLimitMsg(resource.getFullPath(), resource.length());
                        continue;
                    }

                    assetPublicID = jobStepHelpers.getAssetRelURL(asset.assetURL);

                    // if job is running in "delta" mode, check the last modification date on the file
                    if (syncMode === cloudinaryConstants.SYNC_MODE_DELTA) {
                        if (resource.lastModified > lastJobExecution) {
                            changedAssetIds = jobStepHelpers.changePublicIdAndCloudFolder(assetPublicID, asset.cloudFolder);
                            assetOriginalPublicID = assetPublicID;
                            assetPublicID = changedAssetIds.assetPublicID;
                            asset.cloudFolder = changedAssetIds.cldFolder;
                            isFileChanged = changedAssetIds.fileChangedStatus;

                            isAssetUploaded = jobStepHelpers.uploadFile(cloudinaryConstants, asset.assetURL, tags, asset.cloudFolder, assetPublicID, metadata, svcArgs);

                            if (isAssetUploaded && isFileChanged) {
                                jobStepHelpers.logAssetPathChangedMessage(assetOriginalPublicID, assetPublicID);
                                changedFilesCount++;
                                isAssetUploaded = false;
                                isFileChanged = false;
                            }
                        }
                    } else {
                        changedAssetIds = jobStepHelpers.changePublicIdAndCloudFolder(assetPublicID, asset.cloudFolder);
                        assetOriginalPublicID = assetPublicID;
                        assetPublicID = changedAssetIds.assetPublicID;
                        asset.cloudFolder = changedAssetIds.cldFolder;
                        isFileChanged = changedAssetIds.fileChangedStatus;

                        isAssetUploaded = jobStepHelpers.uploadFile(cloudinaryConstants, asset.assetURL, tags, asset.cloudFolder, assetPublicID, metadata, svcArgs);

                        if (isAssetUploaded && isFileChanged) {
                            jobStepHelpers.logAssetPathChangedMessage(assetOriginalPublicID, assetPublicID);
                            changedFilesCount++;
                            isAssetUploaded = false;
                            isFileChanged = false;
                        }
                    }

                    // in case of debug mode terminate loop if assets limit exceeded
                    if (cloudinaryConstants.DEBUG_EXECUTION_MODE === executionMode) {
                        assetsLimit++;
                    }
                } else {
                    changedFilesCount += jobStepHelpers.processFolder(resource, jobStepHelpers.buildCatalogAssetURL, cloudinaryConstants, args,
                        cloudinaryConstants.CLD_CATALOG_CONTENT_JOB_LAST_EXECUTION_DATE);
                }
            }

            // send email if any file changed
            if (!empty(notificationEmail) && changedFilesCount > 0) {
                jobStepHelpers.sendChangedFilesEmail(cloudinaryConstants.CUSTOMER_SERVICE_EMAIL, notificationEmail,
                    cloudinaryConstants.CONTENT_ASSETS_NAME_CHANGED_EMAIL_SUBJECT, changedFilesCount);
            }
        }

        Transaction.wrap(function () {
            var runTime = new Date();
            Site.current.preferences.custom.CLDCatalogContentJobLastExecutionDate = runTime;
        });
    } catch (e) {
        jobLogger.error('Error occured while processing catalog content folder/file, message : {0}', e.message);
    }

    return new Status(Status.OK);
};
