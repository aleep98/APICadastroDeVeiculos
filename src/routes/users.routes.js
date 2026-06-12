import { Router } from 'express';
import validate from '../middleware/validation.js';
import UserService from '../services/user.service.js';
import User from '../models/User.js';
import Joi from 'joi';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import RefreshToken from '../models/RefreshToken.js';
import { getJwtSecret } from '../config/secretsManager.js';
import crypto from 'crypto';

const router = Router();

const userSchema = Joi.object({
    name: Joi.string().required().messages({
        'string.empty': 'Nome é obrigatório'
    }),
    email: Joi.string().email().required().messages({
        'string.email': 'Email inválido',
        'string.empty': 'Email é obrigatório'
    }),
    password: Joi.string().min(6).required().messages({
        'string.min': 'Senha deve ter no mínimo 6 caracteres',
        'string.empty': 'Senha é obrigatória'
    })
});

// Register - agora gera access token e refresh token (cookie HttpOnly)
router.post('/', validate(userSchema), async (req, res, next) => {
    try {
        const usuario = await UserService.criar(req.body);

        const JWT_SECRET = await getJwtSecret();
        if (!JWT_SECRET) {
            console.error('JWT_SECRET não definido');
            return res.status(500).json({ success: false, message: 'Configuração do servidor inválida' });
        }

        // access token
        const accessToken = jwt.sign({ userId: usuario._id, email: usuario.email }, JWT_SECRET, { expiresIn: '1h' });

        // refresh token (rotacionável)
        const refreshToken = crypto.randomBytes(64).toString('hex');
        const refreshTokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 dias

        await RefreshToken.create({ user: usuario._id, tokenHash: refreshTokenHash, expiresAt });

        // envia cookie seguro (HttpOnly)
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        res.status(201).json({
            success: true,
            message: 'Usuário cadastrado com sucesso!',
            data: { user: usuario, accessToken }
        });
    } catch (error) {
        next(error);
    }

});

// Login - gera access + refresh token
router.post('/login', async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const JWT_SECRET = await getJwtSecret();
        if (!JWT_SECRET) {
            console.error('JWT_SECRET não definido');
            return res.status(500).json({ message: 'Configuração do servidor inválida' });
        }

        const user = await User.findOne({ email });
        if (!user) return res.status(401).json({ message: 'Usuário não encontrado' });

        const senhaCorreta = await bcrypt.compare(password, user.password);
        if (!senhaCorreta) return res.status(401).json({ message: 'Senha incorreta' });

        const accessToken = jwt.sign({ userId: user._id, email: user.email }, JWT_SECRET, { expiresIn: '1h' });

        const refreshToken = crypto.randomBytes(64).toString('hex');
        const refreshTokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        await RefreshToken.create({ user: user._id, tokenHash: refreshTokenHash, expiresAt });

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        res.json({ message: 'Login bem-sucedido', accessToken });
    } catch (error) {
        next(error);
    }
});

router.post('/logout', async (req, res, next) => {
    try {
        const { token } = req.body;
        if (!token) return res.status(400).json({ message: 'Token não fornecido' });

    }catch (error) {
        next(error);
    }
    })

router.get('/', async (req, res, next) => {
    try {
        const usuarios = await UserService.listar();
        res.json({
            success: true,
            data: usuarios
        });
    } catch (error) {
        next(error);
    }
});

router.get('/:id', async (req, res, next) => {
    try {
        const usuario = await UserService.obterPorId(req.params.id);
        res.json({
            success: true,
            data: usuario
        });
    } catch (error) {
        next(error);
    }
});

router.put('/:id', validate(userSchema), async (req, res, next) => {
    try {
        const usuario = await UserService.atualizar(req.params.id, req.body);
        res.json({
            success: true,
            message: 'Usuário atualizado com sucesso!',
            data: usuario
        });
    } catch (error) {
        next(error);
    }
});

router.delete('/:id', async (req, res, next) => {
    try {
        await UserService.deletar(req.params.id);
        res.json({
            success: true,
            message: 'Usuário deletado com sucesso!'
        });
    } catch (error) {
        next(error);
    }
});

export default router;