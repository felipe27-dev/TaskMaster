require("dotenv").config();
const express = require("express");
const path = require("path");
const cors = require("cors");

// Importar rotas
const taskRoutes = require("./routes/taskRou"); // Mantendo rotas existentes de tarefas
const authRoutes = require("./routes/authRoutes"); // Importando as novas rotas de autenticação
// const viewRoutes = require("./routes/viewRoutes"); // Rotas EJS não serão usadas com React

const app = express();
const port = process.env.PORT || 3001; // Usar porta 3001 para consistência com frontend ou variável de ambiente

// Middleware CORS - Configuração mais flexível
app.use(cors({
    origin: "*", // Em produção, restrinja para a URL do seu frontend
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));

// Middleware para interpretar JSON no corpo das requisições
app.use(express.json());

// Middleware para interpretar dados de formulário URL-encoded (opcional, mas útil)
app.use(express.urlencoded({ extended: true }));

// Configurar EJS (Desnecessário com React, mas mantido comentado caso haja uso futuro)
// app.set("view engine", "ejs");
// app.set("views", path.join(__dirname, "views"));

// Middleware para arquivos estáticos (Se o backend servir o build do React)
// app.use(express.static(path.join(__dirname, "../frontend/dist"))); // Exemplo: servir build do React
app.use(express.static(path.join(__dirname, "public"))); // Mantendo pasta public original por enquanto

// Rotas da API
app.use("/api/tasks", taskRoutes); // Rotas de tarefas existentes
app.use("/api/auth", authRoutes); // Novas rotas de autenticação

// Rota de fallback para servir o index.html do React (se o backend servir o frontend)
// app.get("*", (req, res) => {
//   res.sendFile(path.join(__dirname, "../frontend/dist", "index.html"));
// });

// Rota raiz simples para teste
app.get("/", (req, res) => {
  res.send("Servidor backend TaskMaster rodando!");
});

app.listen(port, () => {
  console.log(`✅ Servidor backend rodando na porta ${port}`);
});

