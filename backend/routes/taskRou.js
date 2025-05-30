const express = require("express");
const router = express.Router();
const TaskController = require("../controllers/TaskController");
const authMiddleware = require('../middleware/authMiddleware'); // Importa o middleware

// Aplica o middleware de verificação de token a TODAS as rotas definidas abaixo neste router
router.use(authMiddleware.verifyToken);

// Define as rotas da API para tarefas (agora protegidas)
router.get("/", TaskController.getTasks); // Busca tarefas DO USUÁRIO LOGADO
router.post("/", TaskController.createTask); // Cria uma nova tarefa PARA O USUÁRIO LOGADO
router.put("/:id", TaskController.updateTask); // Atualiza uma tarefa DO USUÁRIO LOGADO
router.delete("/completed", TaskController.deleteCompletedTasks); // Deleta tarefas concluídas DO USUÁRIO LOGADO
router.delete("/:id", TaskController.deleteTask); // Deleta uma tarefa DO USUÁRIO LOGADO


module.exports = router;