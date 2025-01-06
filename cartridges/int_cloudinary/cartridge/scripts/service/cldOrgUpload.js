'use strict';

/* API Includes */
var logger = require('dw/system/Logger').getLogger('Cloudinary', 'UPLOAD');

var cloudinaryUtils = require('~/cartridge/scripts/util/cloudinaryOrgUtils');
var cloudinaryConstants = require('~/cartridge/scripts/util/cloudinaryOrgConstants');

/* API Includes */
var LocalServiceRegistry = require('dw/svc/LocalServiceRegistry');

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
            var cldTrackingParam = cloudinaryConstants.API_TRACKING_PARAM.replace(cloudinaryConstants.CLD_TRACKING_PARAM_PLATFORM_PLACEHOLDER, cloudinaryConstants.CLD_SFCC_PLATFORM);
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

/**
 * This method creates the request object.
 *
 * @param {Object} args - The arguments
 *
 * @returns {string} result - The API service response (JSON)
 */
function buildPayload(args) {
    var Prefs = args.servicePrefs;
    var publicID = args.assetPublicID;
    var requestObj = {};
    // If the API key is missing throw an error
    if (empty(Prefs.CLD_APIKEY)) {
        logger.error(Prefs.CLD_MISSING_KEY);
        return false;
    }
    if (empty(Prefs.CLD_APISECRET)) {
        logger.error(Prefs.CLD_MISSING_PARAM);
        return false;
    }
    // Required params for signed upload are cloud_name, resource_type, file, api_key, timestamp, signature
    requestObj.folder = args.cloudinaryFolder;
    requestObj.public_id = (publicID.indexOf(Prefs.FORWARD_SLASH) === 0) ? publicID.substring(1) : publicID;
    requestObj.tags = args.tags;
    if (!empty(args.metadata)) {
        requestObj.metadata = args.metadata;
    }
    requestObj.timestamp = (Date.now() / 1000).toFixed();
    requestObj.invalidate = true;
    // if (!empty(Prefs.CLD_UPLOAD_PRESET)) {
    //     requestObj.upload_preset = Prefs.CLD_UPLOAD_PRESET;
    // }

    requestObj.overwrite = true;
    if (args.executionMode && (cloudinaryConstants.PROD_BACK_FILE_EXECUTION_MODE.equals(args.executionMode))) {
        requestObj.overwrite = false;
    }
    
    // Add SHA-1 hash signature for valid fields
    requestObj.signature = cloudinaryUtils.buildSignature(requestObj, Prefs.CLD_APISECRET);
    // These MUST come after buildSignature() so they aren't included in hash [API key, cloud name, file, resource_type]
    requestObj.api_key = Prefs.CLD_APIKEY;
    requestObj.cloud_name = Prefs.CLD_CLOUDNAME;
    requestObj.file = args.file.toString();
    requestObj.resource_type = args.resource_type;

    return requestObj;
}

/**
 * This method uses the service to get order history from cld.
 * @param {string} args - any arguments passed
 *
 * @returns {string} result - The API service response (JSON)
 */
function uploadAsset(args) {
    var Prefs = args.servicePrefs;
    var result = [];
    var cldResponse = { ok: true, message: '' };
    // if either of the params are empty, return error
    if (empty(args)) {
        logger.error(Prefs.CLD_MISSING_PARAM);
        result.status = 500;
        result.errorMessage = Prefs.CLD_MISSING_PARAM;

        return result;
    }

    var configArgs = args;
    configArgs.method = configArgs.servicePrefs.POST_METHOD;

    try {
        configArgs.resource_type = cloudinaryUtils.getAssetType(configArgs.file, configArgs.servicePrefs);
    } catch (e) {
        configArgs.resource_type = cloudinaryConstants.CONTENT_TYPE_IMAGE;
    }

    if (empty(configArgs.resource_type)) {
        configArgs.resource_type = configArgs.servicePrefs.CONTENT_TYPE_IMAGE;
    }

    configArgs.endPoint = Prefs.CLD_CLOUDNAME + configArgs.servicePrefs.FORWARD_SLASH + configArgs.resource_type + configArgs.servicePrefs.UPLOAD_ENDPOINT;

    var service = getService(configArgs.servicePrefs.CLD_UPLOAD_SVC, getServiceConfigs(configArgs));
    service.setCredentialID(configArgs.servicePrefs.CLD_UPLOAD_SVC_CRED);
    // Build the request package
    var assetReqObj = buildPayload(configArgs);
    // assetReqObj.file = assetReqObj.file + '?username=asaleem@pixelmedia.com&password=PixelMedia@1234'

    // Now call the API
    try {
        result = service.call(assetReqObj);
        if (result.ok && result.error === 0) {
            cldResponse.ok = true;
            cldResponse.message = 'Upload successful. Public ID: ' + result.object.public_id + ' access: ' + result.object.access_mode + ' format: ' + result.object.format;
            cldResponse.resultObj = result.object;
        } else {
            cldResponse.ok = false;
            cldResponse.message = result.errorMessage;
            cldResponse.errorCode = result.error;
        }
    } catch (e) {
        dw.system.Logger.error(Prefs.CLD_GENERAL_ERROR + e.message);
        cldResponse.ok = false;
        cldResponse.message = e.message;
    }
    return cldResponse;
}

/*
* Module exposed methods
*/
module.exports = {
    uploadAsset: uploadAsset,
    getService: getService,
    getServiceConfigs: getServiceConfigs
};
