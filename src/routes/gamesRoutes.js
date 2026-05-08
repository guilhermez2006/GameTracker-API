import express from "express";
// Removido o "../src" e ajustado para o caminho relativo correto dentro da pasta src
import * as GamesController from "../Controllers/gamesController.js";
import { autenticacao } from "../Middlewares/auth.js";
import { login, criarUsuario } from "../Controllers/authController.js";

const router = express.Router();

// --- ROTAS PÚBLICAS ---
router.post("/cadastro", criarUsuario); 
router.post("/login", login);

// --- ROTAS DE GAMES (Protegidas) ---
router.use(autenticacao); 

router.post("/games", GamesController.adicionarJogo);
router.get("/games", GamesController.listarJogos);
router.get("/games/:id", GamesController.buscarJogoId);
router.put("/games/:id", GamesController.editarJogo);
router.delete("/games/:id", GamesController.deletarJogo);

export default router;