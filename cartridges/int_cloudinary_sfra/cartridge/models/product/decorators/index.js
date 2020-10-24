'use strict';

var indexBase = module.superModule;
// add cloudinary decorator in base index decorators object
indexBase.cloudinary = require('*/cartridge/models/product/decorators/cloudinary');

module.exports = indexBase;
