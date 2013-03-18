var loadTesting = require('./lib/loadtesting'),
    config = require('./lib/config');

module.exports.run = loadTesting.run;
module.exports.setMonitorIntervalMs = exports.setMonitorIntervalMs = config.setMonitorIntervalMs;
module.exports.quiet = exports.quiet = config.quiet;
module.exports.setBaseDir = exports.setBasedir = config.setBaseDir;
module.exports.Spec = loadTesting.Spec;