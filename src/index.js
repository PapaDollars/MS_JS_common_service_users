const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const winston = require('winston');
const axios = require('axios');
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8003;
const CONFIG_SERVICE_URL = process.env.CONFIG_SERVICE_URL || 'http://localhost:8001';

// Configuration du logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
    new winston.transports.Console({ format: winston.format.simple() })
  ]
});

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// Démarrage du serveur
app.listen(PORT, async () => {
  logger.info(`Service Users démarré sur le port ${PORT}`);
  
  // S'enregistrer auprès du service de configuration
  try {
    await axios.post(`${CONFIG_SERVICE_URL}/api/config/register`, {
      name: 'service-users',
      host: 'localhost',
      port: PORT,
      healthUrl: `http://localhost:${PORT}/api/users/health`
    });
    logger.info('Enregistré avec succès auprès du service de configuration');
  } catch (error) {
    logger.error('Erreur lors de l\'enregistrement auprès du service de configuration', error);
  }
});