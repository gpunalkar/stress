"use strict";
var assert = require('assert'),
    http = require('http'),
    config = require('../lib/config'),
    HttpServer = require('../lib/http').HttpServer;

config.enableServer(false);
config.apply();

module.exports = {
    'example: add a new route': function(beforeExit) {
        var done = false,
            server = new HttpServer();

        server.once('start', function(){
            server.addRoute('^/route', function(url, req, res) {
                done = true;
                res.end();
            });

            var client = http.createClient(9020, '127.0.0.1'),
            req = client.request('GET', '/route/item');
            req.end();
        });

        server.start(9020);

        setTimeout(function() { server.stop(); }, 2000);
        
        beforeExit(function() {
            assert.ok(done, 'Never got request to /route');
        });
    },
    'test file server finds package.json': function(beforeExit) {
        var done = false,
            server = new HttpServer();

        server.once('start', function(){

            var client = http.createClient(9021, '127.0.0.1'),
            req = client.request('GET', '/package.json');
            req.end();

            req.on('response', function(res) {
                assert.equal(res.statusCode, 200);
                res.on('data', function(chunk) {
                    done = true;
                });
            });
        });

        server.start(9021);

        setTimeout(function() { server.stop(); }, 2000);

        beforeExit(function() {
            assert.ok(done, 'Never got response data from /package.json');
        });
    },
};
