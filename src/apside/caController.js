const { connection } = require('../database/connection');

module.exports = {

    async put(request, response) {

        const consulta1 = "SELECT * FROM connectedclients where mac = ?"
        const consulta2 = "SELECT * FROM accesspoint where mac = ?"
        const consulta3 = "INSERT INTO connectedclients SET ?";
        const consulta4 = "UPDATE connectedclients SET ? WHERE mac = ?"
        const consulta5 = "SELECT mac FROM connectedclients where status = 'block'"
        const consulta6 = "UPDATE accesspoint SET ? WHERE mac = ?"
        const consulta8 = "SELECT c.* FROM connectedclients as c, accesspoint as a where c.fk_ap_id = a.id and a.mac = ?"
        const body = request.body;

        var conn;
        var include_black = []
        var exclude_black = []
        var filter = []

        function objetoVazio(obj) {
            for (var prop in obj) {
                if (obj.hasOwnProperty(prop)) return false;
            }
            return true;
        }

        try {

            conn = await connection.getConnection();
            const [e] = await conn.query(consulta2, [body.mac])

            if (e.length > 0) {

                const [r] = await conn.query(consulta5)
                if(r.length > 0){
                    r.forEach(item => filter.push(item.mac))
                }
                
                if(body.blacklist !== undefined){
                    body.blacklist.forEach(item => {
                        if (!filter.includes(item)) {
                            exclude_black.push(item)
                        }
                    })
                }
               
                filter.forEach(item => {
                    if (!body.blacklist.includes(item)) {
                        include_black.push(item)
                    }
                })

                if (e[0].status !== "online" && e[0].status !== "block"){
                    var data = {
                        status:"online"
                    }
                    conn.query(consulta6,[data,e[0].mac])
                }

                conn.query(consulta6,[{ipv4:body.ipv4,ipv6:body.ipv6},e[0].mac])

                var setCa = []
                var setOffline = []

                if (body.ca.length > 0) {

                    for (i = 0; i < body.ca.length; i++) {
           
                        setCa.push(body.ca[i])                   

                        const [r] = await conn.query(consulta1, [body.ca[i]])

                        if (r.length < 1) {

                            var dado = {
                                mac: body.ca[i],
                                status: "online",
                                fk_ap_id: e[0].id
                            }

                            await conn.query(consulta3, dado)

                        } else {

                            var dado = {
                                fk_ap_id: e[0].id,
                                status: "online"
                            }
                            if (r[0].status !== "block") {
                               await conn.query(consulta4, [dado, body.ca[i]])
                            }

                        }
                    }

                }

                const [res] = await conn.query(consulta8, [body.mac])

                if(res.length > 0){

                    res.forEach(item => {
                        if(!setCa.includes(item.mac) && item.status !== 'block'){
                            setOffline.push(item)
                        }
                    })
                }

                for(var k=0; k<setOffline.length; k++){

                    var dado = {
                        fk_ap_id: setOffline[k].fk_ap_id,
                        status: "offline"
                    }
                   
                    await conn.query(consulta4, [dado, setOffline[k].mac])
                    
                }
                

                if(e[0].channel_mode == "auto" && body.channel != e[0].channel){

                    var data = {
                        channel: body.channel
                    }
                    
                    await conn.query(consulta6, [data, e[0].mac])
                }

                var update = new Date()

                var data = {
                    last_update: update,
                    n_connected_clients: body.ca.length
                }

                conn.query(consulta6, [data, e[0].mac])

                var changes = {}

                if (e[0].ssid !== body.ssid && body.ssid !== undefined) {
                    changes.ssid = e[0].ssid
                }

                var condicao1 = e[0].type_password !== body.type_password && body.type_password !== undefined
                var condicao2 = e[0].password !== body.password && body.password !== undefined
                var condicao3 = e[0].wpa2_server !== body.wpa2_server && body.wpa2_server !== undefined && e[0].type_password == 'wpa2'

                if (condicao1 || condicao2 || condicao3) {

                    changes.type_password = e[0].type_password
                    changes.password = e[0].password
                    if (e[0].type_password == "wpa2") {
                        changes.wpa2_server = e[0].wpa2_server
                    }
                }

                if (e[0].channel_mode !== body.channel_mode && body.channel_mode !== undefined) {
                    changes.channel_mode = e[0].channel_mode
                }
                
                if (e[0].channel != body.channel && body.channel != undefined && e[0].channel_mode == "manual") {
                    changes.channel_mode = e[0].channel_mode
                    changes.channel = e[0].channel
                }

                if (include_black.length > 0) {
                    changes.include_black = include_black
                }

                if (exclude_black.length > 0) {
                    changes.exclude_black = exclude_black
                }

                if (e[0].reboot){
                    await conn.query("update accesspoint set reboot=false where mac = ?",[e[0].mac])
                    changes.reboot = true
                }

                if (objetoVazio(changes)) {
                    return response.json({ sucesso: true, resultado: "Atualizado com sucesso" });
                } else {
                    return response.json({ sucesso: true, resultado: "Atualizado com sucesso", mudancas: changes });
                }

            } else {
                return response.status(402).json({ sucesso: false, mensagem: "Não autorizado" });
            }


        } catch (error) {

            console.log("date: " + new Date() + "\nerror: " + error);
            return response.status(500).json({ sucesso: false, mensagem: error });

        } finally {
            if (conn !== undefined) //Isto irá checar se a conn já foi inicializada
            { conn.release(); conn.destroy() };
        }
    }



}