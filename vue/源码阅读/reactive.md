# 响应式原理
vue的响应式是通过`Object.defineProperty`实现的，也就是对象劫持

文件位置在`src/core/observer`，顾名思义，是通过观察者模型实现的

# index.js
用于数据劫持的核心功能
包含的主要有`Observer`类，`observe`,`defineReactive`,`set`与`del`方法

## Observer类
一个Observer实例与一个响应式对象相连（attached），保存了这个对象的响应式内容

Observer内保存了Dep实例（实例触发用），vmCount（使用次数）及原始value值

### constructor
```js
this.value = value
this.dep = new Dep()
this.vmCount = 0
def(value, '__ob__', this)
if (Array.isArray(value)) {
  const augment = hasProto
    ? protoAugment
    : copyAugment
  augment(value, arrayMethods, arrayKeys)
  this.observeArray(value)
} else {
  this.walk(value)
}
```
内容很简单，针对Array与Object做不同的处理，对其调用walk与observeArray方法，在这些方法里将value转换成响应式对象
```js
walk (obj: Object) {
  const keys = Object.keys(obj)
  for (let i = 0; i < keys.length; i++) {
    defineReactive(obj, keys[i])
  }
}
```
显然，转换为响应式对象的核心是`defineReactive`方法

### defineReactive + observe
defineReactive里做了很多针对不同情况的设计，但是核心是以下这段
```js
let childOb = !shallow && observe(val)
Object.defineProperty(obj, key, {
  enumerable: true,
  configurable: true,
  get: function reactiveGetter () {
    const value = getter ? getter.call(obj) : val // getter是原有定义的getter方法，如果定义了，就调用原有的
    
    ...

    return value
  },
  set: function reactiveSetter (newVal) {
    const value = getter ? getter.call(obj) : val // 同getter中
    /* eslint-disable no-self-compare */
    if (newVal === value || (newVal !== newVal && value !== value)) {
      return
    }
    
    ...

    if (setter) {
      setter.call(obj, newVal)
    } else {
      val = newVal
    } // 同getter

    childOb = !shallow && observe(newVal)

    ...
  }
})
```
可以看到，defineReactive对原本的数据进行了一次劫持，而在劫持过程中调用了`observe`对child对象进行进一步的观察
```js
export function observe (value: any, asRootData: ?boolean): Observer | void {
  if (!isObject(value) || value instanceof VNode) {
    return
  }
  let ob: Observer | void
  if (hasOwn(value, '__ob__') && value.__ob__ instanceof Observer) {
    ob = value.__ob__
  } else if (
    ...
  ) {
    ob = new Observer(value)
  }
  
  ...

  return ob
}
```
可见，observe的过程就是将value转化成一个Observer实例，而Observer实例的创建又会调用一次`defineReactive`，因此两者形成了一个递归，劫持了value下的所有属性

**这里也可以看到，判断一个实例有没有被vue劫持可以看他有没有`__ob__`属性**

当然，仅仅劫持了属性并没有用，也无法做到响应式的效果，前面说过，Observe是一个观察者模型，因此，在劫持的同时也是一个观察者建立的过程。回到`defineReactive`
```js
const dep = new Dep()

...

let childOb = !shallow && observe(val)
Object.defineProperty(obj, key, {
  enumerable: true,
  configurable: true,
  get: function reactiveGetter () {
    const value = getter ? getter.call(obj) : val

    if (Dep.target) {
      dep.depend()
      if (childOb) {
        childOb.dep.depend()
        if (Array.isArray(value)) {
          dependArray(value)
        }
      }
    }

    return value
  },
  set: function reactiveSetter (newVal) {
    const value = getter ? getter.call(obj) : val
    /* eslint-disable no-self-compare */
    if (newVal === value || (newVal !== newVal && value !== value)) {
      return
    }

    ...

    dep.notify()
  }
})
```
可以看到，观察者模型的实例是一个Dep实例，而且，对于每一个Observer实例（通过constructor方法）和底下的每一个对象（通过defineReactive）都会有一个Dep实例。关于Dep实例在后续进行说明

