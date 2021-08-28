const { connection } = require('../database/connection');
const logger = require('../logger');

module.exports = {

    async create(request, response) {

        const body = request.body;
        const consulta = "INSERT INTO accesspoint SET ?";
        const user_login = request.user.user_login
        const user_id = request.user.user_id

        var conn;

        try {

            conn = await connection.getConnection();

            const [resultado] = await conn.query(consulta, [body]);

            logger.info({
                type: "APs",
                action: "create",
                user: user_login + "(" + user_id + ")" ,
                message:"Ponto de acesso "+body.mac + "(" + resultado.insertId + ") foi criado", 
                date: new Date()
            })

            return response.status(201).json({
                sucesso: true,
                mensagem: 'Access Point cadastrado com sucesso',
                ap_id: resultado.insertId
            });

        } catch (error) {

            logger.error({
                type: "APs",
                action: "create",
                user: user_login + "(" + user_id + ")" ,
                message:error, 
                date: new Date()
            })

            if (error.code == "ER_DUP_ENTRY") {
                return response.status(406).json({ sucesso: false, mensagem: "MAC já cadastrado" });
            } else {
                return response.status(500).json({ sucesso: false, mensagem: error });
            }

        } finally {

            if (conn !== undefined) { conn.release(); conn.destroy() };
        }
    },

    async index(request, response) {

        const consulta1 = "SELECT * FROM accesspoint order by status desc"

        var conn;

        try {

            conn = await connection.getConnection();

            const [resultado] = await conn.query(consulta1);
 
            return response.json({ sucesso: true, resultado: resultado });

        } catch (error) {

            console.log(error);
            return response.status(500).json({ sucesso: false, mensagem: error });

        } finally {
            if (conn !== undefined) //This will check if the conn has already be initialized
            { conn.release(); conn.destroy() };
        }
    },

    async update(request, response) {

        const { id }  = request.params;
        const body = request.body;
        const user_login = request.user.user_login
        const user_id = request.user.user_id

        var list = id.split(',')

        const consulta = "UPDATE accesspoint SET ? WHERE id in (?)"
        const consulta2 = "SELECT id,mac FROM accesspoint WHERE id in (?)"

        var conn;

        try {

            conn = await connection.getConnection();

            const [resultado] = await conn.query(consulta2, [list])

            if(resultado.length < 1){
                return response.status(401).json({ sucesso: false, mensagem: "Ap não cadastrado" });
            }

            await conn.query(consulta, [body, list])// executa o comando no banco de dados

            logger.info({
                type: "APs",
                action: "update",
                user: user_login + "(" + user_id + ")" ,
                message:"Ponto de acesso "+resultado[0].mac + "(" + resultado[0].id + ") foi atualizado", 
                date: new Date()
            })
            
            return response.json({
                sucesso: true,
                mensagem: 'Access point atualizado com sucesso'
            });

        } catch (error) {

            logger.error({
                type: "APs",
                action: "update",
                user: user_login + "(" + user_id + ")" ,
                message:error, 
                date: new Date()
            })

            if (error.code == "ER_DUP_ENTRY") {
                return response.status(406).json({ sucesso: false, mensagem: "MAC já cadastrado" });
            } else {
                return response.status(500).json({ sucesso: false, mensagem: error });
            }

        } finally {

            if (conn !== undefined) { conn.release(); conn.destroy() };
        }
    },

    async delete(request, response) {

        const { id } = request.params;
        const user_login = request.user.user_login
        const user_id = request.user.user_id

        const consulta = "DELETE FROM accesspoint WHERE id= ?";
        const consulta2 = "SELECT id,mac FROM accesspoint WHERE id = ?"

        var conn;

        try {

            conn = await connection.getConnection();

            const [resultado] = await conn.query(consulta2, [id])

            if(resultado.length < 1){
                return response.status(401).json({ sucesso: false, mensagem: "Ap não cadastrado" });
            }

            await conn.query(consulta, [id]);

            logger.info({
                type: "APs",
                action: "delete",
                user: user_login + "(" + user_id + ")" ,
                message:"Ponto de acesso "+resultado[0].mac + "(" + resultado[0].id + ") foi deletado", 
                date: new Date()
            })

            return response.json({
                sucesso: true,
                mensagem: "Access Point deletado com sucesso"
            });

        } catch (error) {

            logger.error({
                type: "APs",
                action: "delete",
                user: user_login + "(" + user_id + ")" ,
                message:error, 
                date: new Date()
            })
            return response.status(500).json({ sucesso: false, mensagem: error });

        } finally {
            if (conn !== undefined) //This will check if the conn has already be initialized
            { conn.release(); conn.destroy() };
        }
    }

}