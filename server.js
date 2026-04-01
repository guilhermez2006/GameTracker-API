// Importando e utilizando express
import express from "express";
const app = express()

// Fazendo as requisições serem retornadas em JSON
app.use(express.json())

const users = []


app.post('/usuarios', (req, res) => {

    users.push(req.body)
    res.status(201).json(req.body)
   
})






app.get('/usuarios', (req, res) => {
   res.status(200).json(users)
})


app.listen(3000)
