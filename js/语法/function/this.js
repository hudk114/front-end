/**
 * this of function
 * @author hudk
 * @link https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Operators/this
 * @link http://blog.csdn.net/qaserfvvbbert/article/details/52385699
 */

// 函数简单调用下绑定到全局

// strict mode下绑定
function f() {
  'use strict'; // 只有在调用的运行中使用strict mode才会绑定到undefined
  console.log(this.a);
}
var a = 2;
(function() {
  f();
})(); // TypeError

('use strict');
function f() {
  console.log(this.a);
}
var a = 2;
(function() {
  'use strict';
  f();
})(); // 2

// 使用apply, call, bind可以改变this值(显式绑定)
function f() {}
f.apply(obj);
f.call(obj);
var f1 = f.bind(obj); // f1 is a function which is always bind to obj
f1();
// 通过call与apply绑定后的函数无法重新绑定
function f() {
  console.log(this.a);
}
var obj = { a: 1 };
function f1() {
  f.call(obj);
}
var a = 2;
f1.call(window); // 1
var f2 = f1.bind(obj);
f2 = f1.bind(window);
f2(); // 1

// 作为对象方法调用会绑定到对象

var obj = {
  func: function() {
    console.log(this);
  }
};
obj.func(); // obj
// 丢失
obj.func(); // obj
var c;
(c = obj.func)(); // window
(obj.func = obj.func)(); // window

// callback lose this
var obj = {
  f() {
    console.log(this);
  }
};
function f(fn) {
  fn(); // same as (fn = obj.f)()
}
f(obj.f); // windows

// 构造函数 绑定到返回到对象

// array(lambda)
// 无自己的this，绑定到定义时的外层this
// 之后再用apply，call与bind方法也无效
var obj = {
  a: function() {
    return () => console.log(this);
  }
};
obj.a()(); // obj
var f = obj.a();
f(); // obj 在obj的调用过程中外层this绑定了！
var f2 = obj.a;
f2()(); // window

// TODO 优先级

//
function b() {
  console.log(this);
}
b();
b.call({ a: 2 });
b.call();

// 例外
function f() {
  console.log(this);
}
var f1 = f.bind(null);
var f2 = f.bind();
f1(); // window
f2(); // window
f.apply(); // window
f.call(null); // window
