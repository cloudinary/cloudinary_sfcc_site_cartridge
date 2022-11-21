'use strict';

var URLUtils = require('dw/web/URLUtils');
var ACTION_ENDPOINT = 'Product-Show';
var IMAGE_SIZE = 'medium';

var cloudinaryConstants = require('*/cartridge/scripts/util/cloudinaryConstants');
var cloudinaryModel = require('*/cartridge/scripts/model/cloudinaryModel');

var productSuggestionsProduct = module.superModule;

/**
 * Get Image URL
 *
 * @param {dw.catalog.Product} product - Suggested product
 * @return {string} - Image URL
 */
function getImageUrl(product) {
    var imageProduct = product;
    if (product.master) {
        imageProduct = product.variationModel.defaultVariant;
    }
    return imageProduct.getImage(IMAGE_SIZE).URL.toString();
}

/**
 * Compile a list of relevant suggested products
 *
 * @param {dw.util.Iterator.<dw.suggest.SuggestedProduct>} suggestedProducts - Iterator to retrieve
 *                                                                             SuggestedProducts
*  @param {number} maxItems - Maximum number of products to retrieve
 * @return {Object[]} - Array of suggested products
 */
function getProducts(suggestedProducts, maxItems) {
    var product = null;
    var products = [];
    var cldProductImg;

    for (var i = 0; i < maxItems; i++) {
        if (suggestedProducts.hasNext()) {
            product = suggestedProducts.next().productSearchHit.product;
            cldProductImg = cloudinaryModel.getProductPrimaryImage(product.ID, cloudinaryConstants.CLD_HIGH_RES_IMAGES_VIEW_TYPE,
                { pageType: cloudinaryConstants.PAGE_TYPES.SEARCH_SUGGESTIONS });

            products.push({
                name: product.name,
                imageUrl: getImageUrl(product),
                url: URLUtils.url(ACTION_ENDPOINT, 'pid', product.ID),
                cloudinaryProductImage: cldProductImg
            });
        }
    }

    return products;
}

/**
 * @constructor
 * @classdesc ProductSuggestions class
 *
 * @param {dw.suggest.SuggestModel} suggestions - Suggest Model
 * @param {number} maxItems - Maximum number of items to retrieve
 */
function ProductSuggestions(suggestions, maxItems) {
    productSuggestionsProduct.call(this, suggestions, maxItems);

    if (cloudinaryConstants.CLD_ENABLED) {
        // calling this method again since base model doesn't return product id
        // and it's mandatory to load cloudinary product primary image
        if (cloudinaryConstants.CLD_IMAGE_PAGE_TYPE_SETTINGS_OBJECT.searchSuggestions.enabled) {   // added logic for pageType settings cloudinary
            var products = getProducts(suggestions.productSuggestions.suggestedProducts, maxItems);
            this.products = products;
        }
    }
}

module.exports = ProductSuggestions;
