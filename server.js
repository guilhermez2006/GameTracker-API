import express from "express"
import usuariosRoutes from "./routes/usuariosRoutes.js"

const app = express()
app.use(express.json())
app.use(usuariosRoutes)

app.listen(3000)