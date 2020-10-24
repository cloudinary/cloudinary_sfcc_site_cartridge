'use strict';

// API includes
var assetRenameLogger = require('dw/system').Logger.getLogger('cld-asset-upload-report', 'cld-asset-upload-report');
var jobLogger = require('dw/system').Logger.getLogger('Cloudinary', 'UPLOAD');
var ContentMgr = require('dw/content/ContentMgr');
var File = require('dw/io/File');
var Site = require('dw/system/Site');
var URLUtils = require('dw/web/URLUtils');

var WS = require('*/cartridge/scripts/service/cldWebService');

var assetsLimit = 0;
var changedFilesCount = 0;

/**
 * Returns true if the given {params} object contains a isDisabled property as true.
 * This will allows us to disable a job step without removing it from the configuration
 *
 * @param {Object} params - object holding job step params
 *
 * @return {boolean} flag to indicate if job step is disabled or not
 */
var isStepDisabled = function (params) {
    if (empty(params)) {
        return false;
    }

    return ['true', true].indexOf(params.Disabled) > -1;
};

/**
 * It's used to build content library asset URL and cloudinary folder.
 *
 * @param {string} file - asset file
 *
 * @return {boolean} flag to indicate if job step is disabled or not
 */
var buildLibraryAssetURL = function (file) {
    var cloudinaryConstants = require('*/cartridge/scripts/util/cloudinaryConstants');

    var assetURL = '';
    var currentSite;
    var cloudFolder = '';
    var siteLibrary = ContentMgr.getSiteLibrary();
    var path;

    try {
        cloudFolder = file.getFullPath();
        cloudFolder = cloudFolder.substring(0, cloudFolder.lastIndexOf(cloudinaryConstants.FORWARD_SLASH));
        cloudFolder = cloudFolder.replace(cloudinaryConstants.DEFAULT_DIRECTORY_WITHOUT_SLASH, cloudinaryConstants.EMPTY_STRING);
        cloudFolder = cloudFolder.replace(cloudinaryConstants.FORWARD_SLASH + File.LIBRARIES + cloudinaryConstants.FORWARD_SLASH, cloudinaryConstants.EMPTY_STRING);
        cloudFolder = cloudFolder.replace(cloudinaryConstants.CLD_PRODUCT_CATALOG, cloudinaryConstants.EMPTY_STRING);
        cloudFolder = cloudinaryConstants.CLD_CONTENT_IMAGE_PATH + cloudinaryConstants.FORWARD_SLASH + cloudFolder;

        path = file.getFullPath().toString().replace(cloudinaryConstants.FORWARD_SLASH + File.LIBRARIES, cloudinaryConstants.EMPTY_STRING);
        path = path.replace(cloudinaryConstants.DEFAULT_DIRECTORY, cloudinaryConstants.EMPTY_STRING);
        if (!empty(siteLibrary)) {
            currentSite = Site.getCurrent();
            path = path.replace(siteLibrary.ID === cloudinaryConstants.PRIVATE_LIBRARY ? currentSite.ID : siteLibrary.ID,
                cloudinaryConstants.EMPTY_STRING);
        }
        assetURL = URLUtils.absStatic(URLUtils.CONTEXT_LIBRARY, null, path).toString();
    } catch (err) {
        jobLogger.error('Error occured while building library asset URL, file : {0}, message: {1}', file.path, err);
    }

    return { assetURL: assetURL, cloudFolder: cloudFolder };
};

/**
 * It's used to build catalog asset URL and cloudinary folder.
 *
 * @param {string} file - asset file
 * @param {string} folder - cloudinary folder
 *
 * @return {Object} - object holding asset URL and cloudinary folder
 */
