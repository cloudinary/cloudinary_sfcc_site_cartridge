'use strict';

var path = require('path');
var sgmfScripts = require('sgmf-scripts');

module.exports = [{
    mode: 'production',
    name: 'js',
    entry: sgmfScripts.createJsPath(),
    output: {
        path: path.resolve('./cartridges/int_cloudinary_sfra/cartridge/static'),
        filename: '[name].js'
    }
}];
