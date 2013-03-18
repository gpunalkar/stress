var Spec = function(){
    "use strict";
    this.name = 'Default Spec Name';
    this.host = 'localhost';
    this.port = 80;
    this.requestGenerator = null;
    this.method = 'GET';
    this.path = '/';
    this.requestData = null;
    this.numUsers = 1;
    this.numRequests = 100;
    this.timeLimit = Infinity;
    this.stats = ['latency', 'result-codes', 'request-bytes', 'response-bytes'];

    this.requestsPerSecond = 5;
    Object.defineProperty(this, 'targetRps', {
        get: function(){
            return this.requestsPerSecond;
        },
        set: function(val){
            console.warn('Please use requestsPerSecond instead of targetRps. targetRps is deprecated.');
            this.requestsPerSecond = parseInt(val||0, 10);
        }
    });
};

module.exports = Spec;