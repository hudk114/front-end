/**
 * es5 extend, use delegate
 * @author hudk
 * @link http://blog.csdn.net/qaserfvvbbert/article/details/52252920
 */

var Base = {
  baseFunc: function () {
    console.log(this);
  }
};

// 令 Delegate.__proto__ === Base
var Delegate = Object.create(Base);

Delegate.delegateFunc = function delegateFunc() {
  // 通过这种方式不需要使用函数调用的硬绑定，用这种方式也可以保护愿型链方法
  this.baseFunc();
};

Delegate.selfFunc = function selfFunc() {
  console.log(this);
};