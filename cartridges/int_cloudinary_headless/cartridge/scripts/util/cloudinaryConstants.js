'use strict';

var CloudinaryConstants = module.superModule;
var COMMIT_HASH = require('~/cartridge/scripts/util/commit_hash').COMMIT_HASH;

/**
 * Cloudinary Constants sets up various values to be used throughout the cartridge code
 */

CloudinaryConstants.CLD_TRACKING_PARAM = '_i=AO';
CloudinaryConstants.CLD_SFCC_PLATFORM_ARCHITECTURE = 'headless';
CloudinaryConstants.CLD_COMMIT_HASH = COMMIT_HASH;

module.exports = CloudinaryConstants;
