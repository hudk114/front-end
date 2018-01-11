/** this of function
 *  @author hudk
 *  @link https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Operators/this
 */

// this是基于函数运行时的执行环境绑定的

// strict mode下绑定
function f() {
  "use strict"; // 只有在调用的运行中使用strict mode才会绑定到undefined
  console.log(this.a);
}
var a = 2;
(function() {
  f();
})(); // TypeError

"use strict"
function f() {
  console.log(this.a);
}
var a = 2;
(function() {
  "use strict"
  f();
})(); // 2

// callback lose this
function f1() {
  console.log(this);
}
function f2(fn) {
  // fn();
  f1();
}
function f3() {
  f2();
}
f3();
// f2(f1); // windows