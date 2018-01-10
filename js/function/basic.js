/** function basic
 *  @author hudk
 *  @link http://blog.csdn.net/qaserfvvbbert/article/details/52354468
 */

/** hoisting
 *  @link http://blog.csdn.net/qaserfvvbbert/article/details/52354468
 */
test() // for fun
typeof test // 'function'
function test() {
  console.log('test')
}

test1() // TypeError: test1 is not a function
typeof test1 // 'undefined'
var test1 = function () {
  console.log('test1')
}

/** arguments
 *  @link http://blog.csdn.net/qaserfvvbbert/article/details/52354468
 */
