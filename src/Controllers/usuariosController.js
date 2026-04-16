// src/Controllers/usuariosController.js
import pkg from "@prisma/client";
const { PrismaClient } = pkg;
const prisma = new PrismaClient();

export const criarUsuario = async (req, res) => {
    try {
        const { email, name, age } = req.body;
        // data: envia os dados para o banco criar um novo registro
        const newUser = await prisma.user.create({ data: { email, name, age } });
        res.status(201).json(newUser);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const listarUsuarios = async (req, res) => {
    try {
        // findMany busca todos os registros sem filtro, retorna um array
        const users = await prisma.user.findMany();
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const buscarUsuarioId = async (req, res) => {
    try {
        const users = await prisma.user.findUnique({
            where: { id: req.params.id }
        })
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
export const editarUsuario = async (req, res) => {
    try {
        const users = await prisma.user.update({
            where: { id: req.params.id }, // qual registro alterar (id vem pela URL)
            data: req.body, // o que alterar (dados vêm pelo body JSON)
        });
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const deletarUsuario = async (req, res) => {
    try {
        const users = await prisma.user.delete({
            where: { id: req.params.id }, // qual registro deletar (id vem pela URL)
        });
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};