const { connection } = require('../database/connection');

module.exports = {

    //https://superuser.com/questions/1286244/openwrt-how-can-i-kick-a-wireless-client-from-command-line

    async get(request, response) {

        const consulta1 = "SELECT * FROM connectedclients"
        const consulta2 = "SELECT count(*) FROM connectedclients"

        var conn;

        try {

            conn = await connection.getConnection();

            const [resultado] = await conn.query(consulta1);
            const [resultado2] = await conn.query(consulta2);

            response.header('X-Total-Count', resultado2[0]['count(*)']);
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
        const user_permission = request.user.user_permission;

        const consulta = "UPDATE connectedclients SET status=? WHERE mac = ?"
        const consulta2 = "SELECT mac FROM connectedclients WHERE mac = ?"

        var conn;

        try {

            conn = await connection.getConnection();


            if (user_permission == 0) { //Verifica se o usuario tem permissao para atualizar AP

                const [resultado] = await conn.query(consulta2, mac)

                if (resultado.length < 1) {
                    return response.status(401).json({ sucesso: false, mensagem: "Cliente não cadastrado" });
                }

                if(status == 'unblock' || status == 'block'){

                    await conn.query(consulta, [status, mac])// executa o comando no banco de dados

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
                
            } else {
                return response.status(401).json({ sucesso: false, mensagem: "Usuário não autorizado" });
            }

        } catch (error) {

            console.log(error)
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
        const user_permission = request.user.user_permission;

        const consulta = "DELETE FROM connectedclients WHERE id= ?";
        const consulta2 = "SELECT id FROM connectedclients WHERE id = ?"

        var conn;

        try {

            if (user_permission == 0) {

                conn = await connection.getConnection();

                const [resultado] = await conn.query(consulta2, [id])

                if(resultado.length < 1){
                    return response.status(401).json({ sucesso: false, mensagem: "Cliente não cadastrado" });
                }

                await conn.query(consulta, [id]);

                return response.json({
                    sucesso: true,
                    mensagem: "Cliente deletado com sucesso"
                });

            } else {
                return response.status(401).json({ sucesso: false, mensagem: "Usuário não autorizado" });
            }


        } catch (error) {

            console.log(error)
            return response.status(500).json({ sucesso: false, mensagem: error });

        } finally {
            if (conn !== undefined) //This will check if the conn has already be initialized
            { conn.release(); conn.destroy() };
        }
    }
} 

  