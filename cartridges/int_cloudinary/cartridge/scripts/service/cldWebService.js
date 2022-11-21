'use strict';

/* API Includes */
var LocalServiceRegistry = require('dw/svc/LocalServiceRegistry');
/* Script Includes */
var cloudinaryConstants = require('*/cartridge/scripts/util/cloudinaryConstants');
var cloudinaryConstant = require('*/cartridge/scripts/util/cloudinaryConstant');
/**
* Create and configure service.
*
* @param {string} serviceID - The service ID
* @param {Object} serviceConfig - The service configuration object
*
* @returns {Service} - The configured service
*/
function getService(serviceID, serviceConfig) {
    var cldWebService = LocalServiceRegistry.createService(serviceID, serviceConfig);
    return cldWebService;
}

/**
 * Service configurations
 *
 * @param {string} args - Any arguments
 * @returns {Object} - The service configuration
 */
function getServiceConfigs(args) {
    var serviceConfig = {
        createRequest: function (svc, requestPayload) {
            var credential = svc.getConfiguration().getCredential();
            var cldTrackingParam = cloudinaryConstants.API_TRACKING_PARAM.replace(cloudinaryConstants.CLD_TRACKING_PARAM_PLATFORM_PLACEHOLDER, cloudinaryConstant.CLD_SFCC_PLATFORM_ARCHITECTURE);
            var url = credential.getURL();

            if (url.lastIndexOf(cloudinaryConstants.FORWARD_SLASH) !== (url.length - 1)) {
                url += cloudinaryConstants.FORWARD_SLASH;
            }

            // add cloud name if placeholder [cloudname] is present
            if (url.indexOf(cloudinaryConstants.CLD_LIST_SERVICE_CLOUDNAME_PLACEHOLDER) > -1) {
                url = url.replace(cloudinaryConstants.CLD_LIST_SERVICE_CLOUDNAME_PLACEHOLDER, cloudinaryConstants.CLD_CLOUDNAME);
            }

            // add api key if placeholder [apikey] is present
            if (url.indexOf(cloudinaryConstants.CLD_LIST_SERVICE_API_KEY_PLACEHOLDER) > -1) {
                url = url.replace(cloudinaryConstants.CLD_LIST_SERVICE_API_KEY_PLACEHOLDER, cloudinaryConstants.CLD_APIKEY);
            }

            // add api secret if placeholder [apisecret] is present
            if (url.indexOf(cloudinaryConstants.CLD_LIST_SERVICE_API_SECRET_PLACEHOLDER) > -1) {
                url = url.replace(cloudinaryConstants.CLD_LIST_SERVICE_API_SECRET_PLACEHOLDER, cloudinaryConstants.CLD_APISECRET);
            }

            if (!empty(args.endPoint)) {
                url += args.endPoint;
            }

            svc.setURL(url);
            svc.setRequestMethod(args.method);
            svc.setAuthentication('BASIC');
            svc.setEncoding('UTF-8');
            svc.addHeader('Content-Type', 'application/json');
            svc.addHeader('User-Agent', cldTrackingParam);
            return JSON.stringify(requestPayload);
        },

        parseResponse: function (svc, client) {
            var response = JSON.parse(client.text);
            return response;
        },

        filterLogMessage: function (msg) {
            return msg;
        }
    };
    return serviceConfig;
}

module.exports = {
    getService: getService,
    getServiceConfigs: getServiceConfigs
};
