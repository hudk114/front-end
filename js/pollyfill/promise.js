/* eslint-disable */
function noop() {}

function nextTick(cb) {
  if (typeof setImmediate === 'function') {
    setImmediate(cb);
  } else {
    setTimeoutFunc(cb, 0);
  }
}

function isObj(val) {
  return val && typeof val === 'object';
}

function isFunc(val) {
  return typeof val === 'function';
}

var STATUS = {
  PENDING: 0,
  FULFILLED: 1,
  REJECTED: 2
};

function Promise(resolver) {
  if (!(this instanceof Promise)) {
    throw new TypeError('需要new调用');
  }
  if (typeof resolver !== 'function') {
    throw new TypeError('resolver必须是function');
  }

  this._value = undefined;
  this._status = STATUS.PENDING;

  // 在pending过程中通过then加入方法，需要延迟执行，所以加入到handles中
  // 注意，不挂载链式加载的，只有直接挂载到这个promise上的then才会加载
  this._handles = [];
}

// [[Resolve]] (promise, value) 过程
function resolve(promise, value) {
  if (promise === value) {
    throw new TypeError('promise返回的值不可以是本身');
  }

  if (value instanceof Promise) {
    // TODO

    return;
  }

  if (ifObj(value) || isFunc(value)) {
    try {
      // TODO
      var then = value.then;
      then
    } catch (e) {
      reject(promise, e);
    }
  }
}

// 将promise reject
function reject(promise, value) {
  promise._status = STATUS.REJECTED;
  promise._value = value;
  finish(promise);
}

// promise状态完结
function finish(promise) {
  // TODO 未处理的error

  // 对每个handle自行处理即可
  promise._handles.forEach(handle => {
    handle(promise, handle);
  });

  promise._handles = [];
}

// defer包含新Promise对象和处理方法，根据promise的状态进行操作
function handle(promise, defer) {
  // 当前的还没结束，需要延时处理
  if (promise._status === this.PENDING) {
    promise._handles.push(deffered);
    return;
  }

  nextTick(function() {
    var cb =
      promise._status === promise.STATUS.FULFILLED
        ? defer.onFulfilled
        : defer.onRejected;

    // TODO cb不存在的情况

    var res = null;
    try {
      res = cb(promise._value);
    } catch (e) {
      // 将新的promise转换为reject状态
      reject(defer.promise, e);
      return;
    }

    resolve(defer.promise, res);
  });
}

// then方法会返回一个promise对象，这个对象的结果会根据当前promise对象的结果改变
Promise.prototype.then = function(onFulfilled, onRejected) {
  var p = new Promise(noop);

  handle(this, {
    promise: p,
    onFulfilled: onFulfilled,
    onRejected: onRejected
  });

  return p;
};

Promise.resolve = function(val) {
  // TODO thenable转化为promise

  return new Promise(function(res) {
    res(val);
  });
};

Promise.reject = function(val) {
  return new Promise(function(res, rej) {
    rej(val);
  });
};

export default Promise;
