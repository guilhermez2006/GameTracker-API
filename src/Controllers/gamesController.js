import pkg from "@prisma/client";
const { PrismaClient } = pkg;
const prisma = new PrismaClient();

// 1. ADICIONAR JOGO
export const adicionarJogo = async (req, res) => {
  try {
    // Pegamos os campos de JOGO que vêm do corpo da requisição (JSON)
    const { title, platform, status, genre, rating, userId } = req.body;

    const jogo = await prisma.game.create({ // Use "game" (conforme seu schema)
      data: {
        title,
        platform,
        status,
        genre,
        rating,
        userId // O ID do dono do jogo (essencial!)
      }
    });

    res.status(201).json(jogo);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 2. LISTAR JOGOS
export const listarJogos = async (req, res) => {
  try {
    // Se a função é listar JOGOS, use prisma.game, não prisma.user!
    const jogos = await prisma.game.findMany(); 
    res.status(200).json(jogos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 3. BUSCAR POR ID
export const buscarJogoId = async (req, res) => {
  try {
    const jogo = await prisma.game.findUnique({
      where: { id: req.params.id }, // O ID vem da URL
    });
    res.status(200).json(jogo);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 4. EDITAR JOGO
export const editarJogo = async (req, res) => {
  try {
    const jogoEditado = await prisma.game.update({
      where: { id: req.params.id }, // QUEM eu vou editar (ID da URL)
      data: req.body,               // O QUE eu vou mudar (Body JSON)
    });
    res.status(200).json(jogoEditado);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 5. DELETAR JOGO
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