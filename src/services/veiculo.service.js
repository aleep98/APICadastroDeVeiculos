import Veiculo from '../models/Veiculo.js';

class VeiculoService {
    async criar(dados) {
        const veiculoExistente = await Veiculo.findOne({ placa: dados.placa });

        if (veiculoExistente) {
            const error = new Error('Veículo com esta placa já cadastrado');
            error.statusCode = 400;
            throw error;
        }

        const novoVeiculo = await Veiculo.create(dados);
        return novoVeiculo;
    }

    async listar() {
        return await Veiculo.find().sort({ createdAt: -1 });
    }

    async obterPorId(id) {
        const veiculo = await Veiculo.findById(id);

        if (!veiculo) {
            const error = new Error('Veículo não encontrado');
            error.statusCode = 404;
            throw error;
        }

        return veiculo;
    }

    async atualizar(id, dados) {
        const veiculo = await Veiculo.findByIdAndUpdate(id, dados, {
            new: true,
            runValidators: true
        });

        if (!veiculo) {
            const error = new Error('Veículo não encontrado');
            error.statusCode = 404;
            throw error;
        }

        return veiculo;
    }

    async deletar(id) {
        const veiculo = await Veiculo.findByIdAndDelete(id);

        if (!veiculo) {
            const error = new Error('Veículo não encontrado');
            error.statusCode = 404;
            throw error;
        }

        return veiculo;
    }
}

export default new VeiculoService();