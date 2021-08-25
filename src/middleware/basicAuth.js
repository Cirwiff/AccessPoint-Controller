module.exports = {

    async login(req, res, next) {

        const auth = { login: process.env.AUTH_USER, password: process.env.AUTH_KEY } // credenciais

        const b64auth = (req.headers.authorization || '').split(' ')[1] || ''
        const [login, password] = Buffer.from(b64auth, 'base64').toString().split(':')

        // Verify login and password are set and correct
        if (login === auth.login && password === auth.password) {
            // Access granted...
            return next()
        }

        // Access denied...
        res.set('WWW-Authenticate', 'Basic realm="401"') // change this
        return res.status(401).json({ sucesso: false, mensagem: 'Falha na autenticação'});

        // -----------------------------------------------------------------------

    }
}