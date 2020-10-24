'use strict';

// API includes
var jobLogger = require('dw/system').Logger.getLogger('Cloudinary', 'UPLOAD');
var HashMap = require('dw/util/HashMap');
var Status = require('dw/system/Status');

var changedFilesCount = 0;

/**
 * Build tags for asset based on product attributes.
 *
 * @param {Product} masterProduct - the DW master product object (optional)
 * @param {Product} product - the DW product object
 * @param {string} viewType - view type for images
 *
 * @returns {array} - tags array
*/
var buildTags = function (masterProduct, product, viewType) {
    var cloudinaryConstants = require('*/cartridge/scripts/util/cloudinaryConstants');
    var cloudinaryHelper = require('*/cartridge/scripts/helpers/cloudinaryHelpers');

    var productVariationAttrValueId;
    var tagName;
    var tags = [];

    try {
        if (cloudinaryConstants.CLD_HIGH_RES_IMAGES_VIEW_TYPE.equalsIgnoreCase(viewType) || cloudinaryConstants.VIDEO_VIEW_TYPE.equalsIgnoreCase(viewType) ||
            cloudinaryConstants.CLD_SWATCH_IMAGES_VIEW_TYPE.equalsIgnoreCase(viewType)) {
            if (!empty(viewType)) { tags.push(viewType); }
            if (!empty(product)) {
                if (product.variant) {
                    tagName = cloudinaryHelper.getCloudinaryTagName(product.masterProduct);
                    if (!empty(tagName)) {
                        productVariationAttrValueId = cloudinaryHelper.fetchVariationAttrValueId(product.ID, cloudinaryConstants.COLOR_ATTR);
                        // concate color attribute value ID with tagName
                        if (!empty(productVariationAttrValueId)) {
                            if (cloudinaryConstants.CLD_SWATCH_IMAGES_VIEW_TYPE.equalsIgnoreCase(viewType)) {
                                tags.push(tagName + cloudinaryConstants.HYPHEN + productVariationAttrValueId + cloudinaryConstants.HYPHEN + viewType);
                            } else {
                                tags.push(tagName + cloudinaryConstants.HYPHEN + productVariationAttrValueId);
                            }
                        }
                    }
                } else {
                    // in case of bundle or set products
                    tagName = cloudinaryHelper.getCloudinaryTagName(product);
                    if (!empty(tagName)) {
                        if (cloudinaryConstants.CLD_SWATCH_IMAGES_VIEW_TYPE.equalsIgnoreCase(viewType)) {
                            tags.push(tagName + cloudinaryConstants.HYPHEN + viewType);
                        } else {
                            tags.push(tagName);
                        }
                    }
                }

                if (!empty(product.EAN)) { tags.push(product.EAN); }
                if (!empty(product.manufacturerSKU)) { tags.push(product.manufacturerSKU); }
                if (!empty(product.UPC)) { tags.push(product.UPC); }
                if (!empty(product.brand)) { tags.push(product.brand); }
                if (!empty(product.primaryCategory)) { tags.push(product.primaryCategory.ID); }
            }

            if (!empty(masterProduct)) {
                tagName = cloudinaryHelper.getCloudinaryTagName(masterProduct);

                if (!empty(tagName)) {
                    if (!cloudinaryConstants.CLD_SWATCH_IMAGES_VIEW_TYPE.equalsIgnoreCase(viewType)) {
                        tags.push(tagName);
                    }
                }

                if (!empty(masterProduct.EAN)) { tags.push(masterProduct.EAN); }
                if (!empty(masterProduct.manufacturerSKU)) { tags.push(masterProduct.manufacturerSKU); }
                if (!empty(masterProduct.UPC)) { tags.push(masterProduct.UPC); }
                if (!empty(masterProduct.brand)) { tags.push(masterProduct.brand); }
                if (!empty(masterProduct.primaryCategory)) { tags.push(masterProduct.primaryCategory.ID); }
            }
        }
    } catch (e) {
        jobLogger.error('Error occurred while building tags for product with ID : {0}, message: {1}',
             !empty(product) ? product.ID : (!empty(masterProduct) ? masterProduct.ID : ''), e.message);
    }

    return tags;
};

