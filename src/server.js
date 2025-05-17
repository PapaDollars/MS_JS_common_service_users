const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { Sequelize } = require('sequelize');
const userRoutes = require('./routes/user.routes');
const db = require('./models');
const configService = require('./services/config.service');
const discoveryService = require('./services/discovery.service');

// Charger les variables d'environnement
dotenv.config();

const app = express();
const PORT = process.env.PORT || 8081;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/users', userRoutes);

// Route de base
app.get('/', (req, res) => {
  res.json({
    message: 'Service utilisateurs opérationnel',
    status: 'UP'
  });
});

// Route de santé
app.get('/health', (req, res) => {
  res.json({
    status: 'UP'
  });
});

// Initialiser le service
const initializeService = async () => {
  try {
    // Récupérer la configuration depuis le service de configuration
    const config = await configService.getServiceConfig('service-users');
    console.log('Configuration récupérée:', config);
    
    // Synchroniser la base de données
    await db.sequelize.sync();
    console.log('Base de données synchronisée');
    
    // Démarrer le serveur
    app.listen(PORT, async () => {
      console.log(`Service utilisateurs démarré sur le port ${PORT}`);
      
      // Enregistrer le service dans le registre
      await discoveryService.registerService({
        name: process.env.SERVICE_NAME,
        instanceId: process.env.INSTANCE_ID,
        url: 'http://localhost',
        port: PORT,
        status: 'UP'
      });
      
      // Envoyer un heartbeat périodique au registre
      setInterval(() => {
        discoveryService.sendHeartbeat(process.env.SERVICE_NAME, process.env.INSTANCE_ID);
      }, 30000);
    });
  } catch (error) {
    console.error('Erreur lors de l\'initialisation du service:', error);
  }
};

// Gérer la fermeture gracieuse
process.on('SIGINT', async () => {
  try {
    await discoveryService.deregisterService(process.env.SERVICE_NAME, process.env.INSTANCE_ID);
    console.log('Service désenregistré avec succès');
    process.exit(0);
  } catch (error) {
    console.error('Erreur lors du désenregistrement:', error);
    process.exit(1);
  }
});

// Initialiser le service
initializeService();