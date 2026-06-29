import { Router } from 'express';
import Joi from 'joi';
import validate from '../middleware/validation.js';
import UserService from '../services/user.service.js';

const router = Router();

const userSchema = Joi.object({
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
      message: 'Usuario atualizado com sucesso!',
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
      message: 'Usuario deletado com sucesso!'
    });
  } catch (error) {
    next(error);
  }
});

export default router;
