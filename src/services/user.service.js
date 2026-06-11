import User from '../models/User.js';
import bcrypt from 'bcryptjs';

class UserService {
    async criar(dados) {
        const usuarioExistente = await User.findOne({ email: dados.email });



        if (usuarioExistente) {
            const error = new Error('Usuário com este email já cadastrado');
            error.statusCode = 400;
            throw error;
        }
        if (!dados.password) throw Object.assign(new Error('Senha é obrigatória'), { statusCode: 400 });
        dados.password = await bcrypt.hash(dados.password, 10);
        const novoUsuario = await User.create(dados);
        const out = novoUsuario.toObject();
        delete out.password;
        return out;
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
        if (dados.password) dados.password = await bcrypt.hash(dados.password, 10);
        if (dados.email) {
            const existe = await User.findOne({ email: dados.email, _id: { $ne: id } });
            if (existe) {
                const err = new Error('Usuário com este email já cadastrado');
                err.statusCode = 400;
                throw err;
            }

        }
        const usuario = await User.findByIdAndUpdate(id, dados, { new: true, runValidators: true }).select('-password');
        if (!usuario) { const error = new Error('Usuário não encontrado'); error.statusCode = 404; throw error; }
        return usuario;



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