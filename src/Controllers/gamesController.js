import pkg from "@prisma/client";
import axios from "axios";

const { PrismaClient } = pkg;
const prisma = new PrismaClient();

const STEAM_SEARCH_URL = "https://store.steampowered.com/api/storesearch";
const STEAM_DETAILS_URL = "https://store.steampowered.com/api/appdetails";

// ─── CRUD: DATABASE OPERATIONS ───────────────────────────────────────────────

export const adicionarJogo = async (req, res) => {
  try {
    const { title, platform, status, genre, rating, cover, description } = req.body;
    const userId = req.usuarioId;

    const jogo = await prisma.game.create({
      data: {
        title,
        platform,
        status,
        genre,
        rating,
        userId,
        cover, 
        description
      },
    });

    res.status(201).json(jogo);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const editarJogo = async (req, res) => {
  try {
    const idDoJogo = req.params.id;
    if (!idDoJogo) return res.status(400).json({ error: "ID inválido." });

    const { title, platform, status, genre, rating, cover, description } = req.body;

    const updateData = {};
    if (title) updateData.title = title;
    if (platform) updateData.platform = platform;
    if (status) updateData.status = status;
    if (genre !== undefined) updateData.genre = genre;
    if (rating !== undefined) updateData.rating = rating;
    if (cover !== undefined) updateData.cover = cover;
    if (description !== undefined) updateData.description = description;

    const jogoEditado = await prisma.game.update({
      where: { id: idDoJogo },
      data: updateData,
    });

    return res.status(200).json(jogoEditado);
  } catch (error) {
    console.error("[editarJogo] Erro:", error.message);
    return res.status(500).json({ error: error.message });
  }
};

export const listarJogos = async (req, res) => {
  try {
    const jogos = await prisma.game.findMany();
    res.status(200).json(jogos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const buscarJogoId = async (req, res) => {
  try {
    const jogo = await prisma.game.findUnique({
      where: { id: req.params.id },
    });
    res.status(200).json(jogo);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deletarJogo = async (req, res) => {
  try {
    await prisma.game.delete({
      where: { id: req.params.id },
    });
    res.status(200).json({ message: "Jogo deletado com sucesso!" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ─── STEAM API INTEGRATION ───────────────────────────────────────────────────

export const getGameById = async (req, res) => {
  const { appid } = req.params;

  try {
    const response = await axios.get(`${STEAM_DETAILS_URL}?appids=${appid}`);
    const json = response.data;
    const gameEntry = json[appid];

    if (!gameEntry || !gameEntry.success) {
      return res.status(404).json({ message: `Nenhum jogo encontrado para o appid ${appid}.` });
    }

    const data = gameEntry.data;
    const game = {
      appid: data.steam_appid,
      name: data.name,
      short_description: data.short_description,
      header_image: data.header_image,
      screenshots: data.screenshots?.map((s) => s.path_full) ?? [],
    };

    return res.status(200).json(game);
  } catch (error) {
    console.error("[getGameById] Erro:", error.message);
    return res.status(500).json({ message: "Erro interno no servidor." });
  }
};

export const searchGameByName = async (req, res) => {
  const { name } = req.query;

  if (!name || name.trim() === "") {
    return res.status(400).json({ message: "O parâmetro 'name' é obrigatório." });
  }

  try {
    const response = await axios.get(`${STEAM_SEARCH_URL}/?term=${encodeURIComponent(name)}&l=brazilian&cc=BR`);
    const json = response.data;

    if (!json || !json.items || json.items.length === 0) {
      return res.status(200).json([]);
    }

    const games = json.items.map((item) => {
      const appId = item.id;
      return {
        appid: appId,
        name: item.name,
        short_description: "", 
        header_image: `https://cdn.akamai.steamstatic.com/steam/apps/${appId}/header.jpg`,
        screenshots: []
      };
    });

    return res.status(200).json(games);
  } catch (error) {
    console.error("[searchGameByName] Erro:", error.message);
    return res.status(200).json([]); 
  }
};