/**
 * Build assets metadata to include while uploading on cloudinary DAM.
 *
 * @param {Product} product - the DW product object
 * @param {integer} assetViewTypePosition - asset's position in viewtype
 * @param {array} metadataFields - metadata fields fetched from cloudinary
 * @param {string} asset - asset's URL
 * @param {string} productTagName - identifier for asset
 * @param {string} viewType - view type
 *
 * @returns {string} - pipe separated metadata fields
*/
var buildAssetMetadata = function (product, assetViewTypePosition, metadataFields, asset, productTagName, viewType) {
    var cloudinaryConstants = require('*/cartridge/scripts/util/cloudinaryConstants');

    var externalIdForTrue;
    var externalIdForFalse;
    var metadataField;
    var metadata = '';

    if (metadataFields) {
        try {
            for (var idx = 0; idx < metadataFields.length; idx++) {
                metadataField = metadataFields[idx];
                if (!empty(metadataField.external_id)) {
                    // external_id is case-sensitive
                    switch (metadataField.external_id) {
                        case cloudinaryConstants.SFCC_PRODUCT_IDENTIFIER:
                            metadata += metadataField.external_id + cloudinaryConstants.EQUAL + (!empty(productTagName) ? productTagName : product.ID) +
                                cloudinaryConstants.PIPE;
                            break;
                        case cloudinaryConstants.SFCC_IS_MAIN:
                            if (cloudinaryConstants.CLD_HIGH_RES_IMAGES_VIEW_TYPE.equalsIgnoreCase(viewType) || cloudinaryConstants.VIDEO_VIEW_TYPE.equalsIgnoreCase(viewType) ||
                                cloudinaryConstants.CLD_SWATCH_IMAGES_VIEW_TYPE.equalsIgnoreCase(viewType)) {
                                // fetch external IDs for metadata values i.e. True & False
                                if (metadataField.datasource && metadataField.datasource.values) {
                                    metadataField.datasource.values.forEach(function (metadataValue) {
                                        if (cloudinaryConstants.TRUE.equals(metadataValue.value)) {
                                            externalIdForTrue = metadataValue.external_id;
                                        } else if (cloudinaryConstants.FALSE.equals(metadataValue.value)) {
                                            externalIdForFalse = metadataValue.external_id;
                                        }
                                    });
                                    if (!empty(externalIdForTrue) && !empty(externalIdForFalse)) {
                                        metadata += metadataField.external_id + cloudinaryConstants.EQUAL + (assetViewTypePosition === 0 ? externalIdForTrue : externalIdForFalse)
                                            + cloudinaryConstants.PIPE;
                                    } else {
                                        jobLogger.debug('No external IDs found for {0} metadata values {1} or {2}', cloudinaryConstants.SFCC_IS_MAIN,
                                            cloudinaryConstants.TRUE, cloudinaryConstants.FALSE);
                                    }
                                } else {
                                    jobLogger.debug('No datasource values present for metadata key {0} ', cloudinaryConstants.SFCC_IS_MAIN);
                                }
                            }
                            break;
                        case cloudinaryConstants.SFCC_GALLERY_POSITION:
                            // (assetViewTypePosition + 1) because asset position starts from 0th index
                            metadata += metadataField.external_id + cloudinaryConstants.EQUAL + (assetViewTypePosition + 1) + cloudinaryConstants.PIPE;
                            break;
                        case cloudinaryConstants.SFCC_PRODUCT_NAME:
                            if (!empty(product.name)) {
                                metadata += metadataField.external_id + cloudinaryConstants.EQUAL + product.name + cloudinaryConstants.PIPE;
                            }
                            break;
                        case cloudinaryConstants.SFCC_PRODUCT_BRAND:
                            if (!empty(product.brand)) {
                                metadata += metadataField.external_id + cloudinaryConstants.EQUAL + product.brand + cloudinaryConstants.PIPE;
                            }
                            break;
                        case cloudinaryConstants.SFCC_VIEW_TYPE:
                            if (!empty(viewType)) {
                                metadata += metadataField.external_id + cloudinaryConstants.EQUAL + viewType + cloudinaryConstants.PIPE;
                            }
                            break;
                        default:
                            break;
                    }
                }
            }
        } catch (e) {
            jobLogger.error('Error occurred while building metadata for assset {0}, message: {1}', asset, e.message);
        }
    }

    return metadata;
};

