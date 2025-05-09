
// service-users/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const { User, Profile } = require('../models');
const { authenticate, isAdmin } = require('../middlewares/authMiddleware');
const { validateUserUpdate } = require('../middlewares/validators');

// Obtenir tous les utilisateurs (admin seulement)
router.get('/', authenticate, isAdmin, async (req, res, next) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password'] },
      include: [
        {
          model: Profile,
          as: 'profile'
        }
      ]
    });
    
    res.json(users);
  } catch (error) {
    next(error);
  }
});

// Obtenir un utilisateur par ID
router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Vérifier si l'utilisateur demande ses propres infos ou est admin
    if (req.user.id !== id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Accès non autorisé' });
    }
    
    const user = await User.findByPk(id, {
      attributes: { exclude: ['password'] },
      include: [
        {
          model: Profile,
          as: 'profile'
        }
      ]
    });
    
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }
    
    res.json(user);
  } catch (error) {
    next(error);
  }
});

// Mettre à jour un utilisateur
router.put('/:id', authenticate, validateUserUpdate, async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Vérifier si l'utilisateur met à jour ses propres infos ou est admin
    if (req.user.id !== id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Accès non autorisé' });
    }
    
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }
    
    // Seul un admin peut changer le rôle ou le statut actif
    if (req.body.role && req.user.role !== 'admin') {
      delete req.body.role;
    }
    
    if (req.body.isActive !== undefined && req.user.role !== 'admin') {
      delete req.body.isActive;
    }
    
    // Mise à jour de l'utilisateur
    await user.update(req.body);
    
    res.json({
      message: 'Utilisateur mis à jour avec succès',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        isActive: user.isActive
      }
    });
  } catch (error) {
    next(error);
  }
});

// Supprimer un utilisateur (soft delete)
router.delete('/:id', authenticate, async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Vérifier si l'utilisateur supprime son propre compte ou est admin
    if (req.user.id !== id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Accès non autorisé' });
    }
    
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }
    
    // Supprimer l'utilisateur (soft delete)
    await user.destroy();
    
    res.json({ message: 'Utilisateur supprimé avec succès' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
