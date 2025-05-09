
// service-users/middlewares/errorHandler.js
const winston = require('winston');

const errorHandler = (err, req, res, next) => {
  const logger = winston.createLogger({
    level: 'error',
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json()
    ),
    defaultMeta: { service: 'service-users', correlationId: req.correlationId },
    transports: [
      new winston.transports.Console(),
      new winston.transports.File({ filename: 'logs/error.log' })
    ]
  });

  logger.error(`${err.name}: ${err.message}`, { stack: err.stack });

  // Erreurs de validation Sequelize
  if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
    return res.status(400).json({
      error: 'Erreur de validation',
      details: err.errors.map(e => ({
        field: e.path,
        message: e.message
      }))
    });
  }

  // Erreurs de validation Joi
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Erreur de validation',
      details: err.details.map(e => ({
        field: e.path[0],
        message: e.message
      }))
    });
  }

  // Erreurs HTTP personnalisées
  if (err.statusCode) {
    return res.status(err.statusCode).json({ error: err.message });
  }

  // Erreur par défaut
  res.status(500).json({ error: 'Erreur interne du serveur' });
};

module.exports = {
  errorHandler
};
