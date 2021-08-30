import express from 'express';
const gisp = express();
import session from 'express-session';
import fs from 'fs';
import path from 'node:path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const options = {
    key: fs.readFileSync('key.pem'),
    cert: fs.readFileSync('cert.pem')
  };
import https from 'https';
const server = https.createServer(options, gisp).listen(3000);
import { Server } from 'socket.io';
const socket = new Server(server, {
    cors: {
      origin: "https://www.testingdomain.com:3000",
    },
  });
const port = process.env.PORT || 3000;
import bodyParser from 'body-parser';
import request from 'request';
import * as auth_arcgis from './src/config/auth_arcgis.js'
import { response } from 'express';
// ensures fetch is available as a global
import swaggerUi from 'swagger-ui-express';
import swaggerFile from './swagger_output.js'

import { ApplicationSession } from '@esri/arcgis-rest-auth';
import { UserSession } from '@esri/arcgis-rest-auth';

// UserSession.beginOAuth2({
//     clientId: auth_arcgis.default.client_id,
//     redirectUri: "https://multiplay.maps.arcgis.com/sharing/rest/oauth2/authorize",
//   }).then((session) => {
//     // for this example we will only send auth to embeds hosted on storymaps.arcgis.com
//     const validOrigins = ["https://multiplay.maps.arcgis.com/"];
//     session.enablePostMessageAuth(validOrigins);
//   });

//   const originalUrl =
//   "https://multiplay.maps.arcgis.com/apps/dashboards/ffaf78fa324040bcb1e8148341a539df";
// const embedUrl = `${originalUrl}
//     ?arcgis-auth-origin=${encodeURIComponent(window.location.origin)}
//     &arcgis-auth-portal=${encodeURIComponent(session.portal)}`;

const authentication = new ApplicationSession({
  clientId: auth_arcgis.default.client_id,
  clientSecret: auth_arcgis.default.secret
})

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

gisp.get('/iframe', function(req, res){
    // url not accessible to anonymous users
    const url = `https://multiplay.maps.arcgis.com/sharing/rest/content/items/ffaf78fa324040bcb1e8148341a539df/data`

    // token will be appended by rest-js
    // sheets.then(data => {
    //     console.log(data);
    // })

    res.sendFile(__dirname + '/src/pages/dashboards.html')
});

socket.on('connection', (sckt) => {
    sckt.on('arcgis', arg => {
        const { func, pathAcces, tkn } = arg;
        const services = {
            'tokengen': (id) => {
                request.post({
                    url: 'https://www.arcgis.com/sharing/rest/oauth2/token/',
                    json: true,
                    form: {
                        'f': 'json',
                        'client_id': auth_arcgis.default.client_id,
                        'client_secret': auth_arcgis.default.secret,
                        'grant_type': 'client_credentials',
                        'expiration': 1440
                    }
                }, function(error, response, body) {
                    if (!body) {
                        res.redirect('/');
                    }
                    const data = {
                        token: body.access_token
                    }
                    socket.emit(id, data);
                })                
            },
            'tokengenerateInit': (id) => {
                console.log(id)
                request.post({
                    url: 'https://www.arcgis.com/sharing/rest/oauth2/token/',
                    json: true,
                    form: {
                        'f': 'json',
                        'client_id': auth_arcgis.default.client_id,
                        'client_secret': auth_arcgis.default.secret,
                        'grant_type': 'client_credentials',
                        'expiration': 1440
                    }
                }, function(error, response, body) {
                    if (!body) {
                        res.redirect('/');
                    }
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
                    if (!body) {
                        res.redirect('/');
                    }
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
                        'client_id': auth_arcgis.default.client_id,
                        'client_secret': auth_arcgis.default.secret,
                        'grant_type': 'client_credentials',
                        'expiration': 1440
                    }
                }, function(error, response, body) {
                    if (!body) {
                        res.redirect('/');
                    }
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
            },
            'authFor': () => {
                socket.emit('teste', authentication)
            }
        }
        services[func](tkn);
    })
})

gisp.use('/valinor/doc', swaggerUi.serve, swaggerUi.setup(swaggerFile))
import app from './src/app/controllers/index.js';
app(gisp)

// server.listen(port, function () {
//     console.log('Servidor rodando na porta %d', port);
// });