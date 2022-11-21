'use strict';

/* API Includes */
var cldWebService = require('*/cartridge/scripts/service/cldWebService');
var logger = require('dw/system/Logger').getLogger('Cloudinary', 'UPLOAD');

/* Script Includes */
var cloudinaryConstants = require('*/cartridge/scripts/util/cloudinaryConstants');

/**
 * This method uses the service to get all resources based on tags.
 *
 * @param {Object} args - any arguments passed
 *
 * @returns {string} result - The API service response (JSON)
 */
function searchResourcesFromCld(args) {
    var cldResponse = { ok: true, message: '', result: { } };
    var configArgs = {};
    var result = [];
    var withField = !empty(args.withFields) ? args.withFields : ['tags', 'metadata'];
    var requestObj = {
        expression: args.tagsSearchQuery,
        with_field: withField
    };

    configArgs.method = 'POST';

    var service = cldWebService.getService(cloudinaryConstants.CLD_SEARCH_SVC, cldWebService.getServiceConfigs(configArgs));

    try {
        result = service.call(requestObj);
        if (result.ok && result.error === 0) {
            cldResponse.ok = true;
            cldResponse.message = 'cloudinary resources retrieved successfully.';
            cldResponse.result = result.object;
        } else {
            if (result.error === cloudinaryConstants.ERROR_CODES.UNAUTHORIZED) {
                logger.error('Error occurred while connecting to the service due to invalid credentials, message: {0}', result.errorMessage);
            } else {
                logger.error('Error occured while retrieving resources from cloudinary for tag : {0}, message: {1}', args.tag, result.errorMessage);
            }
            cldResponse.ok = false;
            cldResponse.message = result.errorMessage;
        }
    } catch (e) {
        logger.error(cloudinaryConstants.CLD_GENERAL_ERROR + e.message);
        cldResponse.ok = false;
        cldResponse.message = e.message;
    }
    return cldResponse;
}

/**
 * This method calls internal service method to fetch resources based on tag names query
 * @param {string} tagsSearchQuery - tags search query
 * @param {List} withFields - fields which will be returned with assets
 *
 * @returns {Object} cldResources - object holding array of resources
 */
function searchResources(tagsSearchQuery, withFields) {
    var cldResources;
    if (!empty(tagsSearchQuery)) {
        try {
            var cldResponse = searchResourcesFromCld({ tagsSearchQuery: tagsSearchQuery, withFields: withFields });
            if (cldResponse.ok) {
                cldResources = cldResponse.result.resources;
            }
        } catch (e) {
            logger.error(cloudinaryConstants.CLD_GENERAL_ERROR + e.message);
        }
    } else {
        logger.error('Missing tags search query, skipping call to cloudinary Search API to fetch resources.');
    }
    return cldResources;
}

/*
* Module exposed methods
*/
module.exports = {
    searchResources: searchResources
};
