"use strict";
/*
 * ------------------------------------
 * Nodeload configuration
 * ------------------------------------
 *
 * The functions in this file control the behavior of the nodeload globals, like HTTP_SERVER and
 * REPORT_MANAGER. They should be called when the library is included:
 *
 *       var nl = require('./lib/nodeload').quiet().port(10000);
 *       nl.runTest(...);
 *
 * Or, when using individual modules:
 *
 *       var nlconfig = require('./lib/config').quiet().port(10000);
 *       var reporting = require('./lib/reporting');
 */
var EventEmitter = require('events').EventEmitter,
    path = require('path'),
    defaultBaseDir = path.join(process.env.HOME, '.config/stress');


var booleanValidator = function(val, fallback){
    val = 'boolean' === typeof val ? val :
        ('boolean' === typeof fallback ? fallback : false);
    return val;
};

// e.g. When default to true if no valid value is supplied
var booleanTrueValidator = function(val){
    return booleanValidator(val, true);
};

var portValidator = function(val){
    var defaultPort = 80;
    val = Number(val) <= defaultPort ? defaultPort : Number(val);

    return val;
};

var millisecondValidator = function(val){
    var defaultMinimum = 250,
        numVal = Number(val);
    if(Number.isNaN(numVal)) {
        val = defaultMinimum;
    } else {
        val = Math.max(numVal, defaultMinimum);
    }

    return val;
};

var settings = {
    'lazy': false,
    'quiet': false,
    'port': 80,
    'enableServer': true,
    'monitorInterval': 2000,
    'refreshInterval': 2000,
    'logsEnabled': true,
    'baseDirectory': defaultBaseDir,
    'slaveUpdateInterval': 3000
};

// validate inputs and coerce to defaults if invalid
var validators = {
    'lazy': booleanValidator,
    'quiet': booleanTrueValidator,
    'port': portValidator,
    'enableServer': booleanTrueValidator,
    'monitorInterval': millisecondValidator,
    'refreshInterval': millisecondValidator,
    'logsEnabled': booleanTrueValidator,
    'slaveUpdateInterval': millisecondValidator,
    'baseDirectory': function(val){return val;}
};

/**
 * Exposes configuration settings as getter/setter properties which expose change events
 */
function ConfigurationSettings(){
    var config = this;
    Object.keys(settings).forEach(function(setting){
        Object.defineProperty(config, setting, {
            get: function() {
                return settings[setting];
            },
            set: function(val){
                var oldVal = settings[setting];
                val = validators[setting](val);
                settings[setting] = val;
                config.emit('change', setting, oldVal, val);
            },
            configurable: false,
            enumerable: true
        });
    });
}

ConfigurationSettings.prototype.__proto__ = EventEmitter.prototype;

var Configuration = function Configuration(){
    this.settings = new ConfigurationSettings();
    var self = this;

    self.settings.on('change', function(setting, oldValue, newValue){
        self.emit('change', setting, oldValue, newValue);
    });

    this.start = new Date();

    this.apply = function(){
        this.emit('apply');
    };
};

Object.keys(settings).forEach(function(setting){
    Configuration.prototype[setting] = function(val){
        this.settings[setting] = val;
        return this;
    };
});

Configuration.prototype.__proto__ = EventEmitter.prototype;

var exportConfig = new Configuration();
// This overrides any previous exports.*, need to remove those.
module.exports = exportConfig;

process.nextTick(function() { exportConfig.apply(); });