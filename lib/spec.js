var Spec = function(defs) {
    "use strict";
    this.name = 'Default Spec Name';
    this.host = 'localhost';
    this.port = 80;
    this.method = 'GET';
    this.path = '/';
    this.requestData = null;

    // TODO: Headers

    /**
     * A function which creates a connection for each request
     * (deprecated)
     *
     * @type Function
     */
    this.connectionGenerator = null;

    /**
     * A function which takes HttpClient to generate each request
     * Example:
     *      function(client) { }
     *
     * @type {Function}
     */
    this.requestGenerator = null;

    /**
     * A function which loops the request and a callback to determine completion
     * Example:
     *      function(finished, client) { }
     *
     * @type {Function}
     */
    this.requestLoop = null;

    /**
     * number of virtual users concurrently executing therequest loop
     * @type {number}
     */
    this.numUsers = 1;

    /**
     * Array with requests/sec over time:
     *        [[time (seconds), rps], [time 2, rps], ...]
     *      For example, ramp up from 100 to 500 rps and then
     *      down to 0 over 20 seconds:
     *        [[0, 100], [10, 500], [20, 0]]
     *
     * @type {Array}
     */
    this.loadProfile = [];

    /**
     * Array with number of users over time:
     *        [[time (seconds), # users], [time 2, users], ...]
     *      For example, ramp up from 0 to 100 users and back
     *      down to 0 over 20 seconds:
     *        [[0, 0], [10, 100], [20, 0]]
     *
     * @type {Array}
     */
    this.userProfile = [];

    /**
     * Maximum number of iterations of request loop
     * @type {number}
     */
    this.numRequests = 100;

    /**
     * Maximum duration of test in seconds
     * @type {number}
     */
    this.timeLimit = 120;

    /**
     * Seconds before starting test
     * @type {number}
     */
    this.delay = 0;

    // TODO: create stats constructor?
    /**
     * Specify list of: 'latency', 'result-codes', 'uniques',
     * 'concurrency', 'http-errors'. These following statistics
     * may also be specified with parameters:
     *
     *     { name: 'latency', percentiles: [0.9, 0.99] }
     *     { name: 'http-errors', successCodes: [200,404], log: 'http-errors.log' }
     *
     * Extend this list of statistics by adding to the
     * monitor.js#Monitor.Monitors object.
     *
     * Note:
     * - for 'uniques', traceableRequest() must be used  to create the ClientRequest or only 2 will be detected.
     *
     * @type {Array}
     */
    this.stats = ['latency', 'result-codes', 'request-bytes', 'response-bytes'];

    /**
     * The number of requests to attempt to execute per second
     *
     * @type {number}
     */
    this.requestsPerSecond = 5;
    Object.defineProperty(this, 'targetRps', {
        get: function() {
            return this.requestsPerSecond;
        },
        set: function(val) {
            console.warn('Please use requestsPerSecond instead of targetRps. targetRps is deprecated.');
            this.requestsPerSecond = parseInt(val || 0, 10);
        }
    });

    if (defs) {
        var self = this;
        Object.keys(defs).forEach(function(k, i) {
            if (self.hasOwnProperty(k)) {
                self[k] = defs[k];
                if (typeof self[k] === 'function') {
                    self[k].bind(self);
                }
            } else {
                delete self[k];
            }
        });
    }
};

module.exports = Spec;