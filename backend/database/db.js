const { Pool } = require("pg");
require("dotenv").config();
// Configuração da conexão com o banco de dados PostgreSQL
// Utiliza as informações fornecidas pelo usuário
const connectionString = process.env.DATABASE_URL || "postgres://postgres:facom@localhost:5432/controle_tarefas";

const pool = new Pool({
  connectionString: connectionString, // String de conexão do banco de dados
  ssl: {
    rejectUnauthorized: false, // Desativa a verificação de certificado SSL (não recomendado para produção)
  },
});
// Testa a conexão (opcional, mas bom para depuração)
pool.connect((err, client, release) => {
  if (err) {
    return console.error("❌ Erro ao conectar ao banco de dados:", err.stack);
  }
  console.log("✅ Conexão com o banco de dados PostgreSQL estabelecida com sucesso!");
  client.release(); // Libera o cliente de volta para o pool
});

module.exports = pool;

