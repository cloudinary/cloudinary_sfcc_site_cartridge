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
            api_key: apiKey
        }
    };
    ISML.renderTemplate('widgets/viewmedia', context);
}

start.public = true;
exports.Start = start;
