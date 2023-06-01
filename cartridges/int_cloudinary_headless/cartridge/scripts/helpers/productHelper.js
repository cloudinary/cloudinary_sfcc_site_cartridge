'use strict';

var cloudinaryAPI = require('*/cartridge/scripts/api/cloudinaryApi');
var cloudinaryConstants = require('*/cartridge/scripts/util/cloudinaryConstants');
var cloudinaryHelper = require('*/cartridge/scripts/helpers/cloudinaryHelpers');
var Logger = require('dw/system/Logger');

/**
* Used to get product swatch images from Cloudinary on productDetails hook
*
* @param {Object} doc - doc returned from hook
* @param {Object} product - product
*
* @returns {array} -swatchURLObjs
*/
function getPdpSwatches(doc, product) {
    var cldSwatch = [];
    try {
        var swatchURLObjs = [];
        var swatchURLObj;
        var variationAttrID;
        var variationAttrValueID;
        var productID;
        var variantID;
        productID = doc.id;
        var variationArray = doc.variationAttributes.length > 0 ? doc.variationAttributes.toArray() : null;

        if (!empty(variationArray)) {
            variationArray.some(function (variationAttr) { // eslint-disable-line
                variationAttrID = variationAttr.id;
                // only consider color attribute for swatch images
                if (cloudinaryConstants.COLOR_ATTR.equals(variationAttrID) && !empty(variationAttr.values)) {
                    var variationAttrArray = variationAttr.values.toArray();
                    variationAttrArray.forEach(function (attributeValue) {
                        // check if swatch image exists in SFCC
                        variationAttrValueID = attributeValue.value;

                        if (cloudinaryConstants.CLD_CARTRIDGE_OPERATION_MODE === cloudinaryConstants.CLD_GET_ASSETS_BY_TAG_NAME_MODE) {
                            if (product.variant) {
                                productID = product.masterProduct.ID;
                            }
                            swatchURLObj = cloudinaryAPI.getProductPrimaryImageURLUsingTagName(productID, {
                                pageType: cloudinaryConstants.PAGE_TYPES.CLD_PDP_SWATCH,
                                isSwatch: true,
                                variationAttrValueID: variationAttrValueID
                            });
                        } else if (cloudinaryConstants.CLD_CARTRIDGE_OPERATION_MODE === cloudinaryConstants.CLD_GET_ASSETS_BY_VIEW_TYPE_MODE) {
                            variantID = cloudinaryHelper.getVariantProductIDByColor(productID, variationAttrValueID);
                            productID = !empty(variantID) ? variantID : productID;
                            swatchURLObjs = cloudinaryAPI.getProductImagesByViewType(productID, cloudinaryConstants.CLD_SWATCH_IMAGES_VIEW_TYPE, cloudinaryConstants.PAGE_TYPES.CLD_PDP_SWATCH);
                            swatchURLObj = swatchURLObjs.length > 0 ? swatchURLObjs[0] : swatchURLObj;
                        } else if (cloudinaryConstants.CLD_CARTRIDGE_OPERATION_MODE === cloudinaryConstants.CLD_GET_ASSETS_BY_AUTO_UPLOAD_MODE) {
                            variantID = cloudinaryHelper.getVariantProductIDByColor(productID, variationAttrValueID);
                            productID = !empty(variantID) ? variantID : productID;
                            swatchURLObjs = cloudinaryAPI.getProductImagesByAutoupload(productID, cloudinaryConstants.PAGE_TYPES.CLD_PDP_SWATCH, cloudinaryConstants.CLD_SWATCH_IMAGES_VIEW_TYPE);
                            swatchURLObj = swatchURLObjs.length > 0 ? swatchURLObjs[0] : swatchURLObj;
                        }

                        if (!empty(swatchURLObj)) {
                            cldSwatch.push({
                                variationAttrValueID: variationAttrValueID,
                                cldUrl: swatchURLObj.url
                            }); // eslint-disable-line
                        }
                    });
                }
            });
        }
    } catch (ex) {
        Logger.error('producthelper~getPdpSwatches -> There is an error while executing the file {0} at: line number {1}: {2}', ex.fileName, ex.lineNumber, ex.toString());
    }
    return cldSwatch;
}

module.exports.getPdpSwatches = getPdpSwatches;
