import User from '../models/User.js';

class UserService {
    async criar(dados) {
        const usuarioExistente = await User.findOne({ email: dados.email });

        if (usuarioExistente) {
            const error = new Error('Usuário com este email já cadastrado');
            error.statusCode = 400;
            throw error;
        }

        const novoUsuario = await User.create(dados);
        return novoUsuario;
    }

    async listar() {
        return await User.find().select('-password').sort({ createdAt: -1 });
    }

    async obterPorId(id) {
        const usuario = await User.findById(id).select('-password');

        if (!usuario) {
            const error = new Error('Usuário não encontrado');
            error.statusCode = 404;
            throw error;
        }

        return usuario;
    }

    async atualizar(id, dados) {
        const usuario = await User.findByIdAndUpdate(id, dados, {
            new: true,
            runValidators: true
        }).select('-password');

        if (!usuario) {
            const error = new Error('Usuário não encontrado');
            error.statusCode = 404;
            throw error;
        }

        return usuario;
    }

    async deletar(id) {
        const usuario = await User.findByIdAndDelete(id);

        if (!usuario) {
            const error = new Error('Usuário não encontrado');
            error.statusCode = 404;
            throw error;
        }

        return usuario;
    }
}

export default new UserService();