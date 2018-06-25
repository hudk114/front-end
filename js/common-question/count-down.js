const GAP = 100;

function oneSecond (d, callback) {
  Date.now() - d > 1000
    ? typeof callback === 'function' && callback()
    : setTimeout(_ => {
      oneSecond(d, callback);
    }, GAP);
}

function countDown (time, callback, d = Date.now()) {
  if (time <= 0) {
    return callback(time);
  }

  oneSecond(d, _ => {
    callback(--time);

    if (time > 0) {
      d += 1000;
      countDown(time, callback, d);
    }
  });
}

countDown(90, time => {
  console.log(time);
  if (time === 0) {
    console.log(`it's over!`);
  }
});
