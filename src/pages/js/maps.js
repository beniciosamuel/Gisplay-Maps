const socket = io();
var datauser;
var arrId = [];

let token = window.localStorage.getItem('token');
let dataUserParam = window.localStorage.getItem('dataUser');
var dataUser;
if (dataUserParam != '') {
  dataUser = JSON.parse(dataUserParam)["user"];
} else {
  signOut();
}

$(window).on('load', () => {
  if (dataUser.access != true) {
    signOut();
  } 
})

$(document).ready(() => {   
  if (dataUser.accessCredential != 'premium') {
    document.getElementById('manageUsers').remove()
  }

  if (dataUser.sector != 'projetos') {
    console.log(dataUser.sector);
    document.getElementById('promoteUser').remove();
  }

    $('#btn_signOut').click(() => {
      signOut();
    })  

    $('#configUsers').click(() => {
      console.log(dataUser.email)
      newRequest(dataUser.email, 'getall', 'POST');
    })

    $('#closeConfig').click(() => {
      let node;
      if (arrId) {
        Object.values(arrId).forEach((el) => {
          node = document.getElementById(el);
          document.getElementById('listUsersSector').removeChild(node);
        })
      }
    
      arrId = [];
    })

    $('#checkUsers').click(() => {
      console.log(dataUser.email)
      newRequest(dataUser.email, 'get-pendents', 'POST');
    })

    $('#closePendents').click(() => {
      let node;
      if (arrId) {
        Object.values(arrId).forEach((el) => {
          node = document.getElementById(el);
          document.getElementById('listUsers').removeChild(node);
        })
      }
    
      arrId = [];
    })

    $('#acceptUser').click(() => {
      let active = document.getElementsByClassName('list-group-item active');
      const el = arrId.splice(arrId.indexOf(active[0].getAttribute('value')));
      newRequest(dataUser.email, 'release', 'PUT', el);
    })

    $('#rejectUser').click(() => {
      let active = document.getElementsByClassName('list-group-item active');
      const el = arrId.splice(arrId.indexOf(active[0].getAttribute('value')));
      newRequest(dataUser.email, 'reject', 'DELETE', el);
    })

    $('#delUser').click(() => {
      let active = document.getElementsByClassName('list-group-item active');
      const el = arrId.splice(arrId.indexOf(active[0].getAttribute('value')));
      newRequest(dataUser.email, 'reject', 'DELETE', el);
    })
    $('#resettPass').click(() => {
      let active = document.getElementsByClassName('list-group-item active');
      const el = arrId.splice(arrId.indexOf(active[0].getAttribute('value')));
      newRequest(dataUser.email, 'forgot', 'POST', el);
    })
    $('#promoteUser').click(() => {
      let active = document.getElementsByClassName('list-group-item active');
      const el = arrId.splice(arrId.indexOf(active[0].getAttribute('value')));
      newRequest(dataUser.email, 'upgrade', 'PUT', el);
    })
})

socket.on('constructor', (status) => {
  document.getElementById('bg').setAttribute('class', 'fade out');
  document.getElementById('load').setAttribute('class', 'fade out');
})

function signOut () {
  dataUserParam = {}
  token = '';
  window.localStorage.setItem('token', '');
  window.localStorage.setItem('dataUser', '');
  window.location.assign('/');
} 

