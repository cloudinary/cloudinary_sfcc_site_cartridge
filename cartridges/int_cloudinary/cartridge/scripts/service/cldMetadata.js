'use strict';

/* API Includes */
var cldWebService = require('*/cartridge/scripts/service/cldWebService');
var logger = require('dw/system/Logger').getLogger('Cloudinary', 'UPLOAD');

/* Cloudinary Prefs */
var Prefs = require('*/cartridge/scripts/util/cloudinaryConstants');

/**
 * This method uses the service to get metadata fields from cld.
 *
 * @returns {string} result - The API service response (JSON)
 */
function fetchMetadataFromCld() {
    var cldResponse = { ok: true, message: '', result: { } };
    var configArgs = {};
    var result = [];

    configArgs.method = 'GET';
    configArgs.endPoint = Prefs.CLD_CLOUDNAME + '/metadata_fields';

    var service = cldWebService.getService(Prefs.CLD_UPLOAD_SVC, cldWebService.getServiceConfigs(configArgs));
    service.setCredentialID(Prefs.CLD_REST_SERVICE_CREDENTIALS);

    try {
        result = service.call();
        if (result.ok && result.error === 0) {
            cldResponse.ok = true;
            cldResponse.message = 'Metadata fields retrieved successfully.';
            cldResponse.result = result.object;
        } else {
            if (result.error === Prefs.ERROR_CODES.UNAUTHORIZED) {
                logger.error('Error occurred while connecting to the service due to invalid credentials, message: {0}', result.errorMessage);
            } else {
                logger.error('Error occured while retrieving metadata fields from cloudinary');
            }
            cldResponse.ok = false;
            cldResponse.message = result.errorMessage;
        }
    } catch (e) {
        logger.error(Prefs.CLD_GENERAL_ERROR + e.message);
        cldResponse.ok = false;
        cldResponse.message = e.message;
    }
    return cldResponse;
}

/**
 * This method uses to fetch metadata from service response.
 *
 * @returns {Object} metadataFields - The metadata fields
 */
function fetchMetadata() {
    var metadataFields;
    try {
        var cldResponse = fetchMetadataFromCld();
        if (cldResponse.ok) {
            metadataFields = cldResponse.result.metadata_fields;
        }
    } catch (e) {
        logger.error(Prefs.CLD_GENERAL_ERROR + e.message);
    }
    return metadataFields;
}

/*
* Module exposed methods
*/
module.exports = {
    fetchMetadata: fetchMetadata
};
