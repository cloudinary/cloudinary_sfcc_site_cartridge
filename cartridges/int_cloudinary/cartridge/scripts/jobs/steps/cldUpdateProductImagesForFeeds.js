'use strict';

// API includes
var CatalogMgr = require('dw/catalog/CatalogMgr');
var File = require('dw/io/File');
var FileWriter = require('dw/io/FileWriter');
var ProductSearchModel = require('dw/catalog/ProductSearchModel');
var Status = require('dw/system/Status');
var Site = require('dw/system/Site');
var StringUtils = require('dw/util/StringUtils');
var XMLStreamWriter = require('dw/io/XMLStreamWriter');
var jobLogger = require('dw/system').Logger.getLogger('Cloudinary', 'UPLOAD');


/**
 * Function used to get product search hits
 * @returns {Object} - productSearchHitsItr
 */
function getProductSearchHitIt() {
    var siteRootCategory = CatalogMgr.getSiteCatalog().getRoot();
    var productSearchModel = new ProductSearchModel();
    productSearchModel.setCategoryID(siteRootCategory.ID);
    productSearchModel.setRecursiveCategorySearch(true);
    productSearchModel.setOrderableProductsOnly(true);
    productSearchModel.search();
    var productSearchHitsItr = productSearchModel.getProductSearchHits();
    return productSearchHitsItr;
}

/**
 * Write catalog header
 * @param {dw.io.XMLStreamWriter} cloudinaryUrlStreamWriter - The file writer to write the file
 * @param {string} siteRootCategory - The siteRootCategory
 * @returns {void}
 */
function writeCatalogHeader(cloudinaryUrlStreamWriter, siteRootCategory) {
    var mainTag = '?xml version="1.0" encoding="UTF-8"?';
    cloudinaryUrlStreamWriter.writeStartElement(mainTag);
    cloudinaryUrlStreamWriter.writeCharacters('\n');
    cloudinaryUrlStreamWriter.writeStartElement('catalog');
    cloudinaryUrlStreamWriter.writeAttribute('xmlns', 'http://www.demandware.com/xml/impex/catalog/2006-10-31');
    cloudinaryUrlStreamWriter.writeAttribute('catalog-id', siteRootCategory);
}

