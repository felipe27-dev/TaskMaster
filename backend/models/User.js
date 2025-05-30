const pool = require('../database/db');
const bcrypt = require('bcrypt');

const User = {
    // Encontra um usuário pelo email
    async findByEmail(email) {
        const query = 'SELECT * FROM users WHERE email = $1';
        try {
            const { rows } = await pool.query(query, [email]);
            return rows[0];
        } catch (error) {
            console.error('Erro ao buscar usuário por email:', error);
            throw error;
        }
    },

    // Encontra um usuário pelo nome de usuário
    async findByUsername(username) {
        const query = 'SELECT * FROM users WHERE username = $1';
        try {
            const { rows } = await pool.query(query, [username]);
            return rows[0];
        } catch (error) {
            console.error('Erro ao buscar usuário por username:', error);
            throw error;
        }
    },

    // *** NOVA FUNÇÃO ***
    // Encontra um usuário pelo ID
    async findById(id) {
        // Certifique-se que o ID é tratado corretamente (ex: número inteiro se for o caso)
        const query = 'SELECT id, username, email, created_at, updated_at FROM users WHERE id = $1'; // Exclui password_hash
        try {
            const { rows } = await pool.query(query, [id]);
            return rows[0]; // Retorna o usuário encontrado ou undefined
        } catch (error) {
            console.error('Erro ao buscar usuário por ID:', error);
            throw error;
        }
    },

    // Cria um novo usuário
    async create({ username, email, password }) {
        // Gera o hash da senha
        const saltRounds = 10;
        const password_hash = await bcrypt.hash(password, saltRounds);

        const query = `
            INSERT INTO users (username, email, password_hash)
            VALUES ($1, $2, $3)
            RETURNING id, username, email, created_at, updated_at;
        `;
        const values = [username, email, password_hash];

        try {
            const { rows } = await pool.query(query, values); // Retorna o usuário recém-criado (sem o hash da senha)
            return rows[0];
        } catch (error) {
            console.error('Erro ao criar usuário:', error);
            // Verifica se o erro é de violação de constraint UNIQUE
            if (error.code === '23505') { // Código de erro do PostgreSQL para unique_violation
                if (error.constraint && error.constraint.includes('email')) { // Verifica se a constraint contém 'email'
                    throw new Error('Email já cadastrado.');
                }
                if (error.constraint && error.constraint.includes('username')) { // Verifica se a constraint contém 'username'
                    throw new Error('Nome de usuário já cadastrado.');
                }
            }
            throw error; // Re-lança outros erros
        }
    },

    // Compara a senha fornecida com o hash armazenado
    async comparePassword(plainPassword, hashedPassword) {
        try {
            return await bcrypt.compare(plainPassword, hashedPassword);
        } catch (error) {
            console.error('Erro ao comparar senhas:', error);
            throw error;
        }
    },

    // *** NOVA FUNÇÃO (para updateUserProfile no authController) ***
    // Atualiza dados do usuário (excluindo senha)
    async update(id, { username, email }) { // Recebe apenas campos permitidos
        const fieldsToUpdate = [];
        const values = [];
        let queryIndex = 1;

        if (username !== undefined) {
            fieldsToUpdate.push(`username = $${queryIndex++}`);
            values.push(username);
        }
        if (email !== undefined) {
            fieldsToUpdate.push(`email = $${queryIndex++}`);
            values.push(email);
        }

        if (fieldsToUpdate.length === 0) {
            // Se nada for passado para atualizar, busca e retorna o usuário atual
            return this.findById(id);
        }

        values.push(id); // Adiciona o ID como último valor para a cláusula WHERE

        const query = `
            UPDATE users
            SET ${fieldsToUpdate.join(', ')}, updated_at = CURRENT_TIMESTAMP
            WHERE id = $${queryIndex}
            RETURNING id, username, email, created_at, updated_at;
        `;

        try {
            const { rows } = await pool.query(query, values);
            if (rows.length === 0) {
                return null; // Usuário não encontrado com esse ID
            }
            return rows[0]; // Retorna o usuário atualizado
        } catch (error) {
            console.error('Erro ao atualizar usuário:', error);
             // Verifica se o erro é de violação de constraint UNIQUE
            if (error.code === '23505') {
                if (error.constraint && error.constraint.includes('email')) {
                    throw new Error('Email já está em uso por outra conta.');
                }
                if (error.constraint && error.constraint.includes('username')) {
                    throw new Error('Nome de usuário já está em uso por outra conta.');
                }
            }
            throw error;
        }
    }
};

module.exports = User;

