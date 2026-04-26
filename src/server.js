import express from "express"
import 'dotenv/config' // Lê o arquivo .env
import usuariosRoutes from "./routes/gamesRoutes.js"

const app = express()
app.use(express.json())
app.use(usuariosRoutes)

app.listen(3000)