/**
 * Process variant products for a master product, fetch images, assign metadata and tags.
 *
 * @param {Product} masterProduct - the DW master product object (optional)
 * @param {array} masterProdImages - master product images
 * @param {array} metadataFields - cloudinary metadata feilds
 * @param {Object} args - job step params
 * @param {number} cldAssetsLimitCount - assets limit count
 *
 * @returns {Object} - map object holding product assets
*/
var processVariants = function (masterProduct, masterProdImages, metadataFields, args, cldAssetsLimitCount) {
    var cloudinaryConstants = require('*/cartridge/scripts/util/cloudinaryConstants');
    var cloudinaryHelper = require('*/cartridge/scripts/helpers/cloudinaryHelpers');

    var assetsLimit = args.CLDNumberOfAssets || 0;
    var assetsLimitCount = cldAssetsLimitCount;
    var existingTags;
    var isAlreadyPresent = false;
    var isMasterImg = false;
    var image;
    var imageAbsURL;
    var imagesWithMetadata = new HashMap();
    var masterProductImages = masterProdImages;
    var productIdentifier;
    var productMetaData;
    var viewType = args.CLDViewType;
    var variants;
    var variantProduct;
    var variantProductImages;
    var variantProductImg;

    try {
        productIdentifier = cloudinaryHelper.getCloudinaryTagName(masterProduct);
        // add master product images into map
        if (masterProductImages) {
            masterProductImages = masterProductImages.toArray();
            for (var index = 0; index < masterProductImages.length; index++) {
                if (args.CLDJobExecutionMode === cloudinaryConstants.DEBUG_EXECUTION_MODE && assetsLimitCount === assetsLimit) {
                    break;
                }

                image = masterProductImages[index];
                productMetaData = {};
                imageAbsURL = image.getAbsURL().toString();

                // check in case of same images
                isAlreadyPresent = imagesWithMetadata.containsKey(imageAbsURL);
                if (!isAlreadyPresent) {
                    productMetaData.metadata = buildAssetMetadata(masterProduct, index, metadataFields, image, productIdentifier, viewType);
                    productMetaData.tags = buildTags(masterProduct, null, viewType).join();
                    imagesWithMetadata.put(imageAbsURL, productMetaData);
                    if (args.CLDJobExecutionMode === cloudinaryConstants.DEBUG_EXECUTION_MODE) {
                        assetsLimitCount++;
                    }
                }
            }

            isAlreadyPresent = false;
            existingTags = null;
        }

        variants = masterProduct.getVariants().iterator();

        while (variants.hasNext()) {
            try {
                variantProduct = variants.next();
                variantProductImages = variantProduct.getImages(viewType);

                if (!empty(variantProductImages) && variantProductImages.length > 0) {
                    for (var idx = 0; idx < variantProductImages.length; idx++) {
                        try {
                            if (args.CLDJobExecutionMode === cloudinaryConstants.DEBUG_EXECUTION_MODE && assetsLimitCount === assetsLimit) {
                                break;
                            }

                            productMetaData = {};
                            variantProductImg = variantProductImages[idx];
                            imageAbsURL = variantProductImg.getAbsURL().toString();

                            productMetaData.metadata = buildAssetMetadata(masterProduct, idx, metadataFields, variantProductImg, productIdentifier, viewType);
                            if (masterProductImages && masterProductImages.length > 0) {
                                if (!Array.isArray(masterProductImages)) {
                                    masterProductImages = masterProductImages.toArray();
                                }
                                isMasterImg = masterProductImages.filter(function (asset) { return asset.absURL.toString() === imageAbsURL; }).length > 0;
                            }

                            isAlreadyPresent = imagesWithMetadata.containsKey(imageAbsURL);

                            if (isMasterImg) {
                                jobLogger.debug('variant product with ID {0} has master product image, URL: {1}', variantProduct.ID, imageAbsURL);
                                productMetaData.tags = buildTags(masterProduct, variantProduct, viewType).join();
                            } else {
                                jobLogger.debug('variant product with ID {0} has its own image, URL: {1}', variantProduct.ID, imageAbsURL);
                                productMetaData.tags = buildTags(null, variantProduct, viewType).join();
                            }

                            // if duplicate then update tags
                            if (isAlreadyPresent) {
                                if (isMasterImg) {
                                    productMetaData.metadata = imagesWithMetadata.get(imageAbsURL).metadata;
                                }

                                if (cloudinaryConstants.CLD_HIGH_RES_IMAGES_VIEW_TYPE.equalsIgnoreCase(viewType) || cloudinaryConstants.VIDEO_VIEW_TYPE.equalsIgnoreCase(viewType) ||
                                    cloudinaryConstants.CLD_SWATCH_IMAGES_VIEW_TYPE.equalsIgnoreCase(viewType)) {
                                    existingTags = imagesWithMetadata.get(imageAbsURL).tags;
                                    productMetaData.tags = productMetaData.tags + cloudinaryConstants.COMMA + existingTags;
                                }
                                imagesWithMetadata.put(imageAbsURL, productMetaData);
                            } else {
                                imagesWithMetadata.put(imageAbsURL, productMetaData);
                            }

                            if (args.CLDJobExecutionMode === cloudinaryConstants.DEBUG_EXECUTION_MODE) {
                                assetsLimitCount++;
                            }
                        } catch (e) {
                            jobLogger.error('Error occurred while processing variant image, URL: {0}, variant ID: {1}, message: {2}', imageAbsURL, variantProduct.ID, e.message);
                            continue;
                        }
                    }
                } else {
                    jobLogger.debug('No images found against variant product with ID {0}', variantProduct.ID);
                }
            } catch (e) {
                jobLogger.error('Error occurred while processing variant with ID : {0}, message: {1}', variantProduct.ID, e.message);
                continue;
            }
        }
    } catch (e) {
        jobLogger.error('Error occurred while processing variants for master product with ID : {0}, message: {1}', masterProduct.ID, e.message);
    }

    return imagesWithMetadata;
};

