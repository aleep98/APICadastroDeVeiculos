// ⚠️ DEPRECATED - Use src/services/veiculo.service.js ao invés
// Este arquivo é mantido apenas para referência histórica

import placa from "../models/Veiculo.js"

class VeiculoController {
    async store(req, res) {
        const { placa } = req.body;

        const veiculoExiste = await placa.findOne({ placa });

        if (veiculoExiste) {
            return res.status(400).json({ error: "Veículo já cadastrado" });
        }

        const novoVeiculo = await placa.create(req.body);

        return res.status(201).json(novoVeiculo);
    }

}
