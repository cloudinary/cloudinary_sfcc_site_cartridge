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
function fetchResourcesFromCld(args) {
    var cldResponse = { ok: true, message: '', result: {} };
    var configArgs = {};
    var result = [];

    configArgs.method = 'GET';
    configArgs.endPoint = args.resourceType + cloudinaryConstants.LIST_RESOURCE_TYPE + args.tag + cloudinaryConstants.JSON_EXTENSION;

    var service = cldWebService.getService(cloudinaryConstants.CLD_LIST_SVC, cldWebService.getServiceConfigs(configArgs));

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
 * This method calls internal service method to fetch resources based on tag name
 * @param {string} tagName - tag name against which need to query resources
 * @param {string} resourceType - type of the resources to fetch
 *
 * @returns {Object} cldResources - object holding array of resources
 */
function fetchResources(tagName, resourceType) {
    var cldResources;
    if (!empty(tagName)) {
        try {
            var cldResponse = fetchResourcesFromCld({ tag: tagName, resourceType: resourceType });
            if (cldResponse.ok) {
                cldResources = cldResponse.result.resources;
            }
        } catch (e) {
            logger.error(cloudinaryConstants.CLD_GENERAL_ERROR + e.message);
        }
    } else {
        logger.error('Missing tag name, skipping call to cloudinary list API to fetch resources.');
    }
    return cldResources;
}

/**
 * This method calls internal service method to fetch resources based on tag name
 * @param {string} tagName - tag name against which need to query resources
 * @param {string} resourceType - type of the resources to fetch
 *
 * @returns {Object} cldResources - object holding array of resources and updated date
 */
function fetchResourcesWithModifiedDate(tagName, resourceType) {
    var cldResources = {
        resources: '',
        updatedAt: ''
    };
    if (!empty(tagName)) {
        try {
            var cldResponse = fetchResourcesFromCld({ tag: tagName, resourceType: resourceType });
            if (cldResponse.ok) {
                cldResources.resources = cldResponse.result.resources;
                cldResources.updatedAt = cldResponse.result.updated_at;
            }
        } catch (e) {
            logger.error(cloudinaryConstants.CLD_GENERAL_ERROR + e.message);
        }
    } else {
        logger.error('Missing tag name, skipping call to cloudinary list API to fetch resources.');
    }
    return cldResources;
}

/*
* Module exposed methods
*/
module.exports = {
    fetchResources: fetchResources,
    fetchResourcesWithModifiedDate: fetchResourcesWithModifiedDate
};
