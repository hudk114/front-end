[next-tick 官方文档](https://cn.vuejs.org/v2/api/#Vue-nextTick)

# 简介

next-tick 的位置在`src/core/utils/next-tick.js`

# next-tick 文件

最核心的几个方法是 flushCallback，nextTick 及 macroTask 与 microTask，其中前两者是负责消息的处理与建立，后两者是构建不同的消息执行体，此外还有一个 withMacroTask
   ## flushCallback

```javascript
const callbacks = [];
let pending = false;

function flushCallbacks() {
  pending = false;
  const copies = callbacks.slice(0);
  callbacks.length = 0;
  for (let i = 0; i < copies.length; i++) {
    copies[i]();
  }
}
```

就是一个队列的消费者

## nextTick

nextTick 的作用是将传入的 callback 分发到不同的 TimerFunc 中

```javascript
function nextTick (cb?: Function, ctx?: Object) {
  let _resolve
  callbacks.push(() => {
    if (cb) {
      try {
        cb.call(ctx)
      } catch (e) {
        handleError(e, ctx, 'nextTick')
      }
    } else if (_resolve) {
      _resolve(ctx)
    }
  })

  ... // 分发部分先跳过

  if (!cb && typeof Promise !== 'undefined') {
    return new Promise(resolve => {
      _resolve = resolve
    })
  }
}
```

闭包，当没有 cb 传入的时候，返回的就是一个简单的 promise（microtask），并且在回调队列中会直接触发 then 事件；否则就是执行回调，并不会有返回值。

```javascript
function nextTick (cb?: Function, ctx?: Object) {

  ...

  if (!pending) {
    pending = true
    if (useMacroTask) { // 手动指定使用macroTask方式
      macroTimerFunc()
    } else {
      microTimerFunc()
    }
  }

  ...
}
```

分发部分，这部分是 next-tick 函数的核心触发的 timerFunc 分为[macroTask 和 microTask](https://juejin.im/entry/58332d560ce46300610e4bad)
pending 的状态只有在 flushCallback 中才会修改，因此分发部分可以保证一次 nextTick 处理流程中只触发一次 timerFunc，亦即只有一次 flushCallback 事件由于整个模块中只有一个 callback，所以一次 nextTick 或者是由 macro 或者是由 micro 来处理；而若这次 nextTick 中有 macro 事件，那么在下一个 eventLoop 前（或者本次 eventloop 的最后处理 setImmediate 前），所有的 microTask 都无法触发，必须等到 microTimerFunc 中定义的 macroTask 来处理

> 有一个问题，如果先调用 microTask 然后接着在其还没有被执行的时候再 nextTick 一个 macroTask（在 vue 中是绑定的 v-dom 事件），那么 macroTask 会在下次执行 microTask 的时候被执行，这明显是不对的

>好吧，这个问题和 eventloop 的触发有关，Vue 在所有 DOM 元素的 addEventListener 上定义了使用 macroTask，所以如果是用户触发，最外层的回掉事件就会首先采用 macroTask；而如果使用的是 programmatical trigger，则在当前执行栈 jsstack 内就会触发 bubble 和 capture，不会存在 Vue 注释里面说的那种问题

> [参考 1](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/dispatchEvent)

>[参考 2](https://www.youtube.com/watch?v=cCOL7MC4Pl0&feature=youtu.be&t=1797)

> 根据这个特性，写了一个[库](https://github.com/hudk114/judgeInteract)，用来区分用户触发事件和程序触发事件

## timerFunc

### macroTask

```javascript
let microTimerFunc;
let macroTimerFunc;
let useMacroTask = false;

// Technically setImmediate should be the ideal choice, but it's only available
// in IE. The only polyfill that consistently queues the callback after all DOM
// events triggered in the same loop is by using MessageChannel.
if (typeof setImmediate !== 'undefined' && isNative(setImmediate)) {
  macroTimerFunc = () => {
    setImmediate(flushCallbacks);
  };
} else if (
  typeof MessageChannel !== 'undefined' &&
  (isNative(MessageChannel) ||
    // PhantomJS
    MessageChannel.toString() === '[object MessageChannelConstructor]')
) {
  const channel = new MessageChannel();
  const port = channel.port2;
  channel.port1.onmessage = flushCallbacks;
  macroTimerFunc = () => {
    port.postMessage(1);
  };
} else {
  macroTimerFunc = () => {
    setTimeout(flushCallbacks, 0);
  };
}
```

可以看到，分别使用了`setImmediate`，`MessageChannel`和`setTimeout`三种方法。保证 flushCallback 会在下一次 eventloop 中执行早期的是使用`mutationObserve`实现的

### microTask

```javascript
// Determine microtask defer implementation.
if (typeof Promise !== 'undefined' && isNative(Promise)) {
  const p = Promise.resolve();
  microTimerFunc = () => {
    p.then(flushCallbacks);
    // in problematic UIWebViews, Promise.then doesn't completely break, but
    // it can get stuck in a weird state where callbacks are pushed into the
    // microtask queue but the queue isn't being flushed, until the browser
    // needs to do some other work, e.g. handle a timer. Therefore we can
    // "force" the microtask queue to be flushed by adding an empty timer.
    if (isIOS) setTimeout(noop);
  };
} else {
  // fallback to macro
  microTimerFunc = macroTimerFunc;
}
```

采用 promise 实现，有意思的一点是针对 ios 的 UIWebViews 进行了优化，强行触发了一次 microtask 的事件处理

### withMacroTask

```javascript
function withMacroTask(fn: Function): Function {
  return (
    fn._withTask ||
    (fn._withTask = function() {
      useMacroTask = true;
      const res = fn.apply(null, arguments);
      useMacroTask = false;
      return res;
    })
  );
}
```

装饰器，返回了一个通过 macro 处理的函数，看下使用
`platforms\web\runtime\modules\event.js`

```javascript
function add(event: string, handler: Function, once: boolean, capture: boolean, passive: boolean) {
  handler = withMacroTask(handler);
  if (once) handler = createOnceHandler(handler, event, capture);
  target.addEventListener(event, handler, supportsPassive ? { capture, passive } : capture);
}
```

增加事件监听方法，将 DOM 事件放到了下一个 macroTask 队列中

## 总结

1. next-ticker.js 只是一个底层的封装，将函数放到函数队列中，并通过 microTask 和 macroTask 将处理函数推迟处理；
2. next-ticker 在上层对 macroTask 的使用进行判断处理，目前只有用户手动触发的DOM事件会采用macroTask。