### set + del
这两个是Vue提供的方法： [Vue.set](https://cn.vuejs.org/v2/api/#Vue-set) [Vue.delete](https://cn.vuejs.org/v2/api/#Vue-delete)

***其中有一个很小的坑，`Vue.set`里面写的是，“向响应式对象中添加一个属性”，根据源码，向非响应式对象添加属性只会简单对挂载，不会触发更新***

两个方法对内容其实很简单，基本过程都是判断验证有效性、根据不同数据类型进行不同的更新，触发观察者Dep实例的notify。以set为例
```js
export function set (target: Array<any> | Object, key: any, val: any): any {
  
  ...

  // 针对array处理
  if (Array.isArray(target) && isValidArrayIndex(key)) {
    target.length = Math.max(target.length, key)
    target.splice(key, 1, val)
    return val
  }

  // 与del不同之处，如果有这个值，认为之前已经进行过observe了，不需要再次处理
  // 当然可能会引入一些问题，就是之前有这个值但是这个值没有被vue处理过，那么就没有办法触发
  if (key in target && !(key in Object.prototype)) {
    target[key] = val
    return val
  }

  // 同上，利用__ob__判断是否已经被vue劫持
  const ob = (target: any).__ob__
  
  ...

  // 普通的不进行劫持
  if (!ob) {
    target[key] = val
    return val
  }

  // 进行劫持，并对新的val进行递归劫持，触发obj的更新
  defineReactive(ob.value, key, val)
  ob.dep.notify()

  return val
}
```
可见，Observer中所做的事是劫持对象，并注入Dep实例，而绑定的原型还是在`Dep`中

# Dep.js
Dep是一个dependence的简称，简单对说，Dep本身并不是观察者实例，而是一个中间的依赖层

使用依赖的原因是判断这个对象是否真的在模板中被用到

在`defineReactive`中使用到的`Dep`类方法主要有注册用到的`depend`与更新用到的`notify`，顾名思义，这两个方法是用来添加依赖与触发依赖更新的

## depend
```js
depend () {
  if (Dep.target) {
    Dep.target.addDep(this)
  }
}
```
可以看到，添加依赖的代码很简单，是在Dep.target(一个Dep的全局变量)上添加一个Dep，而Dep.target的定义和赋值如下
```js
Dep.target = null
const targetStack = []

export function pushTarget (_target: ?Watcher) {
  if (Dep.target) targetStack.push(Dep.target)
  Dep.target = _target
}

// Watcher中 Watcher后续说明
export class Watcher {

  get () {
    pushTarget(this)

    ...

  }

  addDep (dep: Dep) {
    const id = dep.id
    if (!this.newDepIds.has(id)) {
      this.newDepIds.add(id)
      this.newDeps.push(dep)
      if (!this.depIds.has(id)) {
        dep.addSub(this)
      }
    }
  }

}
```
可见，`Dep.target`是一个`Watcher`实例，而`addDep`方法是将一个`Dep`实例加入到其的`newDeps`中，也就是watcher列表中

### notify
```js
addSub (sub: Watcher) {
  this.subs.push(sub)
}

notify () {
  // stabilize the subscriber list first
  const subs = this.subs.slice()
  for (let i = 0, l = subs.length; i < l; i++) {
    subs[i].update()
  }
}
```
notify只是简单的调用subs里每个watcher的update方法，而向subs里插入watcher的方法是addSub，非常眼熟，因为就在之前的addDep方法里

**所以，调用`depend`方法会将调用的Dep实例插入到全局`watcher`（`Dep.target`）中，而这个方法又回将`watcher`返回给这个`Dep`实例，供实例在调用`notify`时触发`watcher`的`update`**

可以看到，现在已经很接近最后也是最核心的观察者模型，`Watcher`类了

# watcher.js
watcher文件是观察者模型真正实现的地方

刚刚前文提到，注册触发了Watcher的addDep方法，更新触发了update方法，前文说明了addDep的流程，这里的重点就放在update方法上

```js
update () {
  if (this.computed) {
    if (this.dep.subs.length === 0) {
      this.dirty = true
    } else {
      // In activated mode, we want to proactively perform the computation
      // but only notify our subscribers when the value has indeed changed.
      this.getAndInvoke(() => {
        this.dep.notify()
      })
    }
  } else if (this.sync) {
    this.run()
  } else {
    queueWatcher(this)
  }
}
```
可以看到，针对不同的情况，vue提供了不同触发方式，首先看最普通的一种方式`queueWatcher`

## queueWatcher
```js
/**
 * Push a watcher into the watcher queue.
 * Jobs with duplicate IDs will be skipped unless it's
 * pushed when the queue is being flushed.
 */
function queueWatcher (watcher: Watcher) {
  const id = watcher.id
  if (has[id] == null) {
    has[id] = true
    if (!flushing) {
      queue.push(watcher)
    } else {
      // if already flushing, splice the watcher based on its id
      // if already past its id, it will be run next immediately.
      let i = queue.length - 1
      while (i > index && queue[i].id > watcher.id) {
        i--
      }
      queue.splice(i + 1, 0, watcher)
    }
    // queue the flush
    if (!waiting) {
      waiting = true
      nextTick(flushSchedulerQueue)
    }
  }
}
```
可见，这里将watcher放到了queue里，并且通过nextTick触发，实现了官网所说的下一次更新的时候触发watch更新，且同时改变多次同一个watcher只会添加一个到queue中

## computed
采用`getAndInvoke`方法
```js
getAndInvoke (cb: Function) {
  const value = this.get()
  if (
    value !== this.value ||
    // Deep watchers and watchers on Object/Arrays should fire even
    // when the value is the same, because the value may
    // have mutated.
    isObject(value) ||
    this.deep
  ) {
    // set new value
    const oldValue = this.value
    this.value = value
    this.dirty = false
    if (this.user) {
      try {
        cb.call(this.vm, value, oldValue)
      } catch (e) {
        handleError(e, this.vm, `callback for watcher "${this.expression}"`)
      }
    } else {
      cb.call(this.vm, value, oldValue)
    }
  }
}
```
除了一堆条件判断外，最核心的一句是`cb.call(this.vm, value, oldValue)`，调用VDOM进行触发，从而对需要触发DOM操作的数据进行了更新，同时需要注意到的是，这里的触发更新是同步的

## sync
与普通的使用nextTick方法不同，sync使用了run方法
```js
run () {
  if (this.active) {
    this.getAndInvoke(this.cb)
  }
}
```
这里的关键在与this.cb方法，是在Watch定义到时候插入到，找到定义到地方
```js
new Watcher(vm, updateComponent, noop, {
  before () {
    if (vm._isMounted) {
      callHook(vm, 'beforeUpdate')
    }
  }
}
```
显然，cb就是updateComponent，顾名思义，也就是更新component

# 总体流程
所以，vue的响应式整体流程主要分为3个文件，`Observer`, `Dep` 与 `Watcher`

其中，注册的流程是
1. Observer/get
1. Dep/depend
1. Watcher/addDep

更新的流程是
1. Observer/set
1. Dep/notify
1. Watcher/update
