[mdn](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Operators/this)
[csdn](http://blog.csdn.net/qaserfvvbbert/article/details/52385699)
this由调用方法与位置决定，与定义位置，作用域，上下文均无关

# 全局
绑定到全局对象
```js
this // window
console.log(this) // window
```
# 函数调用

## 简单调用
绑定到全局
```js
function f() {
  console.log(this);
}
f(); // window
```
*严格模式会绑定到undefined*
```js
// strict mode下绑定
function f() {
  'use strict'; // 只有在调用的运行中使用strict mode才会绑定到undefined
  console.log(this.a);
}
var a = 2;
(function () {
  f();
})(); // TypeError

'use strict'
function f() {
  console.log(this.a);
}
var a = 2;
(function () {
  'use strict'
  f();
})(); // 2
```
## 使用apply,call,bind
是一种显式绑定
```js
function f() { console.log(this); }
f.apply(obj); // obj
f.call(obj); // obj
var f1 = f.bind(obj); // f1 is a function which is always bind to obj
f1(); // obj
```
*通过call与apply绑定后的函数无法重新绑定(硬绑定)*
```js
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
```
## 箭头表达式
无自己的this，[参考](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Functions/Arrow_functions)
绑定到外层的this，之后无法通过硬绑定重新绑定
```js
var obj = {
  a: function () {
    return (() => console.log(this));
  }
}
obj.a()(); // obj
var f = obj.a();
f(); // obj 在obj的调用过程中外层this绑定了！
var f2 = obj.a;
f2()(); // window
```
# 对象调用
```js
var obj = {
  func: function f() { console.log(this) }
}
obj.func() // obj
```
*严格意义上方法f不属于对象，只是由对象调用，从而将其this绑定到对象，因此可能会发生丢失*
```js
(obj.func)() // obj
var c;
(c = obj.func)() // window
(obj.func = obj.func)() // window
// callback
var obj = {
  f() {
    console.log(this);
  }
}
function f(fn) {
  fn(); // same as (fn = obj.f)()
}
f(obj.f); // windows
```
# 构造调用
this指向返回到新对象
*调用过程[参考](http://blog.csdn.net/qaserfvvbbert/article/details/52386723)*
```js
var NewObj = function() {}
var Obj = new NewObj(); // this == Obj
```
# 优先级
new（构造调用）  > 硬绑定（call，apply，bind） > 隐绑定（对象调用） > 默认（window）
# 例外
1. 硬绑定中传入null或undefined会应用默认绑定
```js
function f() {
  console.log(this)
}
var f1 = f.bind(null);
var f2 = f.bind();
f1() // window
f2() // window
f.apply() // window
f.call(null) // window
```
1. 函数不是对象的成员，只是一个引用，因此用对象赋值会使用默认绑定


# 其他

## map
map可将this传递到函数中，若不传递，默认为window
```js
var obj = {
  array: [1],
  f() {
    this.array.map(function (item) {
      console.log(this);
    });
  },
  f1() {
    this.array.map(function (item) {
      console.log(this);
    },this);
  }
};
obj.f(); // window
obj.f1(); // obj
```
## 对象定义
在群里看到有人说了这样一种情况
```js
var a = 10;
var obj = {
  a: 20,
  b: this.a + 10
};

console.log(obj.b); // 20 
```
很明显，这里的this指向的是window而非obj

我的理解是，this的指向是函数调用时由调用方法与对象决定的。在编译过程中，对b的赋值就是一次对b的RHS以及对a的LHS，此时类似会有一个IIFE调用
```js
var obj = {
  b: (function () { return this.a + 10 })()
};
```
显然，这是一次隐式调用，this指向window