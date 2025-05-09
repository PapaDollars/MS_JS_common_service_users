
// service-users/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { User, Profile } = require('../models');
const { validateRegistration, validateLogin } = require('../middlewares/validators');
const { authenticate } = require('../middlewares/authMiddleware');

// Enregistrement d'un nouvel utilisateur
router.post('/register', validateRegistration, async (req, res, next) => {
  try {
    const { username, email, password, firstName, lastName } = req.body;

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await User.findOne({
      where: {
        [User.sequelize.Op.or]: [
          { username },
          { email }
        ]
      }
    });

    if (existingUser) {
      return res.status(409).json({ error: 'Nom d\'utilisateur ou email déjà utilisé' });
    }

    // Créer l'utilisateur
    const user = await User.create({
      username,
      email,
      password,
      firstName,
      lastName
    });

    // Créer le profil associé
    await Profile.create({
      userId: user.id
    });

    // Générer un token JWT
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET || (global.app && global.app.locals.config && global.app.locals.config.jwt.secret),
      { expiresIn: process.env.JWT_EXPIRES_IN || (global.app && global.app.locals.config && global.app.locals.config.jwt.expiresIn) || 86400 }
    );

    res.status(201).json({
      message: 'Utilisateur créé avec succès',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role
      },
      token
    });
  } catch (error) {
    next(error);
  }
});

// Connexion utilisateur
router.post('/login', validateLogin, async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Trouver l'utilisateur par email
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
    }

    // Vérifier si l'utilisateur est actif
    if (!user.isActive) {
      return res.status(403).json({ error: 'Compte utilisateur désactivé' });
    }

    // Vérifier le mot de passe
    const isPasswordValid = await user.isValidPassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
    }

    // Mettre à jour la date de dernière connexion
    user.lastLogin = new Date();
    await user.save();

    // Générer un token JWT
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET || (global.app && global.app.locals.config && global.app.locals.config.jwt.secret),
      { expiresIn: process.env.JWT_EXPIRES_IN || (global.app && global.app.locals.config && global.app.locals.config.jwt.expiresIn) || 86400 }
    );

    res.json({
      message: 'Connexion réussie',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role
      },
      token
    });
  } catch (error) {
    next(error);
  }
});

// Vérifier le token JWT
router.get('/verify', authenticate, (req, res) => {
  res.json({
    user: {
      id: req.user.id,
      username: req.user.username,
      email: req.user.email,
      firstName: req.user.firstName,
      lastName: req.user.lastName,
      role: req.user.role
    }
  });
});

// Déconnexion (côté client, suppression du token)
router.post('/logout', (req, res) => {
  res.json({ message: 'Déconnexion réussie' });
});

module.exports = router;
