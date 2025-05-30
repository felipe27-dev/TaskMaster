const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
require("dotenv").config(); // Mantém para caso o .env seja adicionado depois

// *** CORREÇÃO: Usar o MESMO segredo padrão em ambos os arquivos ***
const JWT_SECRET = process.env.JWT_SECRET || "seu_segredo_super_secreto"; // Alinhado com o middleware

const authController = {
    // Controlador para registrar um novo usuário
    async register(req, res) {
        const { username, email, password } = req.body;

        // Validação básica de entrada
        if (!username || !email || !password) {
            return res.status(400).json({ error: "Nome de usuário, email e senha são obrigatórios." });
        }
        // Removido console.log(JWT_SECRET)

        // Validação simples de formato de email
        const emailRegex = /^[^"]+@[^"]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: "Formato de email inválido." });
        }

        // Validação simples de senha
        if (password.length < 6) {
            return res.status(400).json({ error: "A senha deve ter pelo menos 6 caracteres." });
        }

        try {
            // Verifica se o usuário ou email já existe
            const existingUserByEmail = await User.findByEmail(email);
            if (existingUserByEmail) {
                return res.status(409).json({ error: "Email já cadastrado." });
            }
            const existingUserByUsername = await User.findByUsername(username);
            if (existingUserByUsername) {
                return res.status(409).json({ error: "Nome de usuário já cadastrado." });
            }

            // Cria o usuário no banco de dados
            const newUser = await User.create({ username, email, password });

            // Retorna o usuário sem o hash da senha
            const { password_hash, ...userWithoutPassword } = newUser;

            res.status(201).json({ message: "Usuário registrado com sucesso.", user: userWithoutPassword });

        } catch (error) {
            console.error("Erro no registro:", error);
            if (error.message.includes("já cadastrado")) {
                 return res.status(409).json({ error: error.message });
            }
            res.status(500).json({ error: "Erro interno ao registrar usuário." });
        }
    },

    // Controlador para logar um usuário
    async login(req, res) {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: "Email e senha são obrigatórios." });
        }

        try {
            const user = await User.findByEmail(email);

            if (!user) {
                return res.status(401).json({ error: "Credenciais inválidas." });
            }

            // Compara a senha
            const isMatch = await User.comparePassword(password, user.password_hash);

            if (!isMatch) {
                return res.status(401).json({ error: "Credenciais inválidas." });
            }

            // Gera o token JWT
            const payload = {
                id: user.id, // Certifique-se que 'id' é o nome correto da coluna PK
                username: user.username,
            };

            // *** CORREÇÃO: Aumentado tempo de expiração para teste, mas ideal é sincronizar relógio ***
            const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "10h" }); // Aumentado para 10 horas

            // Retorna o token e informações básicas do usuário
            res.status(200).json({
                message: "Login bem-sucedido!",
                token: token,
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email
                }
            });

        } catch (error) {
            console.error("Erro no login:", error);
            res.status(500).json({ error: "Erro interno ao realizar login." });
        }
    },

    // Controlador para obter o perfil do usuário logado
    async getUserProfile(req, res) {
        if (!req.user) {
            return res.status(404).json({ message: "Usuário não encontrado ou não autenticado." });
        }
        // Retorna os dados do usuário anexados pelo middleware (já sem senha)
        res.status(200).json({
            id: req.user.id,
            username: req.user.username, // Usando username consistentemente
            email: req.user.email
        });
    },

    // Controlador para atualizar o perfil do usuário logado
    async updateUserProfile(req, res) {
        // *** CORREÇÃO: Usar 'username' consistentemente com o model e payload ***
        const { username, email } = req.body;
        const userId = req.userId;

        if (!username && !email) {
            return res.status(400).json({ message: "Nenhum dado fornecido para atualização (nome de usuário ou email)." });
        }

        const updateData = {};
        if (username) updateData.username = username;
        if (email) updateData.email = email;

        try {
            // *** CORREÇÃO: Usar User.findByEmail para verificar email existente ***
            if (email) {
                const existingUser = await User.findByEmail(email);
                // Verifica se o email existe E pertence a um usuário DIFERENTE do atual
                if (existingUser && existingUser.id !== userId) {
                    return res.status(409).json({ message: "Este email já está em uso por outra conta." });
                }
            }

            // *** CORREÇÃO: Usar o método User.update que criamos no model ***
            const updatedUser = await User.update(userId, updateData);

            if (!updatedUser) {
                // User.update retorna null se não encontrar o usuário
                return res.status(404).json({ message: "Usuário não encontrado para atualização." });
            }

            // Retorna o usuário atualizado (User.update já retorna sem senha)
            res.status(200).json({
                message: "Perfil atualizado com sucesso.",
                user: {
                    id: updatedUser.id,
                    username: updatedUser.username,
                    email: updatedUser.email
                }
            });

        } catch (error) {
            console.error("Erro ao atualizar perfil:", error);
            // Trata erro de chave duplicada (email/username único) vindo do User.update
            if (error.message.includes("já está em uso")) {
                 return res.status(409).json({ message: error.message });
            }
            // Trata outros erros
            res.status(500).json({ message: "Erro interno ao atualizar perfil." });
        }
    }
};

module.exports = authController;

