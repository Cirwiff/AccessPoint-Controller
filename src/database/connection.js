const mysql = require('mysql2/promise');

require('dotenv').config();

var config = {
    connectionLimit: 30,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE
} //configurações de acesso ao bando de dados

const connection = mysql.createPool(config); //criando módulo com base no arquivo config

module.exports = { connection } //exportando modulo para acesso ao banco de dados