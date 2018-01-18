/**
 * primitive values
 * @author hudk
 * @link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures
 * @link http://mp.blog.csdn.net/mdeditor/index/76468805
 */

// boolean
var a = true;
typeof a; // 'boolean'

// null
var b = null;
typeof b; // 'object'
b === null; // true
!b && typeof b === 'object' // true

// undefined
var a;
var b;
typeof a; // 'undefined'
a === b; // true
a === undefined; // true
// use typeof for compare undefined, cause a may even not defined!
c; // ReferenceError
typeof c; // 'undefined'


// number
// 采用 IEEE 754 编码，浮点数会有问题
0.1 + 0.2 === 0.3 // false
// ES6中采用Nubmer.EPSILON定义机器精度 https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/EPSILON
function fixedEqual (a, b) {
  return Math.abs(a - b) < Number.EPSILON;
}

fixedEqual(0.1 + 0.2, 0.3); // ture
// .优先级比运算高
42.toFixed(2); // SyntaxError: Invalid or unexpected token
42..toFixed(2); // 42.00
// 整数可以达到2^53 - 1， 但是位运算只能达到2^32
var n = Math.pow(2, 53); // TODO why 在chrome中实际上可以达到。。。
n >> 2; // 0

// string
// 通过装箱，可以实现类似数组的功能
var s = '123';
s.concat('4'); // '1234'
// 可以用硬绑定实现数组功能
Array.prototype.map.call(s, (i) => {
  console.log(i);
}); // 1 2 3
// 但是字符串本身不能改变
Array.prototype.reverse.call(s); // TypeError: Cannot assign to read only property '0' of object '[object String]'
a.split('').reverse().join(''); // '321'

// symbol


// object


// array
// delete won't change array length
var arr = [3, 4];
delete arr[1];
arr.length; // 2