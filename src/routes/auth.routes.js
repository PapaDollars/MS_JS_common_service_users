const express = require('express');
const router = express.Router();

// Route de santé
router.get('/health', (req, res) => {
    res.status(200).json({ status: 'UP' });
});

// Route de connexion
router.post('/login', (req, res) => {
    const { username, password } = req.body;
    
    if (!username || !password) {
        return res.status(400).json({ error: 'Nom d\'utilisateur et mot de passe requis' });
    }
    
    // Ici, vous pourriez vérifier les identifiants dans une base de données
    if (username === 'admin' && password === 'admin') {
        res.status(200).json({
            message: 'Connexion réussie',
            token: 'fake-jwt-token'
        });
    } else {
        res.status(401).json({ error: 'Identifiants invalides' });
    }
});

module.exports = router;
