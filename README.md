# GameTracker-API 🎮

API REST para gerenciar seu backlog de games. Construída com Node.js, Express e Prisma com MongoDB Atlas.

## Tecnologias

- Node.js
- Express
- Prisma ORM
- MongoDB Atlas
- JSON Web Token (JWT)
- Bcryptjs

## Como rodar o projeto

### 1. Clone o repositório
```bash
git clone https://github.com/guilhermez2006/GameTracker-API
cd GameTracker-API
```

### 2. Instale as dependências
```bash
npm install
```

### 3. Configure o banco de dados
Crie um arquivo `.env` na raiz do projeto:
```
DATABASE_URL="mongodb+srv://usuario:senha@cluster.mongodb.net/NomeDoBanco?appName=nome"
JWT_SECRET=suaChaveSecretaAqui123!@#
```

### 4. Sincronize o banco e gere o client do Prisma
```bash
npx prisma db push
npx prisma generate
```

### 5. Rode o servidor
```bash
node --watch server.js
```

O servidor sobe em `http://localhost:3000`

## Rotas disponíveis

### Autenticação (públicas)
| Método | Rota | Descrição |
|--------|------|-----------|
| POST | /cadastro | Cria um novo usuário |
| POST | /login | Autentica e retorna o token JWT |

### Games (protegidas — requer token JWT)
| Método | Rota | Descrição |
|--------|------|-----------|
| GET | /games | Lista todos os games |
| GET | /games/:id | Busca um game por ID |
| POST | /games | Adiciona um game ao backlog |
| PUT | /games/:id | Edita um game |
| DELETE | /games/:id | Remove um game |

> Para acessar as rotas protegidas, envie o token no header:
> `Authorization: Bearer <seu_token>`

## Estrutura do projeto

```
├── prisma/
│   └── schema.prisma
├── routes/
│   └── gamesRoutes.js
├── src/
│   └── Controllers/
│       ├── gamesController.js
│       └── authController.js
│   └── Models/
│       └── Game.js
├── .env
├── server.js
└── package.json
```
