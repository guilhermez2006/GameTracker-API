import express from "express";
import * as GamesController from "../Controllers/gamesController.js";
import { autenticacao } from "../Middlewares/auth.js";
import { login, criarUsuario } from "../Controllers/authController.js";

const router = express.Router();

// --- ROTAS PÚBLICAS DE AUTENTICAÇÃO ---
router.post("/cadastro", criarUsuario); 
router.post("/login", login);

// --- ROTAS DE BUSCA DIRETA NA STEAM ---
// Corrigido aqui para usar os nomes exatos do controller do Claude
router.get("/steam/search", GamesController.searchGameByName); 
router.get("/steam/:appid", GamesController.getGameById);    

// --- CRUD DE GAMES NO BANCO (Protegidas por JWT) ---
router.use(autenticacao); 

router.post("/games", GamesController.adicionarJogo);
router.get("/games", GamesController.listarJogos);
router.get("/games/:id", GamesController.buscarJogoId);
router.put("/games/:id", GamesController.editarJogo);
router.delete("/games/:id", GamesController.deletarJogo);

export default router;
