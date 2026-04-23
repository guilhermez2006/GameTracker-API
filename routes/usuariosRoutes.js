import express from "express";
import * as UsuariosController from "../src/Controllers/usuariosController.js";
import { autenticacao } from "../src/Middlewares/auth.js"; 

const router = express.Router();

// ROTA PÚBLICA: Sem o middleware (Aberto para todos criarem conta)
router.post("/usuarios", UsuariosController.criarUsuario);

// ROTAS PROTEGIDAS: Adiciono 'autenticacao' como o segundo argumento
// O Express lerá: "Se for GET em /usuarios, primeiro chame 'autenticacao', depois 'listarUsuarios'"
router.get("/usuarios", autenticacao, UsuariosController.listarUsuarios);
router.get("/usuarios/:id", autenticacao, UsuariosController.buscarUsuarioId);
router.put("/usuarios/:id", autenticacao, UsuariosController.editarUsuario);
router.delete("/usuarios/:id", autenticacao, UsuariosController.deletarUsuario);

export default router;