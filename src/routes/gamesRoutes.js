import express from "express";
import * as GamesController from "../Controllers/gamesController.js";
import { autenticacao } from "../Middlewares/auth.js";
import { login, criarUsuario } from "../Controllers/authController.js";

const router = express.Router();

// Public Routes: Authentication
router.post("/cadastro", criarUsuario);
router.post("/login", login);

// Public Routes: Steam API Search
router.get("/steam/search", GamesController.searchGameByName);
router.get("/steam/:appid", GamesController.getGameById);

// Protected Routes: Games Database (JWT Required)
router.use(autenticacao);

router.post("/games", GamesController.adicionarJogo);
router.get("/games", GamesController.listarJogos);
router.get("/games/:id", GamesController.buscarJogoId);
router.put("/games/:id", GamesController.editarJogo);
router.delete("/games/:id", GamesController.deletarJogo);

export default router;