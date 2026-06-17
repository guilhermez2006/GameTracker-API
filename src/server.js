import express from "express";
import cors from "cors";
import 'dotenv/config';
import gamesRoutes from "./routes/gamesRoutes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use(gamesRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});