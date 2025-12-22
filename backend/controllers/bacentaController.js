// controllers/bacentaController.js
const { BacentaMeeting, BacentaAttendance, BacentaOffering, Member, User, Area } = require('../models');
const { Op } = require('sequelize');

const bacentaController = {
  // Lister les réunions Bacenta
  getBacentaMeetings: async (req, res) => {
    try {
      const {
        page = 1,
        limit = 50,
        leader_id,
        start_date,
        end_date,
        is_verified
      } = req.query;

      const offset = (page - 1) * limit;
      const whereClause = {};

      // Filtrage basé sur le rôle
      if (req.user.role === 'Bacenta_Leader') {
        whereClause.leader_id = req.user.userId;
      }

      if (leader_id) whereClause.leader_id = leader_id;
      if (is_verified !== undefined) whereClause.is_verified = is_verified === 'true';

      // Filtre de date
      if (start_date && end_date) {
        whereClause.meeting_date = {
          [Op.between]: [start_date, end_date]
        };
      }

      const meetings = await BacentaMeeting.findAndCountAll({
        where: whereClause,
        include: [
          { model: User, as: 'leader' },
          { model: User, as: 'verifier' },
          {
            model: BacentaAttendance,
            as: 'attendances',
            include: [{ model: Member, as: 'member' }]
          },
          {
            model: BacentaOffering,
            as: 'offerings'
          }
        ],
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['meeting_date', 'DESC']]
      });

      // Map to frontend expected format
      const mappedMeetings = meetings.rows.map(meeting => ({
        id: meeting.id,
        title: meeting.title,
        date: meeting.meeting_date,
        time: meeting.meeting_time,
        location: meeting.location,
        host: meeting.host,
        type: meeting.meeting_type === 'Weekly_Sharing' ? 'weekly' :
          meeting.meeting_type === 'Prayer_Meeting' ? 'midweek' : 'special',
        expectedParticipants: meeting.expected_participants,
        agenda: meeting.agenda,
        offerings: meeting.offering_amount,
        familyPhoto: meeting.family_photo,
        photo_url: meeting.photo_url,
        status: meeting.is_verified ? 'completed' : 'planned',
        attendance: meeting.attendances?.map(att => ({
          member_id: att.member_id,
          status: att.present ? 'present' : 'absent'
        })) || [],
        offerings_breakdown: meeting.offerings?.map(off => ({
          type: off.offering_type,
          amount: off.amount
        })) || []
      }));

      res.json({
        meetings: mappedMeetings,
        total: meetings.count,
        page: parseInt(page),
        totalPages: Math.ceil(meetings.count / limit)
      });
    } catch (error) {
      console.error('Get bacenta meetings error:', error);
      res.status(500).json({ error: 'Erreur lors de la récupération des réunions' });
    }
  },

  // Créer une réunion Bacenta
  createBacentaMeeting: async (req, res) => {
    try {
      console.log('CreateBacentaMeeting - Received data:', req.body);
      console.log('User ID:', req.user.userId);

      const {
        title,
        date,
        time,
        location,
        host,
        type,
        expectedParticipants,
        agenda,
        offerings,
        familyPhoto
      } = req.body;

      if (!date || !type) {
        return res.status(400).json({ error: 'Date et type de réunion requis' });
      }

      // Map type to meeting_type
      const meetingTypeMap = {
        weekly: 'Weekly_Sharing',
        midweek: 'Prayer_Meeting',
        special: 'Other'
      };

      // Format date to YYYY-MM-DD for DATEONLY field
      const formattedDate = new Date(date).toISOString().split('T')[0];

      const meeting = await BacentaMeeting.create({
        leader_id: req.user.userId,
        meeting_date: formattedDate,
        meeting_time: time,
        meeting_type: meetingTypeMap[type] || 'Weekly_Sharing',
        title,
        host,
        expected_participants: expectedParticipants,
        agenda,
        family_photo: familyPhoto,
        location,
        offering_amount: offerings || 0,
        total_members_present: 0,
        notes: agenda ? agenda.join('\n') : null,
        is_verified: false
      });

      const newMeeting = await BacentaMeeting.findByPk(meeting.id, {
        include: [
          { model: User, as: 'leader' }
        ]
      });

      // Map to frontend format
      const mappedMeeting = {
        id: newMeeting.id,
        title: newMeeting.title,
        date: newMeeting.meeting_date,
        time: newMeeting.meeting_time,
        location: newMeeting.location,
        host: newMeeting.host,
        type: newMeeting.meeting_type === 'Weekly_Sharing' ? 'weekly' :
          newMeeting.meeting_type === 'Prayer_Meeting' ? 'midweek' : 'special',
        expectedParticipants: newMeeting.expected_participants,
        agenda: newMeeting.agenda,
        offerings: newMeeting.offering_amount,
        familyPhoto: newMeeting.family_photo,
        photo_url: newMeeting.photo_url,
        status: 'planned'
      };

      res.status(201).json(mappedMeeting);
    } catch (error) {
      console.error('Create bacenta meeting error:', error);
      console.error('Error details:', error.message);
      console.error('Error stack:', error.stack);
      res.status(500).json({ error: 'Erreur lors de la création de la réunion', details: error.message });
    }
  },

  // Obtenir une réunion Bacenta par ID
  getBacentaMeetingById: async (req, res) => {
    try {
      const meetingId = req.params.id;

      const meeting = await BacentaMeeting.findByPk(meetingId, {
        include: [
          { model: User, as: 'leader' },
          { model: User, as: 'verifier' },
          {
            model: BacentaAttendance,
            as: 'attendances',
            include: [
              { model: Member, as: 'member' },
              { model: User, as: 'marked_by' }
            ]
          },
          {
            model: BacentaOffering,
            as: 'offerings',
            include: [
              { model: User, as: 'collector' },
              { model: User, as: 'verifier' }
            ]
          }
        ]
      });

      if (!meeting) {
        return res.status(404).json({ error: 'Réunion non trouvée' });
      }

      // Vérification des permissions
      if (req.user.role === 'Bacenta_Leader' && meeting.leader_id !== req.user.userId) {
        return res.status(403).json({ error: 'Accès non autorisé à cette réunion' });
      }

      res.json(meeting);
    } catch (error) {
      console.error('Get bacenta meeting error:', error);
      res.status(500).json({ error: 'Erreur lors de la récupération de la réunion' });
    }
  },

  // Mettre à jour une réunion Bacenta
  updateBacentaMeeting: async (req, res) => {
    try {
      const meetingId = req.params.id;
      const {
        title,
        date,
        time,
        location,
        host,
        type,
        expectedParticipants,
        agenda,
        offerings,
        familyPhoto
      } = req.body;

      const meeting = await BacentaMeeting.findByPk(meetingId);
      if (!meeting) {
        return res.status(404).json({ error: 'Réunion non trouvée' });
      }

      // Vérification des permissions
      if (req.user.role === 'Bacenta_Leader' && meeting.leader_id !== req.user.userId) {
        return res.status(403).json({ error: 'Accès non autorisé' });
      }

      const meetingTypeMap = {
        weekly: 'Weekly_Sharing',
        midweek: 'Prayer_Meeting',
        special: 'Other'
      };

      const updateData = {
        meeting_date: date ? new Date(date).toISOString().split('T')[0] : meeting.meeting_date,
        meeting_time: time,
        meeting_type: meetingTypeMap[type] || meeting.meeting_type,
        title,
        host,
        expected_participants: expectedParticipants,
        agenda,
        family_photo: familyPhoto,
        location,
        offering_amount: offerings,
        notes: agenda ? agenda.join('\n') : meeting.notes
      };

      await meeting.update(updateData);

      const updatedMeeting = await BacentaMeeting.findByPk(meetingId, {
        include: [
          { model: User, as: 'leader' },
          { model: User, as: 'verifier' }
        ]
      });

      // Map to frontend format
      const mappedMeeting = {
        id: updatedMeeting.id,
        title: updatedMeeting.title,
        date: updatedMeeting.meeting_date,
        time: updatedMeeting.meeting_time,
        location: updatedMeeting.location,
        host: updatedMeeting.host,
        type: updatedMeeting.meeting_type === 'Weekly_Sharing' ? 'weekly' :
          updatedMeeting.meeting_type === 'Prayer_Meeting' ? 'midweek' : 'special',
        expectedParticipants: updatedMeeting.expected_participants,
        agenda: updatedMeeting.agenda,
        offerings: updatedMeeting.offering_amount,
        familyPhoto: updatedMeeting.family_photo,
        photo_url: updatedMeeting.photo_url,
        status: updatedMeeting.is_verified ? 'completed' : 'planned'
      };

      res.json(mappedMeeting);
    } catch (error) {
      console.error('Update bacenta meeting error:', error);
      res.status(500).json({ error: 'Erreur lors de la modification de la réunion' });
    }
  },

  // Marquer la présence à une réunion Bacenta
  markBacentaAttendance: async (req, res) => {
    try {
      const bacenta_meeting_id = req.params.meetingId;
      const { attendance } = req.body;

      if (!bacenta_meeting_id || !attendance || !Array.isArray(attendance)) {
        return res.status(400).json({ error: 'ID de réunion et liste de présence requis' });
      }

      const meeting = await BacentaMeeting.findByPk(bacenta_meeting_id);
      if (!meeting) {
        return res.status(404).json({ error: 'Réunion non trouvée' });
      }

      if (req.user.role === 'Bacenta_Leader' && meeting.leader_id !== req.user.userId) {
        return res.status(403).json({ error: 'Accès non autorisé à cette réunion' });
      }

      const results = [];
      const errors = [];

      for (const att of attendance) {
        try {
          const member = await Member.findByPk(att.member_id);
          if (!member) {
            errors.push(`Membre ${att.member_id} non trouvé`);
            continue;
          }

          const present = att.status === 'present';

          const existing = await BacentaAttendance.findOne({
            where: {
              bacenta_meeting_id,
              member_id: att.member_id
            }
          });

          let attendanceRecord;
          if (existing) {
            attendanceRecord = await existing.update({
              present,
              marked_by_user_id: req.user.userId
            });
          } else {
            attendanceRecord = await BacentaAttendance.create({
              bacenta_meeting_id,
              member_id: att.member_id,
              present,
              marked_by_user_id: req.user.userId
            });
          }

          results.push(attendanceRecord);
        } catch (error) {
          errors.push(`Erreur pour le membre ${att.member_id}: ${error.message}`);
        }
      }

      // Mettre à jour le compte des membres présents
      const presentCount = await BacentaAttendance.count({
        where: {
          bacenta_meeting_id,
          present: true
        }
      });

      await meeting.update({ total_members_present: presentCount });

      res.json({
        message: `Présence marquée pour ${results.length} membres`,
        successes: results.length,
        errors: errors.length,
        total_members_present: presentCount,
        details: errors
      });
    } catch (error) {
      console.error('Mark bacenta attendance error:', error);
      res.status(500).json({ error: 'Erreur lors du marquage de présence' });
    }
  },

  // Ajouter des offrandes
  addBacentaOfferings: async (req, res) => {
    try {
      const meetingId = req.params.meetingId;
      const { offerings } = req.body;

      if (!offerings || !Array.isArray(offerings)) {
        return res.status(400).json({ error: 'Liste d\'offrandes requise' });
      }

      const meeting = await BacentaMeeting.findByPk(meetingId);
      if (!meeting) {
        return res.status(404).json({ error: 'Réunion non trouvée' });
      }

      if (req.user.role === 'Bacenta_Leader' && meeting.leader_id !== req.user.userId) {
        return res.status(403).json({ error: 'Accès non autorisé à cette réunion' });
      }

      const results = [];
      let totalAmount = 0;

      for (const off of offerings) {
        if (off.amount > 0) {
          const offering = await BacentaOffering.create({
            bacenta_meeting_id: meetingId,
            offering_type: off.type,
            amount: off.amount,
            currency: 'XAF',
            collected_by: req.user.userId,
            is_verified: false
          });
          results.push(offering);
          totalAmount += parseFloat(off.amount);
        }
      }

      // Mettre à jour le montant total des offrandes
      await meeting.update({ offering_amount: totalAmount });

      res.status(201).json({
        message: `${results.length} offrandes ajoutées`,
        total: totalAmount,
        offerings: results
      });
    } catch (error) {
      console.error('Add bacenta offerings error:', error);
      res.status(500).json({ error: 'Erreur lors de l\'ajout des offrandes' });
    }
  },

  // Vérifier une réunion Bacenta (pour les superviseurs)
  verifyBacentaMeeting: async (req, res) => {
    try {
      const meetingId = req.params.id;
      const { verification_notes } = req.body;

      const meeting = await BacentaMeeting.findByPk(meetingId);
      if (!meeting) {
        return res.status(404).json({ error: 'Réunion non trouvée' });
      }

      // Seuls les superviseurs peuvent vérifier
      if (!['Bishop', 'Assisting_Overseer', 'Area_Pastor'].includes(req.user.role)) {
        return res.status(403).json({ error: 'Accès non autorisé. Rôle insuffisant.' });
      }

      await meeting.update({
        is_verified: true,
        verified_by: req.user.userId,
        verified_at: new Date(),
        verification_notes
      });

      const verifiedMeeting = await BacentaMeeting.findByPk(meetingId, {
        include: [
          { model: User, as: 'leader' },
          { model: User, as: 'verifier' }
        ]
      });

      res.json(verifiedMeeting);
    } catch (error) {
      console.error('Verify bacenta meeting error:', error);
      res.status(500).json({ error: 'Erreur lors de la vérification de la réunion' });
    }
  },

  // Obtenir les statistiques Bacenta pour le leader
  getBacentaStats: async (req, res) => {
    try {
      const { start_date, end_date } = req.query;

      const whereClause = {
        leader_id: req.user.userId
      };

      if (start_date && end_date) {
        whereClause.meeting_date = {
          [Op.between]: [start_date, end_date]
        };
      }

      const meetings = await BacentaMeeting.findAll({
        where: whereClause,
        include: [
          { model: BacentaAttendance, as: 'attendances' },
          { model: BacentaOffering, as: 'offerings' }
        ]
      });

      const stats = {
        total_meetings: meetings.length,
        total_offering: meetings.reduce((sum, meeting) => sum + parseFloat(meeting.offering_amount), 0),
        total_attendance: meetings.reduce((sum, meeting) => sum + meeting.total_members_present, 0),
        average_attendance: meetings.length > 0 ?
          Math.round(meetings.reduce((sum, meeting) => sum + meeting.total_members_present, 0) / meetings.length) : 0,
        verified_meetings: meetings.filter(meeting => meeting.is_verified).length,
        meetings_by_type: meetings.reduce((acc, meeting) => {
          acc[meeting.meeting_type] = (acc[meeting.meeting_type] || 0) + 1;
          return acc;
        }, {})
      };

      res.json(stats);
    } catch (error) {
      console.error('Get bacenta stats error:', error);
      res.status(500).json({ error: 'Erreur lors de la récupération des statistiques Bacenta' });
    }
  },

  // Supprimer une réunion Bacenta
  deleteBacentaMeeting: async (req, res) => {
    try {
      const meetingId = req.params.id;

      const meeting = await BacentaMeeting.findByPk(meetingId);
      if (!meeting) {
        return res.status(404).json({ error: 'Réunion non trouvée' });
      }

      // Vérification des permissions
      if (req.user.role === 'Bacenta_Leader' && meeting.leader_id !== req.user.userId) {
        return res.status(403).json({ error: 'Accès non autorisé' });
      }

      await meeting.destroy();

      res.json({ message: 'Réunion supprimée avec succès' });
    } catch (error) {
      console.error('Delete bacenta meeting error:', error);
      res.status(500).json({ error: 'Erreur lors de la suppression de la réunion' });
    }
  },

  // Uploader une photo pour une réunion Bacenta
  uploadBacentaMeetingPhoto: async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'Aucun fichier uploadé' });
      }

      const meetingId = req.params.id;
      const meeting = await BacentaMeeting.findByPk(meetingId);

      if (!meeting) {
        return res.status(404).json({ error: 'Réunion non trouvée' });
      }

      // Vérifier que l'utilisateur est le leader de la réunion ou un superviseur
      if (meeting.leader_id !== req.user.userId && !['Bishop', 'Assisting_Overseer', 'Area_Pastor'].includes(req.user.role)) {
        return res.status(403).json({ error: 'Accès non autorisé' });
      }

      const photoUrl = `/uploads/bacenta-meetings/${req.file.filename}`;
      await meeting.update({ photo_url: photoUrl });

      res.json({ message: 'Photo uploadée avec succès', photo_url: photoUrl });
    } catch (error) {
      console.error('Upload photo error:', error);
      res.status(500).json({ error: 'Erreur lors de l\'upload de la photo' });
    }
  },

  // Obtenir les membres du Bacenta
  getBacentaMembers: async (req, res) => {
    try {
      const whereClause = {};

      // Filtrage basé sur le rôle
      if (req.user.role === 'Bacenta_Leader') {
        whereClause.leader_id = req.user.userId;
      }

      const members = await Member.findAll({
        where: whereClause,
        include: [
          { model: User, as: 'leader' }
        ],
        order: [['first_name', 'ASC']]
      });

      // Map to frontend format
      const mappedMembers = members.map(member => ({
        id: member.id,
        first_name: member.first_name,
        last_name: member.last_name,
        phone: member.phone_primary
      }));

      res.json(mappedMembers);
    } catch (error) {
      console.error('Get bacenta members error:', error);
      res.status(500).json({ error: 'Erreur lors de la récupération des membres' });
    }
  }
};

module.exports = bacentaController;