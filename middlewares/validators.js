
// service-users/middlewares/validators.js
const Joi = require('joi');

const validateRegistration = (req, res, next) => {
  const schema = Joi.object({
    username: Joi.string().alphanum().min(3).max(30).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    firstName: Joi.string().allow('', null),
    lastName: Joi.string().allow('', null)
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({
      error: 'Erreur de validation',
      details: error.details.map(e => ({
        field: e.path[0],
        message: e.message
      }))
    });
  }

  next();
};

const validateLogin = (req, res, next) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({
      error: 'Erreur de validation',
      details: error.details.map(e => ({
        field: e.path[0],
        message: e.message
      }))
    });
  }

  next();
};

const validateUserUpdate = (req, res, next) => {
  const schema = Joi.object({
    username: Joi.string().alphanum().min(3).max(30),
    email: Joi.string().email(),
    password: Joi.string().min(6),
    firstName: Joi.string().allow('', null),
    lastName: Joi.string().allow('', null),
    role: Joi.string().valid('user', 'admin'),
    isActive: Joi.boolean()
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({
      error: 'Erreur de validation',
      details: error.details.map(e => ({
        field: e.path[0],
        message: e.message
      }))
    });
  }

  next();
};

const validateProfileUpdate = (req, res, next) => {
  const schema = Joi.object({
    avatar: Joi.string().allow('', null),
    phone: Joi.string().allow('', null),
    address: Joi.string().allow('', null),
    city: Joi.string().allow('', null),
    country: Joi.string().allow('', null),
    postalCode: Joi.string().allow('', null),
    bio: Joi.string().allow('', null),
    preferences: Joi.object().allow(null)
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({
      error: 'Erreur de validation',
      details: error.details.map(e => ({
        field: e.path[0],
        message: e.message
      }))
    });
  }

  next();
};

module.exports = {
  validateRegistration,
  validateLogin,
  validateUserUpdate,
  validateProfileUpdate
};
