/**
 * es5 extend, use prototype
 * @author hudk
 * @link http://blog.csdn.net/qaserfvvbbert/article/details/52252920
 */

// mixin, mix all source have but target haven't property to target
var extend = function extend(source, target) {
  for (var key in source) {
    if (!(key in target)) {
      target[key] = source[key];
    }
  }
  // actually needn't...
  return target;
};

// 寄生继承
function Sup() {
  this.property = 1;
}
Sup.prototype.func1 = function() {
  console.log(this.property);
};
function Sub() {
  var sub = new Sup();
  var inner = sub.func1;

  sub.func1 = function() {
    inner.call(this);
    console.log('sub func1');
  };
  return sub;
}
var s = new Sub();
s.func1(); // 1 sub func1
// s lose Type!
s instanceof Sub; // false

var Animal = function Animal(name) {
  this.name = name;
};

Animal.prototype.call = function() {
  console && console.log(this.name + ' call!');
};

// 组合继承
var Cat = function Cat(name, type) {
  // extend properties here
  Animal.call(this, name);

  this.type = type;
};
// extend funcs here
Cat.prototype = new Animal();
Cat.prototype.constructor = Cat;
Cat.prototype.run = function() {
  console && console.log(this.name + ' run!');
};

// pollyfill for before es5， 返回的其实是o的原型的一个副本，不会返回o的实例属性与方法，因而使得继承的原型链上不会有o的实例属性与方法
Object.create = function(o) {
  function F() {}
  F.prototype = o;
  return new F();
};

// 寄生组合式继承
var inherit = function inherit(sub, sup) {
  var prototype = Object.create(sup.prototype); // 减少一次super实例调用，且原型链上无多余属性
  prototype.constructor = sub;
  sub.prototype = prototype;
};

var Dog = function Dog(name, type) {
  Animal.call(this, name);
  this.type = type;
};
inherit(Dog, Animal);
Dog.prototype.sleep = function() {
  console && console.log(this.name + ' sleep!');
};

var a = new Animal('Godfather');
var c = new Cat('Mojito', 'British Shorthair');
var d = new Dog('Negroni', 'Golden Retriever');

// judge
c.__proto__.__proto__.constructor === Animal; // true
d.__proto__.__proto__.constructor === Animal; // true
c.__proto__; // Animal {name: undefined, constructor: ƒ, run: ƒ} 存在实例属性
d.__proto__; // Animal {constructor: ƒ, sleep: ƒ} 不存在实例属性
