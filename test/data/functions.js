'use strict';

var f = function() {
  console.log('in f');
};

function g() {
  console.log('in g');
  f();
}

console.log('start');
debugger;
g();
debugger;
f();
console.log('end');

