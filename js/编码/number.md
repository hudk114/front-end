# 数值编码
本文根据经典面试题引申而来

``` javascript
    0.1 + 0.2 !== 0.3
    0.1 + 0.2 // 0.30000000000000004
```

# js数值编码问题
1. 浮点数运算不准确
2. 超过最大安全整数运算不正确

``` javascript
    Number.MAX_SAFE_INTEGER // 9007199254740991
    Number.MAX_SAFE_INTEGER + 2 // 9007199254740992
    Number.MAX_VALUE // 1.7976931348623157e+308
```

_两者都是由于浮点数的存储方式造成的_
## 浮点数存储方式 [IEEE 754](https://zh.wikipedia.org/wiki/IEEE_754)
1. 转换为二进制存储
1. 采用科学计数法存储
1. js采用双精度浮点数（64位），其中一位符号位，11位指数位，52位精度位

IEEE 754的编码中对指数采用offset binary编码，但与大多数存储不同，采用正数比负数多的形式，例如[0000, 1111]表示的是[-7, 8]


## 0.1 + 0.2 !== 0.3
0.1与0.2在存储时都会有精度损失，具体可[参见](https://medium.com/dailyjs/javascripts-number-type-8d59199db1b6)。因此，0.1+0.2存储的值最后四位是`0100`(从`00111`进位)，而0.3存储的后四位是`0011`，两者比较时会不相等

## MAX_SAFE_INTEGER
MAX_SAFE_INTEGER: 9007199254740991 = 2^53 - 1

也就是52位精度位都是1(小数点前的第一位1不存储)，所有大于这个数的值都需要通过指数位来表示，显然，采用了指数位会丢失一定的精度

## MAX_VALUE NAN
MAX_VALUE: 1.7976931348623157e+308 = (2^53 - 1) * 2^1023

前文提到，指数位有11位，可以存储[-1023~1024]，但最大值只用到了1023，因为1024（11111111111）对应的是NaN与Infinity

NaN的常数位为（10000...）,Infinty为（00000...）

## tips
大于最大安全数的数值操作是不可信的，因此

``` javascript
  for (let i = 0; 1 / i > 0; i++) {
    // do sth here
  }
```
会无限循环。这是因为 `Number.MAX_SAFE_INTEGER + 2 === Number.MAX_SAFE_INTEGER + 1
`



# 参考
1. [从0.1+0.2=0.30000000000000004再看JS中的Number类型](https://juejin.im/post/5a6fce10f265da3e261c3c71)
1. [Here is what you need to know about JavaScript’s Number type](https://medium.com/dailyjs/javascripts-number-type-8d59199db1b6)