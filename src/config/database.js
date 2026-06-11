import mongoose from 'mongoose';
import chalk from 'chalk';

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log(chalk.green('✓ MongoDB conectado com sucesso'));
    } catch (error) {
        console.error(chalk.red('✗ Erro ao conectar MongoDB:'), error.message);
        process.exit(1);
    }
};

export default connectDB;