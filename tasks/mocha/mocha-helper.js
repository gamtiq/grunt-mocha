/*
 * Is injected into the spec runner file
 
 * Copyright (c) 2012 Kelly Miyashiro
 * Copyright (c) 2012 "Cowboy" Ben Alman
 * Licensed under the MIT license.
 * http://benalman.com/about/license/
 */

/*global mocha:true, alert:true*/

(function() {
    // Send messages to the parent phantom.js process via alert! Good times!!
    function sendMessage() {
      var args = [].slice.call(arguments);
      alert(JSON.stringify(args));
    }

    var GruntReporter = function(runner){
      // 1.4.2 moved reporters to Mocha instead of mocha
      var reporters = Mocha.reporters || mocha.reporters;

      reporters.HTML.call(this, runner);

      var stats = this.stats;
  
      runner.on('test', function(test) {
        sendMessage('testStart', test.title);
      });
  
      runner.on('test end', function(test) {
        sendMessage('testDone', test.title, test.state);
      });
  
      runner.on('suite', function(suite) {
        sendMessage('suiteStart', suite.title);
      });
  
      runner.on('suite end', function(suite) {
        if (suite.root) return;
        sendMessage('suiteDone', suite.title);
      });
  
      runner.on('fail', function(test, err) {
        sendMessage('testFail', test.title, err);
      });
  
      runner.on('end', function() {
        var time = new Date() - stats.start;
        time = (time / 1000).toFixed(2);
    
        var failed  = this.failures,
          passed    = this.total - this.failures,
          total     = this.total;
    
        sendMessage('done', failed, passed, total, time);
      });
    };
    
    var phantom = window.PHANTOMJS;
    if (phantom) {
        var config = {
              ui: 'bdd',
              ignoreLeaks: true,
              reporter: GruntReporter
            },
            options = phantom.mocha,
            key;
        if (options) {
          if (typeof options === "string") {
            config.ui = options;
          }
          else {
            for (key in options) {
              config[key] = options[key];
            }
            config.reporter = GruntReporter;
          }
        }
        mocha.setup(config);
        if (phantom.run) {
          mocha.run();
        }
    }
}());