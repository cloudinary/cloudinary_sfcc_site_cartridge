'use strict';

// API includes
var jobLogger = require('dw/system').Logger.getLogger('Cloudinary', 'CREATE');
var Status = require('dw/system/Status');

module.exports.Start = function (args) {
    var cloudinaryConstants = require('*/cartridge/scripts/util/cloudinaryConstants');
    var cloudinaryMetadataSvc = require('*/cartridge/scripts/service/cldMetadata');
    var jobStepHelpers = require('*/cartridge/scripts/helpers/jobStepHelpers');

    if (!cloudinaryConstants.CLD_ENABLED) {
        return new Status(Status.ERROR, 'ERROR', 'The Cloudinary cartridge is disabled');
    }

    if (jobStepHelpers.isStepDisabled(args)) {
        return new Status(Status.OK, 'OK', 'Step disabled, skip it...');
    }

    const schema = [
        { "label": "sfcc-product-name", "external_id": "sfcc-product-name", "type": "string" },
        { "label": "sfcc-view-type", "external_id": "sfcc-view-type", "type": "string" },
        { "label": "sfcc-product-identifier", "external_id": "sfcc-product-identifier", "type": "string" },
        { "label": "sfcc-is-main", "external_id": "sfcc-is-main", "type": "enum", "datasource": { "values": [{ "external_id": "True", "value": "True" }, { "external_id": "False", "value": "False" }] } },
        { "label": "sfcc-gallery-position", "external_id": "sfcc-gallery-position", "type": "integer" },
        { "label": "sfcc-alt-text", "external_id": "sfcc-alt-text", "type": "string" }
    ];

    try {
        cloudinaryMetadataSvc.createMetadataSchemeCld(schema);
    } catch (e) {
        jobLogger.error('Error occurred while creating metadata, message : {0}', e.message);
    }

    return new Status(Status.OK);
};
