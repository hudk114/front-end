/** function closure
 *  @author hudk
 *  @link http://blog.csdn.net/qaserfvvbbert/article/details/52354468
 */

// 指有权访问另一个函数作用域中的函数
function outter() {
  var outterData = 1;
  // 在创建inner时会创建一个预先包含全局变量对象的作用域链，只保存，并非是真的作用域链
  return function inner() {
    console.log(outterData);
  };
}

// 调用inner时会创造执行环境，然后赋值函数的[[scope]]中的对象构建执行环境作用域链，最后将函数活动对象推入作用域链最前端
inner(); // 1

// 闭包包含了定义时的函数的活动对象，因此可能会造成内存泄漏
function outter() {
  var ele = document.getElementById('test');
  ele.onclick = function() {
    // 循环引用自身，造成引用次数为2，无法被清除
    console.log(ele.id);
  };
}
function outter() {
  var ele = document.getElementById('test');
  var id = ele.id; // 存储闭包
  ele.onclick = function() {
    console.log(id);
  };
  ele = null; // 断开连接，减少引用
}

// 闭包保存的是整个对象
function outter() {
  var arr = [];
  for (var i = 0; i < 10; i++) {
    result[i] = function() {
      return i;
    };
  }
  return arr;
}
// 闭包访问的i是同一个
arr[3]; // 10

// 模块
var module = (function createModule() {
  var privateProperty = 0; // 静态私有变量
  var privateFunc = function privateFunc(params) {
    console.log('1');
    return true;
  };

  var obj = new Base(); // 保证返回的module一定是Base的实例
  obj.publicProperty = 1;
  obj.publicFunc = function publicFunc() {
    privateProperty++;
    return privateFunc();
  };

  return obj;
})();
