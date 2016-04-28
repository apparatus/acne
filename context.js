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


/**
 * provides a cache of script and scope context
 */
module.exports = function() {
  var scriptCache = {};
  var currentFrameId;
  var currentContext;

  var cacheScript = function(scriptId, script) { scriptCache[scriptId] = script; };
  var script = function(scriptId) { return scriptCache[scriptId]; };
  var setFrame = function(frameId) { currentFrameId = frameId; };
  var frame = function() { return currentFrameId; };
  var setContext = function(context) { currentContext = context; };
  var context = function() { return currentContext; };

  return {
    cacheScript: cacheScript,
    script: script,
    setFrame: setFrame,
    frame: frame,
    setContext: setContext,
    context: context
  };
};

