本文针对的是浏览器级对文件缓存对一些优化对总结

# HTTP 缓存

http 缓存指的是缓存 http 请求的数据，一次 http 请求包含几个主要步骤
![http请求步骤](https://img-blog.csdn.net/20180426110151103?watermark/2/text/aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3Fhc2VyZnZ2YmJlcnQ=/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70)
http 缓存主要在第 3 和第 4 步进行，根据协议不同，会采用强缓存和协商缓存（弱缓存）两种

## 强缓存

强缓存指缓存在本地，不会再向服务端请求的文件缓存方式强缓存采用的是 Cache-Control 与 Expires 两个字段
[Expires](https://tools.ietf.org/html/rfc7234#section-5.3)：HTTP 1.0 http-date 过期时间 指定了文件过期的**绝对时间**，意即，当前时间小于过期时间时，采用本地缓存
[Cache-Control](https://tools.ietf.org/html/rfc7234#section-5.2): HTTP 1.1 Cache-Control 有多个属性，具体[参考](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Headers/Cache-Control)，其中主要的是 max-age，指定了文件过期的**相对时间**，意即，当前时间小于生成时间加上 max-age 时，采用本地缓存
_Expires 与 Cache-Control 共同使用时，Cache-Control 的优先级更高_

![http返回头](https://img-blog.csdn.net/20180426112245392?watermark/2/text/aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3Fhc2VyZnZ2YmJlcnQ=/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70)

设置了强缓存的文件 status 会变为 200，然后从 memory cache 或 disk cache 中直接读取
![强缓存了的请求](https://img-blog.csdn.net/20180426112741327?watermark/2/text/aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3Fhc2VyZnZ2YmJlcnQ=/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70)

需要考虑的是，强缓存应当用在那些采用了 hash（或者说，每次上线文件名不一样）的文件，否则会造成在过期时间内无法清楚缓存

## 协商缓存（弱缓存）

协商缓存指本地强缓存失效情况下，再向服务器验证的缓存机制协商缓存采用的是 Etag 与 Last-Modified 两个字段
[ETag](https://tools.ietf.org/html/rfc7232#section-2.3): 用于唯一的标识一个资源，与 If-Match 与 If-None-Match 协同使用
[If-Match](https://tools.ietf.org/html/rfc7232#section-3.1): 有满足的 ETag，才会返回（或上传）资源
[If-None-Match](https://tools.ietf.org/html/rfc7232#section-3.2): 没有满足的 ETag，才会返回（或上传）资源

[Last-Modified](https://tools.ietf.org/html/rfc7232#section-2.2): 用于标识资源上次修改的时间
[If-Modified-Since](https://tools.ietf.org/html/rfc7232#section-3.3): 只有在指定时间后有修改，才会返回（或修改）资源
[If-Unmodified-Since](https://tools.ietf.org/html/rfc7232#section-3.4): 只有在指定时间后没有修改，才会返回（或修改）资源

_同时使用的时候，Last-Modified 的优先级低于 ETag_
如果缓存成功，协商缓存的数据请求会是 304（get）
![协商缓存](https://img-blog.csdn.net/20180426142843726?watermark/2/text/aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3Fhc2VyZnZ2YmJlcnQ=/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70)
![协商缓存](https://img-blog.csdn.net/20180426142404541?watermark/2/text/aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3Fhc2VyZnZ2YmJlcnQ=/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70)

对于名称不变但是内容可能会变化的资源，采用协商缓存比较好

# 参考

1. [前端性能优化之缓存技术
   ](https://juejin.im/post/5a482d976fb9a044fc451456)
