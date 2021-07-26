const express = require('./node_modules/express');
const gisp = express();
const session = require('express-session');
const server = require('http').createServer(gisp);
const socket = require("socket.io")(server, {
    cors: {
      origin: "http://localhost:3000",
    },
  });
const port = process.env.PORT || 3000;
const bodyParser = require('body-parser');
const request = require('request');
const { client_id, secret } = require('./src/config/auth-arcgis')
const fs = require('fs');
const { response } = require('./node_modules/express');

const sessionConfig = {
    secret: '06599cb1933341858d9348a817b31e69',
    name: 'Gisplay',
    resave: false,
    saveUninitialized: false,
    cookie : {
        sameSite: 'strict', // THIS is the config you are looing for.
    }
};

if (process.env.NODE_ENV === 'production') {
    gisp.set('trust proxy', 1); // trust first proxy
    sessionConfig.cookie.secure = true; // serve secure cookies
}

gisp.use(session(sessionConfig));

gisp.use(express.static(__dirname + '/'));
gisp.use(express.static(__dirname + '/pages/'));
gisp.use(bodyParser.json({limit: '10mb', extended: true}))
gisp.use(bodyParser.urlencoded({limit: '10mb', extended: false}))

gisp.use(express.static(__dirname + '/'));
gisp.use(express.static(__dirname + '/login'));



gisp.get('/', function(req, res){
    res.sendFile(__dirname + '/src/pages/login.html');
});

gisp.get('/login', function(req, res){
    res.sendFile(__dirname + '/src/pages/login.html');
});

gisp.get('/register', function(req, res){
    res.sendFile(__dirname + '/src/pages/register.html');
});

gisp.get('/verify:email', function(req, res){    
    res.sendFile(__dirname + '/src/pages/verify.html');
    socket.emit('sendInfo', req.params.email);
});

gisp.get('/maps', function(req, res){
    res.sendFile(__dirname + '/src/pages/maps.html');
});

socket.on('connection', (sckt) => {
    sckt.on('arcgis', arg => {
        const { func, pathAcces, tkn } = arg;
        const services = {
            'tokengenerateInit': (id) => {
                request.post({
                    url: 'https://www.arcgis.com/sharing/rest/oauth2/token/',
                    json: true,
                    form: {
                        'f': 'json',
                        'client_id': client_id,
                        'client_secret': secret,
                        'grant_type': 'client_credentials',
                        'expiration': 1440
                    }
                }, function(error, response, body) {
                    const data = {
                        token: body.access_token,
                        map: {
                            id: "16823bdee2cb42d4b8c173fce596bf8d",
                            feature: {
                                layers: [{
                                    url: "https://services3.arcgis.com/kLX7U8fknUKht1rW/arcgis/rest/services/Rede%20Ativa%20Conex%C3%A3o%20CE/FeatureServer",
                                    apiKey: "AAPK34ec65d4807f41e99648e09bb783f04amtSzGgiBVsOlwV_vlUUbtYDn71qq0EWaAMHBnyV8MzvqrBPVkSceq7dSfDHAAVLM",
                                    title: "Rede Ativa",
                                }],
                                sources: [{
                                    searchFields: ["Node", "POP", "ARMARIO", "OLT"],
                                    displayField: "Node",
                                    exactMatch: false,
                                    outFields: ["TECNOLOGIA", "ARMARIO", "POP"],
                                    name: "Pesquisa por Nodes",
                                    placeholder: "Ex.: FOFG01, FOR02..."
                                }]
                            }
                        }
                    }
                    socket.emit(id, data);
                })                
            },
            'authtoken': () => {
                request.post({
                    url: pathAcces,
                    json: true,
                    form: {
                        'f': 'json',
                        'token': tkn
                    }
                }, (error, response, body) => {
                    if(error) {
                        console.log(error)
                    }            
                    socket.emit('sendcontent', body);
                })                
            },
            'mapconstructor': () => {
                socket.emit('constructor', { status: 'constructed' });
            },
            'equipamentos': (id) => {
                console.log(id)
                request.post({
                    url: 'https://www.arcgis.com/sharing/rest/oauth2/token/',
                    json: true,
                    form: {
                        'f': 'json',
                        'client_id': client_id,
                        'client_secret': secret,
                        'grant_type': 'client_credentials',
                        'expiration': 1440
                    }
                }, function(error, response, body) {
                    const data = {
                        token: body.access_token,
                        map: {
                            id: "ff2357df20fd430dbcdc08cc4716fcbd",
                            feature: {
                                layers: [{
                                    url: "https://services3.arcgis.com/kLX7U8fknUKht1rW/arcgis/rest/services/Rede%20Ativa%20Conex%C3%A3o%20CE/FeatureServer",
                                    apiKey: "AAPK34ec65d4807f41e99648e09bb783f04amtSzGgiBVsOlwV_vlUUbtYDn71qq0EWaAMHBnyV8MzvqrBPVkSceq7dSfDHAAVLM",
                                    title: "Rede Ativa",
                                },
                                {
                                    url: "https://services3.arcgis.com/kLX7U8fknUKht1rW/arcgis/rest/services/FOR/FeatureServer",
                                    apiKey: "AAPK34ec65d4807f41e99648e09bb783f04amtSzGgiBVsOlwV_vlUUbtYDn71qq0EWaAMHBnyV8MzvqrBPVkSceq7dSfDHAAVLM",
                                    title: "FOR",
                                }],
                                sources: [{
                                    searchFields: ["Node", "POP", "ARMARIO", "OLT"],
                                    displayField: "Node",
                                    exactMatch: false,
                                    outFields: ["TECNOLOGIA", "ARMARIO", "POP"],
                                    name: "Pesquisa por Nodes",
                                    placeholder: "Ex.: FOFG01, FOR02..."
                                },
                                {
                                    searchFields: ["Numero Serie", "Camino Red"],
                                    displayField: "Numero Serie",
                                    exactMatch: false,
                                    outFields: [],
                                    name: "Pesquisa por Equipamentos",
                                    placeholder: "Ex.: SP00001, SP01901..."
                                }]
                            }
                        }
                    }
                    socket.emit(id, data);
                })                
            }
        }
        services[func](tkn);
    })
})

require('./src/app/controllers/index')(gisp);

server.listen(port, function () {
    console.log('Servidor rodando na porta %d', port);
});