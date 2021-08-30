function callFunction(funct) {  
    let anythingtodo = funct
    anythingtodo()
  }

  // const session = new arcgisRest.UserSession({
  //   username: "projetosmultiplay",
  //   password: "Leomota2301",
  // })
  // const validOrigins = ["https://localhost:3000/iframe"];
  // session.enablePostMessageAuth(validOrigins);

  // arcgisRest.request(session.portal, { authentication: session })
  

  const originalUrl =
        "https://multiplay.maps.arcgis.com/apps/dashboards/ffaf78fa324040bcb1e8148341a539df";
  // const embedUrl = originalUrl + "?arcgis-auth-origin=https://localhost:3000&arcgis-auth-portal=" + session.portal;
  // console.log(embedUrl)

  $("#iframe").attr('src', originalUrl)
  const iframe = $("#iframe").get(0).contentWindow;

  postMessage(async () => {
    const socket = await io();
    const userId = JSON.parse(window.localStorage.getItem('dataUser')).user["_id"]
    socket.emit('arcgis', { 'func': 'tokengenerateInit', 'path': '', 'tkn': userId});

    socket.on(userId, function(dataServ) {
      require(["esri/config", "esri/WebMap", "esri/layers/FeatureLayer"], (esriConfig, WebMap, FeatureLayer) => {
        console.log(dataServ)
        esriConfig.apiKey = 'AAPKfa176b384a0f4731b5616ab458000295sqFrPIg9EfPL30UQ5vEZbERzqVymJealBtlTJ5IDwsRvMZd_uOW5LYFtrmmEIDOO';
        console.log(esriConfig)
        esriConfig.request.trustedServers.push("https://localhost:3000");
        esriConfig.request.interceptors.push({
            // set the `urls` property to the URL of the FeatureLayer so that this
            // interceptor only applies to requests made to the FeatureLayer URL
            urls: ["https://services3.arcgis.com/", "https://multiplay.maps.arcgis.com/"],
            // use the BeforeInterceptorCallback to add token to query
            before: function(params) {
                params.requestOptions.query = params.requestOptions.query || {};
                params.requestOptions.query.token = dataServ.token;
            },
        });
        const webmap = new WebMap({
          portalItem: {
              id: "433937ae82ca4a3bac341aa54e722622"
          }
        });

        const layer = []
        layer.push(new FeatureLayer({ 
          url: "https://services3.arcgis.com/kLX7U8fknUKht1rW/arcgis/rest/services/FOR/FeatureServer",
          apiKey: 'AAPKfa176b384a0f4731b5616ab458000295sqFrPIg9EfPL30UQ5vEZbERzqVymJealBtlTJ5IDwsRvMZd_uOW5LYFtrmmEIDOO',
          title: "FOR"
        }))
        layer.push(new FeatureLayer({ 
          url: "https://services3.arcgis.com/kLX7U8fknUKht1rW/arcgis/rest/services/Rede%20Ativa%20Conex%C3%A3o%20CE/FeatureServer",
          apiKey: 'AAPKfa176b384a0f4731b5616ab458000295sqFrPIg9EfPL30UQ5vEZbERzqVymJealBtlTJ5IDwsRvMZd_uOW5LYFtrmmEIDOO',
          title: "Rede Ativa"
        }))
      })
    })
  }, "callFunction");

  function postMessage(value, callback) {       
      var type = typeof value;

      if (type === "function")
          value = String(value);

      iframe.postMessage({
          type: type,
          value: value,
          callback: callback
      }, "https://localhost:3000/iframe");
  }

  iframe.addEventListener("message", function (event) {
    const data = event.data;
    const rawValue = data.value; 
    const letCallback = data.callback 
    let value, callback;

    if (data.type === "function") {
      value = eval(rawValue);
      value()
    }
  }, false);

  // const session = new arcgisRest.UserSession({
  //   username: "projetosmultiplay",
  //   password: "Leomota2301",
  // })
  // arcgisRest.UserSession.fromParent("https://localhost:3000/iframe")
  //     .then((session) => {
  //       // session is a UserSession instance, populated from the parent app
  //       // the embedded app should exchange this token for one specific to the application
  //       console.log(session);
  //     })
  //     .catch((ex) => {
  //       // The only case it will reject is if the parent is unable to return a credential
  //       // if the parent does not see the child as a valid origin, the parent will never respond.
  //       console.log(ex);
  //     });