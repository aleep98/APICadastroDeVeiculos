import { Schema, model } from 'mongoose';

// Modelo para armazenar refresh tokens (armazenamos apenas o hash do token)
const RefreshTokenSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  tokenHash: { type: String, required: true, unique: true },
  expiresAt: { type: Date, required: true },
  revoked: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

export default model('RefreshToken', RefreshTokenSchema);
