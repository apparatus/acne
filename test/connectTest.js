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


test('connect test', function(t) {
  t.plan(2);

  var acne = acneMod();
  runner.start('data/ping.js', function(ping) {
    acne.connect({}, function(err, v8Info) {
      t.assert(!err);
      acne.disconnect();
      runner.stop(ping, function(){
        t.pass();
      });
    });
  });
});


test('connect fail test', function(t) {
  t.plan(1);

  var acne = acneMod();
  acne.connect({}, function(err, v8Info) {
    t.assert(err);
  });
});


test('failed connection test', function(t) {
  t.plan(2);

  var acne = acneMod();
  runner.start('data/ping.js', function(ping) {
    acne.connect({}, function(err, v8Info) {
      t.assert(!err);
      runner.stop(ping, function(){
        t.pass();
        acne.version(function(err, result) {
        });
      });
    });
  });
});

