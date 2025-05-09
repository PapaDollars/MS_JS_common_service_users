// service-users/server.js
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const winston = require('winston');
const dotenv = require('dotenv');
const { v4: uuidv4 } = require('uuid');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Importer les routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const profileRoutes = require('./routes/profileRoutes');

// Importer les middlewares
const { errorHandler } = require('./middlewares/errorHandler');

// Charger les variables d'environnement
dotenv.config();

const app = express();
const PORT = process.env.PORT || 8081;
const CONFIG_SERVICE_URL = process.env.CONFIG_SERVICE_URL || 'http://localhost:8888';
const REGISTRY_SERVICE_URL = process.env.REGISTRY_SERVICE_URL || 'http://localhost:8761';
const ENVIRONMENT = process.env.NODE_ENV || 'dev';

// Configuration du logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  defaultMeta: { service: 'service-users' },
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' })
  ]
});

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Limiter le taux de requêtes
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limite chaque IP à 100 requêtes par fenêtre
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Middleware pour ajouter un ID de corrélation à chaque requête
app.use((req, res, next) => {
  req.correlationId = req.headers['x-correlation-id'] || uuidv4();
  res.setHeader('x-correlation-id', req.correlationId);
  next();
});

// Fonction pour charger la configuration
const loadConfig = async () => {
  try {
    const response = await axios.get(`${CONFIG_SERVICE_URL}/config/service-users/${ENVIRONMENT}`);
    app.locals.config = response.data;
    logger.info('Configuration chargée avec succès');
    
    // Initialiser la base de données après avoir chargé la configuration
    const db = require('./models');
    await db.sequelize.authenticate();
    logger.info('Connexion à la base de données établie avec succès');
    
  } catch (error) {
    logger.error(`Erreur lors du chargement de la configuration: ${error.message}`);
    setTimeout(loadConfig, 10000); // Réessayer après 10 secondes
  }
};

// Route de santé pour les health checks
app.get('/health', (req, res) => {
  res.json({ status: 'UP' });
});

// Installer les routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/profiles', profileRoutes);

// Middleware de gestion des erreurs
app.use(errorHandler);

// Démarrer le serveur
app.listen(PORT, async () => {
  logger.info(`Service Users démarré sur le port ${PORT}`);
  
  // Charger la configuration initiale
  await loadConfig();
  
  // S'enregistrer auprès du service de découverte
  registerWithDiscoveryService();
});

// Fonction pour s'enregistrer auprès du service de découverte
const registerWithDiscoveryService = async () => {
  try {
    const response = await axios.post(`${REGISTRY_SERVICE_URL}/register`, {
      name: 'service-users',
      host: process.env.HOST || 'localhost',
      port: PORT,
      healthCheckUrl: `http://${process.env.HOST || 'localhost'}:${PORT}/health`
    });
    
    const serviceId = response.data.id;
    logger.info(`Enregistré avec succès auprès du service de découverte, ID: ${serviceId}`);
    
    // Envoyer des heartbeats périodiques
    setInterval(async () => {
      try {
        await axios.put(`${REGISTRY_SERVICE_URL}/heartbeat/${serviceId}`);
      } catch (error) {
        logger.error(`Erreur lors de l'envoi du heartbeat: ${error.message}`);
      }
    }, 30000); // Toutes les 30 secondes
    
    // Désinscription lors de l'arrêt de l'application
    const cleanup = async () => {
      try {
        await axios.delete(`${REGISTRY_SERVICE_URL}/unregister/${serviceId}`);
        logger.info('Désinscrit avec succès du service de découverte');
        process.exit(0);
      } catch (error) {
        logger.error(`Erreur lors de la désinscription: ${error.message}`);
        process.exit(1);
      }
    };
    
    process.on('SIGINT', cleanup);
    process.on('SIGTERM', cleanup);
    
  } catch (error) {
    logger.error(`Erreur lors de l'enregistrement auprès du service de découverte: ${error.message}`);
    setTimeout(registerWithDiscoveryService, 10000); // Réessayer après 10 secondes
  }
};
