/**
 * type-casting
 * @author hudk
 * @link http://www.ecma-international.org/ecma-262/5.1/index.html#sec-9
 * @link 
 */

// 除了用户在定义编写时候强制修改类型外，js运行时会根据需要默认修改数据类型

// toPrimitive
// 数字会首先转换为基本类型值 http://www.ecma-international.org/ecma-262/5.1/index.html#sec-9.1

// toString


// toNumber http://www.ecma-international.org/ecma-262/5.1/index.html#sec-9.3

// toBoolean 
// falsy object
if (document.all) {
  console.log(0);
} else {
  console.log(1);
} // 1

// toNumber
