import express from "express";
import cors from "cors"; 
import 'dotenv/config';
import usuariosRoutes from "./routes/gamesRoutes.js"; // Importando o arquivo unificado

const app = express();

app.use(cors()); 
app.use(express.json());

// Carrega todas as rotas (Autenticação, Banco Prisma e Steam API)
app.use(usuariosRoutes);

app.listen(3000, () => {
    console.log("🚀 Servidor rodando lindamente na porta 3000");
});
