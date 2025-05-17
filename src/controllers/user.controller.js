exports.updateProfile = async (req, res) => {
    try {
      const userId = req.user.id;
      const { firstName, lastName, email } = req.body;
      
      const user = await User.findByPk(userId);
      
      if (!user) {
        return res.status(404).json({
          message: 'Utilisateur non trouvé'
        });
      }
      
      // Mettre à jour les champs
      if (firstName !== undefined) user.firstName = firstName;
      if (lastName !== undefined) user.lastName = lastName;
      if (email !== undefined) {
        // Vérifier si l'email est déjà utilisé
        const existingUser = await User.findOne({ 
          where: { 
            email, 
            id: { [db.Sequelize.Op.ne]: userId } 
          } 
        });
        
        if (existingUser) {
          return res.status(400).json({
            message: 'Cet email est déjà utilisé'
          });
        }
        
        user.email = email;
      }
      
      await user.save();
      
      res.json({
        message: 'Profil mis à jour avec succès',
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role
        }
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour du profil:', error);
      
      res.status(500).json({
        message: 'Erreur lors de la mise à jour du profil',
        error: error.message
      });
    }
  };
  
  // Changer le mot de passe
  exports.changePassword = async (req, res) => {
    try {
      const userId = req.user.id;
      const { currentPassword, newPassword } = req.body;
      
      const user = await User.findByPk(userId);
      
      if (!user) {
        return res.status(404).json({
          message: 'Utilisateur non trouvé'
        });
      }
      
      // Vérifier le mot de passe actuel
      const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
      
      if (!isPasswordValid) {
        return res.status(401).json({
          message: 'Mot de passe actuel incorrect'
        });
      }
      
      // Hacher le nouveau mot de passe
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      
      // Mettre à jour le mot de passe
      user.password = hashedPassword;
      await user.save();
      
      res.json({
        message: 'Mot de passe modifié avec succès'
      });
    } catch (error) {
      console.error('Erreur lors du changement de mot de passe:', error);
      
      res.status(500).json({
        message: 'Erreur lors du changement de mot de passe',
        error: error.message
      });
    }
  };
  
  // Vérifier si un token est valide
  exports.verifyToken = async (req, res) => {
    try {
      // Le middleware auth a déjà vérifié le token et ajouté les infos utilisateur
      const userId = req.user.id;
      
      const user = await User.findByPk(userId, {
        attributes: { exclude: ['password'] }
      });
      
      if (!user) {
        return res.status(404).json({
          message: 'Utilisateur non trouvé'
        });
      }
      
      res.json({
        valid: true,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role
        }
      });
    } catch (error) {
      console.error('Erreur lors de la vérification du token:', error);
      
      res.status(500).json({
        message: 'Erreur lors de la vérification du token',
        error: error.message
      });
    }
  };
  
  // Admin: Obtenir tous les utilisateurs
  exports.getAllUsers = async (req, res) => {
    try {
      // Vérifier si l'utilisateur est un admin
      if (req.user.role !== 'admin') {
        return res.status(403).json({
          message: 'Accès refusé'
        });
      }
      
      const users = await User.findAll({
        attributes: { exclude: ['password'] }
      });
      
      res.json({
        users
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des utilisateurs:', error);
      
      res.status(500).json({
        message: 'Erreur lors de la récupération des utilisateurs',
        error: error.message
      });
    }
  };
  
  // Admin: Activer/désactiver un utilisateur
  exports.toggleUserStatus = async (req, res) => {
    try {
      // Vérifier si l'utilisateur est un admin
      if (req.user.role !== 'admin') {
        return res.status(403).json({
          message: 'Accès refusé'
        });
      }
      
      const { userId } = req.params;
      
      const user = await User.findByPk(userId);
      
      if (!user) {
        return res.status(404).json({
          message: 'Utilisateur non trouvé'
        });
      }
      
      // Inverser le statut
      user.isActive = !user.isActive;
      await user.save();
      
      res.json({
        message: `Utilisateur ${user.isActive ? 'activé' : 'désactivé'} avec succès`,
        user: {
          id: user.id,
          username: user.username,
          isActive: user.isActive
        }
      });
    } catch (error) {
      console.error('Erreur lors de la modification du statut:', error);
      
      res.status(500).json({
        message: 'Erreur lors de la modification du statut',
        error: error.message
      });
    }
  };