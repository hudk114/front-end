function append (obj, path) {
  let ele = null;
  if (obj instanceof Object) {
    ele = document.createElement('ul');
    let li;
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        li = document.createElement('li');
        // 太丑陋了
        if (obj[key] instanceof Object) {
          li.innerText = key;
        }
        li.appendChild(append(obj[key], `${path}/${key}`));
        ele.appendChild(li);
      }
    }
    if (li) {
      ele.appendChild(li);
    }
  } else {
    ele = document.createElement('a');
    ele.href = path;
    ele.innerText = obj;
  }

  return ele;
}

function appendM (obj) {
  document.getElementById('app').appendChild(append(obj, ''));
}

window.onload = function () {
  var xhr = new XMLHttpRequest();

  xhr.onload = function () {
    if (xhr.readyState === 4 && xhr.status === 200) {
      appendM(JSON.parse(xhr.response));
    }
  };

  xhr.open('GET', '/data');
  xhr.send();
};
