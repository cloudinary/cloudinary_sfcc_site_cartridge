'use strict';

function map() {
    var args = Array.from(arguments);
    var list = args[0];
    var callback = args[1];
    if (list && Object.prototype.hasOwnProperty.call(list, 'toArray')) {
        list = list.toArray();
    }
    return list ? list.map(callback) : [];
}

module.exports = {
    map: map
};
