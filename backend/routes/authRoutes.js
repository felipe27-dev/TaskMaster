const express = require("express");
const authController = require("../controllers/authController");
// Importa o middleware de verificação de token
// Certifique-se que o caminho para o middleware está correto
const { verifyToken } = require("../middleware/authMiddleware");

const router = express.Router();

// Rota para registro de usuário (pública)
router.post("/register", authController.register);

// Rota para login de usuário (pública)
router.post("/login", authController.login);

// --- NOVAS ROTAS PROTEGIDAS PARA PERFIL ---

// Rota para obter o perfil do usuário logado (protegida)
// GET /api/auth/me (ou o prefixo que você usa para authRoutes)
router.get("/me", verifyToken, authController.getUserProfile);

// Rota para atualizar o perfil do usuário logado (protegida)
// PUT /api/auth/me (ou o prefixo que você usa para authRoutes)
router.put("/me", verifyToken, authController.updateUserProfile);


// Exemplo de outra rota protegida que você pode adicionar depois
// router.get('/alguma-outra-rota-protegida', verifyToken, (req, res) => {
//     // req.user contém os dados do usuário obtidos pelo middleware
//     res.status(200).json({ message: "Acesso concedido!", user: req.user });
// });

module.exports = router;

