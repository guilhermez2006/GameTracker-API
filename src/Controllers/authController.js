import pkg from "@prisma/client"
const { PrismaClient } = pkg
const prisma = new PrismaClient()
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"

// 1. LOGIN DE USUÁRIO
export const login = async (req, res) => {
    try {
        const { email, password } = req.body

        const user = await prisma.user.findUnique({ where: { email } })
        if (!user) return res.status(404).json({ message: "Usuário não encontrado" })

        const senhaCorreta = await bcrypt.compare(password, user.password)
        if (!senhaCorreta) return res.status(401).json({ message: "Senha incorreta" })

        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: "1d" })

        res.status(200).json({ token })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

// 2. CRIAR USUÁRIO (O que estava faltando!)
export const criarUsuario = async (req, res) => {
    try {
        const { name, email, password } = req.body

        // Verifica se o usuário já existe
        const usuarioExiste = await prisma.user.findUnique({ where: { email } })
        if (usuarioExiste) return res.status(400).json({ message: "Este e-mail já está cadastrado" })

        // Criptografa a senha antes de salvar (Segurança!)
        const salt = await bcrypt.genSalt(10)
        const hashPassword = await bcrypt.hash(password, salt)

        const novoUsuario = await prisma.user.create({
            data: {
                name,
                email,
                password: hashPassword
            }
        })

        res.status(201).json({ message: "Usuário criado com sucesso!", id: novoUsuario.id })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}