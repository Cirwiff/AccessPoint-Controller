const { connection } = require('../database/connection');
const logger = require('../logger');

module.exports = {

    //https://superuser.com/questions/1286244/openwrt-how-can-i-kick-a-wireless-client-from-command-line

    async index(request, response) {

        const consulta1 = "SELECT * FROM connectedclients"

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

        const mac = request.query.mac;
        const status = request.query.status
        const user_login = request.user.user_login
        const user_id = request.user.user_id

        const consulta = "UPDATE connectedclients SET status=? WHERE mac = ?"
        const consulta2 = "SELECT id,mac FROM connectedclients WHERE mac = ?"

        var conn;

        try {

            conn = await connection.getConnection();

            const [resultado] = await conn.query(consulta2, mac)

            if (resultado.length < 1) {
                return response.status(401).json({ sucesso: false, mensagem: "Cliente não cadastrado" });
            }

            if(status == 'unblock' || status == 'block'){

                await conn.query(consulta, [status, mac])// executa o comando no banco de dados

                var m = status == 'block'? "foi bloqueado":"foi desbloqueado"

                logger.info({
                    type: "Clientes conectados",
                    action: "update",
                    user: user_login + "(" + user_id + ")" ,
                    message:"Cliente "+resultado[0].mac + "(" + resultado[0].id + ") "+m, 
                    date: new Date()
                })

                return response.json({
                    sucesso: true,
                    mensagem: 'Access point atualizado com sucesso'
                });

            }else{

                return response.json({
                    sucesso: true,
                    mensagem: 'Parametro invaliddo, status deve ser "block" ou "unblock"'
                });

            }

        } catch (error) {

            logger.error({
                type: "Clientes conectados",
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

        const consulta = "DELETE FROM connectedclients WHERE id= ?";
        const consulta2 = "SELECT id,mac FROM connectedclients WHERE id = ?"

        var conn;

        try {

            conn = await connection.getConnection();

            const [resultado] = await conn.query(consulta2, [id])

            if(resultado.length < 1){
                return response.status(401).json({ sucesso: false, mensagem: "Cliente não cadastrado" });
            }

            await conn.query(consulta, [id]);

            logger.info({
                type: "Clientes conectados",
                action: "delete",
                user: user_login + "(" + user_id + ")" ,
                message:"Cliente "+resultado[0].mac + "(" + resultado[0].id + ") foi deletado", 
                date: new Date()
            })

            return response.json({
                sucesso: true,
                mensagem: "Cliente deletado com sucesso"
            });


        } catch (error) {

            logger.error({
                type: "Clientes conectados",
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

  