/**
* Product Images Urls Content
* @param {dw.io.XMLStreamWriter} cloudinaryUrlStreamWriter - The file writer to write the file
* @param {Object} productSearchHitsItr - The productSearchHitsItr
* @param {JSON} params - The parameters
* @returns {void}
*/
function writeProductFileContent(cloudinaryUrlStreamWriter, productSearchHitsItr, params) {
    var cloudinaryConstants = require('*/cartridge/scripts/util/cloudinaryConstants');
    var cldFetchResourcesSvc = require('*/cartridge/scripts/service/cldFetchResources');
    var cloudinaryHelper = require('*/cartridge/scripts/helpers/cloudinaryHelpers');
    var imgAssets;
    var imgAssetsSorted = {};
    var lastJobExecution = new Date(params.jobLastExecutionTime);
    var numberOfProcessedProducts = 0;
    var product;
    var productID;
    var variantsID;
    var colorAttrValueID;
    var sfccAltText;
    var imgVariantsUnSorted;
    var imgVariantsSorted = {};
    var variantTag;
    var clrAttrArray = [];

    try {
        while (productSearchHitsItr.hasNext()) {
            if (params.executionMode === cloudinaryConstants.DEBUG_EXECUTION_MODE && !empty(params.numberOfAssets) && numberOfProcessedProducts >= params.numberOfAssets) {
                break;
            }
            product = productSearchHitsItr.next().product;
            productID = product.ID;

            imgAssets = cldFetchResourcesSvc.fetchResourcesWithModifiedDate(productID, cloudinaryConstants.CLD_IMAGE_RESOURCE_TYPE);
            imgAssetsSorted.resources = cloudinaryHelper.sortResourcesByAssetPosition(imgAssets.resources);
            imgAssetsSorted.updatedAt = imgAssets.updatedAt;
            if (!empty(imgAssetsSorted) && !empty(imgAssetsSorted.resources) && imgAssetsSorted.resources.length > 0 && !empty(params.jobLastExecutionTime) && new Date(imgAssetsSorted.updatedAt) >= lastJobExecution) {
                cloudinaryUrlStreamWriter.writeStartElement('product');
                cloudinaryUrlStreamWriter.writeAttribute('product-id', product.ID);
                if (params.enableUrlOverride) {
                    cloudinaryUrlStreamWriter.writeStartElement('images');
                    cloudinaryUrlStreamWriter.writeStartElement('image-group');
                    cloudinaryUrlStreamWriter.writeAttribute('view-type', params.viewType);

                    for (let imgResource of imgAssetsSorted.resources) {
                        cloudinaryUrlStreamWriter.writeStartElement('image');
                        cloudinaryUrlStreamWriter.writeAttribute('path', imgResource.public_id);
                        cloudinaryUrlStreamWriter.writeEndElement();
                        cloudinaryUrlStreamWriter.writeCharacters('\n');
                    }
                    cloudinaryUrlStreamWriter.writeEndElement();
                    cloudinaryUrlStreamWriter.writeCharacters('\n');

                    var variants = product.variants.iterator();
                    while (variants.hasNext()) {
                        var variant = variants.next();
                        variantsID = variant.ID;
                        colorAttrValueID = cloudinaryHelper.fetchVariationAttrValueId(variantsID, cloudinaryConstants.COLOR_ATTR);

                        variantTag = productID + cloudinaryConstants.HYPHEN + colorAttrValueID;

                        if (clrAttrArray.includes(variantTag)) {
                            continue;
                        }
                        clrAttrArray.push(variantTag);

                        imgVariantsUnSorted = cldFetchResourcesSvc.fetchResourcesWithModifiedDate(variantTag, cloudinaryConstants.CLD_IMAGE_RESOURCE_TYPE);
                        imgVariantsSorted.resources = cloudinaryHelper.sortResourcesByAssetPosition(imgVariantsUnSorted.resources);
                        imgVariantsSorted.updatedAt = imgAssets.updatedAt;

                        cloudinaryUrlStreamWriter.writeStartElement('image-group');
                        cloudinaryUrlStreamWriter.writeAttribute('view-type', params.viewType);

                        cloudinaryUrlStreamWriter.writeStartElement('variation');
                        cloudinaryUrlStreamWriter.writeAttribute('attribute-id', 'color');
                        cloudinaryUrlStreamWriter.writeAttribute('value', colorAttrValueID);
                        cloudinaryUrlStreamWriter.writeEndElement();

                        for (let imgResources of imgVariantsSorted.resources) {
                            cloudinaryUrlStreamWriter.writeStartElement('image');
                            cloudinaryUrlStreamWriter.writeAttribute('path', imgResources.public_id);
                            cloudinaryUrlStreamWriter.writeEndElement();
                            cloudinaryUrlStreamWriter.writeCharacters('\n');
                        }
                        cloudinaryUrlStreamWriter.writeEndElement();
                        cloudinaryUrlStreamWriter.writeCharacters('\n');
                    }
                    cloudinaryUrlStreamWriter.writeEndElement();
                    cloudinaryUrlStreamWriter.writeCharacters('\n');
                }
                if (params.enableAltText) {
                    cloudinaryUrlStreamWriter.writeStartElement('custom-attributes');
                    cloudinaryUrlStreamWriter.writeCharacters('\n');
                    cloudinaryUrlStreamWriter.writeStartElement('custom-attribute');
                    cloudinaryUrlStreamWriter.writeAttribute('attribute-id', 'CLDAltTextForImages');

                    try {
                        sfccAltText = null;
                        var imgAssetsContainer = imgAssetsSorted.resources;

                        for (let imgContainer of imgAssetsContainer) {
                            var isAltText = false;
                            var altText = imgContainer.metadata.filter(function (data) {
                                return data.external_id === cloudinaryConstants.SFCC_ALTTEXT_EXTERNAL_ID;
                            });
                            isAltText = imgContainer.metadata.filter(function (data) {
                                return data.external_id === cloudinaryConstants.SFCC_IS_MAIN && data.value.value === cloudinaryConstants.TRUE;
                            });

                            if (!empty(altText) && altText[0].value && !empty(isAltText) && isAltText[0].value) {
                                sfccAltText = altText[0].value;
                                break;
                            }
                        }
                    } catch (ex) {
                        jobLogger.error('Error occurred while processing folder/file, message : {0}', ex.message);
                    }
                    if (!empty(sfccAltText)) {
                        cloudinaryUrlStreamWriter.writeCharacters(sfccAltText);
                    }
                    cloudinaryUrlStreamWriter.writeEndElement();
                    cloudinaryUrlStreamWriter.writeCharacters('\n');
                    cloudinaryUrlStreamWriter.writeEndElement();
                    cloudinaryUrlStreamWriter.writeCharacters('\n');
                }
                cloudinaryUrlStreamWriter.writeEndElement();
                cloudinaryUrlStreamWriter.writeCharacters('\n');
                cloudinaryUrlStreamWriter.writeCharacters('\n');
                numberOfProcessedProducts++;
            }
        }
    } catch (ex) {
        jobLogger.error('Error occurred while processing folder/file, message : {0}', ex.message);
    }
}

