const socket = await io();
const userId = JSON.parse(window.localStorage.getItem('dataUser')).user["_id"]
var datauser;
var arrIdPendents = [];
var arrIdUsers = [];

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
    document.getElementById('promoteUser').remove();
  }

  $('#btnViewMap').click(() => {
    let active = document.getElementsByClassName('list-group-item active');
    const el = active[0].getAttribute('value');
    callMap(el);
  })

    $('#btn_signOut').click(() => {
      signOut();
    })  

    $('#configUsers').click(() => {
      newRequest(dataUser.email, 'getall', 'POST');
    })

    $('#closeConfig').click(() => {
      let node;
      if (arrIdUsers) {
        Object.values(arrIdUsers).forEach((el) => {
          node = document.getElementById(el);
          document.getElementById('listUsersSector').removeChild(node);
        })
      }
    
      arrIdUsers = [];
    })

    $('#checkUsers').click(() => {
      newRequest(dataUser.email, 'get-pendents', 'POST');
    })

    $('#closePendents').click(() => {
      let node;
      if (arrIdPendents) {
        Object.values(arrIdPendents).forEach((el) => {
          node = document.getElementById(el);
          document.getElementById('listUsers').removeChild(node);
        })
      }
    
      arrIdPendents = [];
    })

    $('#acceptUser').click(() => {
      let active = document.getElementsByClassName('list-group-item active');
      const el = active[0].getAttribute('value');
      arrIdPendents.splice(arrIdPendents.indexOf(active[0].getAttribute('value')), 1);
      newRequest(dataUser.email, 'release', 'PUT', el);
      active[0].remove();
    })

    $('#rejectUser').click(() => {
      let active = document.getElementsByClassName('list-group-item active');
      const el = active[0].getAttribute('value');
      arrIdPendents.splice(arrIdPendents.indexOf(active[0].getAttribute('value')), 1);
      newRequest(dataUser.email, 'reject', 'DELETE', el);
      active[0].remove();
    })

    $('#delUser').click(() => {
      let active = document.getElementsByClassName('list-group-item active');
      const el = active[0].getAttribute('value');
      arrIdUsers.splice(arrIdUsers.indexOf(active[0].getAttribute('value')), 1);
      newRequest(dataUser.email, 'reject', 'DELETE', el);
      active[0].remove();
    })

    $('#resettPass').click(() => {
      let active = document.getElementsByClassName('list-group-item active');
      const el = active[0].getAttribute('value');
      newRequest(dataUser.email, 'forgot', 'POST', el);
    })
    $('#promoteUser').click(() => {
      let active = document.getElementsByClassName('list-group-item active');
      const el = active[0].getAttribute('value');
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
  const xhr = new XMLHttpRequest();
  xhr.withCredentials = true;

  xhr.addEventListener("readystatechange", function () {
    if (this.readyState === this.DONE) {
      const log = JSON.parse(this.responseText);
      if (log["error"]) {
        console.log(log["error"]);
        showMessages('Houve um erro, contacte o setor de Projetos!', 8000);       
      } else {
        const functions = {
          "getall": () => {
            let arrUsers = JSON.parse(this.responseText);
            arrUsers.forEach(element => {
              arrIdUsers.push(element["_id"]);
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
              arrIdPendents.push(element["_id"]);
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
            showMessages('O usuário agora pode acessar o sistema!', 8000);
          },
          "reject": () => {
            showMessages('O usuário foi removido do sistema!', 8000)
          },
          "forgot": () => {
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
    xhr.send(JSON.stringify({ "email": emailToSend, "userResetPass": emailToUpdate }));
  }
  if (type == 'PUT') {
    xhr.send(JSON.stringify({ "email": emailToSend, "userUpdate": emailToUpdate }));
  }
  if (type == 'DELETE') {
    xhr.send(JSON.stringify({ "email": emailToSend, "userRemove": emailToUpdate }));
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

function callMap (map) {
  const service = {
    "rede_ativa": () => {
      socket.emit('arcgis', { 'func': 'tokengenerateInit', 'path': '', 'tkn': userId});
      showMessages("Você está no Rede Ativa!", 8000)
    },
    "equipamentos": () => {
      console.log("Equipamentos " + userId)
      socket.emit('arcgis', { 'func': 'equipamentos', 'path': '', 'tkn': userId});
      showMessages("Este é o mapa de Equipamentos!", 8000)
    },
    "mdu": () => {
      showMessages("Mapa em processo de construção!", 8000)
    }
  }

  service[map]();
}