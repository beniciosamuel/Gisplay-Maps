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
            'tokengenerate': (id) => {
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
                    socket.emit(id, body.access_token);
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
            }
        }
        services[func](tkn);
    })
})

gisp.get('/token-arcgis', (req, res) => {
    
})

gisp.post('/auth-arcgis', (req, res) => {
    
})

require('./src/app/controllers/index')(gisp);

server.listen(port, function () {
    console.log('Servidor rodando na porta %d', port);
});