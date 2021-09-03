const fs = require('fs');

module.exports = {

    async index(request, response) {

        const user_permission = request.user.user_permission;

        try {

            if (user_permission == 0) {

                var array = fs.readFileSync('info.log').toString().split('\r\n')
                var log = []
                
                array.forEach(item => {
                    try{
                        log.push(item)
                    }catch(error){}
                })
            
                return response.json({ sucesso: true, resultado: log});

            }

        } catch (error) {
            console.log(error);
            return response.status(500).json({ sucesso: false, mensagem: error });
        } 
    },

}
