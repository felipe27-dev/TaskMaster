const pool = require("../database/db");

const getTasks = async (req, res) => {
  // *** CORREÇÃO: Usar req.userId definido pelo middleware ***
  const userId = req.userId;
  console.log(`➡️ GET /api/tasks chamado pelo usuário ${userId}`);
  try {
    const { search, status, priority, delivery_date, sort_by } = req.query;
    console.log("📥 Parâmetros recebidos:", { search, status, priority, delivery_date, sort_by });

    let query = "SELECT * FROM tasks WHERE user_id = $1"; // Filtra pelo user_id
    const queryParams = [userId];
    const conditions = [];
    let paramIndex = 2; // Próximo índice de parâmetro

    // Adicionar condição de busca
    if (search && search.trim() !== "") {
      conditions.push(`(LOWER(title) LIKE $${paramIndex} OR LOWER(description) LIKE $${paramIndex})`);
      queryParams.push(`%${search.toLowerCase()}%`);
      paramIndex++;
    }
    // Adicionar filtros de status, prioridade e data
    if (status && status.trim() !== "") {
      conditions.push(`status = $${paramIndex}`);
      queryParams.push(status);
      paramIndex++;
    }
    if (priority && priority.trim() !== "") {
      conditions.push(`priority = $${paramIndex}`);
      queryParams.push(priority);
      paramIndex++;
    }
    if (delivery_date && /^\d{4}-\d{2}-\d{2}$/.test(delivery_date)) {
        conditions.push(`delivery_date = $${paramIndex}`);
        queryParams.push(delivery_date);
        paramIndex++;
    }

    // Adicionar condições extras à query
    if (conditions.length > 0) {
      query += " AND " + conditions.join(" AND ");
    }

    // Adicionar ordenação
    let orderByClause = " ORDER BY list_title, criada_em DESC"; // Ordenação padrão
    if (sort_by) {
        const [field, direction] = sort_by.split(":");
        const allowedFields = ["title", "status", "priority", "delivery_date", "criada_em"];
        const allowedDirections = ["ASC", "DESC"];
        if (allowedFields.includes(field) && allowedDirections.includes(direction.toUpperCase())) {
            orderByClause = ` ORDER BY ${field} ${direction.toUpperCase()}`;
        }
    }
    query += orderByClause;

    console.log("🔍 Query final:", query);
    console.log("🔢 Parâmetros:", queryParams);

    const result = await pool.query(query, queryParams);
    console.log(`✅ ${result.rows.length} tarefas retornadas com sucesso para o usuário ${userId}`);
    res.status(200).json(result.rows);
  } catch (err) {
    console.error(`❌ Erro ao buscar tarefas para o usuário ${userId}:`, err);
    res.status(500).json({ message: "Erro no servidor ao buscar tarefas" });
  }
};

// POST /api/tasks - Cria uma nova tarefa
const createTask = async (req, res) => {
  // *** CORREÇÃO: Usar req.userId definido pelo middleware ***
  const userId = req.userId;
  console.log(`➡️ POST /api/tasks chamado pelo usuário ${userId}`);
  var { title, description, list_title, delivery_date, priority } = req.body;
  priority = priority ? priority.toLowerCase() : 'normal';
  console.log("📥 Dados recebidos:", { title, description, list_title, delivery_date, priority });

  if (!title || title.trim() === "") {
    return res.status(400).json({ message: "O título da tarefa é obrigatório" });
  }

  const initialStatus = 'To Do';
  const targetList = list_title || 'Backlog';

  try {
    const result = await pool.query(
      "INSERT INTO tasks (title, description, status, list_title, delivery_date, priority, user_id) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *",
      [title.trim(), description || null, initialStatus, targetList, delivery_date || null, priority, userId] // Adiciona userId
    );
    console.log(`✅ Tarefa inserida com sucesso para o usuário ${userId}:`, result.rows[0]);
    res.status(201).json(result.rows[0]);
  } catch (err) {
      console.error(`❌ Erro ao inserir tarefa para o usuário ${userId}:`, err);
      res.status(500).json({ message: "Erro no servidor ao inserir tarefa" });
  }
};

