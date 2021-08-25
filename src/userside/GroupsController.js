const { connection } = require('../database/connection');

module.exports = {

    async create(request, response) {

        const body = request.body;
        const user_permission = request.user.user_permission

        const consulta = "INSERT INTO apgroups SET ?";

        var conn;

        try {

            conn = await connection.getConnection();

            if (user_permission == 0) {
                const [resultado] = await conn.query(consulta, [body]);
                return response.status(201).json({
                    sucesso: true,
                    mensagem: 'Grupo cadastrado com sucesso',
                    group_id: resultado.insertId
                });
            } else {
                return response.status(401).json({ sucesso: false, mensagem: "Usuário não autorizado" });
            }

        } catch (error) {

            console.log(error)
            return response.status(500).json({ sucesso: false, mensagem: error });

        } finally {

            if (conn !== undefined) { conn.release(); conn.destroy() };
        }
    },

    async index(request, response) {

        const consulta1 = "SELECT * FROM apgroups"
        const consulta2 = "SELECT count(*) FROM apgroups"

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

        const { id } = request.params;
        const body = request.body;
        const user_permission = request.user.user_permission;

        const consulta = "UPDATE apgroups SET ? WHERE id = ?"
        const consulta2 = "SELECT id FROM apgroups WHERE id = ?"

        var conn;

        try {

            conn = await connection.getConnection();

            if (user_permission == 0) { //Verifica se o usuario tem permissao para atualizar grupo

                const [resultado] = await conn.query(consulta2, [id])

                if(resultado.length < 1){
                    return response.status(401).json({ sucesso: false, mensagem: "Grupo não cadastrado" });
                }

                await conn.query(consulta, [body, id])
                return response.json({
                    sucesso: true,
                    mensagem: 'Grupo atualizado com sucesso'
                });

            } else {
                return response.status(401).json({ sucesso: false, mensagem: "Grupo não autorizado" });
            }

        } catch (error) {

            console.log(error)
            return response.status(500).json({ sucesso: false, mensagem: error });
            
        } finally {

            if (conn !== undefined) { conn.release(); conn.destroy() };
        }
    },

    async delete(request, response) {

        const { id } = request.params;
        const user_permission = request.user.user_permission;

        const consulta = "DELETE FROM apgroups WHERE id= ?";
        const consulta2 = "SELECT id FROM apgroups WHERE id = ?"

        var conn;

        try {

            if (user_permission == 0) {

                conn = await connection.getConnection();

                const [resultado] = await conn.query(consulta2, [id])

                if(resultado.length < 1){
                    return response.status(401).json({ sucesso: false, mensagem: "Grupo não cadastrado" });
                }

                await conn.query(consulta, [id]);

                return response.json({
                    sucesso: true,
                    mensagem: "Grupo deletado com sucesso"
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