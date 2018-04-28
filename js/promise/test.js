// 返回一个then方法
function then(...rest) {
  return Promise.resolve().then(...rest);
}


(new Promise((resolve, reject) => {
  resolve(1);
  reject(2);
  console.log(3);
}))
  .then(val => console.log(val))
  .catch(e => console.log(e));
// 3
// 1


then(_ => console.log(4));
console.log(5);
// 5
// 4


var p = then(_ => {
  return p;
}); // TypeError: Chaining cycle detected for promise #<Promise>


var p = new Promise(_ => {}, _ => {});
var p1 = then(_ => {
  return p;
});
p1 === p; // false


var obj1 = {};
then(_ => obj1).then(_ => console.log(_)); // Error: then is not defined

var obj2 = {
  then(resolve, reject) {
    resolve(2);
  }
};
then(_ => obj2).then(_ => console.log(_)); // 2

var obj3 = {
  then() {
    throw new Error(3);
  }
};
then(_ => obj3).catch(e => console.log(e)); // Error: 3

var obj4 = {
  prop: 4,
  then(res, rej) {
    console.log(this.prop);
    res(5);
  }
};
then(_ => obj4).then(_ => console.log(_));
// 4
// 5

then(_ => 6).then(_ => console.log(_)); // 6
