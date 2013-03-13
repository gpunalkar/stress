// TODO: Rather than cat {SOURCES} > nodeload.js (maintenance nightmare) require modules here and expose nl.run
var loadTesting = require('./lib/loadtesting');

module.exports.run = exports.run = loadTesting.run;