const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';

/**
 * Utilitaires pour la génération et la vérification des tokens JWT
 */
const jwtUtils = {
  /**
   * Générer un token JWT
   * @param {Object} payload - Données à inclure dans le token
   * @returns {string} Token JWT
   */
  generateToken(payload) {
    return jwt.sign(payload, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN
    });
  },
  
  /**
   * Vérifier un token JWT
   * @param {string} token - Token à vérifier
   * @returns {Object|null} Payload décodé ou null si invalide
   */
  verifyToken(token) {
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch (error) {
      console.error('Erreur de vérification JWT:', error.message);
      return null;
    }
  }
};

module.exports = jwtUtils;