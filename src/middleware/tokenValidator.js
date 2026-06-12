import jwt from 'jsonwebtoken';

export default function tokenValidator(req, res, next) {
    const authHeader = req.headers['authorization'];
    
    // O formato comum é: "Bearer TOKEN_AQUI"
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: "Acesso negado. Token não fornecido." });
    }

    try {
        // Valida o token usando a mesma chave secreta do login
        const verificado = jwt.verify(token, process.env.JWT_SECRET);
        req.usuarioLogado = verificado; // Guarda os dados do usuário na requisição
        next(); // Permite que a requisição continue para a rota
    } catch (error) {
        res.status(403).json({ error: "Token inválido ou expirado." });
    }
}