/**
 * Loops over all products and uploads the images to the Cloudinary DAM
 *
 * @param {Object} args - job arguments
 * @param {Object} products - All products in catalog / Site
 * @param {Object} metadataFields - object holding meta data fields
 * @param {boolean} isSearchHits - flag to indicate if product fetched from search indexes
 */
var doProducts = function (args, products, metadataFields, isSearchHits) {
    var cloudinaryConstants = require('*/cartridge/scripts/util/cloudinaryConstants');
    var cloudinaryUtils = require('*/cartridge/scripts/util/cloudinaryUtils');
    var cloudinaryHelper = require('*/cartridge/scripts/helpers/cloudinaryHelpers');
    var jobStepHelpers = require('*/cartridge/scripts/helpers/jobStepHelpers');

    var assetURL;
    var assetPublicID;
    var assetOriginalPublicID;
    var changedAssetObj;
    var assetsLimitCount = 0;
    var cldFolder;
    var file;
    var isAssetUploaded = false;
    var isFileChanged = false;
    var isProductAsset = true;
    var tags = '';
    var curFileName;
    var assetsLimit = args.CLDNumberOfAssets || 0;
    var metadata;
    var product;
    var productImg;
    var productImages;
    var productTags = [];
    var productTagName = '';

    var svcArgs = jobStepHelpers.getCldUploadSvcArgs();

    while (products.hasNext()) {
        product = isSearchHits ? products.next().product : products.next();
        productImages = product.getImages(args.CLDViewType);

        if (product.isVariant()) {
            continue;
        } else if (product.master) {
            jobLogger.debug('Going to process variants for master product with ID: {0}', product.ID);
            productImages = processVariants(product, productImages, metadataFields, args, assetsLimitCount);

            if (productImages) {
                productImages = productImages.entrySet().iterator();
                while (productImages.hasNext()) {
                    if (args.CLDJobExecutionMode === cloudinaryConstants.DEBUG_EXECUTION_MODE && assetsLimitCount === assetsLimit) {
                        break;
                    }
                    productImg = productImages.next();
                    assetURL = productImg.getKey().toString();
                    tags = productImg.getValue().tags;
                    metadata = productImg.getValue().metadata;
                    jobLogger.debug('Now uploading file: {0}', assetURL.toString());
                    cldFolder = cloudinaryUtils.isVideo(assetURL, cloudinaryConstants)
                        ? cloudinaryConstants.CLD_VIDEO_PATH : cloudinaryConstants.CLD_IMAGE_PATH;

                    // replace special characters in URL
                    assetPublicID = jobStepHelpers.getAssetRelURL(assetURL);
                    assetOriginalPublicID = assetPublicID;

                    changedAssetObj = jobStepHelpers.changePublicIdAndCloudFolder(assetPublicID, cldFolder, isProductAsset);
                    assetPublicID = changedAssetObj.assetPublicID;
                    cldFolder = changedAssetObj.cldFolder;
                    isFileChanged = changedAssetObj.fileChangedStatus;

                    isAssetUploaded = jobStepHelpers.uploadFile(cloudinaryConstants, assetURL, tags, cldFolder, assetPublicID, metadata, svcArgs);

                    if (isAssetUploaded && isFileChanged) {
                        jobStepHelpers.logAssetPathChangedMessage(assetOriginalPublicID, assetPublicID);
                        changedFilesCount++;
                        isAssetUploaded = false;
                        isFileChanged = false;
                    }

                    if (args.CLDJobExecutionMode === cloudinaryConstants.DEBUG_EXECUTION_MODE) {
                        assetsLimitCount++;
                    }
                }
            }
        } else if (!empty(productImages) && productImages.length > 0) {
            productTagName = cloudinaryHelper.getCloudinaryTagName(product);
            jobLogger.debug('Total catalog images: {0}', productImages.length);

            for (var idx = 0; idx < productImages.length; idx++) {
                try {
                    if (args.CLDJobExecutionMode === cloudinaryConstants.DEBUG_EXECUTION_MODE && assetsLimitCount === assetsLimit) {
                        break;
                    }

                    file = productImages[idx];
                    productImg = file.getAbsURL().toString();
                    curFileName = productImg;

                    metadata = buildAssetMetadata(product, idx, metadataFields, productImg, productTagName, args.CLDViewType);
                    productTags = buildTags(null, product, args.CLDViewType, cloudinaryConstants).join();

                    jobLogger.debug('Now uploading file: {0}', productImg);
                    cldFolder = cloudinaryUtils.isVideo(productImg, cloudinaryConstants)
                        ? cloudinaryConstants.CLD_VIDEO_PATH : cloudinaryConstants.CLD_IMAGE_PATH;

                    // replace special characters in URL
                    assetPublicID = jobStepHelpers.getAssetRelURL(productImg);
                    assetOriginalPublicID = assetPublicID;

                    changedAssetObj = jobStepHelpers.changePublicIdAndCloudFolder(assetPublicID, cldFolder, isProductAsset);
                    assetPublicID = changedAssetObj.assetPublicID;
                    cldFolder = changedAssetObj.cldFolder;
                    isFileChanged = changedAssetObj.fileChangedStatus;

                    isAssetUploaded = jobStepHelpers.uploadFile(cloudinaryConstants, productImg, productTags, cldFolder, assetPublicID, metadata, svcArgs);

                    if (isAssetUploaded && isFileChanged) {
                        jobStepHelpers.logAssetPathChangedMessage(assetOriginalPublicID, assetPublicID);
                        changedFilesCount++;
                        isAssetUploaded = false;
                        isFileChanged = false;
                    }
                } catch (err) {
                    /*eslint-disable*/
                    // In an error condition we don't halt but log and continue.
                    jobLogger.error('Error on file: {0}. Message: {1}', curFileName, err);
                    productTags = [];
                    isAssetUploaded = false;
                    isFileChanged = false;
                    continue;
                    /*eslint-enable*/
                }

                if (args.CLDJobExecutionMode === cloudinaryConstants.DEBUG_EXECUTION_MODE) {
                    assetsLimitCount++;
                }
            }
        }

        if (args.CLDJobExecutionMode === cloudinaryConstants.DEBUG_EXECUTION_MODE && assetsLimitCount === assetsLimit) {
            break;
        }

        productTags = [];
    }
};

