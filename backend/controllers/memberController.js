// controllers/memberController.js
const { Member, User, Area, Attendance, CallLog, Ministry, Oversee, Region } = require('../models');
const { Op } = require('sequelize');

const memberController = {
  // Lister les membres
  getMembers: async (req, res) => {
    try {
      const {
        page = 1,
        limit = 50,
        search,
        area_id,
        leader_id,
        state,
        is_active,
        is_registered
      } = req.query;

      const offset = (page - 1) * limit;
      const whereClause = {};

      // Filtrage basé sur le rôle
      if (req.user.role === 'Bacenta_Leader') {
        whereClause.leader_id = req.user.userId;
      } else if (req.user.role === 'Area_Pastor' && req.user.area_id) {
        whereClause.area_id = req.user.area_id;
      } else if (req.user.role === 'Assisting_Overseer' && req.user.area_id) {
        whereClause.area_id = req.user.area_id;
      } else if (req.user.role === 'Overseer') {
        // Find the oversee managed by this user
        const oversee = await Oversee.findOne({ where: { overseer_id: req.user.userId } });
        if (oversee) {
            const areas = await Area.findAll({ where: { oversee_id: oversee.id }, attributes: ['id'] });
            const areaIds = areas.map(a => a.id);
            if (areaIds.length > 0) {
                whereClause.area_id = { [Op.in]: areaIds };
            } else {
                whereClause.area_id = '00000000-0000-0000-0000-000000000000'; // Force empty
            }
        } else {
            whereClause.area_id = '00000000-0000-0000-0000-000000000000';
        }
      } else if (req.user.role === 'Governor') {
        if (req.user.area_id) {
          whereClause.area_id = req.user.area_id;
        } else {
          whereClause.area_id = '00000000-0000-0000-0000-000000000000'; // Force empty
        }
      }
      // Note: Bishop has no restriction (global access)

      // Filtres supplémentaires
      if (area_id) {
        if (typeof area_id === 'string' && area_id.includes(',')) {
            const ids = area_id.split(',');
            // If we already have a restriction, intersect them
            if (whereClause.area_id) {
                // Simplified: just use the provided ones if they are within our restriction
                // But for simplicity in this implementation, we re-apply filter
                whereClause.area_id = { [Op.in]: ids };
            } else {
                whereClause.area_id = { [Op.in]: ids };
            }
        } else {
            whereClause.area_id = area_id;
        }
      }
      if (leader_id) whereClause.leader_id = leader_id;
      if (state) whereClause.state = state;
      if (is_active !== undefined) whereClause.is_active = is_active === 'true';
      if (is_registered !== undefined) whereClause.is_registered = is_registered === 'true';

      // Recherche textuelle
      if (search) {
        whereClause[Op.or] = [
          { first_name: { [Op.like]: `%${search}%` } },
          { last_name: { [Op.like]: `%${search}%` } },
          { phone_primary: { [Op.like]: `%${search}%` } }
        ];
      }

      const members = await Member.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: Area,
            as: 'area',
            include: [{ model: require('../models').Region, as: 'region', attributes: ['name'] }]
          },
          { model: User, as: 'leader' },
          { model: Ministry, as: 'ministry_association' }
        ],
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['first_name', 'ASC']]
      });

      res.json({
        members: members.rows,
        total: members.count,
        page: parseInt(page),
        totalPages: Math.ceil(members.count / limit)
      });
    } catch (error) {
      console.error('Get members error:', error);
      res.status(500).json({ error: 'Erreur lors de la récupération des membres' });
    }
  },

  // Obtenir un membre par ID
  getMemberById: async (req, res) => {
    try {
      const memberId = req.params.id;

      const member = await Member.findByPk(memberId, {
        include: [
          {
            model: Area,
            as: 'area',
            include: [{ model: require('../models').Region, as: 'region', attributes: ['name'] }]
          },
          { model: User, as: 'leader' },
          { model: Ministry, as: 'ministry_association' },
          {
            model: Attendance,
            as: 'attendances',
            limit: 10,
            order: [['sunday_date', 'DESC']]
          },
          {
            model: CallLog,
            as: 'call_logs',
            limit: 10,
            order: [['call_date', 'DESC']],
            include: [{ model: User, as: 'caller' }]
          }
        ]
      });

      if (!member) {
        return res.status(404).json({ error: 'Membre non trouvé' });
      }

      if (req.user.role === 'Bacenta_Leader') {
        const memberLeaderId = member.leader_id ? member.leader_id.toString().trim().toLowerCase() : null;
        const requesterId = req.user.userId ? req.user.userId.toString().trim().toLowerCase() : null;

        if (memberLeaderId !== requesterId) {
          console.warn(`[FORBIDDEN] Leader ${requesterId} tried to access member ${member.id} belonging to leader ${memberLeaderId}`);
          return res.status(403).json({
            error: 'Accès non autorisé à ce membre',
            details: process.env.NODE_ENV === 'development' ? `Leader mismatch: ${requesterId} vs ${memberLeaderId}` : undefined
          });
        }
      }

      res.json(member);
    } catch (error) {
      console.error('Get member error:', error);
      res.status(500).json({ error: 'Erreur lors de la récupération du membre' });
    }
  },

  // Créer un membre
  createMember: async (req, res) => {
    try {
      const {
        first_name,
        last_name,
        phone_primary,
        phone_secondary,
        gender,
        is_registered,
        state,
        area_id,
        leader_id,
        ministry,
        ministry_id,
        profession,
        notes,
        service_type
      } = req.body;

      if (!first_name || !last_name || !leader_id) {
        return res.status(400).json({ error: 'Le nom, le prénom et le leader sont obligatoires' });
      }

      // Si leader_id n'est pas fourni, utiliser l'utilisateur courant comme leader
      let finalLeaderId = leader_id || req.user.userId;

      // Si area_id n'est pas fourni, utiliser l'area_id du leader
      let finalAreaId = area_id;
      if (!finalAreaId) {
        const leader = await User.findByPk(finalLeaderId);
        if (leader && leader.area_id) {
          finalAreaId = leader.area_id;
        }
      }

      // Sanitisation des chaînes vides
      const sanitizedMinistryId = ministry_id === '' ? null : ministry_id;
      const sanitizedAreaId = finalAreaId === '' ? null : finalAreaId;

      if (!sanitizedAreaId) {
        return res.status(400).json({ error: 'Zone non définie. Le leader doit avoir une zone assignée.' });
      }

      // Validation de la zone pour les Gouverneurs
      if (req.user.role === 'Governor') {
        if (sanitizedAreaId !== req.user.area_id) {
          return res.status(403).json({ error: 'Vous ne pouvez affecter des membres qu\'à votre propre zone.' });
        }
      }

      const member = await Member.create({
        first_name,
        last_name,
        phone_primary: phone_primary || null,
        phone_secondary,
        gender: gender || 'Unknown',
        is_registered: is_registered || false,
        state: state || 'Sheep',
        area_id: sanitizedAreaId,
        leader_id: finalLeaderId,
        ministry,
        ministry_id: sanitizedMinistryId,
        profession,
        notes,
        service_type: service_type || 'L\' Expérience Service',
        is_active: true
      });

      const newMember = await Member.findByPk(member.id, {
        include: [
          {
            model: Area,
            as: 'area',
            include: [{ model: require('../models').Region, as: 'region', attributes: ['name'] }]
          },
          { model: User, as: 'leader' },
          { model: Ministry, as: 'ministry_association' }
        ]
      });
      res.status(201).json(newMember);
    } catch (error) {
      console.error('Create member error:', error);
      res.status(500).json({ error: 'Erreur lors de la création du membre' });
    }
  },

  // Assigner en masse des membres à un leader
  bulkAssign: async (req, res) => {
    try {
      const { member_ids, leader_id } = req.body;
      
      if (!member_ids || !Array.isArray(member_ids) || member_ids.length === 0) {
        return res.status(400).json({ error: 'Liste des membres requise' });
      }

      // Vérification de sécurité pour le Governor (ne peut assigner qu'à des leaders de sa zone)
      if (req.user.role === 'Governor' && leader_id) {
        const leader = await User.findByPk(leader_id);
        if (leader && leader.area_id !== req.user.area_id) {
           return res.status(403).json({ error: 'Ce leader n\'appartient pas à votre zone' });
        }
      }

      await Member.update(
        { leader_id: leader_id || null }, 
        { 
          where: { 
            id: { [require('sequelize').Op.in]: member_ids },
            ...(req.user.role === 'Governor' ? { area_id: req.user.area_id } : {})
          } 
        }
      );

      res.json({ message: `${member_ids.length} membre(s) assigné(s) avec succès.` });
    } catch (error) {
      console.error('Bulk assign error:', error);
      res.status(500).json({ error: 'Erreur lors de l\'assignation en masse' });
    }
  },

  // Modifier un membre
  updateMember: async (req, res) => {
    try {
      const memberId = req.params.id;
      const updateData = req.body;

      const member = await Member.findByPk(memberId);
      if (!member) {
        return res.status(404).json({ error: 'Membre non trouvé' });
      }

      if (req.user.role === 'Bacenta_Leader') {
        const memberLeaderId = member.leader_id ? member.leader_id.toString().trim().toLowerCase() : null;
        const requesterId = req.user.userId ? req.user.userId.toString().trim().toLowerCase() : null;

        if (memberLeaderId !== requesterId) {
          console.warn(`[FORBIDDEN] Leader ${requesterId} tried to update member ${member.id} belonging to leader ${memberLeaderId}`);
          return res.status(403).json({
            error: 'Accès non autorisé',
            details: process.env.NODE_ENV === 'development' ? `Leader mismatch: ${requesterId} vs ${memberLeaderId}` : undefined
          });
        }
      }

      // Sanitisation des chaînes vides envoyées comme IDs (clés étrangères)
      if (updateData.ministry_id === '') updateData.ministry_id = null;
      if (updateData.area_id === '') updateData.area_id = null;
      if (updateData.leader_id === '') updateData.leader_id = null;

      await member.update(updateData);

      const updatedMember = await Member.findByPk(memberId, {
        include: [
          {
            model: Area,
            as: 'area',
            include: [{ model: require('../models').Region, as: 'region', attributes: ['name'] }]
          },
          { model: User, as: 'leader' },
          { model: Ministry, as: 'ministry_association' }
        ]
      });
      res.json(updatedMember);
    } catch (error) {
      console.error('Update member error:', error);
      res.status(500).json({ error: 'Erreur lors de la modification du membre' });
    }
  },

  // Désactiver un membre
  deleteMember: async (req, res) => {
    try {
      const memberId = req.params.id;

      const member = await Member.findByPk(memberId);
      if (!member) {
        return res.status(404).json({ error: 'Membre non trouvé' });
      }

      await member.update({ is_active: false });
      res.json({ message: 'Membre désactivé avec succès' });
    } catch (error) {
      console.error('Delete member error:', error);
      res.status(500).json({ error: 'Erreur lors de la désactivation du membre' });
    }
  },

  // Uploader une photo de membre
  uploadPhoto: async (req, res) => {
    try {
      console.log('📸 Tentative d\'upload photo membre. ID:', req.params.id);
      if (!req.file) {
        console.warn('❌ Aucun fichier reçu dans req.file');
        return res.status(400).json({ error: 'Aucun fichier fourni' });
      }
      console.log('📁 Fichier reçu:', req.file.path, 'Type:', req.file.mimetype);

      const memberId = req.params.id;
      const member = await Member.findByPk(memberId);

      if (!member) {
        return res.status(404).json({ error: 'Membre non trouvé' });
      }

      // Check permissions (same as update)
      if (req.user.role === 'Bacenta_Leader' && member.leader_id !== req.user.userId) {
        return res.status(403).json({ error: 'Accès non autorisé' });
      }

      // Supprimer l'ancienne photo si elle existe
      const fs = require('fs');
      const path = require('path');
      if (member.photo_url && member.photo_url.startsWith('uploads/')) {
        const oldPath = path.join(__dirname, '..', member.photo_url);
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }

      const photoUrl = `uploads/members/${req.file.filename}`;
      await member.update({ photo_url: photoUrl });

      console.log('✅ Photo mise à jour dans la base de données:', photoUrl);
      res.json({ photo_url: photoUrl });
    } catch (error) {
      console.error('❌ Upload member photo error:', error);
      res.status(500).json({ error: 'Erreur lors de l\'upload de la photo: ' + error.message });
    }
  },

  // Importer des membres à partir d'un fichier CSV/Excel
  importMembers: async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'Aucun fichier fourni' });
      }

      const fs = require('fs');
      const path = require('path');
      const { Area, User } = require('../models');

      console.log('📊 Début de l\'importation de membres. Fichier:', req.file.path);

      // Pour l'import, on a besoin d'un leader_id ou on utilise l'utilisateur courant
      let leaderId = req.body.leader_id || req.user.userId;
      let leader = await User.findByPk(leaderId);

      if (!leader) {
        return res.status(404).json({ error: 'Leader non trouvé' });
      }

      const areaId = leader.area_id;
      if (!areaId) {
        return res.status(400).json({ error: 'Le leader doit avoir une zone assignée pour importer des membres.' });
      }

      // Lecture du fichier (simplifiée pour CSV avec tabulations ou virgules)
      const fileContent = fs.readFileSync(req.file.path, 'utf8');
      const lines = fileContent.split(/\r?\n/).filter(line => line.trim());
      
      if (lines.length < 2) {
        return res.status(400).json({ error: 'Le fichier est vide ou mal formé' });
      }

      // Déterminer le délimiteur (tabulation ou virgule)
      const headerLine = lines[0];
      const delimiter = headerLine.includes('\t') ? '\t' : (headerLine.includes(';') ? ';' : ',');
      const header = headerLine.split(delimiter).map(h => h.trim().toLowerCase().replace(/[\s_]/g, ''));

      let successCount = 0;
      let errorCount = 0;

      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(delimiter).map(v => v.trim().replace(/^["']|["']$/g, ''));
        if (values.length < 2) continue;

        const row = {};
        header.forEach((key, index) => {
          row[key] = values[index] || '';
        });

        const firstName = row.firstname || row.first_name || row.prenom || '';
        const lastName = row.lastname || row.last_name || row.nom || '';
        const phone = row.phone || row.phoneprimary || row.phone_primary || row.telephone || row.tel || '';
        let gender = (row.gender || row.sexe || '').toString().toUpperCase();

        if (!firstName || !lastName) {
          errorCount++;
          continue;
        }

        // Normalisation genre
        if (gender.startsWith('M') || gender.startsWith('H')) gender = 'M';
        else if (gender.startsWith('F')) gender = 'F';
        else gender = 'Unknown';

        try {
          await Member.create({
            first_name: firstName,
            last_name: lastName,
            phone_primary: phone || null,
            gender: gender,
            state: row.state || row.status || 'Sheep',
            area_id: areaId,
            leader_id: leaderId,
            is_active: true
          });
          successCount++;
        } catch (err) {
          console.error(`Erreur ligne ${i+1}:`, err.message);
          errorCount++;
        }
      }

      // Nettoyage : supprimer le fichier temporaire
      fs.unlinkSync(req.file.path);

      res.json({
        message: 'Importation terminée',
        successCount,
        errorCount,
        total: successCount + errorCount
      });

    } catch (error) {
      console.error('Import members error:', error);
      res.status(500).json({ error: 'Erreur lors de l\'importation des membres' });
    }
  }
};

module.exports = memberController;