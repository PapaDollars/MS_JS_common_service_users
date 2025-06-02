const express = require('express');
const router = express.Router();

// Route de santé
router.get('/health', (req, res) => {
    res.status(200).json({ status: 'UP' });
});

// Route pour obtenir tous les utilisateurs
router.get('/', (req, res) => {
    // Ici, vous pourriez récupérer les utilisateurs depuis une base de données
    res.status(200).json({
        users: [
            { id: 1, username: 'admin', role: 'ADMIN' },
            { id: 2, username: 'user', role: 'USER' }
        ]
    });
});

// Route pour obtenir un utilisateur par ID
router.get('/:id', (req, res) => {
    const { id } = req.params;
    
    // Ici, vous pourriez récupérer l'utilisateur depuis une base de données
    if (id === '1') {
        res.status(200).json({
            id: 1,
            username: 'admin',
            role: 'ADMIN'
        });
    } else if (id === '2') {
        res.status(200).json({
            id: 2,
            username: 'user',
            role: 'USER'
        });
    } else {
        res.status(404).json({ error: 'Utilisateur non trouvé' });
    }
});

module.exports = router;
