const { connection } = require('../database/connection');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt')
const logger = require('../logger');

require('dotenv').config();

module.exports = {

    async login(request, response) {

        const body = request.body
        const consulta = "SELECT * FROM sysadmins WHERE login = ?"

        var conn;

        try {
            conn = await connection.getConnection();

            const [res] = await conn.query(consulta, [body.login]);

            if (res.length < 1){
                logger.info({
                    type: "Usuários",
                    action: "login",
                    user: body.login,
                    message:"Falha na autenticação", 
                    date: new Date()
                })
                return response.status(401).json({ sucesso: false, mensagem: 'Falha na autenticação' });
            }
                

            const verified = bcrypt.compare(body.password, res[0].password);

            if (verified) {

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

                logger.info({
                    type: "Usuários",
                    action: "login",
                    user: body.login + "(" + res[0].id + ")",
                    message:"Usuário "+ body.login +"("+ res[0].id +") efetuou login", 
                    date: new Date()
                })

                return response.status(200).json({
                    sucesso: true,
                    mensagem: 'Autenticado com sucesso',
                    token: token,
                    user_id: res[0].id
                });

            } else {
                
                return response.status(401).json({ sucesso: false, mensagem: 'Falha na autenticação' });
            }


        } catch (error) {

            logger.error({type: "Login", user: body.login ,message:error, date: new Date()})
            return response.status(500).json({ sucesso: false, mensagem: error });

        } finally {

            if (conn !== undefined) //This will check if the conn has already be initialized
            { conn.release(); conn.destroy(); }

        }
    },

    async index(request, response) {

        const user_id = request.user.user_id;
        const user_permission = request.user.user_permission;
        const me = request.query.me

        const consulta1 = "SELECT * FROM sysadmins order by permission,name"
        const consulta2 = "SELECT * FROM sysadmins where id = ?"

        var conn;

        try {

            conn = await connection.getConnection();
            var response

            if(user_permission == 0 && me != 'true'){
                resultado = await conn.query(consulta1);
            }else{
                resultado = await conn.query(consulta2,[user_id]);
            }

            return response.json({ sucesso: true, resultado: resultado[0] });

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
        const user_id = request.user.user_id;
        const body = request.body
        const user_permission = request.user.user_permission;
        const user_login = request.user.user_login

        const consulta = "UPDATE sysadmins SET ? WHERE id = ?"
        const consulta2 = "SELECT * FROM sysadmins"

        var conn;
        var user

        try {

            conn = await connection.getConnection();


            if (user_permission == 0) { //Verifica se o usuario tem permissao para atualizar qualquer AP

                const [resultado] = await conn.query(consulta2, id)

                var teste = resultado.filter(item => item.id == id)
                var teste2 = resultado.filter(item => item.permission == 0).filter(item => item.id != id)
                user = resultado.filter(item => item.id == id)[0].login

                if (teste.length < 1) {
                    return response.status(406).json({ sucesso: false, mensagem: "Usuário não cadastrado" });
                }

                if(teste2.length < 1 && body.permission == 1){
                    return response.status(406).json({ sucesso: false, mensagem: "Não é possível alterar a permissão do último administrador cadastrado" });
                }

                var data

                if (body.password === undefined){

                    data = {
                        login: body.login,
                        name: body.name,
                    }

                    if(body.permission !== undefined){
                        data.permission = body.permission
                    }

                }else{

                    if (body.password === body.password2) {

                        data = {
                            login: body.login,
                            name: body.name,
                            password: bcrypt.hash(body.password, 10)
                        }
                        
                        if(body.permission !== undefined){
                            data.permission = body.permission
                        }
    
                    } else {
                        return response.status(200).json({ sucesso: false, mensagem: "Senhas não conferem" });
                    }

                }

                await conn.query(consulta, [data, id])// executa o comando no banco de dados

                logger.info({
                    type: "Usuários",
                    action: "update",
                    user: user_login + "(" + user_id + ")" ,
                    message:"Usuário "+user + "(" + id + ")"+" sofreu alterações", 
                    date: new Date()
                })
    
                return response.json({
                    sucesso: true,
                    mensagem: 'Usuário atualizado com sucesso'
                });

            } else {

                if( user_id == id ){ //Verifica se usuário normal está tentado alterar ele mesmo
                    
                    var data = {
                        login: body.login,
                        name: body.name,
                        permission: body.permission,
                    }

                    await conn.query(consulta, [data, id])// executa o comando no banco de dados

                    logger.info({
                        type: "Usuários",
                        action: "update",
                        user: user_login + "(" + user_id + ")" ,
                        message:"Usuário "+user + "(" + user_id + ")"+" sofreu alterações", 
                        date: new Date()
                    })
    
                    return response.json({
                        sucesso: true,
                        mensagem: 'Usuário atualizado com sucesso'
                    });

                }else{
                    return response.status(401).json({ sucesso: false, mensagem: "Usuário não autorizado" });
                }
                
            }

        } catch (error) {

            if (error.code == "ER_DUP_ENTRY") {
                return response.status(406).json({ sucesso: false, mensagem: "Usuário já cadastrado" });
            }

            logger.error({
                type: "Usuários",
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
        const user_permission = request.user.user_permission;
        const user_id = request.user.user_id;
        const user_login = request.user.user_login

        const consulta = "DELETE FROM sysadmins WHERE id= ?";
        const consulta2 = "SELECT * FROM sysadmins"

        var conn;
        var user

        try {

            if (user_permission == 0) {

                conn = await connection.getConnection();

                const [resultado] = await conn.query(consulta2)

                var teste = resultado.filter(item => item.id == id)
                var teste2 = resultado.filter(item => item.id != id).filter(item => item.permission == 0)
                user = resultado.filter(item => item.id == id)[0].login

                if (teste.length < 1) {
                    return response.status(406).json({ sucesso: false, mensagem: "Usuário não cadastrado" });
                }

                if(id == user_id){
                    return response.status(406).json({ sucesso: false, mensagem: "Não é possível deletar o usuário atual" });
                }

                if (teste2.length < 1){
                    return response.status(406).json({ sucesso: false, mensagem: "Último usuário com permissão de admin não pode ser deletado" })
                }   

                await conn.query(consulta, [id]);

                logger.info({
                    type: "Usuários",
                    action: "delete",
                    user: user_login + "(" + user_id + ")" ,
                    message:"Usuário "+user + "(" + id + ")"+" foi deletado", 
                    date: new Date()
                })

                return response.json({
                    sucesso: true,
                    mensagem: "Usuário deletado com sucesso"
                });

            } else {
                return response.status(401).json({ sucesso: false, mensagem: "Usuário não autorizado" });
            }


        } catch (error) {

            logger.error({
                type: "Usuários",
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
    },

    async create(request, response) {

        const body = request.body
        const user_permission = request.user.user_permission
        const user_id = request.user.user_id
        const user_login = request.user.user_login
        var conn

        const hash = bcrypt.hash(body.password, 10);

        try {

            if (body.password === body.password2) {

                const dados = {
                    name: body.name,
                    password: hash,
                    login: body.login,
                    permission: body.permission
                }

                conn = await connection.getConnection()

                const consulta = "INSERT INTO sysadmins SET ?"

                if (user_permission == 0) {


                    if (dados.login !== null && dados.name !== null && dados.name !== null && dados.permission !== null) { 

                        const [resultado] = await conn.query(consulta, dados);

                        logger.info({
                            type: "Usuários",
                            action: "create",
                            user: user_login +"("+user_id+")",
                            message:"Usuário "+body.login+"("+resultado.insertId+") foi criado",
                            date: new Date()
                        })

                        return response.status(201).json({
                            sucesso: true,
                            mensagem: 'usuário cadastrado com sucesso',
                            user_id: resultado.insertId
                        });
                     }

                } else {
                    return response.status(401).json({ sucesso: false, mensagem: "Usuário não autorizado" });
                }
            } else {
                return response.status(401).json({ sucesso: false, mensagem: "Senhas não conferem" });
            }

        } catch (error) {

            logger.error({
                type: "Usuários",
                action: "create",
                user: user_login +"("+user_id+")",
                message:error,
                date: new Date()
            })

            if (error.code == "ER_DUP_ENTRY") {
                return response.status(406).json({ sucesso: false, mensagem: "Usuário já cadastrado" });
            } else {
                return response.status(500).json({ sucesso: false, mensagem: error });
            }

        } finally {

            if (conn !== undefined) { conn.release(); conn.destroy() };
        }

    }
}
