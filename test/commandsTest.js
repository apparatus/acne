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
      t.assert(!err);
      
      acne.resume(function(err) {
        t.assert(!err);
        acne.stepIn(function(err) {
          t.assert(!err);
          acne.stepOut(function(err) {
            t.assert(!err);
            acne.stepOver(function(err) {
              t.assert(!err);
              acne.resume(function(err) {
                t.assert(!err);
                runner.stop(ping, function(){
                  t.pass();
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
      t.assert(!err);
      acne.resume(function(err) {
        t.assert(!err);
        acne.frame(0, function(err) {
          t.assert(!err);
          acne.scriptList(function(err, list) {
             t.assert(!err);
             t.assert(list.body[0].id);
            acne.scriptSource(list.body[0].id, function(err, source) {
              t.assert(!err);
              t.assert(source);
              acne.source(function(err, source) {
                t.assert(!err);
                t.assert(source);
                acne.resume(function(err) {
                  t.assert(!err);
                  runner.stop(ping, function(){
                    t.pass();
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
      t.assert(!err);
      acne.resume(function(err) {
        t.assert(!err);
        acne.scopes(function(err, scopes) {
          t.assert(!err);
          t.assert(scopes.body.scopes[1]);
          acne.scope(scopes.body.scopes[1].index, function(err, scope) {
            t.assert(!err);
            t.assert(scope);
            acne.resume(function(err) {
              t.assert(!err);
              runner.stop(ping, function(){
                t.pass();
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
        t.assert(!err);
        acne.resume(function(err) {
          t.assert(!err);
        });
      });
      breakCount = breakCount + 1;
      return;
    }
    if (breakCount === 1) {
      acne.clearBreakpoint(bp.breakpoint.breakpoints[0], function(err, result) {
        t.assert(!err);
        acne.resume(function(err) {
          t.assert(!err);
          runner.stop(cproc, function(){
            t.pass();
          });
        });
      });
      return;
    }
  });

  runner.start('data/breakpoint.js', function(ping) {
    cproc = ping;
    acne.connect({}, function(err, v8Info) {
      t.assert(!err);
    });
  });
});


