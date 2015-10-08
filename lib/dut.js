/*
The MIT License (MIT)

Copyright (c)2015 Bryan Hughes <bryan@theoreticalideations.com>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

var os = require('os');
var fs = require('fs');
var url = require('url');
var path = require('path');
var spawn = require('child_process').spawn;
var del = require('del');
var reporter = require('nodeunit').reporters.default;

process.on('message', function(msg) {
  switch(msg.type) {
    case 'run':
      run();
      break;
    case 'config-received':
      parseConfig(msg.config);
      break;
  }
});

process.send({ type: 'init-complete' });

function run() {
  console.log('dut running');
}

function parseConfig(config) {
  var repoDir = path.join(os.tmpdir(), 'hwt', config.name);
  console.log('Deleting old clone in ' + repoDir + ', if it exists');
  del([ repoDir ], { force: true }).then(function(paths) {
    console.log('Cloning ' + config.name + ' to ' + repoDir);
    var gitProcess = spawn('git', [ 'clone', config.repo, repoDir ], {
      stdio: 'inherit'
    });
    gitProcess.on('close', function(code) {
      if (code !== 0) {
        console.error('Error cloning repo');
        return;
      }
      console.log('Running tests');
      reporter.run(config.tests.map(function(test) {
        return path.join(repoDir, test);
      }));
    });
  });
}
