export default{
  "swagger": "2.0",
  "info": {
    "version": "1.0.0",
    "title": "Gisplay",
    "description": "Aplicação de acesso e comunicação com Mapas Multiplay. <br> A plataforma utiliza a API ArcGis e Sharing Portal fornecidos por Esri Enterprise."
  },
  "host": "10.30.0.5:3000",
  "basePath": "/",
  "tags": [
    {
      "name": "Auth",
      "description": "authController"
    },
    {
      "name": "Logged",
      "description": "projectController"
    }
  ],
  "schemes": [
    "https"
  ],
  "consumes": [
    "application/json"
  ],
  "produces": [
    "application/json"
  ],
  "paths": {
    "/register": {
      "post": {
        "tags": [
          "Auth"
        ],
        "description": "Register the user with this route, to get access you must register the email an password. <br>\r  A JSON object containing name, email, password and sector, must be send for this route",
        "parameters": [
          {
            "name": "example",
            "description": "{ 'name': 'username', 'email': 'useremail', 'password': 'password', 'sector': 'usersector'}",
            "in": "query",
            "type": "string"
          },
          {
            "name": "obj",
            "in": "body",
            "schema": {
              "type": "object",
              "properties": {
                "email": {
                  "example": "any"
                }
              }
            }
          }
        ],
        "responses": {
          "200": {
            "description": "OK"
          },
          "400": {
            "description": "Bad Request"
          }
        }
      }
    },
    "/authenticate": {
      "post": {
        "tags": [
          "Auth"
        ],
        "description": "Authenticate a user with this route, to get access you must have registered the email and password.\r  <br> A JSON object containing email and password must be send for this route.",
        "parameters": [
          {
            "name": "example",
            "description": "{ 'email': 'useremail', 'password': 'password'}",
            "in": "query",
            "type": "string"
          },
          {
            "name": "obj",
            "in": "body",
            "schema": {
              "type": "object",
              "properties": {
                "email": {
                  "example": "any"
                },
                "password": {
                  "example": "any"
                }
              }
            }
          }
        ],
        "responses": {
          "200": {
            "description": "OK"
          },
          "400": {
            "description": "Bad Request"
          }
        }
      }
    },
    "/email_confirm": {
      "post": {
        "tags": [
          "Auth"
        ],
        "description": "When a user is register, a email to confirm this account is sent, to confirm this user, use this route.\r  <br> A JSON object containing email and token of email confirm of the user must be send for this route.",
        "parameters": [
          {
            "name": "example",
            "description": "{ 'email': 'useremail', 'token': 'token'}",
            "in": "query",
            "type": "string"
          },
          {
            "name": "obj",
            "in": "body",
            "schema": {
              "type": "object",
              "properties": {
                "email": {
                  "example": "any"
                },
                "token": {
                  "example": "any"
                },
                "password": {
                  "example": "any"
                }
              }
            }
          }
        ],
        "responses": {
          "200": {
            "description": "OK"
          },
          "400": {
            "description": "Bad Request"
          },
          "403": {
            "description": "Forbidden"
          },
          "404": {
            "description": "Not Found"
          }
        }
      }
    },
    "/forgot_password": {
      "post": {
        "tags": [
          "Auth"
        ],
        "description": "When a user is forgot your password, a email to reset your secret is sent, to send this email, use this route.\r  <br> A JSON object containing email of the user must be send for this route.",
        "parameters": [
          {
            "name": "example",
            "description": "{ 'email': 'useremail' }",
            "in": "query",
            "type": "string"
          },
          {
            "name": "obj",
            "in": "body",
            "schema": {
              "type": "object",
              "properties": {
                "email": {
                  "example": "any"
                }
              }
            }
          }
        ],
        "responses": {
          "200": {
            "description": "OK"
          },
          "400": {
            "description": "Bad Request"
          }
        }
      }
    },
    "/reset_password": {
      "post": {
        "tags": [
          "Auth"
        ],
        "description": "When a user want reset your pass, a new token is generated, to confirm this token use this route.\r  <br> A JSON object containing email, token of password confirm and new pass must be send for this route.",
        "parameters": [
          {
            "name": "example",
            "description": "{ 'email': 'useremail', 'token': 'token', 'password': 'password'}",
            "in": "query",
            "type": "string"
          },
          {
            "name": "obj",
            "in": "body",
            "schema": {
              "type": "object",
              "properties": {
                "email": {
                  "example": "any"
                },
                "token": {
                  "example": "any"
                },
                "password": {
                  "example": "any"
                }
              }
            }
          }
        ],
        "responses": {
          "200": {
            "description": "OK"
          },
          "400": {
            "description": "Bad Request"
          }
        }
      }
    },
    "/access-map": {
      "get": {
        "tags": [
          "Logged"
        ],
        "description": "This route is necessary to ensure access to maps with credentials only.",
        "parameters": [],
        "responses": {
          "200": {
            "description": "OK"
          },
          "401": {
            "description": "Unauthorized"
          }
        }
      }
    },
    "/upgrade": {
      "put": {
        "tags": [
          "Logged"
        ],
        "description": "Use this route to upgrade level of the your user.\r  <br> A JSON object containing email of the admin and of the employee must be send for this route.",
        "parameters": [
          {
            "name": "example",
            "description": "{ 'email': 'adminemail', 'userUpdate': 'emailslayer'}",
            "in": "query",
            "type": "string"
          },
          {
            "name": "obj",
            "in": "body",
            "schema": {
              "type": "object",
              "properties": {
                "email": {
                  "example": "any"
                },
                "userUpdate": {
                  "example": "any"
                }
              }
            }
          }
        ],
        "responses": {
          "200": {
            "description": "OK"
          },
          "400": {
            "description": "Bad Request"
          },
          "401": {
            "description": "Unauthorized"
          }
        }
      }
    },
    "/forgot": {
      "post": {
        "tags": [
          "Logged"
        ],
        "description": "Admins can send a email to reset a password for the your employee, use this route for this.\r  <br> A JSON object containing email of the admin and of the employee must be send for this route.",
        "parameters": [
          {
            "name": "example",
            "description": "{ 'email': 'adminemail', 'userResetPass': 'idslayer'}",
            "in": "query",
            "type": "string"
          },
          {
            "name": "obj",
            "in": "body",
            "schema": {
              "type": "object",
              "properties": {
                "email": {
                  "example": "any"
                },
                "userResetPass": {
                  "example": "any"
                }
              }
            }
          }
        ],
        "responses": {
          "200": {
            "description": "OK"
          },
          "400": {
            "description": "Bad Request"
          },
          "401": {
            "description": "Unauthorized"
          },
          "403": {
            "description": "Forbidden"
          },
          "404": {
            "description": "Not Found"
          }
        }
      }
    },
    "/reset_confirm": {
      "post": {
        "tags": [
          "Logged"
        ],
        "description": "Use this route to resend email to confirm account of the your user.\r  <br> A JSON object containing email of the admin and of the employee must be send for this route.",
        "parameters": [
          {
            "name": "example",
            "description": "{ 'email': 'adminemail', 'userResetPass': 'emailslayer'}",
            "in": "query",
            "type": "string"
          },
          {
            "name": "obj",
            "in": "body",
            "schema": {
              "type": "object",
              "properties": {
                "email": {
                  "example": "any"
                },
                "userToConfirm": {
                  "example": "any"
                }
              }
            }
          }
        ],
        "responses": {
          "200": {
            "description": "OK"
          },
          "400": {
            "description": "Bad Request"
          },
          "401": {
            "description": "Unauthorized"
          },
          "403": {
            "description": "Forbidden"
          },
          "404": {
            "description": "Not Found"
          }
        }
      }
    },
    "/release": {
      "put": {
        "tags": [
          "Logged"
        ],
        "description": "Project sector admins can manage all users and make anyone an administrator.\r  <br> A JSON object containing email of the admin and of the employee must be send for this route.",
        "parameters": [
          {
            "name": "example",
            "description": "{ 'email': 'adminemail', 'userUpdate': 'idslayer'}",
            "in": "query",
            "type": "string"
          },
          {
            "name": "obj",
            "in": "body",
            "schema": {
              "type": "object",
              "properties": {
                "email": {
                  "example": "any"
                },
                "userUpdate": {
                  "example": "any"
                }
              }
            }
          }
        ],
        "responses": {
          "200": {
            "description": "OK"
          },
          "400": {
            "description": "Bad Request"
          },
          "401": {
            "description": "Unauthorized"
          },
          "404": {
            "description": "Not Found"
          }
        }
      }
    },
    "/reject": {
      "delete": {
        "tags": [
          "Logged"
        ],
        "description": "Admins can exclude anyone from their sector, be careful when managing.\r  <br> A JSON object containing email of the admin and of the employee must be send for this route.",
        "parameters": [
          {
            "name": "example",
            "description": "{ 'email': 'adminemail', 'userRemove': 'useremail'}",
            "in": "query",
            "type": "string"
          },
          {
            "name": "obj",
            "in": "body",
            "schema": {
              "type": "object",
              "properties": {
                "email": {
                  "example": "any"
                },
                "userRemove": {
                  "example": "any"
                }
              }
            }
          }
        ],
        "responses": {
          "200": {
            "description": "OK"
          },
          "400": {
            "description": "Bad Request"
          },
          "401": {
            "description": "Unauthorized"
          },
          "403": {
            "description": "Forbidden"
          },
          "404": {
            "description": "Not Found"
          }
        }
      }
    },
    "/getall": {
      "post": {
        "tags": [
          "Logged"
        ],
        "description": "Admins can getall anyone from their sector, be careful when managing.\r  <br> A JSON object containing email and sector of the admin must be send for this route.",
        "parameters": [
          {
            "name": "example",
            "description": "{ 'email': 'adminemail' }",
            "in": "query",
            "type": "string"
          },
          {
            "name": "obj",
            "in": "body",
            "schema": {
              "type": "object",
              "properties": {
                "email": {
                  "example": "any"
                }
              }
            }
          }
        ],
        "responses": {
          "200": {
            "description": "OK"
          },
          "400": {
            "description": "Bad Request"
          },
          "401": {
            "description": "Unauthorized"
          },
          "404": {
            "description": "Not Found"
          }
        }
      }
    },
    "/get-pendents": {
      "post": {
        "tags": [
          "Logged"
        ],
        "description": "Admins can getpendents from their sector, be careful when managing.\r  <br> A JSON object containing email and sector of the admin must be send for this route.",
        "parameters": [
          {
            "name": "example",
            "description": "{ 'email': 'adminemail' }",
            "in": "query",
            "type": "string"
          },
          {
            "name": "obj",
            "in": "body",
            "schema": {
              "type": "object",
              "properties": {
                "email": {
                  "example": "any"
                }
              }
            }
          }
        ],
        "responses": {
          "200": {
            "description": "OK"
          },
          "400": {
            "description": "Bad Request"
          },
          "401": {
            "description": "Unauthorized"
          },
          "404": {
            "description": "Not Found"
          }
        }
      }
    },
    "/sign-out": {
      "post": {
        "tags": [
          "Logged"
        ],
        "description": "To sign out a user.\r  <br> A JSON object containing email of the user must be send for this route.",
        "parameters": [
          {
            "name": "example",
            "description": "{ 'email': 'useremail' }",
            "in": "query",
            "type": "string"
          },
          {
            "name": "obj",
            "in": "body",
            "schema": {
              "type": "object",
              "properties": {
                "email": {
                  "example": "any"
                }
              }
            }
          }
        ],
        "responses": {
          "200": {
            "description": "OK"
          },
          "400": {
            "description": "Bad Request"
          },
          "401": {
            "description": "Unauthorized"
          },
          "404": {
            "description": "Not Found"
          }
        }
      }
    }
  },
  "definitions": {
    "User": {
      "type": "object",
      "properties": {
        "name": {
          "type": "string",
          "example": "Joseph Smith"
        },
        "email": {
          "type": "string",
          "example": "joseph.smith@multiplaytelecom.com.br"
        },
        "sector": {
          "type": "string",
          "example": "projetos"
        },
        "accessCredential": {
          "type": "string",
          "example": "basic"
        }
      }
    }
  }
}