module.exports.Start = function (args) {
    var cloudinaryConstants = require('*/cartridge/scripts/util/cloudinaryConstants');
    var jobStepHelpers = require('*/cartridge/scripts/helpers/jobStepHelpers');
    var sitePrefs = Site.getCurrent().getPreferences();
    var currentSite = Site.getCurrent();
    var Calendar = require('dw/util/Calendar');
    var Transaction = require('dw/system/Transaction');
    var calendar = new Calendar();

    if (!cloudinaryConstants.CLD_ENABLED) {
        return new Status(Status.ERROR, 'ERROR', 'Cloudinary is disabled currently');
    }

    if (jobStepHelpers.isStepDisabled(args)) {
        return new Status(Status.OK, 'OK', 'Step disabled, skip it...');
    }

    // load input Parameters
    var params = {
        numberOfAssets: args.CLDNumberOfAssets,
        executionMode: args.CLDJobExecutionMode,
        viewType: args.CLDViewType,
        catalogID: args.CLDCatalogId,
        CatalogFilePath: args.CLDCatalogFilePath,
        currentExecutionTime: calendar.getTime(),
        jobLastExecutionTime: sitePrefs.getCustom().CLDImportImageAndAltTextjobLastExecutionTime,
        enableUrlOverride: args.CLDEnableURLOverride,
        enableAltText: args.CLDEnableAltText
    };

    try {
        Transaction.wrap(function () {
            currentSite.preferences.custom.CLDImportImageAndAltTextjobLastExecutionTime = params.currentExecutionTime;
        });
        var CLDImportImageAndAltTextjobLastExecutionTime = currentSite.preferences.custom.CLDImportImageAndAltTextjobLastExecutionTime ? currentSite.preferences.custom.CLDImportImageAndAltTextjobLastExecutionTime.toString() : currentSite.preferences.custom.CLDImportImageAndAltTextjobLastExecutionTime;
        if (params.currentExecutionTime.toString() !== CLDImportImageAndAltTextjobLastExecutionTime) {
            jobLogger.warn(' Unable to update the job last execution timestamp in Custom Preferences->Cloudinary Jobs Configurations field: Update Product Feeds Job Last Execution Date : {0}', params.currentExecutionTime.toString());
        }

        var productSearchHitsItr = getProductSearchHitIt();
        // catalog Start
        var CloudinaryFetchUrlsFile = new File(dw.io.File.IMPEX + '/' + params.CatalogFilePath + '/' + Site.getCurrent().ID + '_' + params.catalogID + '_' + StringUtils.formatCalendar(currentSite.getCalendar(), cloudinaryConstants.DATETIME_FORMAT) + '.xml');
        CloudinaryFetchUrlsFile.createNewFile();
        var cloudinaryUrlFileWriter = new FileWriter(CloudinaryFetchUrlsFile, 'UTF-8');
        var cloudinaryUrlStreamWriter = new XMLStreamWriter(cloudinaryUrlFileWriter);

        // Catalog Header
        writeCatalogHeader(cloudinaryUrlStreamWriter, params.catalogID);

        // Product Images Urls Content
        writeProductFileContent(cloudinaryUrlStreamWriter, productSearchHitsItr, params);

        cloudinaryUrlStreamWriter.writeCharacters('\n');
        cloudinaryUrlStreamWriter.writeEndElement();
        cloudinaryUrlStreamWriter.close();
        cloudinaryUrlFileWriter.close();
    } catch (e) {
        jobLogger.error('Error occurred while processing folder/file, message: {0} at: line number {1}', e.message, e.lineNumber);
    }

    return new Status(Status.OK);
};
