var assert = require('assert'),
    stats = require('../lib/stats');

describe('stats', function(){
    "use strict";

    it('StatsGroup functions are non-enumerable', function(done) {
        var s = new stats.StatsGroup();
        s.latency = {};
        assert.ok(s.get);
        assert.ok(s.put);
        assert.ok(s.clear);
        assert.ok(s.summary);
        for (var i in s) { 
            if (i !== 'latency') { 
                assert.fail('Found enumerable property: ' + i);
            }
        }

        done();
    });

    it('test StatsGroup methods', function(done) {
        var s = new stats.StatsGroup();
        s.latency = new stats.Histogram();
        s.results = new stats.ResultsCounter();

        // name property
        s.name = 'test';
        assert.equal(s.name, 'test');

        // get()/put()
        s.put(1);
        assert.equal(s.latency.get(1), 1);
        assert.equal(s.results.get(1), 1);
        assert.deepEqual(s.get(1), {latency: 1, results: 1});
        
        // summary()
        var summary = s.summary();
        assert.ok(summary.latency);
        assert.ok(summary.latency.median !== undefined);
        assert.equal(s.summary('latency')['95%'], s.latency.summary()['95%']);
        assert.ok(summary.results);
        assert.equal(summary.results.total, 1);
        assert.deepEqual(s.summary('results'), s.results.summary());
        assert.equal(summary.name, 'test');
        assert.ok(summary.ts);
        
        // clear()
        s.clear('latency');
        assert.equal(s.latency.length, 0);
        assert.equal(s.results.length, 1);
        s.clear();
        assert.equal(s.results.length, 0);

        done();
    });
});