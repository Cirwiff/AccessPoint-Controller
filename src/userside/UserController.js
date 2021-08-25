const { connection } = require('../database/connection');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt')

require('dotenv').config();

module.exports = {

    async login(request, response) {

        const body = request.body
        const consulta = "SELECT * FROM sysadmins WHERE email = ?"

        var conn;

        try {
            conn = await connection.getConnection();

            const [res] = await conn.query(consulta, [body.email]);

            if (res.length < 1)
                return response.status(401).json({ sucesso: false, mensagem: 'Falha na autenticação' });

            const verified = bcrypt.compare(body.password, res[0].password);

            if(verified){

                const token = jwt.sign({
                    user_id: res[0].id,
                    user_name: res[0].name,
                    user_login: res[0].login,
                    user_permission: res[0].permission
                },
                    process.env.JWT_KEY,
                    {
                        expiresIn: '12h'
                    }
                );

                return response.status(200).json({
                    sucesso: true,
                    mensagem: 'Autenticado com sucesso',
                    token: token,
                    user_id: res[0].id
                });

            }else{
                return response.status(401).json({ sucesso: false, mensagem: 'Falha na autenticação' });
            }


        } catch (error) {

            console.log(error);
            return response.status(500).json({ sucesso: false, mensagem: error });

        } finally {

            if (conn !== undefined) //This will check if the conn has already be initialized
            { conn.release(); conn.destroy(); }

        }
    },

    async create(request, response) {

        const body = request.body
        const user_permission = request.user.user_permission
        var conn

        const hash = bcrypt.hash(body.password, 10);

        const dados = {
            name: body.name,
            password: hash,
            login: body.login,
            permission: body.permission
        }

        try {
            
            conn = await connection.getConnection()

            const consulta = "INSERT INTO sysadmins SET ?"

            if(user_permission == 0){

                const [resultado] = await conn.query(consulta, dados);

                return response.status(201).json({
                    sucesso: true,
                    mensagem: 'usuário cadastrado com sucesso',
                    user_id: resultado.insertId
                });

            }else{
                return response.status(401).json({ sucesso: false, mensagem: "Usuário não autorizado" });
            }

            

        } catch (error) {

            if(error.code == "ER_DUP_ENTRY"){
                return response.status(406).json({ sucesso: false, mensagem: "Usuário já cadastrado" });
            }else{
                return response.status(500).json({ sucesso: false, mensagem: error });
            }

        } finally {

            if (conn !== undefined) { conn.release(); conn.destroy() };
        }

    }
}
