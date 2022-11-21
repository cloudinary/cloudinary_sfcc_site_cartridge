'use strict';

var ISML = require('dw/template/ISML');
var cloudinaryConstants = require('int_cloudinary/cartridge/scripts/util/cloudinaryConstants');
var cloudName = cloudinaryConstants.CLD_CLOUDNAME;
var apiKey = cloudinaryConstants.CLD_APIKEY;

/**
 * Renders the viewmedia template
 */
function start() {
    var context = {
        mlOptions: {
            cloud_name: cloudName,
            api_key: apiKey,
            integration: {
                type: cloudinaryConstants.CLD_SFCC_INTEGRATION,
                platform: cloudinaryConstants.CLD_SFCC_PLATFORM,
                version: cloudinaryConstants.CLD_SFCC_VERSION,
                environment: cloudinaryConstants.CLD_SFCC_ENVIRONMENT
            }
        }
    };
    ISML.renderTemplate('widgets/viewmedia', context);
}

start.public = true;
exports.Start = start;
