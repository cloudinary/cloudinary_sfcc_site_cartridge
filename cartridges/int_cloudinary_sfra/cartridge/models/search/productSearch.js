'use strict';

var cloudinaryConstants = require('*/cartridge/scripts/util/cloudinaryConstants');
var cloudinaryAPI = require('*/cartridge/scripts/api/cloudinaryApi');

var productSearchBase = module.superModule;

/**
 * @constructor
 * @classdesc ProductSearch class
 *
 * @param {dw.catalog.ProductSearchModel} productSearch - Product search object
 * @param {Object} httpParams - HTTP query parameters
 * @param {string} sortingRule - Sorting option rule ID
 * @param {dw.util.ArrayList.<dw.catalog.SortingOption>} sortingOptions - Options to sort search
 *     results
 * @param {dw.catalog.Category} rootCategory - Search result's root category if applicable
 */
function ProductSearch(productSearch, httpParams, sortingRule, sortingOptions, rootCategory) {
    productSearchBase.call(this, productSearch, httpParams, sortingRule, sortingOptions, rootCategory);

    if (cloudinaryConstants.CLD_ENABLED && !empty(this.bannerImageUrl)) {
        if (cloudinaryConstants.CLD_IMAGE_PAGE_TYPE_SETTINGS_OBJECT.categoryBanner.enabled) {
            var cldBannerImage = cloudinaryAPI.getCatalogImageAbsURLFromRelURL(this.bannerImageUrl.toString(), this.category.id,
            cloudinaryConstants.PAGE_TYPES.CATEGORY_BANNER);
            if (!empty(cldBannerImage)) {
                this.cldBannerImage = cldBannerImage;
            }
        }
    }
}

module.exports = ProductSearch;
