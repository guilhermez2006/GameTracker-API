import jwt from "jsonwebtoken";

export const autenticacao = (req, res, next) => {
    // 1. Pega o token que o Postman enviou de forma oculta nos 'headers'
    const header = req.headers.authorization;
    
    if (!header) return res.status(401).json({ error: "Token ausente" });

    // 2. Corta o texto "Bearer 12345" e pega só a (posição 1)
    const token = header.split(" ")[1];

    try {
        // 3. Verifica se a senha do .env bate com o token.
        // Se bater, devolve o JSON original do usuário e salva em 'dados'
        const dados = jwt.verify(token, process.env.JWT_SECRET);

        // 4. Cria a variável 'usuarioId' DENTRO do 'req'. 
        // Guarda o ID lá para o Controller poder ler depois.
        req.usuarioId = dados.id;

        // 5. Deu tudo certo. Manda seguir para o Controller.
        next();
    } catch (err) {
        // Se o token estiver expirado ou foi hackeado, cai aqui.
        return res.status(401).json({ error: "Token inválido" });
    }
};