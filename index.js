var loadTesting = require('./lib/loadtesting'),
    config = require('./lib/config');

module.exports.run = loadTesting.run;
module.exports.Spec = loadTesting.Spec;
module.exports.config = config;