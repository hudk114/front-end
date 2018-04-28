[toc]

promise是一种实现链式编写回调的方案，在ES6中实现

# 标准
1. [Promises/A](http://wiki.commonjs.org/wiki/Promises/A)
1. [Promises/A+](https://promisesaplus.com/)
ECMA的规范遵循Promises/A+，但包含一些不在规范中的方法，不完全等同于规范

## 规范实例
1. [promise状态](https://promisesaplus.com/#promise-states)
    * promise只有fulfilled, rejected, pending三种状态
    * 从pending转化为fulfilled或rejected后状态就不会再改变

            let promise1 = new Promise((resolve, reject) => {}); // pending
            let promise2 = new Promise((resolve, reject) => resolve()); // fulfilled
            let promise3 = new Promise((resolve, reject) => reject()); // rejected
            let promise4 = new Promise((resolve, reject) => {
              resolve();
              reject();
            }); // fulfilled

2. [then](https://promisesaplus.com/#the-then-method)
    * then方法是规范中定义的唯一方法，具体看规范即可
    * then方法中的两个回掉参数都需要等当前的execution context执行完后在执行（加入到microtash队列中）[test.js](https://github.com/hudk114/front-end/blob/master/js/es6/promise.js) line 16
    * then方法返回的依然是一个Promise，除非then方法没有指定相应的处理函数或者抛出异常，否则这个Promise会经历一个Promise解决过程([[Resolve]] (promise, value))

3. [[[Resolve]] (promise, value)](https://promisesaplus.com/#the-promise-resolution-procedure)
    * promise === value 抛异常(因为会链式调用)
    * 若value是一个Promise，则promise采用value的状态（但promise !== value)，且状态会随之改变
    * 若value是一个对象或方法，这段很绕
        * 如果value不是一个thenable(不是一个thenable对象或者方法)，抛出异常 [test.js](https://github.com/hudk114/front-end/blob/master/js/es6/promise.js) line 31
        * 如果value是thenable，调用value.then()，方法同then [test.js](https://github.com/hudk114/front-end/blob/master/js/es6/promise.js) line 34 48
        * 如果value.then抛出异常，调用promise的reject(error) [test.js](https://github.com/hudk114/front-end/blob/master/js/es6/promise.js) line 41
    * 若value不是对象或方法，调用promise的resolve方法，参数为value，见[test.js](https://github.com/hudk114/front-end/blob/master/js/es6/promise.js) line 59

## [api](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)
* Promise
* Promise.all
* Promise.race
* Promise.resolve
  * promise.resolve返回一个Promise对象，然后执行Promise解决过程
  * Promise.resolve(value)和new Promise(resolve => resolve(value))的返回过程是一致的
* Promise.reject
  * 同Promise.reject
* Promise.prototype.then
* Promise.prototype.catch
* Promise.prototype.finally

# 总结
Promise是一种用于减少回调写法的机制，所以一般用在异步机制中，此外，还有一些用途。
1. 封装异步操作(xhr，dom，nexttick...)

        var req = new Promise((resolve, reject) => {
          var xhr = new XMLHttpRequest();
          xhr.open(method, url);
          xhr.onreadystatechange = readystatechange => {
            xhr.readystatechange === 4 && xhr.status === 200
              ? resolve(xhr.response)
              : reject(xhr)
          }
          xhr.send(data);
        })
1. microtask
Promise会被插入到microtask中执行，可以用来做一些需要等当前JS执行栈执行完的行为，比如vue的nextTick

# 参考
1. [从0开始构建自己的前端知识体系-JS-跟着规范学Promise](https://segmentfault.com/a/1190000014464934) 曹老师加油hhhhh