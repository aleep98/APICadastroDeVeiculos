import { Router } from 'express';
import crypto from 'crypto';
import RefreshToken from '../models/RefreshToken.js';
import { getJwtSecret } from '../config/secretsManager.js';
import jwt from 'jsonwebtoken';

const router = Router();

// POST /auth/refresh - troca um refresh token válido por um novo access token (e rotaciona o refresh token)
router.post('/refresh', async (req, res, next) => {
  try {
    const cookieToken = req.cookies?.refreshToken;
    if (!cookieToken) return res.status(401).json({ message: 'Refresh token não fornecido' });

    const tokenHash = crypto.createHash('sha256').update(cookieToken).digest('hex');
    const stored = await RefreshToken.findOne({ tokenHash });
    if (!stored || stored.revoked || stored.expiresAt < new Date()) return res.status(403).json({ message: 'Refresh token inválido' });

    // rotate: create new refresh token, mark old revoked
    const newRefreshToken = crypto.randomBytes(64).toString('hex');
    const newHash = crypto.createHash('sha256').update(newRefreshToken).digest('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 dias

    stored.revoked = true;
    await stored.save();

    await RefreshToken.create({ user: stored.user, tokenHash: newHash, expiresAt });

    const JWT_SECRET = await getJwtSecret();
    if (!JWT_SECRET) return res.status(500).json({ message: 'Configuração do servidor inválida' });

    const accessToken = jwt.sign({ userId: stored.user }, JWT_SECRET, { expiresIn: '1h' });

    // Set cookie (HttpOnly)
    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.json({ accessToken });
  } catch (err) {
    next(err);
  }
});

// POST /auth/logout - revoga o refresh token (logout)
router.post('/logout', async (req, res, next) => {
  try {
    // Log simples para confirmar chamada da rota e metadados úteis (não logar tokens em produção)
    console.log('[AUTH] logout called', { ip: req.ip, userAgent: req.get('User-Agent') });

    const cookieToken = req.cookies?.refreshToken;
    if (!cookieToken) {
      console.log('[AUTH] logout: no refresh token cookie present');
      res.clearCookie('refreshToken');
      return res.json({ message: 'Logout efetuado' });
    }

    const tokenHash = crypto.createHash('sha256').update(cookieToken).digest('hex');
    const stored = await RefreshToken.findOne({ tokenHash });
    if (stored) {
      stored.revoked = true;
      await stored.save();
      console.log('[AUTH] logout: refresh token revoked for user', stored.user.toString());
    } else {
      console.log('[AUTH] logout: refresh token not found in DB');
    }

    res.clearCookie('refreshToken');
    res.json({ message: 'Logout efetuado' });
  } catch (err) {
    next(err);
  }
});

export default router;
