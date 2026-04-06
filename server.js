// Importando e utilizando express
import express from "express";
import pkg from '@prisma/client';
const { PrismaClient } = pkg;
const prisma = new PrismaClient()

const app = express()

// Fazendo as requisições serem retornadas em JSON
app.use(express.json())

app.post('/usuarios', async (req, res) => {
    try {
        await prisma.user.create({
            data: {
                email: req.body.email,
                name: req.body.name,
                age: req.body.age
            }
        })
        res.status(201).json(req.body)
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: error.message })
    }
})
app.get('/usuarios', async (req, res) => {
    let users = []

    if (req.query.name || req.query.email || req.query.age) {
        users = await prisma.user.findMany({
            where: {
                name: req.query.name,
                email: req.query.email,
                age: req.query.age
            }
        })
    } else {
        users = await prisma.user.findMany()
    }

    res.status(200).json(users)
})

// /: É uma variavel pra guardar algo, no caso, o ID do User
app.put('/usuarios/:id', async (req, res) => {
    try {
        await prisma.user.update({
            // ONNDE? WHERE!
            where: {
                id: req.params.id
            },
            data: {
                email: req.body.email,
                name: req.body.name,
                age: req.body.age
            }
        })
        res.status(200).json(req.body)
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: error.message })
    }
})

app.delete('/usuarios/:id', async (req, res) => {

    await prisma.user.delete({
        where: {
            id: req.params.id
        }
    })
    res.status(200).json({ message: " Usuário deletado com Sucesso!" })
})
app.listen(3000)
