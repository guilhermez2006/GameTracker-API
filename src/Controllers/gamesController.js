import pkg from "@prisma/client";
import axios from "axios";

const { PrismaClient } = pkg;
const prisma = new PrismaClient();

const STEAM_SEARCH_URL = "https://store.steampowered.com/api/storesearch";
const STEAM_DETAILS_URL = "https://store.steampowered.com/api/appdetails";

// ─── CRUD DO BANCO (MongoDB / Prisma) ───────────────────────────────────

export const adicionarJogo = async (req, res) => {
  try {
    const { title, platform, status, genre, rating, image_url, description } = req.body;
    const userId = req.usuarioId; 

    const jogo = await prisma.game.create({
      data: {
        title,
        platform,
        status,
        genre,
        rating,
        userId,
        ...(image_url && { image_url }),
        ...(description && { description })
      },
    });

    res.status(201).json(jogo);
  } catch (error) {
    res.status(500).json({ error: error.message });
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

export const editarJogo = async (req, res) => {
  try {
    const idDoJogo = req.params.id || req.body.id || req.body._id;

    if (!idDoJogo || idDoJogo === 'undefined') {
      return res.status(400).json({ error: "ID do jogo inválido ou não fornecido." });
    }

    // Separa o id e userId para evitar que o Prisma tente atualizar campos restritos
    const { id, _id, userId, ...updateData } = req.body;

    console.log(`[Backend] Atualizando jogo ${idDoJogo} com os dados:`, updateData);

    const jogoEditado = await prisma.game.update({
      where: { id: idDoJogo },
      data: updateData,
    });

    return res.status(200).json(jogoEditado);
  } catch (error) {
    console.error("[editarJogo] Erro crítico ao atualizar:", error.message);
    return res.status(500).json({ error: error.message });
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

// ─── INTEGRAÇÃO COM A STEAM API ──────────────────────────────────────────

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
      appid:             data.steam_appid,
      name:              data.name,
      short_description: data.short_description,
      header_image:      data.header_image,
      screenshots:       data.screenshots?.map((s) => s.path_full) ?? [],
    };

    return res.status(200).json(game);
  } catch (error) {
    console.error("[getGameById] Erro interno:", error.message);
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
    console.error("[searchGameByName] Erro na comunicação com a Steam:", error.message);
    return res.status(200).json([]); 
  }
};