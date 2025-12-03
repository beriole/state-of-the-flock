// screens/inscription/AttendanceScreen.jsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  FlatList,
  Modal,
  Alert,
  ActivityIndicator,
  RefreshControl,
  TextInput,
  Linking
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Feather from 'react-native-vector-icons/Feather';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { useTranslation } from 'react-i18next';
import { memberAPI, attendanceAPI } from '../../utils/api';
import { NativeModules } from 'react-native';
import Share from 'react-native-share';
import RNFS from 'react-native-fs';

// Robustly find the native module
const RNHTMLtoPDF = NativeModules.RNHTMLtoPDF || NativeModules.HtmlToPdf || NativeModules.RNHTMLToPdf;
import DateTimePicker from '@react-native-community/datetimepicker';

const AttendanceScreen = () => {
  const { t, i18n } = useTranslation();

  // États
  const [activeTab, setActiveTab] = useState('current');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDateModal, setShowDateModal] = useState(false);
  const [members, setMembers] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('Tous');
  const [error, setError] = useState(null);
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);


  // Charger les données au démarrage
  useEffect(() => {
    loadInitialData();
  }, []);

  // Recharger les présences quand la date change
  useEffect(() => {
    if (!loading) {
      loadAttendanceData();
    }
  }, [selectedDate]);

  // Charger les membres et présences
  const loadInitialData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Charger les membres
      const membersResponse = await memberAPI.getMembers({
        limit: 1000, // Charger tous les membres
        is_active: true
      });

      // Charger les présences pour la date sélectionnée
      const dateKey = getDateKey(selectedDate);
      const attendanceResponse = await attendanceAPI.getAttendance({
        sunday_date: dateKey,
        limit: 1000
      });

      setMembers(membersResponse.data.members || []);
      setAttendanceRecords(attendanceResponse.data.attendance || []);

    } catch (error) {
      console.error('Erreur chargement données:', error);
      setError('Erreur de chargement des données');
      // Fallback avec données vides
      setMembers([]);
      setAttendanceRecords([]);
    } finally {
      setLoading(false);
    }
  };

  // Fonctions utilitaires SÉCURISÉES
  const getDateKey = useCallback((date) => {
    try {
      return date.toISOString().split('T')[0];
    } catch {
      return new Date().toISOString().split('T')[0];
    }
  }, []);

  const formatDisplayDate = useCallback((date) => {
    try {
      return date.toLocaleDateString(i18n.language, {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return new Date().toLocaleDateString(i18n.language);
    }
  }, [i18n.language]);

  // Navigation entre dates
  const changeDate = useCallback((days) => {
    setSelectedDate(prev => {
      try {
        const newDate = new Date(prev);
        newDate.setDate(newDate.getDate() + days);
        return newDate;
      } catch {
        return new Date();
      }
    });
  }, []);

  // Basculer présence/absence avec sauvegarde backend
  const toggleAttendance = useCallback(async (memberId) => {
    try {
      setSaving(true);
      const dateKey = getDateKey(selectedDate);

      // Trouver l'enregistrement existant
      const existingRecord = attendanceRecords.find(
        record => record.member_id === memberId && record.sunday_date === dateKey
      );

      const newPresent = !existingRecord?.present;

      // Préparer les données pour l'API
      const attendanceData = [{
        member_id: memberId,
        present: newPresent,
        notes: existingRecord?.notes || ''
      }];

      // Sauvegarder via API
      await attendanceAPI.bulkAttendance({
        sunday_date: dateKey,
        attendances: attendanceData
      });

      // Recharger les données
      await loadAttendanceData();

    } catch (error) {
      console.error('Erreur toggle attendance:', error);
      Alert.alert(t('common.error'), t('attendance.save_error'));
    } finally {
      setSaving(false);
    }
  }, [attendanceRecords, selectedDate, getDateKey, t]);

  // Marquer tous les membres avec sauvegarde backend
  const markAllMembers = useCallback(async (status) => {
    try {
      setSaving(true);
      const dateKey = getDateKey(selectedDate);

      // Préparer les données pour tous les membres
      const attendanceData = members.filter(member => member.is_active).map(member => ({
        member_id: member.id,
        present: status === 'present',
        notes: ''
      }));

      // Sauvegarder via API
      await attendanceAPI.bulkAttendance({
        sunday_date: dateKey,
        attendances: attendanceData
      });

      // Recharger les données
      await loadAttendanceData();

    } catch (error) {
      console.error('Erreur mark all:', error);
      Alert.alert('Erreur', 'Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  }, [selectedDate, members, getDateKey]);

  // Charger les données de présence pour la date sélectionnée
  const loadAttendanceData = useCallback(async () => {
    try {
      const dateKey = getDateKey(selectedDate);
      const response = await attendanceAPI.getAttendance({
        sunday_date: dateKey,
        limit: 1000
      });
      setAttendanceRecords(response.data.attendance || []);
    } catch (error) {
      console.error('Erreur chargement présences:', error);
      setAttendanceRecords([]);
    }
  }, [selectedDate, getDateKey]);

  // Charger l'historique des présences
  const loadAttendanceHistory = useCallback(async () => {
    try {
      setHistoryLoading(true);
      // Charger les présences des 30 derniers jours
      const historyData = [];
      const today = new Date();

      for (let i = 0; i < 30; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        const dateKey = getDateKey(date);

        try {
          const response = await attendanceAPI.getAttendance({
            sunday_date: dateKey,
            limit: 1000
          });

          const records = response.data.attendance || [];
          const presentCount = records.filter(r => r.present).length;
          const totalCount = records.length;

          if (totalCount > 0) {
            historyData.push({
              date: dateKey,
              displayDate: formatDisplayDate(date),
              present: presentCount,
              absent: totalCount - presentCount,
              total: totalCount,
              percentage: Math.round((presentCount / totalCount) * 100)
            });
          }
        } catch (error) {
          // Ignorer les erreurs pour les dates sans données
          console.log(`No data for ${dateKey}`);
        }
      }

      setAttendanceHistory(historyData);
    } catch (error) {
      console.error('Erreur chargement historique:', error);
      setAttendanceHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  }, [getDateKey, formatDisplayDate]);

  // Obtenir le statut d'un membre
  const getMemberAttendance = useCallback((memberId) => {
    try {
      const dateKey = getDateKey(selectedDate);
      const record = attendanceRecords.find(
        r => r.member_id === memberId && r.sunday_date === dateKey
      );
      return record ? (record.present ? 'present' : 'absent') : 'unknown';
    } catch {
      return 'unknown';
    }
  }, [attendanceRecords, selectedDate, getDateKey]);

  // Pull to refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadInitialData();
    setRefreshing(false);
  }, []);

  // Filtrage des membres
  const filteredMembers = useMemo(() => {
    try {
      let filtered = Array.isArray(members) ? members : [];

      // Filtre par recherche
      if (searchQuery && searchQuery.trim()) {
        filtered = filtered.filter(member => {
          const firstName = member?.first_name || '';
          const lastName = member?.last_name || '';
          const fullName = `${firstName} ${lastName}`.trim();
          const phone = member?.phone_primary || '';
          return fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            phone.includes(searchQuery);
        });
      }

      // Filtre par zone (area)
      if (selectedGroup !== 'Tous') {
        filtered = filtered.filter(member => {
          const areaName = member?.area?.name || '';
          return areaName === selectedGroup;
        });
      }

      return filtered;
    } catch (error) {
      console.log('Erreur filtrage:', error);
      return [];
    }
  }, [members, searchQuery, selectedGroup]);

  // Helper function to show file location
  const showFileLocation = (filePath) => {
    const isDownloadDir = filePath.includes('Download') || filePath.includes('Téléchargements');

    const locationMessage = `Le PDF a été généré avec succès !\n\n📁 Emplacement du fichier :\n${filePath}\n\n📱 Pour accéder au fichier :\n1. Ouvrez un gestionnaire de fichiers (comme "Fichiers" ou "File Manager")\n2. Allez dans le dossier "Téléchargements" ou "Downloads"\n3. Trouvez le fichier PDF et ouvrez-le\n\n✅ Le fichier est maintenant facilement accessible depuis votre dossier Téléchargements !`;

    Alert.alert(
      '✅ PDF généré avec succès',
      locationMessage,
      [{ text: 'Compris' }]
    );
  };

  // Generate PDF for Attendance - Specific to selected date
  const generateAttendancePDF = async () => {
    try {
      console.log('Starting attendance PDF generation for selected date...');
      setLoading(true);

      // Validate data
      if (!members || members.length === 0) {
        console.log('No members found for PDF generation');
        Alert.alert('Erreur', 'Aucun membre trouvé pour générer le rapport');
        return;
      }

      console.log('Members found:', members.length);
      console.log('Attendance records:', attendanceRecords.length);
      console.log('Selected date:', selectedDate);

      // Use the currently selected date
      const dateKey = getDateKey(selectedDate);
      const title = `Rapport de présence - ${formatDisplayDate(selectedDate)}`;

      // Use current attendance records for the selected date
      const records = attendanceRecords;

      // Calculate stats for the selected date
      const presentCount = records.filter(r => r.present && r.sunday_date === dateKey).length;
      const totalCount = members.filter(m => m.is_active).length;
      const statsSummary = {
        present: presentCount,
        absent: totalCount - presentCount,
        total: totalCount
      };

      // Prepare data for the selected date
      const data = members.filter(m => m.is_active).map(member => {
        const record = records.find(r => r.member_id === member.id && r.sunday_date === dateKey);
        return {
          name: `${member.first_name} ${member.last_name}`,
          status: record ? (record.present ? 'Présent' : 'Absent') : 'Inconnu',
          group: member.area?.name || '-'
        };
      });

      // Validate that we have data to export
      console.log('Data prepared for PDF:', data.length, 'records');
      if (data.length === 0) {
        console.log('No attendance data found for the selected date');
        Alert.alert(
          'Aucune donnée',
          'Aucune donnée de présence trouvée pour la date sélectionnée. Essayez de changer la date ou vérifiez que des présences ont été enregistrées.'
        );
        return;
      }

      // Create HTML with beautiful design
      const htmlContent = `
        <!DOCTYPE html>
        <html lang="fr">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${title}</title>
            <style>
              @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

              * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
              }

              body {
                font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                min-height: 100vh;
                padding: 40px 20px;
                color: #1f2937;
              }

              .container {
                max-width: 800px;
                margin: 0 auto;
                background: #ffffff;
                border-radius: 24px;
                box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
                overflow: hidden;
              }

              .header {
                background: linear-gradient(135deg, #991B1B 0%, #7F1D1D 100%);
                padding: 40px 30px;
                text-align: center;
                position: relative;
                overflow: hidden;
              }

              .header::before {
                content: '';
                position: absolute;
                top: -50%;
                left: -50%;
                width: 200%;
                height: 200%;
                background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
                animation: pulse 4s ease-in-out infinite;
              }

              @keyframes pulse {
                0%, 100% { transform: scale(1); opacity: 0.5; }
                50% { transform: scale(1.05); opacity: 0.8; }
              }

              .header-content {
                position: relative;
                z-index: 1;
              }

              .logo {
                width: 60px;
                height: 60px;
                background: rgba(255, 255, 255, 0.2);
                border-radius: 16px;
                margin: 0 auto 20px;
                display: flex;
                align-items: center;
                justify-content: center;
                backdrop-filter: blur(10px);
              }

              .logo-text {
                color: white;
                font-size: 24px;
                font-weight: 700;
              }

              h1 {
                color: #ffffff;
                font-size: 28px;
                font-weight: 700;
                margin-bottom: 8px;
                text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
              }

              .subtitle {
                color: rgba(255, 255, 255, 0.9);
                font-size: 16px;
                font-weight: 400;
              }

              .meta {
                background: #f8fafc;
                padding: 20px 30px;
                border-bottom: 1px solid #e2e8f0;
                font-size: 14px;
                color: #64748b;
                text-align: center;
              }

              .stats-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
                gap: 20px;
                padding: 30px;
                background: #f8fafc;
              }

              .stat-card {
                background: white;
                padding: 24px;
                border-radius: 16px;
                text-align: center;
                box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
                border: 1px solid #e2e8f0;
                transition: transform 0.2s ease;
              }

              .stat-card:hover {
                transform: translateY(-2px);
              }

              .stat-icon {
                width: 48px;
                height: 48px;
                border-radius: 12px;
                margin: 0 auto 16px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 24px;
              }

              .stat-present .stat-icon {
                background: linear-gradient(135deg, #10b981, #059669);
                color: white;
              }

              .stat-absent .stat-icon {
                background: linear-gradient(135deg, #ef4444, #dc2626);
                color: white;
              }

              .stat-percentage .stat-icon {
                background: linear-gradient(135deg, #3b82f6, #2563eb);
                color: white;
              }

              .stat-value {
                font-size: 32px;
                font-weight: 700;
                color: #1f2937;
                margin-bottom: 4px;
              }

              .stat-label {
                font-size: 14px;
                color: #64748b;
                font-weight: 500;
                text-transform: uppercase;
                letter-spacing: 0.5px;
              }

              .content {
                padding: 30px;
              }

              .section-title {
                font-size: 20px;
                font-weight: 600;
                color: #1f2937;
                margin-bottom: 20px;
                padding-bottom: 10px;
                border-bottom: 2px solid #991B1B;
              }

              .attendance-table {
                width: 100%;
                border-collapse: collapse;
                margin-top: 20px;
                border-radius: 12px;
                overflow: hidden;
                box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
              }

              .attendance-table thead {
                background: linear-gradient(135deg, #991B1B, #7F1D1D);
                color: white;
              }

              .attendance-table th {
                padding: 16px 20px;
                text-align: left;
                font-weight: 600;
                font-size: 14px;
                text-transform: uppercase;
                letter-spacing: 0.5px;
              }

              .attendance-table td {
                padding: 16px 20px;
                border-bottom: 1px solid #e2e8f0;
                font-size: 14px;
              }

              .attendance-table tbody tr {
                transition: background-color 0.2s ease;
              }

              .attendance-table tbody tr:hover {
                background-color: #f8fafc;
              }

              .member-name {
                font-weight: 600;
                color: #1f2937;
              }

              .member-group {
                color: #991B1B;
                font-weight: 500;
              }

              .status-badge {
                padding: 6px 12px;
                border-radius: 20px;
                font-size: 12px;
                font-weight: 600;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                display: inline-block;
              }

              .status-present {
                background: linear-gradient(135deg, #dcfce7, #bbf7d0);
                color: #166534;
                border: 1px solid #16a34a;
              }

              .status-absent {
                background: linear-gradient(135deg, #fee2e2, #fecaca);
                color: #991b1b;
                border: 1px solid #dc2626;
              }

              .status-unknown {
                background: linear-gradient(135deg, #f1f5f9, #e2e8f0);
                color: #475569;
                border: 1px solid #cbd5e1;
              }

              .footer {
                background: #f8fafc;
                padding: 30px;
                text-align: center;
                border-top: 1px solid #e2e8f0;
              }

              .footer-content {
                max-width: 600px;
                margin: 0 auto;
              }

              .footer-logo {
                font-size: 18px;
                font-weight: 700;
                color: #991B1B;
                margin-bottom: 8px;
              }

              .footer-text {
                color: #64748b;
                font-size: 14px;
                line-height: 1.5;
              }

              .footer-meta {
                margin-top: 16px;
                padding-top: 16px;
                border-top: 1px solid #e2e8f0;
                font-size: 12px;
                color: #94a3b8;
              }

              @media (max-width: 768px) {
                body {
                  padding: 20px 10px;
                }

                .container {
                  margin: 0;
                }

                .header {
                  padding: 30px 20px;
                }

                h1 {
                  font-size: 24px;
                }

                .stats-grid {
                  grid-template-columns: 1fr;
                  padding: 20px;
                }

                .content {
                  padding: 20px;
                }

                .attendance-table {
                  font-size: 12px;
                }

                .attendance-table th,
                .attendance-table td {
                  padding: 12px 16px;
                }
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <div class="header-content">
                  <div class="logo">
                    <span class="logo-text">BL</span>
                  </div>
                  <h1>Rapport de Présence</h1>
                  <div class="subtitle">${formatDisplayDate(selectedDate)}</div>
                </div>
              </div>

              <div class="meta">
                <strong>Généré le:</strong> ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}
              </div>

              <div class="stats-grid">
                <div class="stat-card stat-present">
                  <div class="stat-icon">✓</div>
                  <div class="stat-value">${statsSummary.present}</div>
                  <div class="stat-label">Présents</div>
                </div>
                <div class="stat-card stat-absent">
                  <div class="stat-icon">✗</div>
                  <div class="stat-value">${statsSummary.absent}</div>
                  <div class="stat-label">Absents</div>
                </div>
                <div class="stat-card stat-percentage">
                  <div class="stat-icon">📊</div>
                  <div class="stat-value">${statsSummary.total > 0 ? Math.round((statsSummary.present / statsSummary.total) * 100) : 0}%</div>
                  <div class="stat-label">Taux de présence</div>
                </div>
              </div>

              <div class="content">
                <h2 class="section-title">Liste des Membres</h2>

                <table class="attendance-table">
                  <thead>
                    <tr>
                      <th>Nom Complet</th>
                      <th>Groupe</th>
                      <th>Statut</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${data.map(item => `
                      <tr>
                        <td>
                          <span class="member-name">${item.name}</span>
                        </td>
                        <td>
                          <span class="member-group">${item.group}</span>
                        </td>
                        <td>
                          <span class="status-badge ${item.status === 'Présent' ? 'status-present' : item.status === 'Absent' ? 'status-absent' : 'status-unknown'}">
                            ${item.status}
                          </span>
                        </td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>

              <div class="footer">
                <div class="footer-content">
                  <div class="footer-logo">Bacenta Leader</div>
                  <div class="footer-text">
                    Application de gestion des présences pour les groupes Bacenta
                  </div>
                  <div class="footer-meta">
                    Rapport généré automatiquement • ${new Date().getFullYear()}
                  </div>
                </div>
              </div>
            </div>
          </body>
        </html>
      `;

      // Create PDF with consistent file naming and location
      const fileName = `Presence_${dateKey}`; // Use date key for consistent naming

      const options = {
        html: htmlContent,
        fileName: fileName,
        directory: '/storage/emulated/0/Download' // Use main Downloads directory at phone root
      };

      console.log('Generating attendance PDF with options:', options);
      console.log('RNHTMLtoPDF available:', !!RNHTMLtoPDF);

      try {
        const file = await RNHTMLtoPDF.convert(options);
        console.log('Attendance PDF generated:', file);

        // Validate file object
        if (!file || !file.filePath) {
          console.error('PDF generation failed: invalid file object', file);
          throw new Error('PDF generation failed: no file path returned');
        }

        // Use the generated file path
        let accessibleFilePath = file.filePath;
        console.log('PDF file path:', accessibleFilePath);

        // Show file location with clear instructions
        console.log('PDF generated successfully, showing file location');
        showFileLocation(accessibleFilePath);

      } catch (pdfError) {
        console.error('PDF conversion error:', pdfError);

        // Fallback: Show HTML content in an alert for debugging
        Alert.alert(
          'Erreur PDF',
          `La génération PDF a échoué. Voulez-vous voir le contenu HTML généré pour déboguer ?`,
          [
            { text: 'Annuler', style: 'cancel' },
            {
              text: 'Voir HTML',
              onPress: () => {
                // Show first 500 characters of HTML for debugging
                const htmlPreview = htmlContent.substring(0, 500) + '...';
                Alert.alert('Contenu HTML', htmlPreview);
              }
            }
          ]
        );
        throw pdfError; // Re-throw to be caught by outer catch
      }

    } catch (error) {
      console.error('Erreur lors de la génération du PDF:', error);
      Alert.alert(
        'Erreur de génération PDF',
        `Impossible de générer ou partager le PDF: ${error.message || 'Erreur inconnue'}`
      );
    } finally {
      setLoading(false);
    }
  };
  // Statistiques calculées
  const stats = useMemo(() => {
    try {
      const dateKey = getDateKey(selectedDate);
      const presentCount = attendanceRecords.filter(
        record => record.sunday_date === dateKey && record.present
      ).length;
      const absentCount = attendanceRecords.filter(
        record => record.sunday_date === dateKey && !record.present
      ).length;
      const total = filteredMembers.length;

      return {
        present: presentCount,
        absent: absentCount,
        total,
        percentage: total > 0 ? Math.round((presentCount / total) * 100) : 0
      };
    } catch {
      return { present: 0, absent: 0, total: 0, percentage: 0 };
    }
  }, [attendanceRecords, selectedDate, filteredMembers, getDateKey]);

  // Zones disponibles
  const availableGroups = useMemo(() => {
    try {
      const groups = ['Tous'];
      const areas = members.map(member => member?.area?.name).filter(Boolean);
      const uniqueAreas = [...new Set(areas)];
      return [...groups, ...uniqueAreas];
    } catch {
      return ['Tous'];
    }
  }, [members]);

  // Rendu d'un membre
  const renderAttendanceItem = useCallback(({ item }) => {
    if (!item || !item.id) return null;

    const status = getMemberAttendance(item.id);
    const displayName = `${item?.first_name || ''} ${item?.last_name || ''}`.trim() || 'Membre inconnu';
    const displayArea = item?.area?.name || 'Non assigné';
    const displayPhone = item?.phone_primary || '-';

    return (
      <TouchableOpacity
        style={[styles.attendanceItem, saving && styles.disabledItem]}
        onPress={() => !saving && toggleAttendance(item.id)}
        activeOpacity={0.7}
        disabled={saving}
      >
        <View style={styles.memberInfo}>
          <View style={styles.memberAvatar}>
            <Text style={styles.memberAvatarText}>
              {displayName.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={styles.memberDetails}>
            <Text style={styles.memberName}>{displayName}</Text>
            <View style={styles.memberMeta}>
              <Text style={styles.memberGroup}>{displayArea}</Text>
              <Text style={styles.memberPhone}>{displayPhone}</Text>
            </View>
          </View>
        </View>

        <View style={styles.attendanceStatus}>
          {saving ? (
            <ActivityIndicator size="small" color="#991B1B" />
          ) : (
            <View style={[
              styles.statusIndicator,
              status === 'present' && styles.presentIndicator,
              status === 'absent' && styles.absentIndicator,
              status === 'unknown' && styles.unknownIndicator
            ]}>
              <Text style={[
                styles.statusText,
                status === 'present' && styles.presentText,
                status === 'absent' && styles.absentText,
                status === 'unknown' && styles.unknownText
              ]}>
                {status === 'present' ? '✓' :
                  status === 'absent' ? '✗' : '○'}
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  }, [getMemberAttendance, toggleAttendance, saving, t]);

  // Sélecteur de dates
  const renderDateSelector = useCallback(() => {
    try {
      const today = new Date();
      const dates = [];

      for (let i = -3; i <= 3; i++) {
        const date = new Date(selectedDate);
        date.setDate(date.getDate() + i);
        dates.push(date);
      }

      return (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.dateScrollView}
        >
          {dates.map((date, index) => {
            const isSelected = getDateKey(date) === getDateKey(selectedDate);
            const isToday = getDateKey(date) === getDateKey(today);

            return (
              <TouchableOpacity
                key={index}
                style={[styles.dateButton, isSelected && styles.dateButtonSelected]}
                onPress={() => setSelectedDate(date)}
              >
                <Text style={[styles.dateDay, isSelected && styles.dateDaySelected]}>
                  {date.toLocaleDateString(i18n.language, { weekday: 'short' })}
                </Text>
                <Text style={[styles.dateNumber, isSelected && styles.dateNumberSelected]}>
                  {date.getDate()}
                </Text>
                {isToday && <View style={styles.todayDot} />}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      );
    } catch {
      return <Text style={styles.errorText}>Erreur</Text>;
    }
  }, [selectedDate, getDateKey, i18n.language, t]);

  // Rendu d'un élément d'historique
  const renderHistoryItem = useCallback(({ item }) => {
    return (
      <TouchableOpacity
        style={styles.historyItem}
        onPress={() => {
          // Naviguer vers les détails de cette date
          setSelectedDate(new Date(item.date));
          setActiveTab('current');
        }}
      >
        <View style={styles.historyHeader}>
          <Text style={styles.historyDate}>{item.displayDate}</Text>
          <View style={styles.historyStats}>
            <View style={[styles.historyStat, styles.presentStat]}>
              <Text style={styles.historyStatValue}>{item.present}</Text>
              <Text style={styles.historyStatLabel}>Présents</Text>
            </View>
            <View style={[styles.historyStat, styles.absentStat]}>
              <Text style={styles.historyStatValue}>{item.absent}</Text>
              <Text style={styles.historyStatLabel}>Absents</Text>
            </View>
            <View style={[styles.historyStat, styles.percentageStat]}>
              <Text style={styles.historyStatValue}>{item.percentage}%</Text>
              <Text style={styles.historyStatLabel}>Taux</Text>
            </View>
          </View>
        </View>
        <View style={styles.historyProgress}>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${item.percentage}%` }
              ]}
            />
          </View>
        </View>
      </TouchableOpacity>
    );
  }, []);

  // Écran de chargement
  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#991B1B" />
        <View style={styles.loadingContent}>
          <ActivityIndicator size="large" color="#991B1B" />
          <Text style={styles.loadingText}>Chargement...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#991B1B" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerBackground} />
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerTitle}>Gestion des présences</Text>
            <Text style={styles.headerSubtitle}>Bacenta Leader - Sector 2</Text>
          </View>
          <View style={{ flexDirection: 'row' }}>
            <TouchableOpacity
              style={[styles.notificationBtn, { marginRight: 10 }]}
              onPress={() => {
                console.log('Generate PDF button pressed');
                generateAttendancePDF();
              }}
            >
              <Feather name="download" size={20} color="#FFFFFF" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.notificationBtn}>
              <Feather name="bell" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'current' && styles.tabActive]}
          onPress={() => setActiveTab('current')}
        >
          <Feather
            name="calendar"
            size={16}
            color={activeTab === 'current' ? '#FFFFFF' : '#6B7280'}
          />
          <Text
            style={[
              styles.tabText,
              activeTab === 'current' && styles.tabTextActive,
            ]}
          >
            Présences actuelles
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'history' && styles.tabActive]}
          onPress={() => {
            setActiveTab('history');
            if (attendanceHistory.length === 0) {
              loadAttendanceHistory();
            }
          }}
        >
          <Feather
            name="clock"
            size={16}
            color={activeTab === 'history' ? '#FFFFFF' : '#6B7280'}
          />
          <Text
            style={[
              styles.tabText,
              activeTab === 'history' && styles.tabTextActive,
            ]}
          >
            Historique
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'current' ? (
        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#991B1B']}
              tintColor="#991B1B"
            />
          }
        >
          {/* Message d'erreur */}
          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity
                style={styles.retryButton}
                onPress={loadInitialData}
              >
                <Text style={styles.retryText}>Réessayer</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Statistiques */}
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: '#16A34A22' }]}>
                <Icon name="check-circle" size={20} color="#16A34A" />
              </View>
              <Text style={styles.statValue}>{stats.present}</Text>
              <Text style={styles.statLabel}>Présents</Text>
            </View>

            <View style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: '#DC262622' }]}>
                <Icon name="close-circle" size={20} color="#DC2626" />
              </View>
              <Text style={styles.statValue}>{stats.absent}</Text>
              <Text style={styles.statLabel}>Absents</Text>
            </View>

            <View style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: '#D9770622' }]}>
                <Icon name="chart-pie" size={20} color="#D97706" />
              </View>
              <Text style={styles.statValue}>{stats.percentage}%</Text>
              <Text style={styles.statLabel}>Taux</Text>
            </View>
          </View>

          {/* Recherche et Filtres */}
          <View style={styles.filtersSection}>
            <View style={styles.searchContainer}>
              <Feather name="search" size={20} color="#9CA3AF" />
              <TextInput
                style={styles.searchInput}
                placeholder="Rechercher un membre..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholderTextColor="#9CA3AF"
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <AntDesign name="closecircle" size={16} color="#9CA3AF" />
                </TouchableOpacity>
              )}
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.groupsScroll}>
              {availableGroups.map((group, index) => (
                <TouchableOpacity
                  key={group || index}
                  style={[styles.groupFilter, selectedGroup === group && styles.groupFilterSelected]}
                  onPress={() => setSelectedGroup(group)}
                >
                  <Text style={[styles.groupFilterText, selectedGroup === group && styles.groupFilterTextSelected]}>
                    {group === 'Tous' ? 'Tous' : group}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Sélecteur de date */}
          <View style={styles.dateSection}>
            <View style={styles.dateHeader}>
              <Text style={styles.sectionTitle}>Date de réunion</Text>
              <TouchableOpacity
                style={styles.calendarButton}
                onPress={() => setShowDateModal(true)}
              >
                <Feather name="calendar" size={20} color="#991B1B" />
              </TouchableOpacity>
            </View>

            {renderDateSelector()}

            <View style={styles.dateNavigation}>
              <TouchableOpacity
                style={styles.navButton}
                onPress={() => changeDate(-1)}
              >
                <Feather name="chevron-left" size={20} color="#991B1B" />
                <Text style={styles.navText}>Hier</Text>
              </TouchableOpacity>

              <Text style={styles.currentDate}>
                {formatDisplayDate(selectedDate)}
              </Text>

              <TouchableOpacity
                style={styles.navButton}
                onPress={() => changeDate(1)}
              >
                <Text style={styles.navText}>Demain</Text>
                <Feather name="chevron-right" size={20} color="#991B1B" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Actions rapides */}
          <View style={styles.quickActions}>
            <TouchableOpacity
              style={[styles.quickActionBtn, saving && styles.disabledButton]}
              onPress={() => !saving && markAllMembers('present')}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator size="small" color="#16A34A" />
              ) : (
                <Feather name="check-circle" size={18} color="#16A34A" />
              )}
              <Text style={[styles.quickActionText, saving && styles.disabledText]}>
                Tout marquer présent
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.quickActionBtn, saving && styles.disabledButton]}
              onPress={() => !saving && markAllMembers('absent')}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator size="small" color="#DC2626" />
              ) : (
                <Feather name="x-circle" size={18} color="#DC2626" />
              )}
              <Text style={[styles.quickActionText, saving && styles.disabledText]}>
                Tout marquer absent
              </Text>
            </TouchableOpacity>
          </View>

          {/* Liste de présence */}
          <View style={styles.attendanceSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                Liste des membres ({filteredMembers.length})
              </Text>
              <View style={styles.legend}>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, styles.presentDot]} />
                  <Text style={styles.legendText}>Présent</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, styles.absentDot]} />
                  <Text style={styles.legendText}>Absent</Text>
                </View>
              </View>
            </View>

            {filteredMembers.length === 0 ? (
              <View style={styles.emptyState}>
                <Feather name="users" size={48} color="#9CA3AF" />
                <Text style={styles.emptyStateText}>
                  Aucun membre trouvé
                </Text>
              </View>
            ) : (
              <FlatList
                data={filteredMembers}
                renderItem={renderAttendanceItem}
                keyExtractor={(item) => item.id || Math.random().toString()}
                scrollEnabled={false}
                initialNumToRender={10}
                maxToRenderPerBatch={5}
                windowSize={5}
                removeClippedSubviews={false} // Désactivé pour plus de stabilité
                ItemSeparatorComponent={() => <View style={styles.separator} />}
              />
            )}
          </View>

          <View style={{ height: 100 }} />
        </ScrollView>
      ) : (
        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={historyLoading}
              onRefresh={loadAttendanceHistory}
              colors={['#991B1B']}
              tintColor="#991B1B"
            />
          }
        >
          {/* Historique des présences */}
          <View style={styles.historySection}>
            <Text style={styles.sectionTitle}>Historique des présences</Text>

            {attendanceHistory.length === 0 ? (
              <View style={styles.emptyState}>
                <Feather name="clock" size={48} color="#9CA3AF" />
                <Text style={styles.emptyStateText}>
                  Aucun historique trouvé
                </Text>
                <Text style={styles.emptyStateSubtext}>
                  Les données d'historique apparaîtront ici
                </Text>
              </View>
            ) : (
              <FlatList
                data={attendanceHistory}
                renderItem={renderHistoryItem}
                keyExtractor={(item) => item.date}
                scrollEnabled={false}
                ItemSeparatorComponent={() => <View style={styles.historySeparator} />}
              />
            )}
          </View>

          <View style={{ height: 100 }} />
        </ScrollView>
      )}

      {/* Modal de sélection de date */}
      <Modal
        visible={showDateModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowDateModal(false)}
      >
        {/* ... existing date modal content ... */}
      </Modal>

      {/* Modal de sélection de date */}
      <Modal
        visible={showDateModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowDateModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.dateModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Choisir une date</Text>
              <TouchableOpacity onPress={() => setShowDateModal(false)}>
                <AntDesign name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <View style={styles.dateGrid}>
              {[...Array(31)].map((_, index) => {
                const day = index + 1;
                const date = new Date(selectedDate);
                date.setDate(day);
                const isCurrentMonth = date.getMonth() === selectedDate.getMonth();
                const isSelected = getDateKey(date) === getDateKey(selectedDate);

                return (
                  <TouchableOpacity
                    key={day}
                    style={[
                      styles.dateCell,
                      isSelected && styles.dateCellSelected,
                      !isCurrentMonth && styles.dateCellOtherMonth
                    ]}
                    onPress={() => {
                      setSelectedDate(date);
                      setShowDateModal(false);
                    }}
                  >
                    <Text style={[
                      styles.dateCellText,
                      isSelected && styles.dateCellTextSelected,
                      !isCurrentMonth && styles.dateCellTextOtherMonth
                    ]}>
                      {day}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView >
  );
};

// Styles (inchangés, déjà optimaux)
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FEF7F7',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#FEF7F7',
  },
  loadingContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
  errorText: {
    color: '#DC2626',
    textAlign: 'center',
    padding: 16,
  },
  header: {
    backgroundColor: '#991B1B',
    height: 140,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    overflow: 'hidden',
    position: 'relative',
  },
  headerBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#991B1B',
    opacity: 0.95,
  },
  headerContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 4,
    fontWeight: '500',
  },
  notificationBtn: {
    width: 44,
    height: 44,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    marginTop: -20,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    marginTop: 60,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    marginHorizontal: 4,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  statIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
  },
  statLabel: {
    fontSize: 11,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 4,
    fontWeight: '500',
  },
  filtersSection: {
    marginBottom: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#111827',
  },
  groupsScroll: {
    marginBottom: 8,
  },
  groupFilter: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  groupFilterSelected: {
    backgroundColor: '#991B1B',
    borderColor: '#991B1B',
  },
  groupFilterText: {
    color: '#6B7280',
    fontWeight: '600',
    fontSize: 12,
  },
  groupFilterTextSelected: {
    color: '#FFFFFF',
  },
  dateSection: {
    marginBottom: 16,
  },
  dateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
  },
  calendarButton: {
    width: 44,
    height: 44,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  dateScrollView: {
    marginBottom: 12,
  },
  dateButton: {
    alignItems: 'center',
    padding: 12,
    marginHorizontal: 4,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    minWidth: 60,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  dateButtonSelected: {
    backgroundColor: '#991B1B',
    borderColor: '#991B1B',
  },
  dateDay: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600',
    marginBottom: 4,
  },
  dateDaySelected: {
    color: '#FFFFFF',
  },
  dateNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  dateNumberSelected: {
    color: '#FFFFFF',
  },
  todayDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#991B1B',
    marginTop: 4,
  },
  dateNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  navText: {
    color: '#991B1B',
    fontWeight: '600',
    fontSize: 14,
  },
  currentDate: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    textAlign: 'center',
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  quickActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  attendanceSection: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  legend: {
    flexDirection: 'row',
    gap: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  presentDot: {
    backgroundColor: '#16A34A',
  },
  absentDot: {
    backgroundColor: '#DC2626',
  },
  legendText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  attendanceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  memberInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  memberAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FEF2F2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  memberAvatarText: {
    color: '#991B1B',
    fontWeight: '800',
    fontSize: 16,
  },
  memberDetails: {
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  memberMeta: {
    flexDirection: 'row',
    gap: 12,
  },
  memberGroup: {
    fontSize: 14,
    color: '#991B1B',
    fontWeight: '600',
  },
  memberPhone: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  attendanceStatus: {
    marginLeft: 12,
  },
  statusIndicator: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    minWidth: 50,
    maxWidth: 80,
    alignItems: 'center',
  },
  presentIndicator: {
    backgroundColor: '#DCFCE7',
    borderWidth: 1,
    borderColor: '#16A34A',
  },
  absentIndicator: {
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#DC2626',
  },
  unknownIndicator: {
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  statusText: {
    fontSize: 18,
    fontWeight: '700',
  },
  presentText: {
    color: '#16A34A',
  },
  absentText: {
    color: '#DC2626',
  },
  unknownText: {
    color: '#6B7280',
  },
  separator: {
    height: 8,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  emptyStateText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  dateModal: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    minHeight: '50%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  dateGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 8,
  },
  dateCell: {
    width: '13%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  dateCellSelected: {
    backgroundColor: '#991B1B',
  },
  dateCellOtherMonth: {
    backgroundColor: 'transparent',
  },
  dateCellText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  dateCellTextSelected: {
    color: '#FFFFFF',
  },
  dateCellTextOtherMonth: {
    color: '#9CA3AF',
  },
  errorContainer: {
    backgroundColor: '#FEE2E2',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  errorText: {
    color: '#DC2626',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 12,
  },
  retryButton: {
    backgroundColor: '#DC2626',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: 'center',
  },
  retryText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  disabledItem: {
    opacity: 0.6,
  },
  disabledButton: {
    opacity: 0.6,
  },
  disabledText: {
    opacity: 0.6,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 42,
    padding: 4,
    borderWidth: 1,
    borderColor: '#FECACA',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    zIndex: 10,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  tabActive: {
    backgroundColor: '#991B1B',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
    marginLeft: 8,
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  historySection: {
    padding: 20,
  },
  historyItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#FECACA',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  historyDate: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  historyStats: {
    flexDirection: 'row',
    gap: 12,
  },
  historyStat: {
    alignItems: 'center',
    minWidth: 50,
  },
  presentStat: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#16A34A',
  },
  absentStat: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DC2626',
  },
  percentageStat: {
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2563EB',
  },
  historyStatValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  historyStatLabel: {
    fontSize: 10,
    color: '#6B7280',
    textAlign: 'center',
  },
  historyProgress: {
    marginTop: 8,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#F3F4F6',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#16A34A',
    borderRadius: 3,
  },
  historySeparator: {
    height: 8,
  },
});

export default AttendanceScreen;
