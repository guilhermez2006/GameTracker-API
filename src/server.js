import express from "express";
import cors from "cors";
import 'dotenv/config';
import gamesRoutes from "./routes/gamesRoutes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use(gamesRoutes);

app.listen(3000, () => {
    console.log("Servidor rodando na porta 3000 🚀");
});