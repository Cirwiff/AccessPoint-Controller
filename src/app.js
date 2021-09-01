require('dotenv').config();

const express = require('express'); //necessário para criar o servidor
const cors = require('cors')
var cron = require('node-cron');
const check = require('./check')


const routes = require('./routes');
const app = express();


app.use(cors())
app.use(express.urlencoded({ limit: "50mb", extended: true, parameterLimit:50000 }));
app.use(express.json({limit: "50mb"}));
app.use(routes); // Servidor usando as APIs listados no arquivo routes

app.listen(3000);  //Servidor sysadmins escutando na porta 3333

cron.schedule('* * * * *', check.index); //agendar tarefa de verificar aps a cada minuto
