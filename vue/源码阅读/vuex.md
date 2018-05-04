[vuex 官方文档](https://vuex.vuejs.org/zh-cn/)

# 简介
vuex是用于状态管理的一个库，类似flux，当然，由于vue和react不同，相对来说在内部就可以维护大量的数据和逻辑，所以其实vuex的应用场景并不像redux那样重要

vuex通过mixin向所有的组件暴露了一些方法并插入到了vue实例上，因此在使用上很像是全局变量

在一般情况下vuex用于兄弟组件之间的数据共用，当然，在复杂的逻辑处理中，也可以采用flux的想法，利用单向数据流的思想来使用vuex。针对这种情况，我使用vue+vuex搭了一个类flux的项目框架，地址和总结后续加上吧 // TODO

# vuex结构
```bash
├── helpers.js
├── index.esm.js
├── index.js
├── mixin.js
├── module
│   ├── module-collection.js
│   └── module.js
├── plugins
│   ├── devtool.js
│   └── logger.js
├── store.js
└── util.js
```
# index.esm.js
```javascript
import { Store, install } from './store'
import { mapState, mapMutations, mapGetters, mapActions, createNamespacedHelpers } from './helpers'

export default {
  Store,
  install,
  version: '__VERSION__',
  mapState,
  mapMutations,
  mapGetters,
  mapActions,
  createNamespacedHelpers
}
```
可以看到，核心功能来自Store，而一些map函数来自helpers

# store.js
## install
方法用于安装vuex，其中主要起作用的语句为 `applyMixin(Vue)`

```javascript
if (version >= 2) {
  Vue.mixin({ beforeCreate: vuexInit })
} else {
  // 针对vue1.0
}

function vuexInit () {
  const options = this.$options
  // store injection
  if (options.store) {
    this.$store = typeof options.store === 'function'
      ? options.store()
      : options.store
  } else if (options.parent && options.parent.$store) {
    this.$store = options.parent.$store
  }
}
```
可以看到，在vue实例的所有组件beforeCreate之前，vuexInit会初始化实例的$store。vue实例的最外层在创建时的options需要传入store实例，也就是顶层的options.store一定存在。因此，在渲染组件时这种方式会将store一层层的传递到底层，也就是给所有实例都挂上了$store

## Store
Store类是store的核心，之后我们从constructor开始，总结一些重要的方法都做了什么

### constructor
constructor中做的主要的事以下几件
1. 存储了一些内部变量
1. decorate了dispatch和commit函数，强制绑定它们的this值为store实例
1. 初始化根state
1. 维护一个内部vue实例，用vue实例来维护data（利用了vue实例的data）
1. 运行插件

其中，核心的部分在于第3与第4步，分别对应源码中的`installModule(this, state, [], this._modules.root)`和`resetStoreVM(this, state)`

#### installModule
installModule分为三大部分
```javascript
function installModule (store, rootState, path, module, hot) {
  const isRoot = !path.length
  const namespace = store._modules.getNamespace(path)

  // register in namespace map
  if (module.namespaced) {
    store._modulesNamespaceMap[namespace] = module
  }

  ...
}
```
这步是存储了当前的namespace

```javascript
function installModule (store, rootState, path, module, hot) {
  ...

  // set state
  if (!isRoot && !hot) {
    const parentState = getNestedState(rootState, path.slice(0, -1))
    const moduleName = path[path.length - 1]
    store._withCommit(() => {
      Vue.set(parentState, moduleName, module.state)
    })
  }

  const local = module.context = makeLocalContext(store, namespace, path)

  module.forEachMutation((mutation, key) => {
    const namespacedType = namespace + key
    registerMutation(store, namespacedType, mutation, local)
  })

  module.forEachAction((action, key) => {
    const type = action.root ? key : namespace + key
    const handler = action.handler || action
    registerAction(store, type, handler, local)
  })

  module.forEachGetter((getter, key) => {
    const namespacedType = namespace + key
    registerGetter(store, namespacedType, getter, local)
  })

  module.forEachChild((child, key) => {
    installModule(store, rootState, path.concat(key), child, hot)
  })
}
```
最后两步注册了mutation，action与getter，并递归注册了子module

```javascript
function installModule (store, rootState, path, module, hot) {
  ...

  // set state
  if (!isRoot && !hot) {
    const parentState = getNestedState(rootState, path.slice(0, -1))
    const moduleName = path[path.length - 1]
    store._withCommit(() => {
      Vue.set(parentState, moduleName, module.state)
    })
  }

  ...
}

function getNestedState (state, path) {
  return path.length
    ? path.reduce((state, key) => state[key], state)
    : state
}
```
首先，path指的是从root到当前module的全部module的path名称。在installModule中，通过path.slice(0, -1)获取父module的path；而getNestedState方法获取的是从path对应的module的state，通过这种方式，就给父module的state上绑定了当前module

root的state就是自身的state