var buildCatalogAssetURL = function (file) {
    var CatalogMgr = require('dw/catalog/CatalogMgr');

    var cloudinaryConstants = require('*/cartridge/scripts/util/cloudinaryConstants');

    var assetURL = '';
    var cloudFolder = '';
    var siteCatalog = CatalogMgr.getSiteCatalog();
    var path;

    try {
        if (!empty(siteCatalog)) {
            cloudFolder = file.getFullPath();
            cloudFolder = cloudFolder.substring(0, cloudFolder.lastIndexOf(cloudinaryConstants.FORWARD_SLASH));
            cloudFolder = cloudFolder.replace(cloudinaryConstants.DEFAULT_DIRECTORY, cloudinaryConstants.EMPTY_STRING);
            cloudFolder = cloudFolder.replace(cloudinaryConstants.FORWARD_SLASH + File.CATALOGS + cloudinaryConstants.FORWARD_SLASH, cloudinaryConstants.EMPTY_STRING);
            cloudFolder = cloudFolder.replace(siteCatalog.ID, cloudinaryConstants.EMPTY_STRING);
            cloudFolder = cloudinaryConstants.CLD_CATALOG_IMAGE_PATH + cloudinaryConstants.FORWARD_SLASH + cloudFolder;
            cloudFolder = cloudFolder.replace(cloudinaryConstants.FORWARD_SLASH + cloudinaryConstants.FORWARD_SLASH, cloudinaryConstants.FORWARD_SLASH);

            path = file.getFullPath().toString().replace(cloudinaryConstants.FORWARD_SLASH + File.CATALOGS, cloudinaryConstants.EMPTY_STRING);
            path = path.replace(siteCatalog.ID, cloudinaryConstants.EMPTY_STRING);
            path = path.replace(cloudinaryConstants.DEFAULT_DIRECTORY, cloudinaryConstants.EMPTY_STRING);
            assetURL = URLUtils.absStatic(URLUtils.CONTEXT_CATALOG, siteCatalog.ID, path).toString();
        }
    } catch (err) {
        jobLogger.error('Error occured while processing file : {0}, message: {1}', file.path, err);
    }

    return { assetURL: assetURL, cloudFolder: cloudFolder };
};

/**
 * Removes redundant and already assigned tags from new tags.
 *
 * @param {string} redundantTags - comma separated tags
 * @param {List} existingTags - already assigned tags in cld
 *
 * @returns {string} tags
 */
var removeRedundantTags = function (redundantTags, existingTags) {
    if (empty(redundantTags)) {
        return null;
    }
    var HashSet = require('dw/util/HashSet');
    var redundantTagsArr = redundantTags.split(',');
    var newTagsSet = new HashSet();
    for (var i = 0; i < redundantTagsArr.length; i++) {
        var redundantTag = redundantTagsArr[i];
        if (empty(redundantTag)) {
            continue;
        }
        newTagsSet.add(redundantTag);
    }
    if (!empty(existingTags)) {
        for (var j = 0; j < existingTags.length; j++) {
            newTagsSet.remove(existingTags[j].toString());
        }
    }
    return !empty(newTagsSet) && newTagsSet.length > 0 ? newTagsSet.toArray().join(',') : null;
};

/**
 * it's used to upload assets on Cloudinary.
 *
 * @param {Object} cloudinaryConstants - constants object
 * @param {Object} asset - asset object to parse
 * @param {string} tags - all tags defined for asset
 * @param {string} assignedFolder - folder of asset
 * @param {string} assetPublicID - asset public ID
 * @param {Object} metadata - meta data
 * @param {Object} svcArgs - service related data
 *
 * @returns {Object} files to be logged
 */
