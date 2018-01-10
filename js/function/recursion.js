/** recursion
 *  @author hudk
 */

// basic
// func被重新定义后调用会出错
var func = function func(num) {
  if (num <= 1) {
    return 1
  }
  return num * func(num - 1)
}

// argument.callee
// 严格模式会报错
var func = function func(num) {
  if (num <= 1) {
    return 1
  }
  return num * arguments.callee(num - 1)
}

// 匿名命名表达式
// f在表达式外无法获取 https://developer.mozilla.org/zh-CN/docs/web/JavaScript/Reference/Operators/function
var func = function f(num) {
  if (num <= 1) {
    return 1
  }
  return num * f(num - 1)
}