const socket = await io();
const userId = JSON.parse(window.localStorage.getItem('dataUser')).user["_id"]
socket.emit('arcgis', { 'func': 'tokengenerateInit', 'path': '', 'tkn': userId});

socket.on(userId, function(dataServ) {           
    require(["esri/config", "esri/WebMap", "esri/views/MapView", "esri/widgets/ScaleBar", "esri/widgets/Search", "esri/widgets/DistanceMeasurement2D",
    "esri/tasks/Locator", "esri/layers/FeatureLayer", "esri/widgets/Expand", "esri/widgets/Legend", "esri/widgets/Locate", "esri/portal/PortalItem"], 
        function (esriConfig, WebMap, MapView, ScaleBar, Search, DistanceMeasurement2D, Locator, FeatureLayer, Expand, Legend, Locate, PortalItem) {
            esriConfig.apiKey = 'AAPKfa176b384a0f4731b5616ab458000295sqFrPIg9EfPL30UQ5vEZbERzqVymJealBtlTJ5IDwsRvMZd_uOW5LYFtrmmEIDOO';
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

            // let item = new PortalItem({
            //     id: "ffaf78fa324040bcb1e8148341a539df",
            //     // autocastable to Portal
            //     portal: {
            //         url: "https://multiplay.maps.arcgis.com"
            //     }
            // });

            // item.load().then((data) => {
            //     console.log(data)
            // })           

            constructor(dataServ)
            
            socket.emit('arcgis', { 'func': 'mapconstructor', 'path': '', 'tkn': ''});

            function constructor (data) {
                const layers = [];
                let count = 0;

                const webmap = new WebMap({
                    portalItem: {
                        id: data.map.id
                    }
                });

                const view = new MapView({
                    map: webmap,
                    container: "viewDiv"
                });

                const scalebar = new ScaleBar({
                    view: view
                });

                const legend = new Expand({
                    content: new Legend({
                        view: view,
                        style: "classic" // other styles include 'classic'
                    }),
                    view: view,
                    expanded: true              
                });

                data.map.feature.layers.forEach(layer => {
                    layers.push(new FeatureLayer({ 
                        url: layer.url,
                        apiKey: layer.apiKey,
                        title: layer.title
                    }))
                });

                const arrSearch = [{
                    name: "Serviço de Geocodificação",
                    placeholder: "Ex.: Rua 418, 1369",
                    apiKey: "AAPKfa176b384a0f4731b5616ab458000295sqFrPIg9EfPL30UQ5vEZbERzqVymJealBtlTJ5IDwsRvMZd_uOW5LYFtrmmEIDOO",
                    singleLineFieldName: "SingleLine",
                    locator: new Locator({
                        url: "http://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer"
                    })
                }]                

                data.map.feature.sources.forEach(source => {
                    source.layer = layers[count];
                    arrSearch.unshift(source);
                    count++;
                });

                var searchWidget = new Search({
                    view: view,
                    allPlaceholder: "Pesquisar",
                    includeDefaultSources: false,
                    sources: arrSearch
                });

                const locateWidget = new Locate({
                    view: view,
                });

                const measurementWidget = new DistanceMeasurement2D({
                    view: view
                });

                

                view.ui.add(searchWidget, {
                    position: "top-right"
                });
                view.ui.add(measurementWidget, "top-right");            
                view.ui.add(scalebar, "bottom-left");            
                view.ui.add(legend, "bottom-right");
                view.ui.add(locateWidget, "top-left")
            }
        }
    );
})

// let item = new PortalItem({
//     id: "ffaf78fa324040bcb1e8148341a539df",
//     // autocastable to Portal
//     portal: {
//         url: "https://multiplay.maps.arcgis.com/apps/dashboards"
//     }
// });
// item.load();