const swaggerAutogen = require('swagger-autogen')()

const doc = {
    info: {
        version: "1.0.0",
        title: "Gisplay",
        description: "Aplicação de acesso e comunicação com Mapas Multiplay. <br> A plataforma utiliza a API ArcGis e Sharing Portal fornecidos por Esri Enterprise."
    },
    host: "10.30.0.5:3000",
    basePath: "/",
    schemes: ['https'],
    consumes: ['application/json'],
    produces: ['application/json'],
    tags: [
        {
            "name": "Auth",
            "description": "authController"
        },
        {
            "name": "Logged",
            "description": "projectController"
        }
    ],
    definitions: {
        User: {
            name: "Joseph Smith",
            email: "joseph.smith@multiplaytelecom.com.br",
            sector: "projetos",
            accessCredential: "basic"
        }
    }
}

const outputFile = './swagger_output.json'
const endpointsFiles = ['./src/app/controllers/authController.js', './src/app/controllers/projectController.js']

swaggerAutogen(outputFile, endpointsFiles, doc).then(() => {
    require('./server')           // Your project's root file
})