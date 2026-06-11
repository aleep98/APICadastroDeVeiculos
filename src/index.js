import 'dotenv/config.js';
import express from "express";
import chalk from "chalk";
import connectDB from "./config/database.js";
import errorHandler from "./middleware/errorHandler.js";
import veiculosRouter from "./routes/veiculos.routes.js";
import usersRouter from "./routes/users.routes.js";

const app = express();

app.use(express.json());

connectDB();

app.use('/veiculos', veiculosRouter);
app.use('/users', usersRouter);

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