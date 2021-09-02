const express = require('express');
const routes = express.Router();
const jwt = require('./middleware/jsonWebToken');
const basic_auth = require('./middleware/basicAuth')

const UserController = require('./userside/UserController')
const ApController = require('./userside/ApController')
const GroupController = require('./userside/GroupsController')
const CaControllerAP = require('./apside/caController')
const CaController = require('./userside/caController')
const LogController = require('./userside/loggerController')

routes.post('/api/v1/user', jwt.login, UserController.create)
routes.get('/api/v1/user', jwt.login, UserController.index)
routes.put('/api/v1/user/:id', jwt.login, UserController.update)
routes.delete('/api/v1/user/:id', jwt.login, UserController.delete)
routes.get('/api/v1/verifica_login', jwt.verify_login)
routes.post('/api/v1/login', UserController.login)

routes.get('/api/v1/ap', jwt.login, ApController.index)
routes.post('/api/v1/ap', jwt.login, ApController.create)
routes.put('/api/v1/ap/:id', jwt.login, ApController.update)
routes.delete('/api/v1/ap/:id', jwt.login, ApController.delete)

routes.get('/api/v1/group', jwt.login, GroupController.index)
routes.post('/api/v1/group', jwt.login, GroupController.create)
routes.put('/api/v1/group/:id', jwt.login, GroupController.update)
routes.delete('/api/v1/group/:id', jwt.login, GroupController.delete)

routes.get('/api/v1/ca', jwt.login, CaController.index)
routes.put('/api/v1/ca', jwt.login, CaController.update)
routes.delete('/api/v1/ca/:id', jwt.login, CaController.delete)

routes.put('/api/v2/ap', basic_auth.login, CaControllerAP.put)
routes.get('/api/v1/log', jwt.login, LogController.index)


module.exports = routes;