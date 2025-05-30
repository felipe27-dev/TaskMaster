# 📝 To Do List - Projeto Web com Node.js, Express e PostgreSQL

Este é um projeto de **Lista de Tarefas (To-do List)** feito com:

- 💻 HTML + JavaScript (no navegador)
- ⚙️ Node.js + Express (back-end)
- 🗄️ PostgreSQL (banco de dados relacional)
- 🖼️ EJS (para renderizar o HTML do servidor)

---

## 📌 Funcionalidades implementadas

- ✅ Adicionar nova tarefa via formulário
- 📋 Listar todas as tarefas salvas no banco
- 🗑️ Apagar tarefas individualmente clicando no botão "Excluir"
- 🔄 Interface se atualiza automaticamente após cada ação

---


## 🗂 Estrutura do projeto

```
Projeto/
│
├── index.js # Entrada do servidor Node.js
├── controllers/
│ ├── TaskController.js # Lógica da API (get, post, delete)
│ └── ViewController.js # Renderiza views usando EJS
├── routes/
│ └── taskRoutes.js # Rotas da aplicação
│ └── viewRoutes.js # engine de visualização
├── database/
│ └── db.js # Conexão com PostgreSQL
├── views/
│ └── index.ejs # HTML com EJS
├── public/
│ └── style.css # Estilos da página (opcional)
├── package.json
└── README.md
```
## ⚙️ Tecnologias utilizadas

- Node.js
- Express
- PostgreSQL
- EJS (template engine)
- HTML5 + JavaScript
- Fetch API (AJAX via navegador)

---

## 🧑‍💻 Como rodar o projeto localmente

### 1. Clone o repositório

```bash
git clone https://github.com/seu-usuario/To-do-list-Projeto-Backend.git
cd To-do-list-Projeto-Backend
```

### 2. Instale as dependências

# 📦 Dependências e Ferramentas Utilizadas

Este documento lista tudo o que foi instalado para rodar o projeto **To-do List com Node.js, Express, EJS e PostgreSQL**.

---

## ✅ 🛠 Ferramentas instaladas no sistema

| Ferramenta         | Função principal                                 | Instalação                        |
|--------------------|--------------------------------------------------|-----------------------------------|
| **Node.js**        | Interpretador JavaScript no back-end             | [nodejs.org](https://nodejs.org) |
| **npm** (vem com Node.js) | Gerenciador de pacotes do Node            | Já vem com o Node.js             |
| **PostgreSQL**     | Banco de dados relacional                        | [postgresql.org](https://www.postgresql.org/download/) |
| **DBeaver** *(opcional)* | Cliente gráfico para acessar o banco       | [dbeaver.io](https://dbeaver.io) |

---

## ✅ 📦 Pacotes npm instalados no projeto

```bash
npm install express pg ejs
```

| Pacote             | Função                                                  |
|--------------------|----------------------------------------------------------|
| `express`          | Framework web para criar rotas, servidor e middleware    |
| `pg`               | Cliente PostgreSQL para conectar ao banco                |
| `ejs`              | Template engine para renderizar HTML no servidor         |

---

## ✅ 📦 Pacotes para desenvolvimento

```bash
npm install --save-dev nodemon
```

| Pacote             | Função                                                  |
|--------------------|----------------------------------------------------------|
| `nodemon`          | Reinicia automaticamente o servidor ao salvar arquivos   |

---

## ✅ `package.json` esperado

```json
"dependencies": {
  "express": "^4.18.2",
  "pg": "^8.10.0",
  "ejs": "^3.1.8"
},
"devDependencies": {
  "nodemon": "^3.1.0"
}
```

---

## 🧠 Observações

- O projeto pode ser executado com `npx nodemon index.js`
- O banco de dados deve estar rodando e acessível localmente na porta padrão (5432)
- Não se esqueça de criar a tabela `tasks` com a estrutura correta antes de iniciar
-Obs: em bd.js as informações de conexão com o banco deve ser alterada com as informações do seu servidor:
```
const pool = new Pool({
  user: 'nome',                 // Seu usuário do PostgreSQL
  host: 'localhost',               // Host do banco
  database: 'nome_do banco',    // Nome do banco de dados
  password: 'sua_senha',               // Senha do seu usuário
  port: 5432,                      // Porta padrão do PostgreSQL
});
```

### 3. Configure o banco de dados

- Crie um banco chamado `controle_tarefas`
- Execute o seguinte comando SQL para criar a tabela:

```sql
CREATE TABLE tasks (
    id SERIAL PRIMARY KEY,
    task_name VARCHAR(255) NOT NULL,
    descricao TEXT,
    criada_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 4. Inicie o servidor

```bash
npx nodemon index.js
```

> O servidor estará rodando em: `http://localhost:3000`

---

## 🌐 Como usar a aplicação

1. Acesse: `http://localhost:3000`
2. Preencha o campo de tarefa e clique em **Adicionar**
3. As tarefas serão listadas logo abaixo
4. Clique em 🗑️ para apagar uma tarefa

---

## 🔗 Endpoints da API (para quem quiser integrar)

| Método | Rota         | Descrição                     |
|--------|--------------|-------------------------------|
| GET    | `/tasks`     | Retorna todas as tarefas      |
| POST   | `/tasks`     | Cria uma nova tarefa          |
| DELETE | `/tasks/:id` | Deleta uma tarefa pelo ID     |

### Exemplo de requisição POST:

```json
{
  "task_name": "Estudar Node.js"
}
```

---

## ✨ Melhorias futuras

- [ ] Marcar tarefas como concluídas
- [ ] Editar tarefas
- [ ] Autenticação de usuários
- [ ] Organização por categorias/prioridades
- [ ] Deploy online (Render, Railway, etc.)

---