import { Router } from 'express';
import validate from '../middleware/validation.js';
import VeiculoService from '../services/veiculo.service.js';
import Joi from 'joi';

const router = Router();

const veiculoSchema = Joi.object({
    placa: Joi.string().required().messages({
        'string.empty': 'Placa é obrigatória'
    }),
    modelo: Joi.string().required().messages({
        'string.empty': 'Modelo é obrigatório'
    }),
    cor: Joi.string().required().messages({
        'string.empty': 'Cor é obrigatória'
    }),
    ano: Joi.number().required().integer().min(1900).max(new Date().getFullYear() + 1),
    proprietario: Joi.string().required().messages({
        'string.empty': 'Proprietário é obrigatório'
    })
});

router.post('/', validate(veiculoSchema), async (req, res, next) => {
    try {
        const veiculo = await VeiculoService.criar(req.body);
        res.status(201).json({
            success: true,
            message: 'Veículo cadastrado com sucesso!',
            data: veiculo
        });
    } catch (error) {
        next(error);
    }
});

router.get('/', async (req, res, next) => {
    try {
        const veiculos = await VeiculoService.listar();
        res.json({
            success: true,
            data: veiculos
        });
    } catch (error) {
        next(error);
    }
});

router.get('/:id', async (req, res, next) => {
    try {
        const veiculo = await VeiculoService.obterPorId(req.params.id);
        res.json({
            success: true,
            data: veiculo
        });
    } catch (error) {
        next(error);
    }
});

router.put('/:id', validate(veiculoSchema), async (req, res, next) => {
    try {
        const veiculo = await VeiculoService.atualizar(req.params.id, req.body);
        res.json({
            success: true,
            message: 'Veículo atualizado com sucesso!',
            data: veiculo
        });
    } catch (error) {
        next(error);
    }
});

router.delete('/:id', async (req, res, next) => {
    try {
        await VeiculoService.deletar(req.params.id);
        res.json({
            success: true,
            message: 'Veículo deletado com sucesso!'
        });
    } catch (error) {
        next(error);
    }
});

export default router;