var uploadFile = function (cloudinaryConstants, asset, tags, assignedFolder, assetPublicID, metadata, svcArgs) {
    var isAssetUploaded = false;
    var cloudinarySvc = require('*/cartridge/scripts/service/cldUpload');
    var cloudinaryTagsSvc = require('*/cartridge/scripts/service/cldAddAssetTags');

    var args = svcArgs.svcConfigArgs;
    var uploadResult;

    args.cloudinaryFolder = assignedFolder;
    args.tags = removeRedundantTags(tags);
    args.assetPublicID = assetPublicID;
    args.servicePrefs = svcArgs.servicePrefs;
    args.cldUploadSvc = svcArgs.cldUploadSvc;

    if (!empty(metadata)) {
        args.metadata = metadata;
    }

    args.file = asset;
    uploadResult = cloudinarySvc.uploadAsset(args);

    if (!uploadResult.ok) {
        if (uploadResult.errorCode === cloudinaryConstants.ERROR_CODES.UNAUTHORIZED) {
            jobLogger.error('Error occurred while connecting with service due to invalid credentials, message: {0}', uploadResult.message);
        } else {
            jobLogger.error('Error uploading file: {0}, message: {1}', asset, uploadResult.message);
        }
    } else if ('resultObj' in uploadResult && !empty(uploadResult.resultObj) && 'existing' in uploadResult.resultObj &&
        uploadResult.resultObj.existing) {
        jobLogger.info('Asset with public ID {0} already exists, going to add new tags', assetPublicID);
        args.assetPublicID = 'public_id' in uploadResult.resultObj ? uploadResult.resultObj.public_id : null;
        args.tags = removeRedundantTags(args.tags, uploadResult.resultObj.tags);
        if (!empty(args.tags)) {
            cloudinaryTagsSvc.addAssetTags(args);
        }
        isAssetUploaded = true;
    } else {
        jobLogger.info(uploadResult.message);
        isAssetUploaded = true;
    }

    return isAssetUploaded;
};

/**
 * Manipulates asset absolute URL and get relative URL.
 *
 * @param {string} assetURL - asset absolute URL
 * @param {boolean} includeVideoExtension - flag to use video extension
 *
 * @returns {string} asset rel URL
 */
var getAssetRelURL = function (assetURL, includeVideoExtension) {
    var cloudinaryConstants = require('*/cartridge/scripts/util/cloudinaryConstants');

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
        jobLogger.error('Error occured while getting asset rel URL, absURL: {0}, message: {1} ', assetURL, ex);
    }

    return relURL;
};

/**
 * Log File too large entries for assets.
 *
 * @param {string} filePath - asset's original path
 * @param {number} fileSize - file size
 *
 */
