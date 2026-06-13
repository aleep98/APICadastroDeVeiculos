import 'dotenv/config.js';
import express from "express";
import cookieParser from 'cookie-parser';
import fs from 'fs';
import path from 'path';
import swaggerUi from 'swagger-ui-express';
import chalk from "chalk";
import connectDB from "./config/database.js";
import errorHandler from "./middleware/errorHandler.js";
import veiculosRouter from "./routes/veiculos.routes.js";
import usersRouter from "./routes/users.routes.js";
import authRouter from "./routes/auth.routes.js";

const app = express();

app.use(express.json());
app.use(cookieParser()); // necessário para ler cookies (refresh token)

connectDB();

// Swagger UI - serve documentação OpenAPI
const openapiPath = path.join(process.cwd(), "src", "config", "openapi.json");
let swaggerDocument = {};
try {
  const raw = fs.readFileSync(openapiPath, 'utf-8');
  swaggerDocument = JSON.parse(raw);
} catch (err) {
  console.error('Não foi possível carregar openapi.json:', err.message || err);
}
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use('/veiculos', veiculosRouter);
app.use('/users', usersRouter);
app.use('/auth', authRouter);

app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: {
            message: 'Rota não encontrada',
            status: 404
        }
    });
});

app.use(errorHandler);

export default app;