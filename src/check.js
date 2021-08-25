const { connection } = require('./database/connection');


module.exports = {

    async index() {

        const consulta1 = "SELECT * FROM accesspoint"
        const consulta2 = "UPDATE accesspoint set ? where id = ?"
        const consulta3 = "UPDATE connectedclients set status = ? where id = ?"
        const consulta4 = "SELECT * FROM connectedclients where fk_ap_id = ?"
        var conn;

        try {

            conn = await connection.getConnection();
            const [response] = await conn.query(consulta1);
            

            for(var i=0; i<response.length; i++){

                var date = new Date()
                var date2 = new Date(response[i].last_update)
                var diffMs = (date.getTime() - date2.getTime());

                if(diffMs > (120*1000)){

                   if (response[i].status !== "offline"){

                        var data = {
                            status:"offline",
                            n_connected_clients:0
                        }
                       
                        await conn.query(consulta2,[data,response[i].id])

                        const [response2] = await conn.query(consulta4,[response[i].id])

                        for (var j=0; j<response2.length; j++){
                            if(response2[j].status !== "block"){
                                await conn.query(consulta3,["offline",response2[j].id])
                            }
                        }
                            

                    }
  
                }

            }

        } catch (error) {

            console.log(error);

        } finally {
            if (conn !== undefined) //This will check if the conn has already be initialized
            { conn.release(); conn.destroy() };
        }
    }

}