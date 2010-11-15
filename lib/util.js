// ------------------------------------
// Statistics Manager
// ------------------------------------
//
// This file defines qputs, qprint, and Utils.
//
// Extends node.js util.js with other common functions.
//
var util = require('util');

var BUILD_AS_SINGLE_FILE;
if (!BUILD_AS_SINGLE_FILE) {
var NODELOAD_CONFIG = require('./config').NODELOAD_CONFIG;
}

// A few common global functions so we can access them with as few keystrokes as possible
//
var qputs = util.qputs = function(s) {
    if (!NODELOAD_CONFIG.QUIET) { util.puts(s); }
};

var qprint = util.qprint = function(s) {
    if (!NODELOAD_CONFIG.QUIET) { util.print(s); }
};


// Static utility methods
//
util.uid = function() {
    exports.lastUid_ = exports.lastUid_ || 0;
    return exports.lastUid_++;
};
util.defaults = function(obj, defaults) {
    for (var i in defaults) {
        if (obj[i] === undefined) {
            obj[i] = defaults[i];
        }
    }
};
util.extend = function(obj, extension) {
    for (var i in extension) {
        if (extension.hasOwnProperty(i)) {
            obj[i] = extension[i];
        }
    }
    return obj;
};
util.forEach = function(obj, f) {
    for (var i in obj) {
        if (obj.hasOwnProperty(i)) {
            f(i, obj[i]);
        }
    }
};
util.argarray = function(args) {
    return (args instanceof Array) ? args : [].concat.apply([], args);
};

util.extend(exports, util);