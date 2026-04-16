import express from "express";
import * as UsuariosController from "../src/Controllers/usuariosController.js";

const router = express.Router();

// A rota só diz: "Nesse endereço, chama essa função do Controller"
router.post("/usuarios", UsuariosController.criarUsuario);
router.get("/usuarios", UsuariosController.listarUsuarios);
router.get("/usuarios/:id", UsuariosController.buscarUsuarioId);
router.put("/usuarios/:id", UsuariosController.editarUsuario);
router.delete("/usuarios/:id", UsuariosController.deletarUsuario);

export default router;