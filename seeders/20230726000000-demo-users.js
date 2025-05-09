
// service-users/seeders/20230726000000-demo-users.js
'use strict';
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const salt = await bcrypt.genSalt(10);
    const adminPassword = await bcrypt.hash('admin123', salt);
    const userPassword = await bcrypt.hash('user123', salt);
    
    const adminId = uuidv4();
    const userId = uuidv4();
    
    // Créer les utilisateurs de test
    await queryInterface.bulkInsert('users', [
      {
        id: adminId,
        username: 'admin',
        email: 'admin@emergent24.com',
        password: adminPassword,
        first_name: 'Admin',
        last_name: 'User',
        role: 'admin',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: userId,
        username: 'user',
        email: 'user@emergent24.com',
        password: userPassword,
        first_name: 'Normal',
        last_name: 'User',
        role: 'user',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      }
    ], {});
    
    // Créer les profils de test
    await queryInterface.bulkInsert('profiles', [
      {
        id: uuidv4(),
        user_id: adminId,
        avatar: 'https://via.placeholder.com/150',
        phone: '+123456789',
        address: '123 Admin St',
        city: 'Admin City',
        country: 'Cameroon',
        postal_code: '12345',
        bio: 'Administrateur du système',
        preferences: JSON.stringify({
          language: 'fr',
          theme: 'dark'
        }),
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        user_id: userId,
        avatar: 'https://via.placeholder.com/150',
        phone: '+987654321',
        address: '456 User St',
        city: 'User City',
        country: 'Cameroon',
        postal_code: '54321',
        bio: 'Utilisateur normal',
        preferences: JSON.stringify({
          language: 'fr',
          theme: 'light'
        }),
        created_at: new Date(),
        updated_at: new Date()
      }
    ], {});
  },
  
  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('profiles', null, {});
    await queryInterface.bulkDelete('users', null, {});
  }
};
