'use strict';
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Hacher les mots de passe
    const hashedPassword1 = await bcrypt.hash('password123', 10);
    const hashedPassword2 = await bcrypt.hash('adminpass', 10);
    
    return queryInterface.bulkInsert('users', [
      {
        id: uuidv4(),
        username: 'user1',
        email: 'user1@example.com',
        password: hashedPassword1,
        firstName: 'Jean',
        lastName: 'Dupont',
        role: 'user',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: uuidv4(),
        username: 'admin',
        email: 'admin@example.com',
        password: hashedPassword2,
        firstName: 'Admin',
        lastName: 'User',
        role: 'admin',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('users', null, {});
  }
};