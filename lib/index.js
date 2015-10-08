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

var path = require('path');
var fork = require('child_process').fork;

var serverProcess = fork(path.join(__dirname, 'server.js'));
var dutProcess = fork(path.join(__dirname, 'dut.js'));
var dutVerifierProcess = fork(path.join(__dirname, 'dut_verifier.js'));
var initsWaiting = 3;

function processMessage(msg) {
  if (initsWaiting) {
    if (msg.type == 'init-complete') {
      initsWaiting--;
      if (!initsWaiting) {
        serverProcess.send({ type: 'run' });
        dutProcess.send({ type: 'run' });
        dutVerifierProcess.send({ type: 'run' });
      }
    }
    return;
  }
  if (msg.source != 'server') {
    serverProcess.send(msg);
  }
  if (msg.source != 'dut') {
    dutProcess.send(msg);
  }
  if (msg.source != 'dutVerifier') {
    dutVerifierProcess.send(msg);
  }
}

serverProcess.on('message', function(msg) {
  msg.source = 'server';
  processMessage(msg);
});

dutProcess.on('message', function(msg) {
  msg.source = 'dut';
  processMessage(msg);
});

dutVerifierProcess.on('message', function(msg) {
  msg.source = 'dutVerifier';
  processMessage(msg);
});