/**
 * Check if required matadata fields are present or not
 *
 * @param {array} metadataFields - matadata fields fetched from cloudinary
 * @param {string} viewType - view type
 *
 * @returns {boolean} - flag to determine if required matadata fields exists or not
 */
var checkMandatoryMetadataFields = function (metadataFields, viewType) {
    var cloudinaryConstants = require('*/cartridge/scripts/util/cloudinaryConstants');

    var mandatoryFieldsExist = false;
    var mandatoryFieldsCount = 0;

    try {
        var mandatoryField;
        if (metadataFields) {
            for (var idx = 0; idx < metadataFields.length; idx++) {
                mandatoryField = metadataFields[idx];
                if (mandatoryField.external_id.equals(cloudinaryConstants.SFCC_PRODUCT_IDENTIFIER) || mandatoryField.external_id.equals(cloudinaryConstants.SFCC_IS_MAIN)
                    || mandatoryField.external_id.equals(cloudinaryConstants.SFCC_GALLERY_POSITION)) {
                    mandatoryFieldsCount++;
                }
            }
        }
    } catch (e) {
        jobLogger.error('Error occured while checking mandatory metadata fields, message: {0}', e.message);
    }

    if (cloudinaryConstants.CLD_HIGH_RES_IMAGES_VIEW_TYPE.equalsIgnoreCase(viewType) || cloudinaryConstants.VIDEO_VIEW_TYPE.equalsIgnoreCase(viewType) ||
        cloudinaryConstants.CLD_SWATCH_IMAGES_VIEW_TYPE.equalsIgnoreCase(viewType)) {
        if (mandatoryFieldsCount === 3) {
            mandatoryFieldsExist = true;
        }
    } else if (mandatoryFieldsCount >= 2) {
        mandatoryFieldsExist = true;
    }

    return mandatoryFieldsExist;
};

