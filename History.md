
0.0.1 / 2013-03-13 
==================

This is a re-release of nodeload. As such, the name and versioning are being reset. Deal with it.

  * Added configurable log output directory
  * Dump stats on SIGINT CTRL+C to kill long-running test should still spit out stats.
  * Move HttpRequest include for single-file generation Until examples are updated, requires need to be done in the standard BUILD_AS_SINGLE_FILE block
  * Various changes Fixed exports in index.js Added new HttpRequest with auto-connect event Directly inhert prototype chain for EventEmitter derived constructors Modified tests to account for variability
  * Changes to remove nodeload.js single-file Remove single-file nodeload Update ./bin/stress.js to reflect this change Update package.json to reflect this change Fix monitoring test
  * Clean up code comments and some spacing
  * Uncomment lines in lib/header.js
  * More minor adjustments for jshint warnings
  * Removed trailing whitespace offenses
  * Removed jshint stuff from TODO
  * Added jshint files
  * Fixed up some jshint errors and warnings
  * Update README.md Updated README.md to reflect new 'ownership' of this codebase, attempting to keep executable information and attribution in tact.
  * Updated developers doc, moved description to bin/stress.js, and removed doc/nl.md because a lot of the text is redundant with Readme
  * Removed jsmin
  * Updated TODO and notes in index.js
  * Squelch no method error for oldclient .destroy
  * Changes toward new structure
  * Makefile, .gitignore changes Wrap rm targets in quotes Add .idea exclusion in .gitignore
  * Update README.md
  * - External monitors use bash instead of sh which does a better job cleaning up child processes on exit. - Update minified nodeload.js
  * Merge remote-tracking branch 'origin/HEAD'
  * Merge pull request #14 from ctavan/feature-v06compat
  * Set compatibility to node >= 0.4, works with 0.6 as well
  * Switch from sys module to util module
  * Use optparse from npm
  * Merge pull request #13 from Erkan-Yilmaz/master
  * 2 fixes in README.md
  * Update jmx & process monitoring to allow monitoring without graphing Add pause / autoupdate to reports
  * Updates for node 0.5 Fix for # precision for external.js
  * Change log file names to use toISOString() rather than millis
  * Reporting: - Replace jmx.js with external.js. Add graphProcess() which replaces spawnAndMonitor() - graphJmx() checks for existence of jmxstat/jmxstat.jar - Add report.getReport, which returns the first report by the same name or creates one
  * Add dataFormatter() option to graphJmx
  * Add reporting.graphJmx() Upgrade jmxstat
  * Use timestamps for summary graph x-axis.
  * Update to latest dygraph
  * Don't auto update summary report time on open
  * Remove rps line from result codes graph and limit rps precision to 1 decimal place.
  * Merge remote branch 'mmattozzi/master'
  * Adding standalone RPS requests per second stat collector
  * upgrade npm files to start v0.4 update tests to work with node 0.4

## v0.4.0 (Nodeload Last Release) ##

Compatible with node v0.4.x

Features:

* Add graphJmx() and graphProcess(); deprecate spawnAndMonitor(). These provide an easy way to graph JMX attributes as well as output from external processes, such as iostat.
* More readable date strings are used in log files names
* rps is a separate stat from result codes
* Test Results page timestamp does not auto-update on open
* X-axes now use real timestamps rather than minutes since test start

## v0.3.0 (2011/06/16) ##

Compatible with node v0.3.x

Features:

* Add /console/console.html, a jQuery based UI for connecting to multiple nodeload instances simultaneously
* jmxstat/jmxstat.jar allows command line polling of JMX attributes. Combined with reporting.spawnAndMonitor(), Java processes can be monitored during load tests.
* Add 'header-code' statistic which counts number of responses with different values for a given header. For instance, this can be used to graph cache misses/hits from Squid responses using the X-Cache header.

Bug Fixes:

* config: Add 'nodeload/config' module for configuring global parameters
* multiloop: polling time for next change in load or user profiles was always 1 second
* stats: Fix one-off error in Histogram.percentile wouldn't return the greatest number if it is greater than the number of buckets (i.e. in extra[]). Fix Uniques.clear() to actually reset count.
* nl.js: #issue/5: nl.js discarded URL query string and hash

## v0.2.0 (2010/12/01) ##

This release is a substantial, non-backwards-compatible rewrite of nodeload. The major features are:

* [npm](http://npmjs.org/) compatibility
* Independently usable modules: loop, stats, monitoring, http, reporting, and remote
* Addition of load and user profiles

Specific changes to note are:

* npm should be used to build the source

        [~/nodeload]> curl http://npmjs.org/install.sh | sh     # install npm if not already installed
        [~/nodeload]> npm link

* `nodeload` is renamed to `nl` and `nodeloadlib` to `nodeload`.

* addTest() / addRamp() / runTest() is replaced by run():

        var nl = require('nodeload');
        var loadtest = nl.run({ ... test specications ... }, ...);

* remoteTest() / remoteStart() is replaced by LoadTestCluster.run:

        var nl = require('nodeload');
        var cluster = new nl.LoadTestCluster(master:port, [slaves:port, ...]);
        cluster.run({ ... test specifications ...});

* Callbacks and most of the globals (except `HTTP_SERVER` and `REPORT_MANAGER`) have been removed. Instead EventEmitters are used throughout. For example, run() returns an instance of LoadTest, which emits 'update' and 'end' events, replacing the need for both `TEST_MONITOR` and the startTests() callback parameter.

* Scheduler has been replaced by MultiLoop, which also understands load & concurrency profiles.

* Statistics tracking works through event handlers now rather than by wrapping the loop function. See monitoring/monitor.js.

## v0.100.0 (2010/10/06) ##

This release adds nodeloadlib and moves to Dygraph for charting.

## v0.1.0 to v0.1.2 (2010/02/27) ##

Initial releases of nodeload. Tags correspond to node compatible versions. To find a version of node that's compatible with a tag release do `git show <tagname>`.

    For example: git show v0.1.1
