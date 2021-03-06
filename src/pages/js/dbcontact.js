var firebaseConfig = {
    apiKey: "AIzaSyCtVw2pRupsba1cTqev23--HrGezIOEx6w",
    authDomain: "gisplay-7eda0.firebaseapp.com",
    databaseURL: "https://gisplay-7eda0-default-rtdb.firebaseio.com",
    projectId: "gisplay-7eda0",
    storageBucket: "gisplay-7eda0.appspot.com",
    messagingSenderId: "556762654826",
    appId: "1:556762654826:web:db906a27805db0e1220213",
    measurementId: "G-W5HXHFTKBY"
  };
  
firebase.initializeApp(firebaseConfig);

const flags = {
    errors: {
        authentication: {
            code: 101,
            message: 'Houve um erro de autenticação.'
        },
        credential: {
            code: 103,
            message: 'O usuário não tem permissão para realizar a operação.'
        }
    } 
}

const dbOpera = {
    authUser: (email, password) => {
        const status = new Promise ((res, rej) => {
            const authStatus = firebase.auth().signInWithEmailAndPassword(email, password).then((userCredential) => {
                var user = firebase.auth().currentUser;
                if (user.emailVerified == true) {
                    window.location.assign("/maps");
                    res(user);
                } if (user.emailVerified == false) {
                    window.location.assign("/verify");
                }
            }).catch((err) => {
                console.log(err);
                rej(err);
            })
        })

         return status;
    },
    newUser: (objUser) => {
        const newDataUser = new Promise ((res, rej) => {
            if (objUser.groupcode == "Multiplay-70DE") {
                firebase.auth().createUserWithEmailAndPassword(objUser.email, objUser.password)
                .then((userCredential) => {
                    const user = firebase.auth().currentUser;
                    user.updateProfile({
                        displayName: objUser.username,
                    })
                    const id = Math.random().toString(36).substring(0, 7).replace('.', '');
                    firebase.database().ref('/Multiplay-70DE/groups/users/' + id).set({
                        name: objUser.username,
                        email: objUser.email,
                        credential: 'basic'
                    });
                    firebase.database().ref('/Multiplay-70DE/users/' + objUser.username).set({
                        id: id,
                        email: objUser.email,
                        group: 'Multiplay',
                        teams: objUser.groupsl,
                        credential: 'basic',
                        approved: false
                    });
                    firebase.database().ref('/Multiplay-70DE/pendents/' + objUser.groupsl + '/' + objUser.username).set({
                        id: id,
                        approved: false
                    });
                    user.sendEmailVerification();
                    console.log(user);
                    res(userCredential);
                }).catch((err) => {
                    console.log(err);
                    rej(err);
                })
            } else {
                const err = "O código do grupo";
                rej(err);
            }
            
        })

        return newDataUser;
    },
    resend: () => {
        const status = new Promise ((res, rej) => {
            const user = firebase.auth().currentUser;
            user.sendEmailVerification().then(() => {
                const msg = "Email enviado com Sucesso!";
                res(msg)
            }).catch((err) => {
                console.log(err);
                const errUser = "Houve um problema com seu Email!";
                rej(errUser);
            })
        })

        return status;
    },
    readData: (path) => {
        const dataResc = new Promise ((res, rej) => {
            firebase.database().ref(path).on('value', (snapshot) => {
                res(snapshot.val())
            })
        })

        return dataResc
    },
    verifyUser: () => {
        const data = new Promise ((res, rej) => {
            firebase.auth().onAuthStateChanged((user) => {
                if (user) {                    
                    res(user)
                } else {
                    console.log('Code error: ' + flags.errors.authentication.code);
                    window.location.assign("/login");
                    rej(flags.errors.authentication);
                }
            })
        })

        return data
    },
    download: () => {
        const app = new Promise ((res, rej) => {
            const blob = firebase.storage().ref('updates').child('gisplay-leaflet.apk').getDownloadURL().then((url) => {
                var xhr = new XMLHttpRequest();
                xhr.responseType = 'blob';
                xhr.onload = function(event) {
                    var blob = xhr.response;
                    console.log("Download Conluído!")
                    res(blob);
                };
                xhr.open('GET', url);
                xhr.send();
            }).catch((err) => {
                console.log("Houve um Erro com o download!")
                console.log(err)
                rej(err);
            })
        })

        return app;
    },
    setValues: (path, obj) => {
        const data = new Promise((res, rej) => {
            firebase.database().ref('Multiplay-70DE/' + path).set(obj, (error) => {
                if (error) {
                    rej(error)
                } else {
                    res('Concluded')
                }
            })
        })

        return data
    },
    dislog: () => {
        const result = new Promise ((res, rej) =>  {
            firebase.auth().signOut().then(() => [
                window.location.assign("/login")
            ]).catch((err) => {
                console.log(err);
            })
        })
    }
}

