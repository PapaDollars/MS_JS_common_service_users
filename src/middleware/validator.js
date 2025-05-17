const { body, validationResult } = require('express-validator');

// Middleware pour traiter les erreurs de validation
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Erreur de validation',
      errors: errors.array()
    });
  }
  
  next();
};

// Validateurs pour les routes utilisateur
exports.userValidator = {
  register: [
    body('username')
      .isLength({ min: 3, max: 30 })
      .withMessage('Le nom d\'utilisateur doit contenir entre 3 et 30 caractères')
      .isAlphanumeric()
      .withMessage('Le nom d\'utilisateur ne doit contenir que des lettres et des chiffres'),
    
    body('email')
      .isEmail()
      .withMessage('Email invalide'),
    
    body('password')
      .isLength({ min: 6 })
      .withMessage('Le mot de passe doit contenir au moins 6 caractères'),
    
    body('firstName')
      .optional()
      .isLength({ min: 2, max: 50 })
      .withMessage('Le prénom doit contenir entre 2 et 50 caractères'),
    
    body('lastName')
      .optional()
      .isLength({ min: 2, max: 50 })
      .withMessage('Le nom doit contenir entre 2 et 50 caractères'),
    
    handleValidationErrors
  ],
  
  login: [
    body('username')
      .notEmpty()
      .withMessage('Nom d\'utilisateur ou email requis'),
    
    body('password')
      .notEmpty()
      .withMessage('Mot de passe requis'),
    
    handleValidationErrors
  ],
  
  updateProfile: [
    body('email')
      .optional()
      .isEmail()
      .withMessage('Email invalide'),
    
    body('firstName')
      .optional()
      .isLength({ min: 2, max: 50 })
      .withMessage('Le prénom doit contenir entre 2 et 50 caractères'),
    
    body('lastName')
      .optional()
      .isLength({ min: 2, max: 50 })
      .withMessage('Le nom doit contenir entre 2 et 50 caractères'),
    
    handleValidationErrors
  ],
  
  changePassword: [
    body('currentPassword')
      .notEmpty()
      .withMessage('Mot de passe actuel requis'),
    
    body('newPassword')
      .isLength({ min: 6 })
      .withMessage('Le nouveau mot de passe doit contenir au moins 6 caractères'),
    
    handleValidationErrors
  ]
};