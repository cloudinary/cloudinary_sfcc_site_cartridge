'use strict';

/**
 * Escapes a value to be used inside double quotes of a Cloudinary search expression.
 *
 * @param {string} value - value to escape
 *
 * @returns {string} escaped value
 */
function escapeSearchValue(value) {
    return String(value).replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\*/g, '\\*');
}

/**
 * Searches Cloudinary for the assets of the given products and view type, grouped by the sfcc-product-identifier metadata.
 *
 * @param {Object} args - service arguments
 * @param {Array} productIdentifiers - values of the sfcc-product-identifier metadata
 * @param {string} viewType - value of the sfcc-view-type metadata
 *
 * @returns {Object|null} assets found keyed by product identifier, or null if the search failed
 */
function searchAssetsByProducts(args, productIdentifiers, viewType) {
    var logger = require('dw/system/Logger').getLogger('Cloudinary', 'UPLOAD');
    var cloudinaryConstants = require('~/cartridge/scripts/util/cloudinaryConstants');

    var prefs = args.servicePrefs;
    var service = args.cldUploadSvc;
    var assetsByProduct = {};
    var nextCursor = null;
    var products = productIdentifiers.join(', ');
    var productsExpression = productIdentifiers.map(function (productIdentifier) {
        return 'metadata.' + cloudinaryConstants.SFCC_PRODUCT_IDENTIFIER + '="' + escapeSearchValue(productIdentifier) + '"';
    }).join(' OR ');
    var expression = 'metadata.' + cloudinaryConstants.SFCC_VIEW_TYPE + '="' + escapeSearchValue(viewType) + '" AND (' + productsExpression + ')';

    try {
        do {
            var payload = { expression: expression, max_results: 500, with_field: ['metadata'] };
            if (nextCursor) {
                payload.next_cursor = nextCursor;
            }

            args.method = prefs.POST_METHOD;
            args.endPoint = prefs.CLD_CLOUDNAME + prefs.FORWARD_SLASH + 'resources/search';

            var result = service.call(payload);
            if (!result.ok || result.error !== 0) {
                logger.error('Error searching assets of products {0}, message: {1}', products, result.errorMessage);
                return null;
            }

            var resources = result.object.resources;
            for (var idx = 0; idx < resources.length; idx++) {
                var resource = resources[idx];
                if (empty(resource.metadata)) {
                    logger.error('Structured metadata is not returned by the Cloudinary search of products {0}, skipping stale asset cleanup', products);
                    return null;
                }

                var productIdentifier = resource.metadata[cloudinaryConstants.SFCC_PRODUCT_IDENTIFIER];
                if (resource.type === 'upload' && !empty(productIdentifier)) {
                    assetsByProduct[productIdentifier] = assetsByProduct[productIdentifier] || [];
                    assetsByProduct[productIdentifier].push({ publicId: resource.public_id, resourceType: resource.resource_type });
                }
            }
            nextCursor = result.object.next_cursor;
        } while (nextCursor);
    } catch (e) {
        logger.error('Error searching assets of products {0}, message: {1}', products, e.message);
        return null;
    }

    return assetsByProduct;
}

/**
 * Deletes the given assets from Cloudinary.
 *
 * @param {Object} args - service arguments
 * @param {Array} assets - assets to delete, each holding publicId and resourceType
 */
function deleteAssets(args, assets) {
    var logger = require('dw/system/Logger').getLogger('Cloudinary', 'UPLOAD');

    var prefs = args.servicePrefs;
    var service = args.cldUploadSvc;
    var batchSize = 100;
    var idsByType = {};

    assets.forEach(function (asset) {
        idsByType[asset.resourceType] = idsByType[asset.resourceType] || [];
        idsByType[asset.resourceType].push(asset.publicId);
    });

    Object.keys(idsByType).forEach(function (resourceType) {
        var allPublicIds = idsByType[resourceType];
        for (var start = 0; start < allPublicIds.length; start += batchSize) {
            var publicIds = allPublicIds.slice(start, start + batchSize);
            try {
                var query = publicIds.map(function (publicId) {
                    return 'public_ids[]=' + encodeURIComponent(publicId);
                }).join('&');

                args.method = 'DELETE';
                args.endPoint = prefs.CLD_CLOUDNAME + prefs.FORWARD_SLASH + 'resources/' + resourceType + '/upload?' + query + '&invalidate=true';

                var result = service.call();
                if (result.ok && result.error === 0) {
                    logger.info('Deleted stale {0} assets from Cloudinary: {1}', resourceType, JSON.stringify(result.object.deleted));
                } else {
                    logger.error('Error deleting stale {0} assets: {1}, message: {2}', resourceType, publicIds.join(', '), result.errorMessage);
                }
            } catch (e) {
                logger.error('Error deleting stale {0} assets: {1}, message: {2}', resourceType, publicIds.join(', '), e.message);
            }
        }
    });
}

module.exports = {
    searchAssetsByProducts: searchAssetsByProducts,
    deleteAssets: deleteAssets
};
