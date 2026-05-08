import express from "express"
import cors from "cors" // <--- ADICIONE ISSO
import 'dotenv/config'
import usuariosRoutes from "./routes/gamesRoutes.js"

const app = express()

app.use(cors()) // <--- ADICIONE ISSO (IMPORTANTE: Antes das rotas!)
app.use(express.json())
app.use(usuariosRoutes)

app.listen(3000, () => {
    console.log("Servidor rodando na porta 3000");
});