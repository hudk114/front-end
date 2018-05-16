# mock方案总结
最近在公司里新建了一个项目，要用到mock数据，所以针对之前的写法和别人的方案，对mock方案进行了一些探讨和使用

主要可以分为三种：
1. devServer配置直接返回data
1. mock服务器 + devServer proxy
1. 前端控制

# 细节详解
## devServer配置直接返回
devServer底层是通过express实现了一个node服务器，其中[ `before` 方法](https://webpack.js.org/configuration/dev-server/#devserver-before)提供了express路由的注入。因此，在这层对请求进行拦截请求直接返回即可实现直接对返回
```js
devServer: {
  before (app) {
    app.get('/listData', (req, res) => {
      res.send(JSON.stringfy(data));
    });
  },
  ...
}
```
当mock数据多的时候，将内部路由抽离出去即可，相当于自己写了一个express对路由中间层

* 优点：最简单，不需要起额外的服务；源代码不需要修改，不会引入不小心带入的错误；对路由的控制更精确，可以精确控制哪些接口需要mock
* 缺点：每次修改了mock数据主项目都需要重新run一遍，项目大的时候编译代价很高

## mock服务器 + devServer proxy
devServer的[proxy](https://webpack.js.org/configuration/dev-server/#devserver-proxy)是作为一层中间的proxy转发层，因此可以用来将需要的接口转发到mock服务器上
```js
proxy: {
  '/mock': {
    target: 'http://localhost:3000',
    pathRewrite: { '^/mock': '' }
  }
}
```
如例子所示，将所有的mock数据都转发到了localhost:3000端口上

* 优点：mock数据与主项目分离，不需要每次重新编译主项目；可以从后端对角度对数据和接口进行定义，能模拟真实环境
* 缺点：每次需要开启两个服务；对路由对匹配依赖 [`http-proxy-middleware`](https://github.com/chimurai/http-proxy-middleware)，对每个请求进行精确控制对代价比较高；

## 前端控制
前端控制的意思是在代码里根据是否需要mock发起不同的请求，通常与前两种方式混合使用
```js
function request (options, mock) {
  mock && (options.url = '/mock' + options.url);

  return axios({
    ...options
  });
}
```
如例子所示，在代码层面对发送对url进行了修改，请求mock服务器数据

* 优点：mock方式简单直接，修改简单；不需要每次重启服务，直接热更新
* 缺点：需要修改源码，可能引入错误

## 替换XMLHttpRequest
例如[Mock](https://github.com/nuysoft/Mock)库，拦截了所有的ajax请求并通过自己定义的xhr返回数据，当然这个库有些问题，具体就不细展开了

# 实践方案
在实践中，针对几种mock方式对优缺点将其整合了一下。制定的解决方案是采用 `mock服务器 + devServer proxy` 与 `前端控制` 的方法，这种方式下，需要重新启动的只有mock服务器，主项目只需要在代码中进行热更新，所以每次修改成本并不高

前端的实现在 [mock](https://github.com/hudk114/mock/tree/master) ，通过 `process.env.NODE_ENV` 的配置，只会在生产环境采用mock，即使开发忘记对代码进行修改，无意带到了线上也不会造成影响

# TODO
前文提到的[Mock](https://github.com/nuysoft/Mock)库有些问题，提了issue也没有人更新，但是这种思想感觉很棒，可以在后续尝试一下