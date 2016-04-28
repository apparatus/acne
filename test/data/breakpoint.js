'use strict';

var wibble = {a:1, b:2};

var f = function() {
  var fish = {c:1, d:2};
  console.log('in f');
};

function g() {
  console.log('in g');
  f();
}

console.log('start');
g();
f();
console.log('end');
console.log('end');
console.log('end');

