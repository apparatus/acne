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

var net = require('net');
var assert = require('assert');
var assign = require('object-assign');


/**
 * implements V8 client debugger protocol as documented here:
 * https://github.com/v8/v8/wiki/Debugging%20Protocol
 */
module.exports = function() {
  var cbt = {eventCb: null, table: {}};
  var connected = false;
  var seq = 0;
  var client;
  var v8Info= false;



  var track = function track(obj, cb) {
    cbt.table[obj.seq] = {command: obj, cb: cb};
  };



  var lookup = function lookup(seq) {
    var copy = assign({}, cbt.table[seq]);
    delete cbt.table[seq];
    cbt.table[seq] = null;
    return copy;
  };



  /**
   * Handle the first response on socket connect from the debugger. This is of the form:
   * Type: connect
   * V8-Version: 4.6.85.31
   * Protocol-Version: 1
   * Embedding-Host: node v5.4.0
   */
  var parseFirstResponse = function parseFirstResponse(data) {
    data = data.toString()
    var type = /Type: ([a-zA-Z]+)/g.exec(data);
    var version = /V8-Version: ([0-9\.]+)/g.exec(data);
    var protocolVersion = /Protocol-Version: ([0-9\.]+)/g.exec(data);
    var idx;

    assert(type && type[1] === 'connect');
    assert(version);
    assert(protocolVersion && protocolVersion[1] === '1');

    v8Info = {version: version[1], protocolVersion: protocolVersion[1]};
    idx = data.indexOf('Content-Length');
    return data.substring(idx);
  };



  /**
   * parse response messages from V8. These are of the form:
   *
   * Content-Length: 138
   *
   * {"seq":15,"request_seq":1,"type":"response","command":"version","success":true,"body":{"V8Version":"4.6.85.31"},"refs":[],"running":false}
   */
  var parseResponse = function parseResponse(data) {
    var messages = data.split('Content-Length:');
    var responses = [];

    messages.forEach(function(message) {
      if (message.length > 0) {
        var contentLength;
        var s = message.split('\r\n');
        var msg;
        assert(s.length === 3);
        contentLength = parseInt(s[0].trim(), 10);
        assert(contentLength >= 0);

        if (contentLength > 0) {
          msg = JSON.parse(s[2]);
          responses.push(msg);
        }
      }
    });
    return responses;
  };



  /**
   * handle messages from the debugger, message is either an event or a response.
   * Response messages are of the form:
   *
   * {seq: <number>,
   *  type: "response",
   *  request_seq: <number>,
   *  command: <command>
   *  body: ...
   *  running: <is the VM running after sending this response>
   *  success: <boolean indicating success>
   *  message: <if command failed this property contains an error message>}
   *
   * event messages are of the form:
   *
   * {seq: <number>,
   *  type: "event",
   *  event: <event name>
   *  body: ... }
   */
  var handleMessages = function handleMessages(messages) {

    messages.forEach(function(message) {
      var cb;

      assert(message.type === 'response' || message.type === 'event');

      if (message.type === 'response') {
        cb = lookup(message.request_seq);
        assert(cb);
        cb.cb(message.message, message);
      }

      if (message.type === 'event') {
        cbt.eventCb(null, message);
      }
    });
  };



  var connect = function connect(options, eventCb, connectCb) {
    assert(!connected);

    options.host = options.host || 'localhost';
    options.port = options.port || 5858;
    cbt.eventCb = eventCb;

    client = net.connect(options.port, options.host, function() {
      connected = true;
    });

    client.on('data', function(data) {
      var messages;

      if (!v8Info) {
        data = parseFirstResponse(data);
        connectCb(null, v8Info);
      }
      else {
        data = data.toString();
      }

      messages = parseResponse(data);
      handleMessages(messages);
    });

    client.on('end', function() {
      cbt.eventCb(null, {type: 'end', event: 'end', body: null});
    });

    client.on('error', function(err) {
      if (!connected) {
        connectCb(err, null);
      }
      else {
        cbt.eventCb(err, {type: 'error', event: 'error', body: null});
      }
    });
  };



  /**
   * send debugger message, obj is of the form:
   *
   * {command: <command>,
   *  arguments: ...
   */
  var send = function send(obj, cb) {
    var packet;

    assert(connected);

    obj.seq = ++seq;
    obj.type = 'request';
    packet = JSON.stringify(obj);

    if(cb){
      track(obj, cb);
    }
    client.write('Content-Length:' + packet.length + '\r\n\r\n' + packet);
  };



  var disconnect = function disconnect() {
    assert(connected);
    client.end();
    client = null;
    connected = false;
  };



  return {
    connect: connect,
    disconnect: disconnect,
    send: send
  };
};

