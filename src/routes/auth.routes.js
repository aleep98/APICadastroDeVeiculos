import { Router } from 'express';
import crypto from 'crypto';
import Joi from 'joi';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import validate from '../middleware/validation.js';
import RefreshToken from '../models/RefreshToken.js';
import User from '../models/User.js';
import UserService from '../services/user.service.js';
import { getJwtSecret } from '../config/secretsManager.js';

const router = Router();

const registerSchema = Joi.object({
  name: Joi.string().required().messages({
    'string.empty': 'Nome e obrigatorio'
  }),
  email: Joi.string().email().required().messages({
    'string.email': 'Email invalido',
    'string.empty': 'Email e obrigatorio'
  }),
  password: Joi.string().min(6).required().messages({
    'string.min': 'Senha deve ter no minimo 6 caracteres',
    'string.empty': 'Senha e obrigatoria'
  })
});

const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Email invalido',
    'string.empty': 'Email e obrigatorio'
  }),
  password: Joi.string().required().messages({
    'string.empty': 'Senha e obrigatoria'
  })
});

//centraliza a criação do refresh token: gera o token, cria o hash define a validade e salva no banco.
async function createRefreshToken(userId) {
  const refreshToken = crypto.randomBytes(64).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  await RefreshToken.create({ user: userId, tokenHash, expiresAt });

  return refreshToken;
}

//evita repetir a configuração do cookie em vários lugares
function setRefreshTokenCookie(res, refreshToken) {
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000
  });
}

//centraliza a verificação do JWT_SECRET, para não repetir o mesmo if(!JWT_SECRET) em todas as rotas
async function getRequiredJwtSecret(res) {
  const JWT_SECRET = await getJwtSecret();

  if (!JWT_SECRET) {
    console.error('JWT_SECRET nao definido');
    res.status(500).json({
      success: false,
      message: 'Configuracao do servidor invalida'
    });
    return null;
  }

  return JWT_SECRET;
}

router.post('/register', validate(registerSchema), async (req, res, next) => {
  try {
    const usuario = await UserService.criar(req.body);
    const JWT_SECRET = await getRequiredJwtSecret(res);
    if (!JWT_SECRET) return;

    const accessToken = jwt.sign(
      { userId: usuario._id, email: usuario.email },
      JWT_SECRET,
      { expiresIn: '1h' }
    );
    const refreshToken = await createRefreshToken(usuario._id);

    setRefreshTokenCookie(res, refreshToken);

    res.status(201).json({
      success: true,
      message: 'Usuario cadastrado com sucesso!',
      data: { user: usuario, accessToken }
    });
  } catch (error) {
    next(error);
  }
});

router.post('/login', validate(loginSchema), async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const JWT_SECRET = await getRequiredJwtSecret(res);
    if (!JWT_SECRET) return;

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Usuario nao encontrado' });

    const senhaCorreta = await bcrypt.compare(password, user.password);
    if (!senhaCorreta) return res.status(401).json({ message: 'Senha incorreta' });

    const accessToken = jwt.sign(
      { userId: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: '1h' }
    );
    const refreshToken = await createRefreshToken(user._id);

    setRefreshTokenCookie(res, refreshToken);

    res.json({ message: 'Login bem-sucedido', accessToken });
  } catch (error) {
    next(error);
  }
});

router.post('/refresh', async (req, res, next) => {
  try {
    const cookieToken = req.cookies?.refreshToken;
    if (!cookieToken) return res.status(401).json({ message: 'Refresh token nao fornecido' });

    const tokenHash = crypto.createHash('sha256').update(cookieToken).digest('hex');
    const stored = await RefreshToken.findOne({ tokenHash });
    if (!stored || stored.revoked || stored.expiresAt < new Date()) {
      return res.status(403).json({ message: 'Refresh token invalido' });
    }

    const newRefreshToken = crypto.randomBytes(64).toString('hex');
    const newHash = crypto.createHash('sha256').update(newRefreshToken).digest('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    stored.revoked = true;
    await stored.save();

    await RefreshToken.create({ user: stored.user, tokenHash: newHash, expiresAt });

    const JWT_SECRET = await getRequiredJwtSecret(res);
    if (!JWT_SECRET) return;

    const accessToken = jwt.sign({ userId: stored.user }, JWT_SECRET, { expiresIn: '1h' });

    setRefreshTokenCookie(res, newRefreshToken);

    res.json({ accessToken });
  } catch (err) {
    next(err);
  }
});

router.post('/logout', async (req, res, next) => {
  try {
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
