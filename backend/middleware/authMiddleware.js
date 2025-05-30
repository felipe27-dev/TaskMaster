const jwt = require("jsonwebtoken");
const User = require("../models/User"); 

// Certifique-se de ter uma variável de ambiente ou configuração para JWT_SECRET
// Use o mesmo segredo que está no authController.js!
const JWT_SECRET = process.env.JWT_SECRET || "seu_segredo_super_secreto"; // Use uma variável de ambiente em produção!

const verifyToken = async (req, res, next) => {
    // 1. Obter o token do cabeçalho Authorization
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Acesso negado. Nenhum token fornecido ou formato inválido." });
    }

    const token = authHeader.split(" ")[1];

    try {
        // 2. Verificar o token usando o segredo
        // Adicionando tolerância de clock como paliativo para pequenas dessincronizações
        const decoded = jwt.verify(token, JWT_SECRET, { clockTolerance: 60 }); // Tolera 60 segundos

        // 3. Verificar se o usuário do token ainda existe no banco de dados
        // *** AJUSTE: Usar a função findById do seu modelo User.js ***
        const user = await User.findById(decoded.id); // decoded.id vem do payload do token

        if (!user) {
            // User.findById retorna undefined se não encontrar
            return res.status(401).json({ message: "Token inválido - usuário não encontrado." });
        }

        // 4. Anexar os dados do usuário (já sem senha, pois findById não a retorna) ao objeto req
        req.user = user; // Agora req.user contém o objeto do usuário retornado pelo seu model
        req.userId = user.id; // Garante que req.userId tenha o ID correto do banco

        next(); // Passa para o próximo middleware ou rota
    } catch (error) {
        console.error("Erro na verificação do token:", error.message);
        if (error.name === "JsonWebTokenError") {
            return res.status(401).json({ message: "Token inválido." });
        }
        if (error.name === "TokenExpiredError") {
            // O erro de expiração agora considera a clockTolerance
            return res.status(401).json({ message: "Token expirado." });
        }
        // Trata outros erros que podem ocorrer na busca do usuário, etc.
        return res.status(500).json({ message: "Falha na autenticação do token." });
    }
};

module.exports = { verifyToken };