var logAssetLargerThanLimitMsg = function (filePath, fileSize) {
    var cloudinaryConstants = require('*/cartridge/scripts/util/cloudinaryConstants');

    if (cloudinaryConstants.CLD_REPORTING_LOG_LEVEL === cloudinaryConstants.CLD_REPORTING_LOG_LEVELS.WARN) {
        assetRenameLogger.warn('File size is too large to upload, skipping... file: {0}, size in bytes: {1}', filePath, fileSize);
    } else if (cloudinaryConstants.CLD_REPORTING_LOG_LEVEL === cloudinaryConstants.CLD_REPORTING_LOG_LEVELS.INFO) {
        assetRenameLogger.info('File size is too large to upload, skipping... file: {0}, size in bytes: {1}', filePath, fileSize);
    } else if (cloudinaryConstants.CLD_REPORTING_LOG_LEVEL === cloudinaryConstants.CLD_REPORTING_LOG_LEVELS.DEBUG) {
        assetRenameLogger.debug('File size is too large to upload, skipping... file: {0}, size in bytes: {1}', filePath, fileSize);
    }
};

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
    var cloudinaryUtils = require('*/cartridge/scripts/util/cloudinaryUtils');
    var cloudinaryConstants = require('*/cartridge/scripts/util/cloudinaryConstants');

    var assetPublicID = cldAssetPublicID;
    var cldFolder = cldAssetFolder;
    var fileChangedStatus = false;
    var isIncludeSpecialChars;
    var isProdAsset = isProductAsset;

    if (!empty(assetPublicID)) {
        if (!isProdAsset) {
            assetPublicID = assetPublicID.substring(assetPublicID.lastIndexOf(cloudinaryConstants.FORWARD_SLASH));
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
 * Log asset rename log entries for assets if they include special characters in their path.
 *
 * @param {string} originalFilePath - asset's original path
 * @param {string} changedFilePath - asset's changed path
 *
 */
var logAssetPathChangedMessage = function (originalFilePath, changedFilePath) {
    var cloudinaryConstants = require('*/cartridge/scripts/util/cloudinaryConstants');

    if (cloudinaryConstants.CLD_REPORTING_LOG_LEVEL === cloudinaryConstants.CLD_REPORTING_LOG_LEVELS.WARN) {
        assetRenameLogger.warn('File path changed, original path: {0}, changedPath: {1} ', originalFilePath, changedFilePath);
    } else if (cloudinaryConstants.CLD_REPORTING_LOG_LEVEL === cloudinaryConstants.CLD_REPORTING_LOG_LEVELS.INFO) {
        assetRenameLogger.info('File path changed, original path: {0}, changedPath: {1} ', originalFilePath, changedFilePath);
    } else if (cloudinaryConstants.CLD_REPORTING_LOG_LEVEL === cloudinaryConstants.CLD_REPORTING_LOG_LEVELS.DEBUG) {
        assetRenameLogger.debug('File path changed, original path: {0}, changedPath: {1} ', originalFilePath, changedFilePath);
    }
};

/**
 * This function is used to get CLD rest upload service.
 *
 * @returns {Object} svcArgs - data related to service
 */
var getCldUploadSvcArgs = function () {
    var cloudinaryConstants = require('*/cartridge/scripts/util/cloudinaryConstants');
    var cloudinaryUtils = require('*/cartridge/scripts/util/cloudinaryUtils');
    var svcConfigArgs = {};
    var servicePrefs = cloudinaryUtils.buildUploadServicePrefs(cloudinaryConstants);
    var service = WS.getService(servicePrefs.CLD_UPLOAD_SVC, WS.getServiceConfigs(svcConfigArgs));
    service.setCredentialID(servicePrefs.CLD_UPLOAD_SVC_CRED);
    var svcArgs = {
        cldUploadSvc: service,
        svcConfigArgs: svcConfigArgs,
        servicePrefs: servicePrefs
    };
    return svcArgs;
};

/**
 * Loops over folder/file list recursively and uploads each asset.
 *
 * @param {Object} currentFolder - the current folder
 * @param {Function} assetURLBuildCallback - asset url builder callback function
 * @param {Object} cloudinaryConstants - constants
 * @param {Object} args - Job step args
 * @param {string} lastJobExecutionDate - last execution date
 *
 * @returns {number} - number of assets names changed
*/
var processFolder = function (currentFolder, assetURLBuildCallback, cloudinaryConstants, args, lastJobExecutionDate) {
    var cloudinaryUtils = require('*/cartridge/scripts/util/cloudinaryUtils');

    var asset;
    var assetPublicID;
    var assetOriginalPublicID;
    var changedAssetIds;
    var counter;
    var file;
    var folder = currentFolder;
    var files = folder.listFiles();
    var isAssetUploaded = false;
    var isFileChanged = false;
    var lastJobExecution = new Date(lastJobExecutionDate);
    var metadata = null;
    var svcArgs = getCldUploadSvcArgs();
    var tags = null;

    counter = files.length;
    for (var idx = 0; idx < counter; idx++) {
        file = files[idx];

        // in case of debug mode terminate loop if assets limit exceed
        if (cloudinaryConstants.DEBUG_EXECUTION_MODE.equals(args.CLDJobExecutionMode) && assetsLimit === args.CLDNumberOfAssets) {
            break;
        }

        if (file.isDirectory()) {
            folder = file;
            jobLogger.info('** Processing folder: {0}', folder.getName());
            processFolder(folder, assetURLBuildCallback, cloudinaryConstants, args, lastJobExecutionDate);
        } else if (cloudinaryUtils.validFile(file.getName(), cloudinaryConstants)) {
            jobLogger.info('** Processing file: {0}', file.getName());
            asset = assetURLBuildCallback(file);

            assetPublicID = getAssetRelURL(file.toString());
            // check asset total size limit
            if (file.length() > cloudinaryConstants.ASSET_UPLOAD_SIZE_LIMIT_BYTES) {
                logAssetLargerThanLimitMsg(file.getFullPath(), file.length());
                continue;
            }

            // If this is a delta job, skip files already processed
            if (args.CLDSyncMode === cloudinaryConstants.SYNC_MODE_DELTA) {
                if (file.lastModified() > lastJobExecution) {
                    changedAssetIds = changePublicIdAndCloudFolder(assetPublicID, asset.cloudFolder);
                    assetOriginalPublicID = assetPublicID;
                    assetPublicID = changedAssetIds.assetPublicID;
                    asset.cloudFolder = changedAssetIds.cldFolder;
                    isFileChanged = changedAssetIds.fileChangedStatus;
                    isAssetUploaded = uploadFile(cloudinaryConstants, asset.assetURL, tags, asset.cloudFolder, assetPublicID, metadata, svcArgs);

                    if (isAssetUploaded && isFileChanged) {
                        changedFilesCount++;
                        logAssetPathChangedMessage(assetOriginalPublicID, assetPublicID);
                        isAssetUploaded = false;
                        isFileChanged = false;
                    }
                }
            } else if (cloudinaryConstants.PROD_EXECUTION_MODE.equals(args.CLDJobExecutionMode) || assetsLimit !== args.CLDNumberOfAssets) {
                changedAssetIds = changePublicIdAndCloudFolder(assetPublicID, asset.cloudFolder);
                assetOriginalPublicID = assetPublicID;
                assetPublicID = changedAssetIds.assetPublicID;
                asset.cloudFolder = changedAssetIds.cldFolder;
                isFileChanged = changedAssetIds.fileChangedStatus;
                isAssetUploaded = uploadFile(cloudinaryConstants, asset.assetURL, tags, asset.cloudFolder, assetPublicID, metadata, svcArgs);

                if (isAssetUploaded && isFileChanged) {
                    changedFilesCount++;
                    logAssetPathChangedMessage(assetOriginalPublicID, assetPublicID);
                    isAssetUploaded = false;
                    isFileChanged = false;
                }
            } else {
                // terminate recursive call
                return changedFilesCount;
            }
            // in case of debug mode terminate loop if assets limit exceed
            if (cloudinaryConstants.DEBUG_EXECUTION_MODE.equals(args.CLDJobExecutionMode)) {
                assetsLimit++;
            }
        }
    }

    return changedFilesCount;
};

/**
* Send email notification when files name changed.
*
* @param {string} fromEmail - from email
* @param {string} toEmail - to email
* @param {string} subject - email subject
* @param {number} filesCount - number of files changed
*
*/
var sendChangedFilesEmail = function (fromEmail, toEmail, subject, filesCount) {
    var HashMap = require('dw/util/HashMap');
    var Mail = require('dw/net/Mail');
    var Template = require('dw/util/Template');

    var context;
    var content;
    var email;
    var template;

    try {
        if (!empty(toEmail) && filesCount > 0) {
            context = new HashMap();
            context.put('changedFilesCount', filesCount);

            template = new Template('email/cldFilesChangedEmail.isml');
            content = template.render(context).text;

            email = new Mail();

            email.addTo(toEmail);
            email.setSubject(subject);
            email.setFrom(fromEmail);
            email.setContent(content, 'text/html', 'UTF-8');
            email.send();
        }
    } catch (ex) {
        jobLogger.error('Error occured while sending files changed email during asset upload job, message: {1} ', ex);
    }
};

module.exports = {
    isStepDisabled: isStepDisabled,
    buildLibraryAssetURL: buildLibraryAssetURL,
    buildCatalogAssetURL: buildCatalogAssetURL,
    uploadFile: uploadFile,
    getAssetRelURL: getAssetRelURL,
    logAssetLargerThanLimitMsg: logAssetLargerThanLimitMsg,
    changePublicIdAndCloudFolder: changePublicIdAndCloudFolder,
    logAssetPathChangedMessage: logAssetPathChangedMessage,
    processFolder: processFolder,
    sendChangedFilesEmail: sendChangedFilesEmail,
    getCldUploadSvcArgs: getCldUploadSvcArgs
};