async function newRequest (emailToSend, path, type, emailToUpdate) {
  console.log(path);
  const xhr = new XMLHttpRequest();
  xhr.withCredentials = true;

  xhr.addEventListener("readystatechange", function () {
    if (this.readyState === this.DONE) {
      const log = JSON.parse(this.responseText);
      if (log["error"]) {
        console.log(log["error"]);        
      } else {
        const functions = {
          "getall": () => {
            let arrUsers = JSON.parse(this.responseText);
            arrUsers.forEach(element => {
              arrId.push(element["_id"]);
              let instobja = document.createElement('a');
              let instobji = document.createElement('i');
              let instobjdiv = document.createElement('div');
              let instobjstrong = document.createElement('strong');
              let name = document.createTextNode(element["name"])
              instobji.setAttribute('class', 'fas fa-address-book')
              instobji.style.margin = '.5vw'
              instobja.setAttribute('class', 'list-group-item list-group-item-action')
              instobja.style.cursor = 'pointer';
              instobjdiv.setAttribute('class', 'd-flex w-100 align-items-center justify-content-between')
              instobjstrong.setAttribute('class', 'mb-1')
              instobjstrong.appendChild(instobji)
              instobjstrong.appendChild(name)
              instobja.style.cursor = 'pointer'
              instobjdiv.appendChild(instobjstrong)
              instobja.appendChild(instobjdiv)
              instobja.setAttribute('data-bs-toggle', 'list')
              instobja.setAttribute('id', element["_id"])
              instobja.setAttribute('value', element["_id"])
              document.getElementById('listUsersSector').appendChild(instobja)
            });
          },
          "get-pendents": () => {
            let arrUsers = JSON.parse(this.responseText);
            arrUsers.forEach(element => {
              arrId.push(element["_id"]);
              let instobja = document.createElement('a');
              let instobji = document.createElement('i');
              let instobjdiv = document.createElement('div');
              let instobjstrong = document.createElement('strong');
              let name = document.createTextNode(element["name"])
              instobji.setAttribute('class', 'fas fa-address-book')
              instobji.style.margin = '.5vw'
              instobja.setAttribute('class', 'list-group-item list-group-item-action')
              instobja.style.cursor = 'pointer';
              instobjdiv.setAttribute('class', 'd-flex w-100 align-items-center justify-content-between')
              instobjstrong.setAttribute('class', 'mb-1')
              instobjstrong.appendChild(instobji)
              instobjstrong.appendChild(name)
              instobja.style.cursor = 'pointer'
              instobjdiv.appendChild(instobjstrong)
              instobja.appendChild(instobjdiv)
              instobja.setAttribute('data-bs-toggle', 'list')
              instobja.setAttribute('id', element["_id"])
              instobja.setAttribute('value', element["_id"])
              document.getElementById('listUsers').appendChild(instobja)
            });
          },
          "release": () => {
            showMessages('O usuário foi removido do sistema!', 8000);
          },
          "reject": () => {
            showMessages('O usuário foi removido do sistema!', 8000);
          },
          "forgot_password": () => {
            showMessages('Um email para que o usuário reconfigure sua senha foi enviado!', 8000);
          },
          "upgrade": () => {
            showMessages('O usuário foi promovido!', 8000);
          }
        }

        functions[path]()
      }
    }
  });
  await xhr.open(type, "/projects/" + path);
  await xhr.setRequestHeader("Content-Type", "application/json");
  await xhr.setRequestHeader("Authorization", token);
  if (type == 'POST' && path != 'forgot') {
    xhr.send(JSON.stringify({ "email": emailToSend }));
  }
  if (type == 'POST' && path == 'forgot') {
    console.log(emailToUpdate[0])
    xhr.send(JSON.stringify({ "email": emailToSend, "userResetPass": emailToUpdate[0] }));
  }
  if (type == 'PUT') {
    console.log(emailToUpdate[0])
    xhr.send(JSON.stringify({ "email": emailToSend, "userUpdate": emailToUpdate[0] }));
  }
  if (type == 'DELETE') {
    console.log(emailToUpdate[0])
    xhr.send(JSON.stringify({ "email": emailToSend, "userRemove": emailToUpdate[0] }));
  }
}

function showMessages(info, time) {
  let objinfo = document.createTextNode(info);
  let spaninfo = document.createElement('span');
  spaninfo.appendChild(objinfo);
  document.getElementById('infotoast').appendChild(spaninfo);
  $("#msg").toast('show');
  setTimeout(() => {
    spaninfo.remove();
  }, time); 
}