// PUT /api/tasks/:id - Atualiza uma tarefa existente
const updateTask = async (req, res) => {
  // *** CORREÇÃO: Usar req.userId definido pelo middleware ***
  const userId = req.userId;
  const { id } = req.params;
  var { title, description, status, list_title, delivery_date, priority } = req.body;

  console.log(`➡️ PUT /api/tasks/${id} chamado pelo usuário ${userId}`);

  // Validação básica
  if (!title && !description && !status && !list_title && delivery_date === undefined && !priority) {
      return res.status(400).json({ message: "Nenhum dado fornecido para atualização" });
  }

  const updateFields = Object.entries({ title, description, status, list_title, delivery_date, priority })
                          .filter(([key, value]) => value !== undefined);

  // Validações específicas (ex: status, priority)
  const validStatuses = ["To Do", "Done"];
  if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ message: `Status inválido: ${status}` });
  }
  const validPriorities = ["baixa", "normal", "alta"];
  if (priority && !validPriorities.includes(priority.toLowerCase())) {
      return res.status(400).json({ message: `Prioridade inválida: ${priority}` });
  }

  let setClauses = [];
  const values = [];
  let paramIndex = 1;
  updateFields.forEach(([key, value]) => {
      setClauses.push(`${key} = $${paramIndex++}`);
      // Trata prioridade para lowercase
      values.push(key === 'priority' ? value.toLowerCase() : value);
  });

  // Adiciona a condição user_id = $N ao WHERE
  let query = `UPDATE tasks SET ${setClauses.join(', ')} WHERE id = $${paramIndex} AND user_id = $${paramIndex + 1} RETURNING *`;
  values.push(id);
  values.push(userId); // Adiciona o userId aos parâmetros

  console.log("🔧 Query de atualização:", query);
  console.log("🔢 Valores:", values);

  try {
    const result = await pool.query(query, values);
    if (result.rowCount === 0) {
      // Pode ser que a tarefa não exista OU não pertença ao usuário
      return res.status(404).json({ message: "Tarefa não encontrada ou não pertence a este usuário" });
    }
    console.log(`✅ Tarefa ${id} atualizada com sucesso pelo usuário ${userId}:`, result.rows[0]);
    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error(`❌ Erro ao atualizar tarefa ${id} para o usuário ${userId}:`, err);
    res.status(500).json({ message: "Erro no servidor ao atualizar tarefa" });
  }
};

// DELETE /api/tasks/:id - Deleta uma tarefa
const deleteTask = async (req, res) => {
  // *** CORREÇÃO: Usar req.userId definido pelo middleware ***
  const userId = req.userId;
  const { id } = req.params;
  console.log(`➡️ DELETE /api/tasks/${id} chamado pelo usuário ${userId}`);

  try {
    // Adiciona a condição user_id = $2 ao WHERE
    const result = await pool.query("DELETE FROM tasks WHERE id = $1 AND user_id = $2 RETURNING *", [id, userId]);

    if (result.rowCount === 0) {
      // Pode ser que a tarefa não exista OU não pertença ao usuário
      return res.status(404).json({ message: "Tarefa não encontrada ou não pertence a este usuário" });
    }

    console.log(`🗑️ Tarefa ${id} apagada com sucesso pelo usuário ${userId}`);
    res.status(200).json({ message: `Tarefa ${id} apagada com sucesso`, deletedTask: result.rows[0] });
  } catch (err) {
    console.error(`❌ Erro ao apagar tarefa ${id} para o usuário ${userId}:`, err);
    res.status(500).json({ message: "Erro no servidor ao apagar tarefa" });
  }
};

// DELETE /api/tasks/completed - Deleta todas as tarefas concluídas
const deleteCompletedTasks = async (req, res) => {
  // *** CORREÇÃO: Usar req.userId definido pelo middleware ***
  const userId = req.userId;
  console.log(`➡️ DELETE /api/tasks/completed chamado pelo usuário ${userId}`);
  try {
    // Adiciona a condição user_id = $1 ao WHERE
    const result = await pool.query("DELETE FROM tasks WHERE status = 'Done' AND user_id = $1 RETURNING *", [userId]);

    if (result.rowCount === 0) {
      return res.status(200).json({ message: "Nenhuma tarefa concluída encontrada para deletar para este usuário", deletedTasks: [] });
    }

    console.log(`🗑️ ${result.rowCount} tarefas concluídas apagadas com sucesso pelo usuário ${userId}`);
    res.status(200).json({ 
      message: `${result.rowCount} tarefas concluídas apagadas com sucesso`, 
      deletedTasks: result.rows 
    });
  } catch (err) {
    console.error(`❌ Erro ao apagar tarefas concluídas para o usuário ${userId}:`, err);
    res.status(500).json({ message: "Erro no servidor ao apagar tarefas concluídas" });
  }
};

module.exports = {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  deleteCompletedTasks,
};

