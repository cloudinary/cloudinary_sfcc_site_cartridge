'use strict';

/* API Includes */
var LocalServiceRegistry = require('dw/svc/LocalServiceRegistry');
/* Script Includes */
var cloudinaryConstants = require('*/cartridge/scripts/util/cloudinaryConstants');

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
            var cldTrackingToken = '';
            var credential = svc.getConfiguration().getCredential();
            var cldTrackingParam = cloudinaryConstants.CLD_TRACKING_PARAM.split(cloudinaryConstants.EQUAL);
            if (!empty(cldTrackingParam) && cldTrackingParam.length > 1) {
                cldTrackingToken = cldTrackingParam[1];
            }
            var url = credential.getURL();

            if (url.lastIndexOf(cloudinaryConstants.FORWARD_SLASH) !== (url.length - 1)) {
                url += cloudinaryConstants.FORWARD_SLASH;
            }

            // add cloud name if placeholder [cloudname] is present
            if (url.indexOf(cloudinaryConstants.CLD_LIST_SERVICE_CLOUDNAME_PLACEHOLDER) > -1) {
                url = url.replace(cloudinaryConstants.CLD_LIST_SERVICE_CLOUDNAME_PLACEHOLDER, cloudinaryConstants.CLD_CLOUDNAME);
            }

            url += args.endPoint;

            svc.setURL(url);
            svc.setRequestMethod(args.method);
            svc.setAuthentication('BASIC');
            svc.setEncoding('UTF-8');
            svc.addHeader('Content-Type', 'application/json');
            svc.addHeader('User-Agent', cldTrackingToken);
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
