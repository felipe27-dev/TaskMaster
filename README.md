# TaskMaster - Projeto Full Stack (React + Node.js/Express + PostgreSQL)

Este projeto é uma aplicação de gerenciamento de tarefas (To-Do List) com frontend em React e backend em Node.js/Express, utilizando PostgreSQL como banco de dados.

## Estrutura do Projeto

```
projeto_unificado_atualizado/
├── backend/         # Código do servidor Node.js/Express
│   ├── controllers/
│   ├── database/
│   ├── middleware/
│   ├── models/
│   ├── public/
│   ├── routes/
│   ├── .env         # Arquivo de variáveis de ambiente (NÃO ENVIAR PARA GIT)
│   ├── .gitignore
│   ├── index.js     # Ponto de entrada do backend
│   ├── package.json
│   └── ...
├── frontend/        # Código da aplicação React (Vite)
│   ├── public/
│   ├── src/
│   ├── .gitignore
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── ...
└── README.md        # Este arquivo
```

## Tecnologias Utilizadas

*   **Frontend:** React, Vite, Tailwind CSS (provavelmente, baseado na estrutura)
*   **Backend:** Node.js, Express, PostgreSQL (`pg`), JWT (`jsonwebtoken`), Bcrypt, CORS, Dotenv
*   **Banco de Dados:** PostgreSQL

## Preparação para Deploy no Render

Este projeto foi preparado para ser hospedado na plataforma Render ([https://render.com/](https://render.com/)). Você precisará criar dois serviços:

1.  **Web Service (Backend):** Para rodar o servidor Node.js.
2.  **Static Site (Frontend):** Para servir os arquivos estáticos do React.

### Configuração do Backend (Web Service)

1.  **Repositório:** Conecte seu repositório Git (GitHub, GitLab, etc.) onde este código está hospedado.
2.  **Root Directory:** `backend` (Informe ao Render que o código do backend está nesta pasta).
3.  **Build Command:** `npm install` (Render geralmente detecta `package.json` e executa isso automaticamente, mas confirme).
4.  **Start Command:** `npm start` (Este comando executa `node index.js` conforme definido no `package.json`).
5.  **Variáveis de Ambiente:** Esta é a parte mais crucial. Vá até a seção "Environment" do seu serviço no Render e adicione as seguintes variáveis:
    *   `DATABASE_URL`: A string de conexão completa fornecida pelo serviço de banco de dados PostgreSQL do Render (ou externo). Exemplo: `postgres://usuario:senha@host:port/database`.
    *   `JWT_SECRET`: Uma string longa e segura para assinar os tokens JWT. Gere uma chave segura (ex: usando um gerador online ou `openssl rand -hex 32`).
    *   `FRONTEND_URL`: A URL pública do seu serviço Static Site (frontend) no Render (ex: `https://seu-frontend.onrender.com`). Isso é usado para a configuração do CORS.
    *   `PORT`: O Render define esta variável automaticamente. O código já está configurado para usá-la (`process.env.PORT || 3001`).

### Configuração do Frontend (Static Site)

1.  **Repositório:** Conecte o mesmo repositório Git.
2.  **Root Directory:** `frontend` (Informe ao Render que o código do frontend está nesta pasta).
3.  **Build Command:** `npm install && npm run build` (Instala dependências e executa o build do Vite).
4.  **Publish Directory:** `dist` (O Vite coloca os arquivos de build nesta pasta por padrão).
5.  **Configuração Adicional (Importante para React Router):** Adicione uma **Rewrite Rule** para garantir que o roteamento do React funcione corretamente em sub-rotas:
    *   **Source:** `/*`
    *   **Destination:** `/index.html`
    *   **Action:** Rewrite

### Banco de Dados PostgreSQL no Render

*   Você pode criar um banco de dados PostgreSQL diretamente no Render. Ele fornecerá a `DATABASE_URL` necessária para a variável de ambiente do backend.
*   Após criar o banco, você precisará conectar-se a ele (usando uma ferramenta como `psql` ou um cliente gráfico via conexão externa do Render) e executar o SQL para criar as tabelas necessárias (como `users`, `tasks`, etc., conforme definido nos seus models).

## Execução Local (Para Desenvolvimento)

1.  **Backend:**
    *   Navegue até a pasta `backend`.
    *   Crie um arquivo `.env` baseado no `.env.example` (se existir) ou preencha as variáveis `DB_USER`, `DB_PASSWORD`, `DB_HOST`, `DB_PORT`, `DB_DATABASE`, `JWT_SECRET`.
    *   Execute `npm install`.
    *   Execute `npm run dev` (usando nodemon) ou `npm start`.
2.  **Frontend:**
    *   Navegue até a pasta `frontend`.
    *   Execute `npm install`.
    *   Execute `npm run dev`.
    *   Acesse a aplicação no endereço fornecido pelo Vite (geralmente `http://localhost:5173`).

**Observação:** Para execução local, você precisará ter um servidor PostgreSQL rodando e acessível com as credenciais fornecidas no `.env` do backend.

