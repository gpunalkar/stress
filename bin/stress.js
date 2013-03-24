#!/usr/bin/env node
'use strict';
var program = require('commander'),
    pkg = require('../package.json'),
    path = require('path'),
    url = require('url');

var usage = [
    '[options] <host>:<port>[<path>]',
    '',
    '  Description:', // match commander.js 2-space indent
    '',
    '\tThis tool is for generating lots of requests to send to an HTTP API. It is',
    "\tinspired by Apache's ab benchmark tool and is designed to let programmers",
    '\tdevelop load tests and get informative reports without having to learn a',
    '\tbig and complicated framework.',
    ''
];

// Setup Program options and parsing
program
    .version(pkg.version)
    .usage(usage.join('\n'))
    .option('-n, --number <Number>', 'Number of requests to make. Defaults to value of --concurrency unless a time limit is specified.', parseInt, -1)
    .option('-c, --concurrency <Number>','Concurrent number of connections. Defaults to 1.', parseInt, 1)
    .option('-t, --time-limit <Number>', 'Number of seconds to spend running test. Default is continuous operation.', parseInt, -1)
    .option('-e, --request-rate <Number>', 'Target number of requests per seconds. Infinite by default', Infinity)
    .option('-m, --method <String>', 'HTTP method to use.', 'GET')
    .option('-d, --data <String>', 'Data to send along with PUT or POST request.')
    .option('-r, --request-generator <String>', 'Path to module that exports getRequest function')
    .option('-i, --report-interval <Number>', 'Frequency in seconds to report statistics. Default is 10.', parseInt, 10)
    .option('--base-dir <Directory>', 'Sets the base directory for logs and reports')
    .option('-q, --quiet', 'Suppress display of progress count info.')
    .parse(process.argv);

var parseTarget = function (value) {
    if(Array.isArray(value) && value.length < 1){
        return null;
    } else {
        value = value[0];
    }

    var opt = {};
    if ((''+value).split(':')[0].search('^http') === -1) {
        value = 'http://' + value;
    }

    opt.url = url.parse(value, false);
    opt.host = opt.url.hostname || '';
    opt.port = Number(opt.url.port) || 80;
    opt.path = opt.url.pathname || '/';
    opt.path += opt.url.search || '';
    opt.path += opt.url.hash || '';

    return opt;
};

// Validate target host:port[path]
var options = parseTarget(program.args);
if(options === null){
    process.stderr.write('\nNo target specified!\n');
    program.help();
    process.exit(1);
}

// Program Operation Below
function puts(text) { if (!program.quiet) { console.log(text); } }
function pad(str, width) { return str + (new Array(width-str.length)).join(' '); }
function printItem(name, val, padLength) {
    if (padLength === undefined) { padLength = 40; }
    puts(pad(name + ':', padLength) + ' ' + val);
}

var stress = require('../');

if(program.quiet) {
    stress.config.quiet();
}

stress.setMonitorIntervalMs(program.reportInterval * 1000);

if(program.baseDir){
    stress.config.baseDirectory(program.baseDir);
}

var genSpec = null;
if(program.requestGenerator){
    try {
        genSpec = require(path.resolve(program.requestGenerator)).getRequest;
        console.log(genSpec);
        console.log('path: %j, genSpec: %j', path.resolve(program.requestGenerator), genSpec);
    } catch(e){
        console.log(e);
        process.exit(1);
    }
}

// TODO: Remove this. I don't like how http server and report server are started by the emitted 'apply' event.
stress.config.apply();

var testStart,
    numRequests = program.number > 0 ? program.number : program.concurrency,
    timeLimit = program.timeLimit > 0 ? program.timeLimit : Infinity;

var spec = new stress.Spec();
spec.name = options.host;
spec.host = options.host;
spec.port = options.port;
spec.requestGenerator = genSpec;
spec.method = program.method;
spec.path = options.path;
spec.requestData = program.requestData;
spec.numUsers = program.concurrency;
spec.numRequests = numRequests;
spec.timeLimit = timeLimit;
spec.targetRps = program.requestRate;
spec.stats = ['latency', 'result-codes', 'request-bytes', 'response-bytes'];

var test = stress.run(spec);

test.on('start', function(tests) { testStart = +new Date(); });
test.on('update', function(interval, stats) {
    puts(pad('Completed ' +stats[options.host]['result-codes'].length+ ' requests', 40));
});
test.on('end', function() {

    var stats = test.stats[options.host];
    var elapsedSeconds = (+new Date() - testStart)/1000;
    var latency = stats.latency || {};

    puts('');
    printItem('Server', options.host + ':' + options.port);

    if (program.requestGenerator === undefined) {
        printItem('HTTP Method', program.method);
        printItem('Document Path', options.path);
    } else {
        printItem('Request Generator', program.requestGenerator);
    }

    printItem('Concurrency Level', program.concurrency);
    printItem('Number of requests', stats['result-codes'].length);
    printItem('Body bytes transferred', stats['request-bytes'].total + stats['response-bytes'].total);
    printItem('Elapsed time (s)', elapsedSeconds.toFixed(2));
    printItem('Requests per second', (stats['result-codes'].length/elapsedSeconds).toFixed(2));
    printItem('Mean time per request (ms)', latency.mean().toFixed(2));
    printItem('Time per request standard deviation', latency.stddev().toFixed(2));

    puts('\nPercentages of requests served within a certain time (ms)');
    printItem('  Min', latency.min, 6);
    printItem('  Avg', latency.mean().toFixed(1), 6);
    printItem('  50%', latency.percentile(0.5), 6);
    printItem('  95%', latency.percentile(0.95), 6);
    printItem('  99%', latency.percentile(0.99), 6);
    printItem('  Max', latency.max, 6);

    process.exit(0);
});
test.start();

process.on('SIGINT', function(){
    test.emit('end');
});

process.on('uncaughtException', function(){
    test.emit('end');
});