module.exports.Start = function (args) {
    var ProductSearchModel = require('dw/catalog/ProductSearchModel');

    var cloudinaryConstants = require('*/cartridge/scripts/util/cloudinaryConstants');
    var cloudinaryMetadataSvc = require('*/cartridge/scripts/service/cldMetadata');
    var jobStepHelpers = require('*/cartridge/scripts/helpers/jobStepHelpers');

    var allProducts;
    var catalog;
    var catalogs;
    var isSearchHits = false;
    var metadataFields;

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
    var viewType = args.CLDViewType;
    var catalogsToProcess = args.CLDCatalogIds;

    if (!empty(executionMode) && cloudinaryConstants.DEBUG_EXECUTION_MODE.equals(executionMode)) {
        if (empty(numberOfAssets)) {
            return new Status(Status.ERROR, 'ERROR', 'Missing mandatory job parameter "CLDNumberOfAssets" when Debug mode is enabled');
        }
    }

    try {
        // fetch structural metadata feilds from cld DAM
        metadataFields = cloudinaryMetadataSvc.fetchMetadata();
        if (!checkMandatoryMetadataFields(metadataFields, viewType)) {
            jobLogger.error('Missing mandatory structured metadata field/s [sfcc-product-identifier, sfcc-is-main, sfcc-gallery-position] fetched from cloudinary DAM. Terminating job...');
            return new Status(Status.ERROR);
        }

        if (!empty(catalogsToProcess)) {
            var ProductMgr = require('dw/catalog/ProductMgr');
            var CatalogMgr = require('dw/catalog/CatalogMgr');

            catalogs = catalogsToProcess.split(cloudinaryConstants.PIPE);
            for (var cat = 0; cat < catalogs.length; cat++) {
                catalog = catalogs[cat];
                jobLogger.debug('Processing catalog: {0}', catalog);
                allProducts = ProductMgr.queryProductsInCatalog(CatalogMgr.getCatalog(catalog));
                doProducts(args, allProducts, metadataFields, isSearchHits);
            }
        } else {
            var productSearchHitsItr;
            var productSearchModel = new ProductSearchModel();
            isSearchHits = true;
            productSearchModel.setCategoryID('root');
            productSearchModel.setRecursiveCategorySearch(true);
            productSearchModel.search();
            productSearchHitsItr = productSearchModel.getProductSearchHits();
            doProducts(args, productSearchHitsItr, metadataFields, isSearchHits);
        }

        // send email if any file changed
        if (!empty(notificationEmail) && changedFilesCount > 0) {
            var emailSubject = cloudinaryConstants.PRODUCT_ASSETS_NAME_CHANGED_EMAIL_SUBJECT.replace(cloudinaryConstants.CLD_VIEW_TYPE_PLACE_HOLDER, args.CLDViewType);
            jobStepHelpers.sendChangedFilesEmail(cloudinaryConstants.CUSTOMER_SERVICE_EMAIL, notificationEmail,
                emailSubject, changedFilesCount);
        }
    } catch (e) {
        jobLogger.error('Error occured while processing folder/file, message : {0}', e.message);
    }

    return new Status(Status.OK);
};
