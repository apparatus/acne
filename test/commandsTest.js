/*
 * THIS SOFTWARE IS PROVIDED ``AS IS'' AND ANY EXPRESSED OR IMPLIED
 * WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
 * OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED.  IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY DIRECT,
 * INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION)
 * HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT,
 * STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING
 * IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 * POSSIBILITY OF SUCH DAMAGE.
 */

'use strict';

var test = require('tape');
var acneMod = require('../acne');
var runner = require('./procRunner')();


test('step test', function(t) {
  t.plan(7);

  var acne = acneMod();
  runner.start('data/functions.js', function(ping) {
    acne.connect({}, function(err, v8Info) {
      t.assert(!err, 'connected');
      
      acne.resume(function(err) {
        t.assert(!err, 'resumed');
        acne.stepIn(function(err) {
          t.assert(!err, 'stepped in');
          acne.stepOut(function(err) {
            t.assert(!err, 'stepped out');
            acne.stepOver(function(err) {
              t.assert(!err, 'stepped over');
              acne.resume(function(err) {
                t.assert(!err, 'resumed');
                runner.stop(ping, function(){
                  t.pass('stopped');
                });
              });
            });
          });
        });
      });
    });
  });
});


test('scripts test', function(t) {
  t.plan(11);

  var acne = acneMod();
  runner.start('data/scope.js', function(ping) {
    acne.connect({}, function(err, v8Info) {
      t.assert(!err, 'connected');
      acne.resume(function(err) {
        t.assert(!err, 'resumed');
        acne.frame(0, function(err) {
          t.assert(!err, 'frame set');
          acne.scriptList(function(err, list) {
             t.assert(!err, 'scripts listed');
             t.assert(list.body[0].id, 'list first item body has an id');
            acne.scriptSource(list.body[0].id, function(err, source) {
              t.assert(!err, 'script sourced');
              t.assert(source, 'script source exists');
              acne.source(function(err, source) {
                t.assert(!err, 'current frame sourced');
                t.assert(source, 'current frame source exists');
                acne.resume(function(err) {
                  t.assert(!err, 'resumed');
                  runner.stop(ping, function(){
                    t.pass('stopped');
                  });
                });
              });
            });
          });
        });
      });
    });
  });
});


test('scopes test', function(t) {
  t.plan(8);

  var acne = acneMod();
  runner.start('data/scope.js', function(ping) {
    acne.connect({}, function(err, v8Info) {
      t.assert(!err, 'connected');
      acne.resume(function(err) {
        t.assert(!err, 'resumed');
        acne.scopes(function(err, scopes) {
          t.assert(!err, 'scopes succeeded');
          t.assert(scopes.body.scopes[1], 'first scope exists');
          acne.scope(scopes.body.scopes[1].index, function(err, scope) {
            t.assert(!err, 'first scope fetched');
            t.assert(scope, 'scope exists');
            acne.resume(function(err) {
              t.assert(!err, 'resumed');
              runner.stop(ping, function(){
                t.pass('stopped');
              });
            });
          });
        });
      });
    });
  });
});


test('breakpoint test', function(t) {
  t.plan(6);
  var acne = acneMod();
  var breakCount = 0;
  var cproc;

  acne.on('break', function(bp) {
    if (breakCount === 0) {
      acne.setBreakpoint(bp.breakpoint.script.id, 17, function(err, result) {
        t.assert(!err, 'breakpoint set');
        acne.resume(function(err) {
          t.assert(!err, 'resumed');
        });
      });
      breakCount = breakCount + 1;
      return;
    }
    if (breakCount === 1) {
      acne.clearBreakpoint(bp.breakpoint.breakpoints[0], function(err, result) {
        t.assert(!err, 'breakpoint cleared');
        acne.resume(function(err) {
          t.assert(!err, 'resumed');
          runner.stop(cproc, function() {
            t.pass('stopped');
          });
        });
      });
      return;
    }
  });

  runner.start('data/breakpoint.js', function(ping) {
    cproc = ping;
    acne.connect({}, function(err, v8Info) {
      t.assert(!err, 'connected');
    });
  });
});


