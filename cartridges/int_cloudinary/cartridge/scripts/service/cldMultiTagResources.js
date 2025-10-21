'use strict';

/**
 * This method uses the service to get all resources based on tags.
 *
 * @param {Object} args - any arguments passed
 *
 * @returns {string} result - The API service response (JSON)
 */
function multiTagResourcesFromCld(args) {
    var cldWebService = require('*/cartridge/scripts/service/cldWebService');
    var logger = require('dw/system/Logger').getLogger('Cloudinary', 'UPLOAD');
    var cloudinaryConstants = require('*/cartridge/scripts/util/cloudinaryConstants');

    var cldResponse = { ok: true, message: '', result: {} };
    var configArgs = {};
    var result = [];

    configArgs.method = 'POST';
    configArgs.endPoint = args.multiTagsQuery + cloudinaryConstants.JSON_EXTENSION;

    var service = cldWebService.getService(cloudinaryConstants.CLD_MULTI_TAGS_SVC, cldWebService.getServiceConfigs(configArgs));
    
    try {
        result = service.call();
        if (result.ok && result.error === 0) {
            cldResponse.ok = true;
            cldResponse.message = 'cloudinary resources retrieved successfully.';
            cldResponse.result = result.object;
        } else {
            if (result.error === cloudinaryConstants.ERROR_CODES.UNAUTHORIZED) {
                logger.error('Error occurred while connecting to the service due to invalid credentials, message: {0}', result.errorMessage);
            } else {
                logger.error('Error occurred while retrieving resources from cloudinary for tag : {0}, message: {1}', args.tag, result.errorMessage);
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
 * @param {string} multiTagsQuery - multi tags query
 *
 * @returns {Object} cldResources - object holding array of resources
 */
function multiTagResources(multiTagsQuery) {
    var logger = require('dw/system/Logger').getLogger('Cloudinary', 'UPLOAD');
    var cloudinaryConstants = require('*/cartridge/scripts/util/cloudinaryConstants');

    var cldResources;
    if (!empty(multiTagsQuery)) {
        try {
            var cldResponse = multiTagResourcesFromCld({ multiTagsQuery: multiTagsQuery });
            if (cldResponse.ok) {
                cldResources = cldResponse.result.resources;
            }
        } catch (e) {
            logger.error(cloudinaryConstants.CLD_GENERAL_ERROR + e.message);
        }
    } else {
        logger.error('Missing multi tags query, skipping call to cloudinary Multi tag API to fetch resources.');
    }
    return cldResources;
}

/*
* Module exposed methods
*/
module.exports = {
    multiTagResources: multiTagResources
};
