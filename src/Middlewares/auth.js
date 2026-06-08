import jwt from "jsonwebtoken";

export const autenticacao = (req, res, next) => {
    const header = req.headers.authorization;

    if (!header) return res.status(401).json({ error: "Token ausente" });

    const token = header.split(" ")[1];

    try {
        const dados = jwt.verify(token, process.env.JWT_SECRET);
        req.usuarioId = dados.id;
        next();
    } catch (err) {
        return res.status(401).json({ error: "Token inválido" });
    }
};