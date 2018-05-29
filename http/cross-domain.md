# 跨域
原本例子全部移出到 [cross-domain-test](https://github.com/hudk114/cross-domain-test)

跨域都是要服务端和客户端共同支持的

# [cors](https://github.com/hudk114/cross-domain-test/tree/master/cors)
## 原理
cors是一种较新的跨域方式，通过返回值里的响应首部 `Access-Control-Allow-Origin` 来设置允许跨域

## 请求
1. 简单请求
GET, HEADER, POST请求。首部除了Accept, Accept-Language, Content-Language, Content-Type(text/plain, multipart/form-data, application/x-www-form-urlencoded)外不得人为设置

只会发起一次请求，返回中带有 `Access-Control-Allow-Origin` 即可跨域，否则虽然收到了回复但是会被浏览器拒绝

1. 复杂请求
除简单请求意外的场景

首先会发起一个OPTIONS预检请求，返回中除了 `Access-Control-Allow-Origin` 外还需要加入 `Access-Control-Allow-Headers` 声明允许修改的头

比如 `res.setHeader('Access-Control-Allow-Headers', 'Content-Type')` 允许人为修改 `Content-Type` 首部

随后在第二个请求中会发起真正的跨域请求

## cookie
如果要带cookie，服务器返回头部需要有两个设置

首先， `Access-Control-Allow-Origin` 不能是 `*` ，意即必须包含请求的网站站点url

其次， `Access-Control-Allow-Credentials` 必须被设为 `true`

**需要注意带是，OPTIONS请求是不会带cookie的，因此后端在OPTIONS里不能通过cookie来判断权限，而是要在之后的请求里判断**

# [jsonp](https://github.com/hudk114/cross-domain-test/blob/master/jsonp)
## 原理
采用动态script，利用script可以请求跨域脚本的方式来跨域，只能实现GET方法

## 请求
如demo

## cookie
会自动携带第三方cookie，如果需要设置，需要手动设置或获取 `document.cookie`

# [iframe](https://github.com/hudk114/cross-domain-test/tree/master/iframe)
## 原理
利用iframe跨域，inner的iframe指向需要请求的同域，从而发起非跨域请求，再通过各种方式实现主windows与iframe的通信而实现跨域

## 请求
如demo

## cookie
同jsonp