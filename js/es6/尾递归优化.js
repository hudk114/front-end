/**
 * 爱奇艺面试题
 * 尾递归优化实现的deepClone
 */
function isObj (obj) {
  return obj !== null && typeof obj === 'object';
}

// TODO 未考虑array情况，以及认为obj一定是一个object
function deepClone (obj) {
  let keys = [];
  let newObj = {};
  Object.keys(obj).forEach(key => {
    if (isObj(obj[key])) {
      newObj[key] = {};
      keys.push(key);
    } else {
      newObj[key] = obj[key];
    }
  });

  return dC(newObj, obj, keys);
}

function dC (newObj, obj, keys) {
  // 没有keys了，直接返回即可
  if (!keys.length) return newObj;

  let k = [];
  // 对每个keys，挂载obj[key]到newObj[key]上，并将新一层里的keys加入
  keys.forEach(key => {
    // key是'a.b.c'的样式
    let kArr = key.split('.');
    let nO = newObj;
    let o = obj;

    for (let i = 0; i < kArr.length; i++) {
      nO = nO[kArr[i]];
      o = o[kArr[i]];
    }

    // 将o上的每个key挂载到nO上，如果是对象的话，需要对底下的每个key加到k中
    Object.keys(o).forEach(oK => {
      if (isObj(o[oK])) {
        nO[oK] = {};
        k.push(`${key}.${oK}`);
      } else {
        nO[oK] = o[oK];
      }
    });
  });

  return dC(newObj, obj, k);
}

var a = {
  a: 1,
  b: {
    a: 2,
    b: 3,
    c: {
      a: 4,
      b: 5
    }
  }
};
var b = deepClone(a);
console.log(b);
console.log(a === b);
console.log(a.b === b.b);
