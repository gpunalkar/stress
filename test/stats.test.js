var assert = require('assert'),
    stats = require('../lib/stats');

describe('stats', function() {
    "use strict";

    describe('StatsGroup', function() {

        it('functions are non-enumerable', function(done) {
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

        it('methods: name, get, put, summary, clear', function() {
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
        });

    });

    describe('Histogram', function() {
        it('#clear (including default size check)', function() {
            var hist = new stats.Histogram();

            // A performance optimization: default to 3000 array items to store 3s worth of updates at ms granularity
            assert.equal(3000, hist.size);

            // stats all have a 'type' property
            assert.equal('Histogram', hist.type);

            hist.put(200);
            assert.equal(1, hist.length);
            assert.equal(200, hist.sum);

            hist.size = 20;
            hist.clear();

            assert.equal(20, hist.size);
        });

        it('#stddev', function() {
            // check some standard deviations.
            var hist = new stats.Histogram({ buckets: 20 });

            for (var i = 100; i < 200; i++) {
                if (i % 2 === 0) {
                    hist.put(i);
                }
            }

            // Check to 5 places
            assert.equal('28.86174', hist.stddev().toFixed(5));

            // Here's the example from Wikipedia
            hist = new stats.Histogram({ buckets: 8 });
            hist.put(2);
            hist.put(4);
            hist.put(4);
            hist.put(4);
            hist.put(5);
            hist.put(5);
            hist.put(7);
            hist.put(9);

            assert.equal(2, hist.stddev());
        });

        it('#get', function() {
            var hist = new stats.Histogram({ buckets: 10 });
            hist.put(1);
            hist.put(2);
            hist.put(1);
            hist.put(2);
            hist.put(1);
            hist.put(2);
            hist.put(1);
            hist.put(2);
            hist.put(1);
            hist.put(2);

            assert.equal(5, hist.get(2)); // 2 occurs 5 times
        });

        it('should maintain full sample stats', function() {
            // stats from http://www.ltcconline.net/greenl/courses/201/descstat/mean.htm
            var hist = new stats.Histogram({
                    buckets    : 20,
                    percentiles: [ 0.1, 0.2, 0.3, 0.4, 0.5, 0.75, 0.95, 0.99 ]
                }),
                expectedSummary = {
                    "min"   : 38,
                    "max"   : 96,
                    "avg"   : 49.2,
                    "median": 44,
                    "10%"   : 38,
                    "20%"   : 39,
                    "30%"   : 40,
                    "40%"   : 42,
                    "50%"   : 44,
                    "75%"   : 50,
                    "95%"   : 96,
                    "99%"   : 96
                };

            hist.put(44);
            hist.put(50);
            hist.put(38);
            hist.put(96);
            hist.put(42);
            hist.put(47);
            hist.put(40);
            hist.put(39);
            hist.put(46);
            hist.put(50);

            assert.equal(49.2, hist.mean());

            // differs slightly from site because they use 1/10 accuracy to calculate mean
            assert.equal('16.12328', hist.stddev().toFixed(5));
            assert.deepEqual(expectedSummary, hist.summary());
        });

        it('should properly calculate variance and standard deviation', function(){
            // This example taken from http://sociology.about.com/od/Statistics/a/Variance-Standard-Deviation.htm
            var hist = new stats.Histogram({ buckets : 5 });

            hist.put(25);
            hist.put(26);
            hist.put(27);
            hist.put(30);
            hist.put(32);

            assert.equal(28, hist.mean());
            assert.equal(6.8, hist.variance());
            assert.equal('2.61', hist.stddev().toFixed(2));
        });
    });

    describe('Accumulator', function(){
        it('should accumulate 0-100 properly', function(){
            var acc = new stats.Accumulator();

            var num = -1;
            while(++num <= 100){
                acc.put(num);
            }

            // 5050 is a known added value
            // See 'Anecdotes' for Carl Gauss: http://en.wikipedia.org/wiki/Carl_Friedrich_Gauss
            assert.equal(5050, acc.get());
        });
    });
});