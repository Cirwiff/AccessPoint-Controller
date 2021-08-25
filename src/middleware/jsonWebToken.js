const jwt = require('jsonwebtoken');

module.exports = {
    async login(req, res, next) {

        const authHeader = req.headers.authorization;
        
        if (!authHeader)
            return res.status(204).json({ sucesso: false, mensagem: 'Nenhum token foi fornecido' });

        const parts = authHeader.split(' ');

        if (parts.length != 2)
            return res.status(401).json({ sucesso: false, mensagem: 'Token inválido' });

        const [scheme, token] = parts;

        if (!/^Bearer$/i.test(scheme))
            return res.status(401).json({ sucesso: false, mensagem: 'Token inválido' });

        jwt.verify(token, process.env.JWT_KEY, (error, decoded) => {
            if (error){
                return res.status(401).json({ sucesso: false, mensagem: 'Falha na autenticação', erro: error });
            }    
            
            req.user = decoded
            return next();
               
        });

    },

    verify_login(req, res) {

        const authHeader = req.headers.authorization;

        if (!authHeader)
            return res.status(204).json({ sucesso: false, mensagem: 'Nenhum token foi fornecido' });

        const parts = authHeader.split(' ');

        if (parts.length != 2)
            return res.status(401).json({ sucesso: false, mensagem: 'Token inválido' });

        const [scheme, token] = parts;

        if (!/^Bearer$/i.test(scheme))
            return res.status(401).json({ sucesso: false, mensagem: 'Token inválido' });

        jwt.verify(token, process.env.JWT_KEY, (error, decoded) => {
            if (error)
                return res.status(401).json({ sucesso: false, mensagem: 'Falha na autenticação', erro: error });

            req.user = decoded;
            return res.json({ sucesso: true, user: decoded });
        });

    }
    
}