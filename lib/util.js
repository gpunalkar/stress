// ------------------------------------
// Statistics Manager
// ------------------------------------
//
// This file defines qputs, qprint, and extends the util namespace.
//
// Extends node.js util.js with other common functions.
//
var util = require('util');
var EventEmitter = require('events').EventEmitter;
var config = require('./config');
var lastUid_ = 0;

/**
 * Outputs all arguments to console (blocking), each followed by a newline
 * @type {Function}
 */
var qputs = util.qputs = function() {
    if (!config.settings.quiet) {
        util.puts.apply(util, arguments);
    }
};

/**
 * Outputs all arguments to console (blocking), none are followed by a newline
 * @type {Function}
 */
var qprint = util.qprint = function(s) {
    if (!config.settings.quiet) {
        util.print(s);
    }
};

/**
 * Gets an auto-incrementing 'unique' id
 * @returns {number}
 */
util.uid = function() {
    return lastUid_++;
};

/**
 * Merge default properties from object `deafults` into `obj`
 * without overwriting existing properties in `obj`
 *
 * @param obj
 * @param defaults
 * @returns {*} Modified `obj`
 */
util.defaults = function(obj, defaults) {
    for (var i in defaults) {
        if (defaults.hasOwnProperty(i)) {
            if (obj[i] === undefined) {
                obj[i] = defaults[i];
            }
        }
    }
    return obj;
};

/**
 * Copies keys/values from `extension` into `obj`,
 * overwriting any properties that already exist.
 *
 * @param obj
 * @param extension
 * @returns {*} Modified `obj`
 */
util.extend = function(obj, extension) {
    for (var i in extension) {
        if (extension.hasOwnProperty(i)) {
            obj[i] = extension[i];
        }
    }
    return obj;
};

/**
 * Iterates over keys of `obj` and performs a function on each
 * @param obj
 * @param {Function} f a callback taking parameters: index, value
 */
util.forEach = function(obj, f) {
    for (var i in obj) {
        if (obj.hasOwnProperty(i)) {
            f(i, obj[i]);
        }
    }
};

/**
 * Validates that every value in `obj` passes condition supplied by `f`
 * @param obj
 * @param {Function} f a function accepting parameters: index, value
 * @returns {boolean}
 */
util.every = function(obj, f) {
    for (var i in obj) {
        if (obj.hasOwnProperty(i)) {
            if (!f(i, obj[i])) {
                return false;
            }
        }
    }
    return true;
};

var slice = [].slice;

/**
 * Converts an `arguments` value into an array.
 *
 * @param args
 * @returns {*}
 */
util.argarray = function(args) {
    return slice.call(args);
};

/**
 * Helper function for reading string data from a stream.
 *
 * @param stream
 * @param callback
 */
util.readStream = function(stream, callback) {
    var data = [];
    stream.on('data', function(chunk) {
        data.push(chunk.toString());
    });
    stream.on('end', function() {
        callback(data.join(''));
    });
};

/** Make an object a PeriodicUpdater by adding PeriodicUpdater.call(this) to the constructor.
 The object will call this.update() every interval. */
util.PeriodicUpdater = function(updateIntervalMs) {
    var self = this, updateTimeoutId;
    this.__defineGetter__('updateInterval', function() {
        return updateIntervalMs;
    });
    this.__defineSetter__('updateInterval', function(milliseconds) {
        clearInterval(updateTimeoutId);
        if (milliseconds > 0 && milliseconds < Infinity) {
            updateTimeoutId = setInterval(self.update.bind(self), milliseconds);
        }
    });
    this.updateInterval = updateIntervalMs;
};

/** Same arguments as http.createClient. Returns an wrapped http.Client object that will reconnect when
 connection errors are detected. In the current implementation of http.Client (11/29/10), calls to
 request() fail silently after the initial 'error' event. */
util.createReconnectingClient = function() {
    var http = require('http'),
        clientArgs = arguments, events = {}, client, wrappedClient = {},
        clientMethod = function(method) {
            return function() {
                return client[method].apply(client, arguments);
            };
        },
        clientGetter = function(member) {
            return function() {
                return client[member];
            };
        },
        clientSetter = function(member) {
            return function(val) {
                client[member] = val;
            };
        },
        reconnect = function() {
            var oldclient = client;
            if (oldclient && 'function' === typeof oldclient.destroy) {
                oldclient.destroy();
            }
            client = http.createClient.apply(http, clientArgs);
            client._events = util.extend(events, client._events); // EventEmitter._events stores event handlers
            client.emit('reconnect', oldclient);
        };

    // Create initial http.Client
    reconnect();
    client.on('error', function(err) {
        reconnect();
    });

    // Wrap client so implementation can be swapped out when there are connection errors
    for (var j in client) {
        if (client.hasOwnProperty(j)) {
            if (typeof client[j] === 'function') {
                wrappedClient[j] = clientMethod(j);
            } else {
                wrappedClient.__defineGetter__(j, clientGetter(j));
                wrappedClient.__defineSetter__(j, clientSetter(j));
            }
        }
    }
    wrappedClient.impl = client;
    return wrappedClient;
};

/** Accepts an EventEmitter object that emits text data. LineReader buffers the text and emits a 'data'
 event each time a newline is encountered. For example, */
var LineReader = util.LineReader = function LineReader(eventEmitter, event) {
    EventEmitter.call(this);
    event = event || 'data';

    var self = this, buffer = '';

    var emitLine = function(buffer) {
        var lineEnd = buffer.indexOf("\n");
        var line = (lineEnd === -1) ? buffer : buffer.substring(0, lineEnd);
        if (line) {
            self.emit('data', line);
        }
        return buffer.substring(line.length + 1, buffer.length);
    };

    var readloop = function(data) {
        if (data) {
            buffer += data.toString();
        }
        if (buffer.indexOf("\n") > -1) {
            buffer = emitLine(buffer);
            process.nextTick(readloop.bind(this));
        }
    };

    eventEmitter.on(event, readloop.bind(this));
};

LineReader.prototype.__proto__ = EventEmitter.prototype;

util.extend(exports, util);