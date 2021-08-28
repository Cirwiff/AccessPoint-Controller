const { connection } = require('../database/connection');
const logger = require('../logger');

module.exports = {

    async create(request, response) {

        const body = request.body;
        const consulta = "INSERT INTO apgroups SET ?";
        const user_login = request.user.user_login
        const user_id = request.user.user_id

        var conn;

        try {

            conn = await connection.getConnection();

            const [resultado] = await conn.query(consulta, [body]);

            logger.info({
                type: "Grupos",
                action: "create",
                user: user_login + "(" + user_id + ")" ,
                message:"Grupo "+body.description + "(" + resultado.insertId + ")"+" foi criado", 
                date: new Date()
            })

            return response.status(201).json({
                sucesso: true,
                mensagem: 'Grupo cadastrado com sucesso',
                group_id: resultado.insertId
            });
           
        } catch (error) {

            logger.error({
                type: "Grupos",
                action: "create",
                user: user_login + "(" + user_id + ")" ,
                message:error, 
                date: new Date()
            })

            return response.status(500).json({ sucesso: false, mensagem: error });

        } finally {

            if (conn !== undefined) { conn.release(); conn.destroy() };
        }
    },

    async index(request, response) {

        const consulta1 = "SELECT * FROM apgroups"

        var conn;

        try {

            conn = await connection.getConnection();
            const [resultado] = await conn.query(consulta1);

            return response.json({ sucesso: true, resultado: resultado });

        } catch (error) {

            console.log(error);
            return response.status(500).json({ sucesso: false, mensagem: error });

        } finally {
            if (conn !== undefined) //Isto irá checar se a conn já foi inicializada
            { conn.release(); conn.destroy() };
        }
    },

    async update(request, response) {

        const { id } = request.params;
        const body = request.body;
        const user_login = request.user.user_login
        const user_id = request.user.user_id

        const consulta = "UPDATE apgroups SET ? WHERE id = ?"
        const consulta2 = "SELECT id,description FROM apgroups WHERE id = ?"

        var conn;

        try {

            console.log(body)

            conn = await connection.getConnection();

            const [resultado] = await conn.query(consulta2, [id])

            console.log(body)

            if(resultado.length < 1){
                return response.status(401).json({ sucesso: false, mensagem: "Grupo não cadastrado" });
            }

            await conn.query(consulta, [body, id])

            logger.info({
                type: "Grupos",
                action: "update",
                user: user_login + "(" + user_id + ")" ,
                message:"Grupo "+resultado[0].description + "(" + resultado[0].id + ")"+" sofreu alterações", 
                date: new Date()
            })

            return response.json({
                sucesso: true,
                mensagem: 'Grupo atualizado com sucesso'
            });

            
        } catch (error) {

            logger.error({
                type: "Grupos",
                action: "update",
                user: user_login + "(" + user_id + ")" ,
                message:error, 
                date: new Date()
            })

            return response.status(500).json({ sucesso: false, mensagem: error });
            
        } finally {

            if (conn !== undefined) { conn.release(); conn.destroy() };
        }
    },

    async delete(request, response) {

        const { id } = request.params;
        const user_login = request.user.user_login
        const user_id = request.user.user_id

        const consulta = "DELETE FROM apgroups WHERE id= ?";
        const consulta2 = "SELECT id, description FROM apgroups WHERE id = ?"

        var conn;

        try {

            conn = await connection.getConnection();

            const [resultado] = await conn.query(consulta2, [id])

            if(resultado.length < 1){
                return response.status(401).json({ sucesso: false, mensagem: "Grupo não cadastrado" });
            }

            await conn.query(consulta, [id]);

            logger.info({
                type: "Grupos",
                action: "delete",
                user: user_login + "(" + user_id + ")" ,
                message:"Grupo "+resultado[0].description + "(" + resultado[0].id + ")"+" foi deletado", 
                date: new Date()
            })

            return response.json({
                sucesso: true,
                mensagem: "Grupo deletado com sucesso"
            });

        } catch (error) {

            logger.error({
                type: "Grupos",
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