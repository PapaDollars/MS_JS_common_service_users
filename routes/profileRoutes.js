
// service-users/routes/profileRoutes.js
const express = require('express');
const router = express.Router();
const { Profile } = require('../models');
const { authenticate } = require('../middlewares/authMiddleware');
const { validateProfileUpdate } = require('../middlewares/validators');

// Obtenir le profil de l'utilisateur connecté
router.get('/me', authenticate, async (req, res, next) => {
  try {
    const profile = await Profile.findOne({
      where: { userId: req.user.id }
    });
    
    if (!profile) {
      return res.status(404).json({ error: 'Profil non trouvé' });
    }
    
    res.json(profile);
  } catch (error) {
    next(error);
  }
});

// Mettre à jour le profil de l'utilisateur connecté
router.put('/me', authenticate, validateProfileUpdate, async (req, res, next) => {
  try {
    let profile = await Profile.findOne({
      where: { userId: req.user.id }
    });
    
    if (!profile) {
      // Créer un profil s'il n'existe pas
      profile = await Profile.create({
        userId: req.user.id,
        ...req.body
      });
      
      return res.status(201).json({
        message: 'Profil créé avec succès',
        profile
      });
    }
    
    // Mettre à jour le profil
    await profile.update(req.body);
    
    res.json({
      message: 'Profil mis à jour avec succès',
      profile
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
