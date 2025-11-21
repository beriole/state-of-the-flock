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
  TextInput
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Feather from 'react-native-vector-icons/Feather';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { useTranslation } from 'react-i18next';
import { memberAPI, attendanceAPI } from '../../utils/api';

const AttendanceScreen = () => {
  const { t, i18n } = useTranslation();

  // États
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
          <TouchableOpacity style={styles.notificationBtn}>
            <Feather name="bell" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

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
    </SafeAreaView>
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
});

export default AttendanceScreen;
