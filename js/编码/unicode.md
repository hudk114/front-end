# 字符编码
此文由于工作中朋友遇到emoji表情的问题，所以总结一下

首先，unicode是一个字符集，utf-8，utf-16，utf-32都是编码方式

# unicode
unicode为每个符号制定了一个码点，以u+XXXX表示。unicode的定义方式是分区定义，每个区存放2^16个字符（16位，u+XXXX表示），总共有17个平面，分为基础平面（BMP）和16个辅助平面（SMP）

## 基础平面
基础平面的码点范围是u+0000～u+FFFF，显然，可以用16位来存储，因此可直接采用utf-16存储

## 辅助平面
辅助平面的码点范围是u+010000～u+10FFFF，需要24位来存储，直接用utf-16无法存放，用utf-32又过于浪费，因此采用一种可变长度的utf-16方式来编码

# 变长的utf-16编码
计算机存储的只会是2字节（16位）或4字节（32位），因此变长的utf-16编码的编码方式是对于BMP采用16位，对SMP采用32位

为了在解码时确定到底是BMP还是SMP字符，BMP中的u+D800～u+DFFF作为空段来映射辅助平面。也就是说，只要解码时遇到u+D800～u+DFFF的字段，就认为是一个4字节的编码，用来映射到SMP

可以计算一下，SMP的字符数是 `16*2^16 = 2^20` 个，而u+D800～u+DFFF只有 `8*2^8=2^11` 个，很显然，直接映射表示不够。所以，utf-16采用了大小位的方式，前16位高位映射u+D800~u+DBFF，后16位低位映射u+DC00~u+DFFF，两者相乘，可以表示的范围就打到了 `4*2^8*4*2^8=2^20` 个，于是就可以和SMP相对应了

_这种方式还可以判断编码是否正确，可以用在编码自校验中_

# js的UCS-2编码
UCS-2是UTF-16未出现前的一个标准，UTF-16是UCS-2的超集，UCS-2采用2字节编码

js中的字符函数会将字符当成2位，所以对于4字节字符（比如emoji）会无法得到正确的结果

``` javascript
'𝌆'.length // 2
'𝌆'.charCodeAt(0) // 返回0-65536的code编码 55348 
'𝌆'.charAt(0) // 返回简单的UTF-16编码字符 '(乱码)'
```
兼容可采用两种方式，[第一种](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/charAt)是手动判断是否是SMP字符；第二种是采用es6的新方法

``` javascript
// judge
function myCharCodeAt (str, index = 0) {
  let code = str.charCodeAt(index);
  
  if (code >= 0xDC00 && code <=0xDFFF) {
    throw new Error('编码有误');
  }

  if (code >= 0xD800 && code <=0xDBFF) {
    let high = code;
    let low = str.charCodeAt(index + 1);
    
    if (isNaN(Number(low))) {
      throw new Error('编码有误');
    }

    return ((hi - 0xD800) * 0x400) + (low - 0xDC00) + 0x10000; // 返回utf-16编码
  }

  return code;
}

// es6
for (let s of str) { ... } // 遍历
Array.from(str).length // 获取长度
'𝌆' === '\u{1D306}' // 4字节unicode需要放到大括号中
'𝌆'.codePointAt(0) // 119558
/^.$/u.test('𝌆')  // true 正则采用 /pattern/u 来支持4码点
```

# 参考
1. [Unicode与JavaScript详解](http://www.ruanyifeng.com/blog/2014/12/unicode.html)
1. [JavaScript has a Unicode problem](https://mathiasbynens.be/notes/javascript-unicode)
1. [Javascript有个Unicode的天坑](http://www.alloyteam.com/2016/12/javascript-has-a-unicode-sinkhole/)