import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  FlatList,
  StyleSheet,
  StatusBar,
  Image,
  Alert,
  Linking,
  Modal,
  Animated,
  RefreshControl,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Feather from 'react-native-vector-icons/Feather';
import LinearGradient from 'react-native-linear-gradient';
import { useTranslation } from 'react-i18next';
import { callLogAPI, attendanceAPI, memberAPI } from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext';
import Toast from 'react-native-toast-message';

const CallsScreen = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [calls, setCalls] = useState([]);
  const [filteredCalls, setFilteredCalls] = useState([]);
  const [selectedCalls, setSelectedCalls] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [view, setView] = useState('list');
  const [refreshing, setRefreshing] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCall, setSelectedCall] = useState(null);
  const [showCallDetails, setShowCallDetails] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [loading, setLoading] = useState(false);

  // Couleurs de l'église - palette rouge améliorée
  const colors = {
    primary: '#DC2626',
    primaryLight: '#EF4444',
    primaryLighter: '#FEE2E2',
    primaryDark: '#B91C1C',
    background: '#FEF2F2',
    card: '#FFFFFF',
    text: '#1F2937',
    textLight: '#6B7280',
    border: '#E5E7EB',
    success: '#10B981',
    warning: '#F59E0B',
    danger: '#DC2626',
    gradientStart: '#DC2626',
    gradientEnd: '#B91C1C',
  };


  const loadCallsCallback = useCallback(async () => {
    try {
      setLoading(true);
      console.log('Loading calls based on attendance...');

      // Charger les membres
      const membersResponse = await memberAPI.getMembers({
        limit: 1000,
        is_active: true
      });
      const members = membersResponse.data.members || [];
      console.log('Members count:', members.length);

      // Calculer les dates pour les deux dernières semaines (dimanches)
      const getDateKey = (date) => date.toISOString().split('T')[0];

      const today = new Date();
      const currentDay = today.getDay(); // 0 = dimanche
      const daysToLastSunday = currentDay === 0 ? 0 : currentDay;
      const lastSunday = new Date(today);
      lastSunday.setDate(today.getDate() - daysToLastSunday);

      const previousSunday = new Date(lastSunday);
      previousSunday.setDate(lastSunday.getDate() - 7);

      const w0DateKey = getDateKey(lastSunday); // Cette semaine (W0)
      const w1DateKey = getDateKey(previousSunday); // Semaine précédente (W-1)

      console.log('W-1 date:', w1DateKey, 'W0 date:', w0DateKey);

      // Charger les présences pour les deux semaines
      const [w1Response, w0Response] = await Promise.all([
        attendanceAPI.getAttendance({ sunday_date: w1DateKey, limit: 1000 }),
        attendanceAPI.getAttendance({ sunday_date: w0DateKey, limit: 1000 })
      ]);

      const w1Attendance = w1Response.data.attendance || [];
      const w0Attendance = w0Response.data.attendance || [];

      console.log('W-1 attendance:', w1Attendance.length, 'W0 attendance:', w0Attendance.length);

      // Créer des maps pour un accès rapide
      const w1Map = new Map(w1Attendance.map(record => [record.member_id, record.present]));
      const w0Map = new Map(w0Attendance.map(record => [record.member_id, record.present]));

      // Filtrer les membres : présents en W-1 et absents en W0
      const callMembers = members.filter(member => {
        const presentW1 = w1Map.get(member.id) === true;
        const presentW0 = w0Map.get(member.id) === true;
        return presentW1 && !presentW0;
      });

      console.log('Call members count:', callMembers.length);

      // Créer la liste d'appels
      const formattedCalls = callMembers.map(member => ({
        id: `call-${member.id}`,
        member: {
          id: member.id,
          name: `${member.first_name} ${member.last_name}`,
          phone: member.phone_primary,
          zone: member.area?.name || 'Zone inconnue',
          leader: member.leader?.first_name || 'Leader inconnu',
          ministry: member.ministry || 'Non spécifié',
          status: member.state,
          lastPresence: member.last_attendance_date,
          email: 'N/A',
          address: 'N/A',
        },
        callStatus: 'pending',
        priority: 'medium',
        reason: 'absent_this_week',
        scheduledDate: null,
        notes: '',
        followup_notes: '',
        assignedTo: 'Auto-généré',
        callResult: 'pending',
        callDate: null,
        callHistory: [], // Vide pour les nouveaux appels générés
      }));

      setCalls(formattedCalls);
      setFilteredCalls(formattedCalls);
    } catch (error) {
      console.error('Error loading calls:', error);
      Toast.show({
        type: 'error',
        text1: 'Erreur',
        text2: 'Erreur lors du chargement des appels',
      });
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    loadCallsCallback();
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, [loadCallsCallback, fadeAnim]);


  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      loadCallsCallback();
      setRefreshing(false);
    }, 1500);
  };

  // Filtrage des appels
  useEffect(() => {
    let results = calls;

    if (searchTerm) {
      results = results.filter(call =>
        call.member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        call.member.phone.includes(searchTerm) ||
        call.member.ministry.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredCalls(results);
  }, [searchTerm, calls]);

  const handleCall = async (phoneNumber) => {
    try {
      // Ouvrir l'application téléphone
      Linking.openURL(`tel:${phoneNumber}`);

      // Enregistrer l'appel dans l'API
      if (selectedCall) {
        await logCallAction(selectedCall.member.id, 'Phone', 'Contacted', 'Appel effectué via l\'application');
        // Recharger les données pour mettre à jour l'historique
        await loadCallsCallback();
      }
    } catch (error) {
      console.error('Error logging call:', error);
      Toast.show({
        type: 'error',
        text1: 'Erreur',
        text2: 'Impossible d\'enregistrer l\'appel',
      });
    }
  };

  const handleWhatsApp = async (phoneNumber, memberName) => {
    try {
      const message = `Bonjour ${memberName}, nous vous contactons pour prendre de vos nouvelles.`;
      const encodedMessage = encodeURIComponent(message);
      Linking.openURL(`https://wa.me/${phoneNumber.replace(/\s/g, '')}?text=${encodedMessage}`);

      // Enregistrer l'action WhatsApp dans l'API
      if (selectedCall) {
        await logCallAction(selectedCall.member.id, 'WhatsApp', 'Contacted', `Message WhatsApp envoyé: "${message}"`);
        // Recharger les données pour mettre à jour l'historique
        await loadCallsCallback();
      }
    } catch (error) {
      console.error('Error logging WhatsApp action:', error);
      Toast.show({
        type: 'error',
        text1: 'Erreur',
        text2: 'Impossible d\'enregistrer l\'action WhatsApp',
      });
    }
  };

  const logCallAction = async (memberId, contactMethod, outcome, notes) => {
    try {
      const callLogData = {
        member_id: memberId,
        outcome: outcome,
        notes: notes,
        contact_method: contactMethod,
        call_duration: 0, // À ajuster si nécessaire
        followup_notes: selectedCall?.followup_notes || null,
      };

      await callLogAPI.createCallLog(callLogData);

      Toast.show({
        type: 'success',
        text1: 'Action enregistrée',
        text2: `${contactMethod} enregistré avec succès`,
      });
    } catch (error) {
      console.error('Error creating call log:', error);
      throw error; // Re-throw pour que l'appelant gère l'erreur
    }
  };

  const handleBulkAction = async (action) => {
    try {
      switch (action) {
        case 'mark_completed':
          // Pour l'instant, on garde la logique locale car il faudrait une API spécifique
          // pour marquer plusieurs appels comme terminés
          setCalls(prev => prev.map(call =>
            selectedCalls.includes(call.id)
              ? {
                ...call,
                callStatus: 'completed',
                callHistory: [
                  ...call.callHistory,
                  {
                    id: `bulk-${Date.now()}`,
                    date: new Date().toISOString().split('T')[0],
                    type: 'bulk_action',
                    status: 'completed',
                    notes: 'Marqué comme terminé en lot',
                    outcome: 'Completed',
                  },
                ],
              }
              : call
          ));
          Alert.alert('Succès', `${selectedCalls.length} appels marqués comme terminés`);
          break;
        case 'send_reminders':
          // Envoyer des rappels WhatsApp à tous les membres sélectionnés
          for (const callId of selectedCalls) {
            const call = calls.find(c => c.id === callId);
            if (call) {
              await handleWhatsApp(call.member.phone, call.member.name);
              // Petite pause entre chaque envoi pour éviter la surcharge
              await new Promise(resolve => setTimeout(resolve, 500));
            }
          }
          Alert.alert('Rappels', `${selectedCalls.length} rappels envoyés`);
          break;
        default:
          break;
      }
      setSelectedCalls([]);
    } catch (error) {
      console.error('Error in bulk action:', error);
      Alert.alert('Erreur', 'Une erreur est survenue lors de l\'action groupée');
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return colors.danger;
      case 'medium': return colors.warning;
      case 'low': return colors.success;
      default: return colors.textLight;
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'high': return 'alert-circle';
      case 'medium': return 'clock-alert';
      case 'low': return 'information';
      default: return 'information';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return 'check-circle';
      case 'scheduled': return 'clock-outline';
      case 'pending': return 'alert-circle-outline';
      default: return 'clock-outline';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return colors.success;
      case 'scheduled': return colors.warning;
      case 'pending': return colors.danger;
      default: return colors.textLight;
    }
  };

  const openCallDetails = (call) => {
    setSelectedCall(call);
    setShowCallDetails(true);
  };

  const CallStats = () => {
    const totalCalls = calls.length;
    const pendingCalls = calls.filter(c => c.callStatus === 'pending').length;
    const completedCalls = calls.filter(c => c.callStatus === 'completed').length;
    const successRate = totalCalls > 0 ? Math.round((completedCalls / totalCalls) * 100) : 0;

    return (
      <View style={styles.statsContainer}>
        <LinearGradient
          colors={[colors.gradientStart, colors.gradientEnd]}
          style={styles.statCard}
        >
          <View style={styles.statContent}>
            <View style={styles.statIconContainer}>
              <Icon name="alert-circle" size={24} color={colors.card} />
            </View>
            <View>
              <Text style={styles.statLabel}>Appels à traiter</Text>
              <Text style={styles.statValue}>{totalCalls}</Text>
              <Text style={styles.statSubtext}>Générés automatiquement</Text>
            </View>
          </View>
        </LinearGradient>

        <LinearGradient
          colors={['#F59E0B', '#D97706']}
          style={styles.statCard}
        >
          <View style={styles.statContent}>
            <View style={styles.statIconContainer}>
              <Icon name="clock-outline" size={24} color={colors.card} />
            </View>
            <View>
              <Text style={styles.statLabel}>En Attente</Text>
              <Text style={styles.statValue}>{pendingCalls}</Text>
              <Text style={styles.statSubtext}>À contacter</Text>
            </View>
          </View>
        </LinearGradient>

        <LinearGradient
          colors={['#10B981', '#059669']}
          style={styles.statCard}
        >
          <View style={styles.statContent}>
            <View style={styles.statIconContainer}>
              <Icon name="check-circle" size={24} color={colors.card} />
            </View>
            <View>
              <Text style={styles.statLabel}>Terminés</Text>
              <Text style={styles.statValue}>{completedCalls}</Text>
              <Text style={styles.statSubtext}>Taux de réussite {successRate}%</Text>
            </View>
          </View>
        </LinearGradient>

        <LinearGradient
          colors={['#8B5CF6', '#7C3AED']}
          style={styles.statCard}
        >
          <View style={styles.statContent}>
            <View style={styles.statIconContainer}>
              <Icon name="account-group" size={24} color={colors.card} />
            </View>
            <View>
              <Text style={styles.statLabel}>Membres ciblés</Text>
              <Text style={styles.statValue}>{totalCalls}</Text>
              <Text style={styles.statSubtext}>Présents W-1, absents W0</Text>
            </View>
          </View>
        </LinearGradient>
      </View>
    );
  };

  const CallItem = ({ item }) => (
    <Animated.View style={[
      styles.callItem,
      { opacity: fadeAnim },
    ]}>
      <TouchableOpacity
        style={[
          styles.callItemContent,
          selectedCalls.includes(item.id) && styles.selectedCallItem,
        ]}
        onPress={() => openCallDetails(item)}
        onLongPress={() => {
          if (selectedCalls.includes(item.id)) {
            setSelectedCalls(prev => prev.filter(id => id !== item.id));
          } else {
            setSelectedCalls(prev => [...prev, item.id]);
          }
        }}
      >
        {/* En-tête de l'appel */}
        <View style={styles.callHeader}>
          <View style={styles.memberInfo}>
            <View style={styles.avatar}>
              <Icon name="account" size={20} color={colors.textLight} />
            </View>
            <View style={styles.memberDetails}>
              <Text style={styles.memberName}>{item.member.name}</Text>
              <Text style={styles.memberPhone}>{item.member.phone}</Text>
            </View>
          </View>

          <View style={styles.callStatus}>
            <Icon
              name={getPriorityIcon(item.priority)}
              size={16}
              color={getPriorityColor(item.priority)}
            />
            <Text style={[styles.priorityText, { color: getPriorityColor(item.priority) }]}>
              {item.priority === 'high' ? 'Urgent' : item.priority === 'medium' ? 'Moyen' : 'Faible'}
            </Text>
          </View>
        </View>

        {/* Détails de l'appel */}
        <View style={styles.callDetails}>
          <View style={styles.detailRow}>
            <Icon name="map-marker" size={14} color={colors.textLight} />
            <Text style={styles.detailText}>{item.member.zone}</Text>
            <Icon name="account-multiple" size={14} color={colors.textLight} style={styles.detailIcon} />
            <Text style={styles.detailText}>{item.member.ministry}</Text>
          </View>

          <View style={styles.detailRow}>
            <Icon name={getStatusIcon(item.callStatus)} size={14} color={getStatusColor(item.callStatus)} />
            <Text style={[styles.statusText, { color: getStatusColor(item.callStatus) }]}>
              {item.callStatus === 'pending' ? 'En attente' :
                item.callStatus === 'scheduled' ? 'Planifié' : 'Terminé'}
            </Text>
          </View>

          <Text style={styles.reasonText}>
            {item.reason === 'absent_this_week' && '🎯 Absent cette semaine'}
            {item.reason === 'absent_2_weeks' && '⚠️ Absent 2 semaines consécutives'}
            {item.reason === 'no_contact_1_month' && '📅 Pas de contact depuis 1 mois'}
          </Text>

          {item.scheduledDate && (
            <View style={styles.scheduledDate}>
              <Icon name="calendar-clock" size={14} color={colors.warning} />
              <Text style={styles.scheduledText}>
                Rappel: {new Date(item.scheduledDate).toLocaleDateString('fr-FR')}
              </Text>
            </View>
          )}
        </View>

        {/* Actions rapides */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={[styles.quickAction, styles.callAction]}
            onPress={() => {
              setSelectedCall(item);
              handleCall(item.member.phone);
            }}
          >
            <Icon name="phone" size={16} color={colors.card} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.quickAction, styles.whatsappAction]}
            onPress={() => {
              setSelectedCall(item);
              handleWhatsApp(item.member.phone, item.member.name);
            }}
          >
            <Icon name="whatsapp" size={16} color={colors.card} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.quickAction, styles.infoAction]}
            onPress={() => openCallDetails(item)}
          >
            <Icon name="information" size={16} color={colors.card} />
          </TouchableOpacity>
        </View>

        {/* Indicateur de sélection */}
        {selectedCalls.includes(item.id) && (
          <View style={styles.selectionIndicator}>
            <Icon name="check-circle" size={20} color={colors.primary} />
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );

  const CallDetailsModal = () => (
    <Modal
      visible={showCallDetails}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowCallDetails(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {selectedCall && (
            <>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Détails de l'Appel</Text>
                <TouchableOpacity onPress={() => setShowCallDetails(false)}>
                  <Icon name="close" size={24} color={colors.text} />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalBody}>
                <View style={styles.memberSection}>
                  <Text style={styles.sectionTitle}>Membre</Text>
                  <View style={styles.memberCard}>
                    <Text style={styles.memberNameLarge}>{selectedCall.member.name}</Text>
                    <Text style={styles.memberInfoText}>{selectedCall.member.phone}</Text>
                    <Text style={styles.memberInfoText}>{selectedCall.member.email}</Text>
                    <Text style={styles.memberInfoText}>{selectedCall.member.address}</Text>
                  </View>
                </View>

                <View style={styles.callInfoSection}>
                  <Text style={styles.sectionTitle}>Informations Appel</Text>
                  <View style={styles.infoGrid}>
                    <View style={styles.infoItem}>
                      <Text style={styles.infoLabel}>Statut</Text>
                      <View style={styles.statusBadge}>
                        <Icon
                          name={getStatusIcon(selectedCall.callStatus)}
                          size={14}
                          color={getStatusColor(selectedCall.callStatus)}
                        />
                        <Text style={[styles.infoValue, { color: getStatusColor(selectedCall.callStatus) }]}>
                          {selectedCall.callStatus === 'pending' ? 'En attente' :
                            selectedCall.callStatus === 'scheduled' ? 'Planifié' : 'Terminé'}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.infoItem}>
                      <Text style={styles.infoLabel}>Priorité</Text>
                      <View style={styles.statusBadge}>
                        <Icon
                          name={getPriorityIcon(selectedCall.priority)}
                          size={14}
                          color={getPriorityColor(selectedCall.priority)}
                        />
                        <Text style={[styles.infoValue, { color: getPriorityColor(selectedCall.priority) }]}>
                          {selectedCall.priority === 'high' ? 'Urgent' :
                            selectedCall.priority === 'medium' ? 'Moyen' : 'Faible'}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>

                {selectedCall.callHistory.length > 0 && (
                  <View style={styles.historySection}>
                    <Text style={styles.sectionTitle}>Historique des Appels</Text>
                    {selectedCall.callHistory.map((history, index) => (
                      <View key={index} style={styles.historyItem}>
                        <Icon name="history" size={16} color={colors.textLight} />
                        <Text style={styles.historyText}>
                          {new Date(history.date).toLocaleDateString('fr-FR')} -
                          {history.type === 'call' ? ' 📞 Appel' : ' 💬 WhatsApp'} -
                          {history.notes}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}

                {selectedCall.followup_notes && (
                  <View style={styles.followupSection}>
                    <Text style={styles.sectionTitle}>Notes de suivi</Text>
                    <View style={styles.followupCard}>
                      <Text style={styles.followupText}>{selectedCall.followup_notes}</Text>
                    </View>
                  </View>
                )}

                <View style={styles.actionSection}>
                  <Text style={styles.sectionTitle}>Actions</Text>
                  <View style={styles.actionButtons}>
                    <TouchableOpacity
                      style={[styles.modalAction, styles.primaryAction]}
                      onPress={() => {
                        handleCall(selectedCall.member.phone);
                        setShowCallDetails(false);
                      }}
                    >
                      <Icon name="phone" size={20} color={colors.card} />
                      <Text style={styles.modalActionText}>Appeler</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.modalAction, styles.successAction]}
                      onPress={() => {
                        handleWhatsApp(selectedCall.member.phone, selectedCall.member.name);
                        setShowCallDetails(false);
                      }}
                    >
                      <Icon name="whatsapp" size={20} color={colors.card} />
                      <Text style={styles.modalActionText}>WhatsApp</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </ScrollView>
            </>
          )}
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={colors.primary} barStyle="light-content" />

      {/* En-tête amélioré compact avec dégradé */}
      <LinearGradient
        colors={[colors.gradientStart, colors.gradientEnd]}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerOverlay}>
          <View style={styles.headerTop}>
            <View style={styles.headerLeft}>
              <View style={styles.headerIconContainer}>
                <Icon name="phone-in-talk" size={20} color={colors.card} />
              </View>
              <View>
                <Text style={styles.headerTitle}>Appels de Suivi</Text>
                <Text style={styles.headerSubtitle}>
                  {filteredCalls.length} appels à traiter
                </Text>
              </View>
            </View>
            <View style={styles.headerRight}>
              <TouchableOpacity style={styles.headerAvatar}>
                <Icon name="account-circle" size={28} color={colors.card} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.headerStats}>
            <View style={styles.headerStat}>
              <Text style={styles.headerStatValue}>
                {filteredCalls.filter(c => c.callStatus === 'pending').length}
              </Text>
              <Text style={styles.headerStatLabel}>En attente</Text>
            </View>
            <View style={styles.headerStatDivider} />
            <View style={styles.headerStat}>
              <Text style={styles.headerStatValue}>
                {filteredCalls.filter(c => c.callStatus === 'completed').length}
              </Text>
              <Text style={styles.headerStatLabel}>Terminés</Text>
            </View>
            <View style={styles.headerStatDivider} />
            <View style={styles.headerStat}>
              <Text style={styles.headerStatValue}>
                {Math.round((filteredCalls.filter(c => c.callStatus === 'completed').length / Math.max(filteredCalls.length, 1)) * 100)}%
              </Text>
              <Text style={styles.headerStatLabel}>Taux</Text>
            </View>
          </View>

          <View style={styles.headerActions}>
            <TouchableOpacity
              style={[styles.headerActionButton, styles.headerPrimaryAction]}
              onPress={() => setView(view === 'list' ? 'stats' : 'list')}
            >
              <Icon
                name={view === 'list' ? 'chart-box' : 'format-list-bulleted'}
                size={16}
                color={colors.card}
              />
              <Text style={styles.headerActionText}>
                {view === 'list' ? 'Stats' : 'Liste'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerActionButton}>
              <Icon name="export" size={16} color={colors.card} />
              <Text style={styles.headerActionText}>Exporter</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerActionButton}>
              <Icon name="filter-variant" size={16} color={colors.card} />
              <Text style={styles.headerActionText}>Filtrer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        {/* Vue Statistiques */}
        {view === 'stats' && <CallStats />}

        {/* Barre de recherche */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Icon name="magnify" size={20} color={colors.textLight} />
            <TextInput
              style={styles.searchInput}
              placeholder="Rechercher un membre, téléphone ou ministère..."
              value={searchTerm}
              onChangeText={setSearchTerm}
              placeholderTextColor={colors.textLight}
            />
            {searchTerm.length > 0 && (
              <TouchableOpacity onPress={() => setSearchTerm('')}>
                <Icon name="close-circle" size={20} color={colors.textLight} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Actions groupées */}
        {selectedCalls.length > 0 && (
          <View style={styles.bulkActions}>
            <View style={styles.bulkActionsHeader}>
              <Text style={styles.bulkActionsText}>
                {selectedCalls.length} appels sélectionnés
              </Text>
              <TouchableOpacity onPress={() => setSelectedCalls([])}>
                <Icon name="close" size={20} color={colors.primary} />
              </TouchableOpacity>
            </View>
            <View style={styles.bulkActionsButtons}>
              <TouchableOpacity
                style={[styles.bulkActionButton, styles.successButton]}
                onPress={() => handleBulkAction('mark_completed')}
              >
                <Icon name="check" size={16} color={colors.card} />
                <Text style={styles.bulkActionText}>Marquer terminés</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.bulkActionButton, styles.primaryButton]}
                onPress={() => handleBulkAction('send_reminders')}
              >
                <Icon name="send" size={16} color={colors.card} />
                <Text style={styles.bulkActionText}>Envoyer rappels</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Liste des appels */}
        <View style={styles.callsList}>
          <Text style={styles.sectionTitle}>
            Appels {filteredCalls.length > 0 ? `(${filteredCalls.length})` : ''}
          </Text>
          <FlatList
            data={filteredCalls}
            renderItem={({ item }) => <CallItem item={item} />}
            keyExtractor={item => item.id.toString()}
            scrollEnabled={false}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Icon name="account-group" size={64} color={colors.border} />
                <Text style={styles.emptyStateTitle}>Aucun appel trouvé</Text>
                <Text style={styles.emptyStateText}>
                  {searchTerm ? 'Aucun résultat pour votre recherche' : 'Tous les appels sont traités'}
                </Text>
              </View>
            }
          />
        </View>
      </ScrollView>

      {/* Modal des détails */}
      <CallDetailsModal />

      {/* Bouton d'action flottant */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setShowFilters(!showFilters)}
      >
        <LinearGradient
          colors={[colors.gradientStart, colors.gradientEnd]}
          style={styles.fabGradient}
        >
          <Icon name="filter" size={24} color={colors.card} />
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FEF2F2',
  },
  header: {
    paddingTop: 38,
    paddingBottom: 10,
    paddingHorizontal: 14,
  },
  headerOverlay: {
    backgroundColor: 'rgba(0,0,0,0.08)',
    borderRadius: 12,
    padding: 12,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerIconContainer: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: 10,
    color: '#FFFFFF',
    opacity: 0.9,
    marginTop: 0,
  },
  headerRight: {
    alignItems: 'center',
  },
  headerAvatar: {
    padding: 1,
  },
  headerStats: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 8,
    marginBottom: 8,
  },
  headerStat: {
    alignItems: 'center',
    flex: 1,
  },
  headerStatValue: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  headerStatLabel: {
    fontSize: 7,
    color: '#FFFFFF',
    opacity: 0.8,
    marginTop: 0,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  headerStatDivider: {
    width: 1,
    height: 16,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  headerActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 4,
  },
  headerActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingVertical: 5,
    paddingHorizontal: 6,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 6,
    minWidth: 48,
    justifyContent: 'center',
  },
  headerPrimaryAction: {
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  headerActionText: {
    fontSize: 9,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
  },
  statsContainer: {
    padding: 16,
    gap: 12,
  },
  statCard: {
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  statContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  statIconContainer: {
    padding: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
  },
  statLabel: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 4,
  },
  statSubtext: {
    fontSize: 12,
    color: '#FFFFFF',
    opacity: 0.8,
    marginTop: 2,
  },
  searchContainer: {
    padding: 16,
    paddingTop: 8,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#1F2937',
  },
  bulkActions: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    marginTop: 0,
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  bulkActionsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  bulkActionsText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#DC2626',
  },
  bulkActionsButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  bulkActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  successButton: {
    backgroundColor: '#10B981',
  },
  primaryButton: {
    backgroundColor: '#DC2626',
  },
  bulkActionText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  callsList: {
    padding: 16,
    paddingTop: 0,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  callItem: {
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  callItemContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#DC2626',
  },
  selectedCallItem: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
    borderWidth: 2,
  },
  callHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  memberInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  memberDetails: {
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  memberPhone: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  callStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  priorityText: {
    fontSize: 12,
    fontWeight: '600',
  },
  callDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailIcon: {
    marginLeft: 12,
  },
  detailText: {
    fontSize: 12,
    color: '#6B7280',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  reasonText: {
    fontSize: 13,
    color: '#DC2626',
    fontWeight: '500',
    marginTop: 4,
  },
  scheduledDate: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  scheduledText: {
    fontSize: 12,
    color: '#F59E0B',
    fontWeight: '500',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 12,
  },
  quickAction: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  callAction: {
    backgroundColor: '#10B981',
  },
  whatsappAction: {
    backgroundColor: '#25D366',
  },
  infoAction: {
    backgroundColor: '#6B7280',
  },
  selectionIndicator: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6B7280',
    marginTop: 16,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 8,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fabGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Styles pour le modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  modalBody: {
    padding: 20,
  },
  memberSection: {
    marginBottom: 24,
  },
  memberCard: {
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  memberNameLarge: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  memberInfoText: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 2,
  },
  callInfoSection: {
    marginBottom: 24,
  },
  infoGrid: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 8,
  },
  infoItem: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    padding: 8,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  historySection: {
    marginBottom: 24,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    marginBottom: 8,
  },
  historyText: {
    fontSize: 12,
    color: '#6B7280',
    flex: 1,
  },
  actionSection: {
    marginBottom: 24,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  modalAction: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 8,
  },
  primaryAction: {
    backgroundColor: '#DC2626',
  },
  successAction: {
    backgroundColor: '#25D366',
  },
  modalActionText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  followupSection: {
    marginBottom: 24,
  },
  followupCard: {
    backgroundColor: '#FEF3C7',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
  },
  followupText: {
    fontSize: 14,
    color: '#92400E',
    lineHeight: 20,
  },
});

export default CallsScreen;
