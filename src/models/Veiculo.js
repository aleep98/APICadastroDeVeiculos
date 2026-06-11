import { Schema, model } from "mongoose"

const VeiculoSchema = new Schema({
    placa: {
        type: String,
        required: true,
        unique: true
    },
    modelo: {
        type: String,
        required: true
    },
    cor: {
        type: String,
        required: true
    },
    ano: {
        type: Number,
        required: true
    },
    proprietario: {
        type: String,
        required: true
    }
}, { timestamps: true })

export default model('Veiculo', VeiculoSchema)