import jwt from 'jsonwebtoken';
import { getJwtSecret } from '../config/secretsManager.js';

// Middleware atualizado para buscar a chave JWT de um secrets manager (quando disponível)
export default async function tokenValidator(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Acesso negado. Token não fornecido.' });

  try {
    const JWT_SECRET = await getJwtSecret();
    if (!JWT_SECRET) {
      console.error('JWT secret não disponível');
      return res.status(500).json({ error: 'Configuração do servidor inválida' });
    }

    const verificado = jwt.verify(token, JWT_SECRET);
    req.usuarioLogado = verificado; // Guarda os dados do usuário na requisição
    return next();
  } catch (error) {
    return res.status(403).json({ error: 'Token inválido ou expirado.' });
  }
}
