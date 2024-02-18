window.addEventListener("unload", function (event) {
    fetch(`/leaving-user-update/${username}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    .then(response => response.json())
    .then(data => {
      alert(data);
    })
    .catch(error => console.error(error));
  });

  fetch(`/leaving-user-update/${username}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
  })
  .then(response => response.json())
  .then(data => {
    alert(data);
  })
  .catch(error => console.error(error));