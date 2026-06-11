import chalk from "chalk";
import app from "./src/index.js";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Criar pastas automaticamente se não existirem
const dirs = ['src/config', 'src/middleware', 'src/services', 'src/routes'];
dirs.forEach(dir => {
    const fullPath = path.join(__dirname, dir);
    if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true });
    }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(chalk.blue(`Server is running on port ${PORT}`))
})