const dbOperaMaps = {
    verifyMaps: () => {
        const maps = new Promise ((res, rej) => {
            dbOpera.verifyUser().then((user) => {
                console.log(user)
            }).catch((err) => {
                rej(err)
            })
        })

        return maps
    },
    createMaps: (name) => {
        const result = new Promise((res, rej) => {
            dbOpera.verifyUser().then((user) => {
                if (user) {
                    dbOpera.verifyUser().then((user) => {
                        if (user) {
                            dbOpera.readData('Multiplay-70DE/users/' + user.displayName).then((userinfo) => {
                                if (userinfo.credential == 'premium') {
                                    const id = Math.random().toString(36).substring(0, 12).replace('.', '');
                                    firebase.database().ref('Multiplay-70DE/maps/' + name).set({
                                        idMap: id,
                                        users: {
                                            name
                                        },
                                        dataraw: '',
                                        features: {
                                            limits: '',
                                            polygons: '',
                                            marks: ''
                                        },
                                        styles: {
                                            servers: {
                                                basic: {
                                                    url: 'https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}',
                                                    maxZoom: 20,
                                                    id: 'mapbox/streets-v11',
                                                    tileSize: 512,
                                                    zoomOffset: -1,
                                                    accessToken: 'pk.eyJ1IjoiYnJpYXJpdXN0ZWNubyIsImEiOiJja2o4ZjlqbWIyM2x4MnFwZGxtempqYmhzIn0.ytMdh_MOTlaynSOSd1VxIQ'
                                                },
                                                openStreetMap: {
                                                    url: 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
                                                    attribution: 'Map data © <a href="http://openstreetmap.org">OpenStreetMap</a> ' +
                                                                'contributors, ' +
                                                                '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
                                                                'Imagery © <a href="http://mapbox.com">Mapbox</a>',
                                                    maxZoom: 19
                                                },
                                                satellite: {
                                                    url: 'https://api.mapbox.com/styles/v1/{username}/{style_id}/tiles/256/{z}/{x}/{y}@2x?access_token={access_token}',
                                                    maxZoom: 18,
                                                    username: 'briariustecno',
                                                    style_id: 'ckk6wkvt60i8s17mt8asgkmd4',
                                                    access_token: 'pk.eyJ1IjoiYnJpYXJpdXN0ZWNubyIsImEiOiJja2o4ZjV6ODcxZXo4MzFueTZoNng1OHhlIn0.TQp7xlD0Yp7KC7feiwriuQ'
                                                },
                                                gisplaymap: {
                                                    url: 'https://api.mapbox.com/styles/v1/{username}/{style_id}/tiles/256/{z}/{x}/{y}@2x?access_token={access_token}',
                                                    maxZoom: 18,
                                                    username: 'briariustecno',
                                                    style_id: 'ckltrxdxq2q8417lkhttp4u2s',
                                                    access_token: 'pk.eyJ1IjoiYnJpYXJpdXN0ZWNubyIsImEiOiJja2o4ZjV6ODcxZXo4MzFueTZoNng1OHhlIn0.TQp7xlD0Yp7KC7feiwriuQ'
                                                }
                                            },
                                            icons: '',
                                        }
                                    })
                                } else {
                                    rej(flags.errors.credential);
                                }
                            })
                        }
                    });
                }
            }).catch((err) => {
                rej(err)
            })
        })

        return result;
    }
}

const operaUsers = {
    getListPendets: (sector) => {
        const list = new Promise ((res, rej) => {
            firebase.database().ref('Multiplay-70DE/pendents/' + sector).on('value', (snapshot) => {
                const users = snapshot.val();
                res(users)
            })
        })

        return list;
    },
    getListPendetsProjects: () => {
        const list = new Promise ((res, rej) => {
            firebase.database().ref('Multiplay-70DE/pendents/').on('value', (snapshot) => {
                const users = snapshot.val();
                res(users)
            })
        })

        return list;
    },
    promoteUser: (user) => {
        const result = new Promise((res, rej) => {
            dbOpera.readData('Multiplay-70DE/users/' + user + '/credential').then(credential => {
                if (credential == 'basic') {
                    dbOpera.setValues('users/' + user + '/credential', 'premium').then((status) => {
                        res(status)
                    }).catch(err => console.log(err))
                } 
                if (credential != 'basic') {
                    err = {
                        code: 'promoted',
                        message: 'O usuário já foi promovido anteriormente!'
                    }
                    console.log(err)
                    rej(err)
                }
            })
        })

        return result;
    },
    aprroveUser: (user) => {
        const result = new Promise((res) => {
            dbOpera.setValues('users/' + user + '/approved', true).then((status) => {
                dbOpera.readData('Multiplay-70DE/users/' + user).then((infoUser) => {
                    firebase.database().ref('Multiplay-70DE/pendents/' + infoUser.teams + '/' + user).remove();
                    res(status);
                })                                
            })
        })

        return result;
    },
    recuseUser: (user) => {
        const result = new Promise ((res, rej) => {
            dbOpera.setValues('users/' + user + '/approved', true).then((status) => {
                dbOpera.readData('Multiplay-70DE/users/' + user).then((infoUser) => {
                    firebase.database().ref('Multiplay-70DE/pendents/' + infoUser.teams + '/' + user).remove();
                    firebase.database().ref('Multiplay-70DE/users/' + user).remove();
                    dbOpera.setValues('recused/' + user, {approved: false}).then((restatus) => {
                        res(status);
                    });
                });
            });
        });

        return result;
    },
    redefinePass: (email) => {
        const status = new Promise ((res, rej) => {
            const auth = firebase.auth();
        
            auth.sendPasswordResetEmail(email).then(() => {
                res('Enviado!');
            }).catch((err) => {
                rej(err);
            })
        });

        return status;
    },
    deleteUser: () => {
        const sat = new Promise ((res, rej) => {
            var user = firebase.auth().currentUser;

            user.delete().then(function() {
                res('Destruido')
            }).catch(function(error) {
                rej('Erro: Usuário não pôde ser deletado.')
            });
        })

        return sat;
    }
}