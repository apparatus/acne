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

var EventEmitter = require('events').EventEmitter;
var util = require('util');
var assign = require('object-assign');


module.exports = function() {
  var protocol = require('./protocol')();
  var context = require('./context')();
  var commands = require('./commands')(protocol);

  var emitter = new EventEmitter();



  /**
   * possible events: break, exception, afterCompile, end
   */
  var eventCb = function(err, evt) {
    if (evt.event === 'break') {
      context.setFrame(0);
      commands.backtrace(function(err, result) {
        context.setContext({breakpoint: evt.body, frames: result.body});
        emitter.emit(evt.event, context.context());
      });
    }
  };



  var connect = function(options, cb) { 
    protocol.connect(options, eventCb, function(err, result) {
      if (!err) {
        commands.version(function() {
          cb(err, result);
        });
      }
      else {
        cb(err, result);
      }
    }); 
  };



  var disconnect = function() { 
    protocol.send({command: 'disconnect'}, function() { 
    }); 
    setTimeout(function() {
      protocol.disconnect(); 
    }, 10);
  };



  var frame = function(frame, cb) {
    commands.frame(frame, function(err, result) {
      if (!err) {
        context.setFrame(frame);
      }
      cb(err, result);
    });
  };



  var evaluate = function(expression, cb) { 
    commands.evaluate(context.frame(), expression, cb);
  };



  var scopes = function(cb) {
    commands.scopes(context.frame(), cb);
  };



  var scope = function(scope, cb) { 
    commands.scope(context.frame(), scope, cb);
  };



  var scriptSource = function(scriptId, cb) {
    var result = context.script(scriptId);
    if (result) {
      cb(null, result);
    }
    else {
      commands.scriptSource(scriptId, function(err, result) {
        if (!err) {
          context.cacheScript(scriptId, result);
        }
        cb(err, result);
      });
    }
  };


  //? add cacheing here
  var source = function(cb) {
    commands.source(context.frame(), cb);
  };



  var execute = {
    version: commands.version,
    pause: commands.pause,
    resume: commands.resume,
    stepIn: commands.stepIn,
    stepOver: commands.stepOver,
    stepOut: commands.stepOut,
    backtrace: commands.backtrace,
    scriptList: commands.scriptList,
    setBreakpoint: commands.setBreakpoint,
    clearBreakpoint: commands.clearBreakpoint,
    connect: connect,
    disconnect: disconnect,
    frame: frame,
    evaluate: evaluate,
    scopes: scopes,
    scope: scope,
    scriptSource: scriptSource,
    source: source
  };

  return assign(emitter, execute);
};

