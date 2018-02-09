function addListener(id, eventType, fn) {
  document.getElementById(id).addEventListener(eventType, fn);
}

function addClickListener(id, fn) {
  addListener(id, 'click', fn);
}

window.onload = function() {
  addClickListener('get-without-option', function(e) {
    fetch('http://localhost:3001/cors').then(function(response) {
      console.log(response);
    });
  });

  addClickListener('get-with-option', function(e) {
    fetch('http://localhost:3001/cors', {
      headers: {
        'Content-Type': 'text/json'
      }
    }).then(function(response) {
      console.log(response);
    });
  });

  addClickListener('post-with-cookie-without-option', function(e) {
    fetch('http://localhost:3001/cors', {
      method: 'POST',
      credentials: 'include'
    }).then(function(response) {
      console.log(response);
    });
  });
};
