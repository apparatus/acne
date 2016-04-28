/* jshint camelcase: false */
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


module.exports = function(protocol) {
 
  var version = function(cb) { protocol.send({command: 'version'}, cb); };
  var pause = function(cb) { protocol.send({command: 'suspend'}, cb); };
  var resume = function(cb) { protocol.send({command: 'continue'}, cb); };
  var stepIn = function(cb) { protocol.send({command: 'continue', arguments: {stepaction: 'in'}}, cb); };
  var stepOver = function(cb) { protocol.send({command: 'continue', arguments: {stepaction: 'next'}}, cb); };
  var stepOut = function(cb) { protocol.send({command: 'continue', arguments: {stepaction: 'out'}}, cb); };

  var evaluate = function(frame, expression, cb) { 
    protocol.send({command: 'evaluate', 
                   arguments: {expression: expression,
                               frame: frame,
                               global: false,
                               disable_break: false}}, cb);
  };

  var backtrace = function(cb) { protocol.send({command: 'backtrace'}, cb); };
  var frame = function(frame, cb) { protocol.send({command: 'frame', arguments: {number: frame}}, cb); };

  var scope = function(frame, scope, cb) { 
    protocol.send({command: 'scope', 
                   arguments: {number: scope,
                               frameNumner: frame}}, cb);
  };

  var scopes = function(frame, cb) { protocol.send({command: 'scopes', arguments: {frameNumber: frame}}, cb); };

  var scriptList = function(cb) {
    protocol.send({command: 'scripts', 
                   arguments: {types: 4,
                               includeSource: false}}, cb);
  };

  var scriptSource = function(scriptId, cb) {
    protocol.send({command: 'scripts', 
                   arguments: {types: 4,
                               ids: [scriptId],
                               includeSource: true}}, cb);
  };

  var source = function(frame, cb) { protocol.send({command: 'source', arguments: {frame: frame}}, cb); };

  var setBreakpoint = function(scriptId, line, cb) {
    protocol.send({command: 'setbreakpoint', 
                   arguments: {target: scriptId,
                               type: 'scriptId',
                               line: line}}, cb);
  };

  var clearBreakpoint = function(breakpointId, cb) { protocol.send({command: 'clearbreakpoint', arguments: {breakpoint: breakpointId}}, cb); };


  return {
    version: version,
    pause: pause,
    resume: resume,
    stepIn: stepIn,
    stepOver: stepOver,
    stepOut: stepOut,
    evaluate: evaluate,
    backtrace: backtrace,
    frame: frame,
    scope: scope,
    scopes: scopes,
    scriptList: scriptList,
    scriptSource: scriptSource,
    source: source,
    setBreakpoint: setBreakpoint,
    clearBreakpoint: clearBreakpoint
  };
};

