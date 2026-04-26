import express from "express";
import * as GamesController from "../src/Controllers/gamesController.js";
import { autenticacao } from "../src/Middlewares/auth.js";
import { login, criarUsuario } from "../src/Controllers/authController.js"; // Criar usuário costuma ir no Auth agora

const router = express.Router();

// --- ROTAS PÚBLICAS (Login e Cadastro de Conta) ---
router.post("/cadastro", criarUsuario); 
router.post("/login", login);

// --- ROTAS DE GAMES (Protegidas) ---
// O 'autenticacao' garante que só quem tá logado mexe na agenda
router.use(autenticacao); 

router.post("/games", GamesController.adicionarJogo);        // Adiciona novo game
router.get("/games", GamesController.listarJogos);          // Lista seu backlog
router.get("/games/:id", GamesController.buscarJogoId);     // Detalhes de um jogo
router.put("/games/:id", GamesController.editarJogo);       // Mudar status (ex: jogando -> zerado)
router.delete("/games/:id", GamesController.deletarJogo);    // Remove da lista

export default router;