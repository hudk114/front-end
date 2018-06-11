/* eslint-disable */
function bind(context) {
  var self = this;
  var args = [].slice.call(arguments, 1);
  return function () {
    return self.apply(context, args.concat([].slice.call(arguments)));
  }
}

Function.prototype.bind || (Function.prototype.bind = bind);

export default bind;