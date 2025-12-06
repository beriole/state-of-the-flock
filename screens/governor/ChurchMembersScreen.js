import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TextInput,
  Modal,
  Alert,
  ActivityIndicator,
  RefreshControl,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Feather from 'react-native-vector-icons/Feather';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { memberAPI } from '../../utils/api';
import Toast from 'react-native-toast-message';
import { Linking } from 'react-native';

const ChurchMembersScreen = () => {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const { user } = useAuth();

  const [members, setMembers] = useState([]);
  const [filteredMembers, setFilteredMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Filtres
  const [selectedZone, setSelectedZone] = useState(null);
  const [selectedLeader, setSelectedLeader] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  // Données pour les filtres
  const [zones, setZones] = useState([]);
  const [leaders, setLeaders] = useState([]);

  // Statistiques
  const [stats, setStats] = useState({
    total: 0,
    byZone: {},
    byLeader: {},
    byState: {}
  });

  // Modal pour les actions
  const [selectedMember, setSelectedMember] = useState(null);
  const [showActionsModal, setShowActionsModal] = useState(false);

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
    info: '#3B82F6',
  };

  const fetchMembers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await memberAPI.getMembers({
        limit: 1000,
        is_active: true
      });

      const membersData = (response.data?.members || []).filter(item => item && typeof item === 'object' && item.id);
      setMembers(membersData);
      setFilteredMembers(membersData);

      // Calculer les statistiques
      calculateStats(membersData);

      // Extraire les zones et leaders uniques
      extractFiltersData(membersData);

    } catch (error) {
      console.error('Error fetching members:', error);
      Toast.show({
        type: 'error',
        text1: 'Erreur',
        text2: 'Impossible de charger les membres'
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const calculateStats = (membersData) => {
    if (!Array.isArray(membersData)) return;
    const stats = {
      total: membersData.length,
      byZone: {},
      byLeader: {},
      byState: {}
    };

    membersData.forEach(member => {
      if (!member || typeof member !== 'object') return;
      // Par zone
      const zoneName = member.area?.name || 'Non assigné';
      stats.byZone[zoneName] = (stats.byZone[zoneName] || 0) + 1;

      // Par leader
      const leaderName = member.leader ? `${member.leader.first_name} ${member.leader.last_name}` : 'Non assigné';
      stats.byLeader[leaderName] = (stats.byLeader[leaderName] || 0) + 1;

      // Par état
      const state = member.state || 'Sheep';
      stats.byState[state] = (stats.byState[state] || 0) + 1;
    });

    setStats(stats);
  };

  const extractFiltersData = (membersData) => {
    if (!Array.isArray(membersData)) return;
    // Zones uniques
    const uniqueZones = [...new Set(membersData.map(m => m.area?.name).filter(Boolean))]
      .map(name => ({
        name,
        id: membersData.find(m => m.area?.name === name)?.area?.id
      }));
    setZones(uniqueZones);

    // Leaders uniques
    const uniqueLeaders = [...new Set(membersData.map(m =>
      m.leader ? `${m.leader.first_name} ${m.leader.last_name}` : null
    ).filter(Boolean))]
      .map(name => ({
        name,
        id: membersData.find(m => `${m.leader?.first_name} ${m.leader?.last_name}` === name)?.leader?.id
      }));
    setLeaders(uniqueLeaders);
  };

  const applyFilters = useCallback(() => {
    if (!Array.isArray(members)) {
      setFilteredMembers([]);
      return;
    }
    let filtered = [...members];

    // Filtre par recherche
    if (searchQuery) {
      filtered = filtered.filter(member =>
        (member.first_name && member.first_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (member.last_name && member.last_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (member.phone_primary && member.phone_primary.includes(searchQuery))
      );
    }

    // Filtre par zone
    if (selectedZone) {
      filtered = filtered.filter(member => member.area?.id === selectedZone.id);
    }

    // Filtre par leader
    if (selectedLeader) {
      filtered = filtered.filter(member => member.leader?.id === selectedLeader.id);
    }

    setFilteredMembers(filtered);
  }, [members, searchQuery, selectedZone, selectedLeader]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchMembers();
  };

  const clearFilters = () => {
    setSelectedZone(null);
    setSelectedLeader(null);
    setSearchQuery('');
  };

  const handleCall = (phoneNumber) => {
    if (phoneNumber) {
      Linking.openURL(`tel:${phoneNumber}`);
    } else {
      Alert.alert('Erreur', 'Numéro de téléphone non disponible');
    }
  };

  const handleWhatsApp = (phoneNumber, memberName) => {
    if (phoneNumber) {
      const message = `Bonjour ${memberName}, nous vous contactons pour prendre de vos nouvelles.`;
      const encodedMessage = encodeURIComponent(message);
      Linking.openURL(`https://wa.me/${phoneNumber.replace(/\s/g, '')}?text=${encodedMessage}`);
    } else {
      Alert.alert('Erreur', 'Numéro de téléphone non disponible');
    }
  };

  const getStateColor = (state) => {
    switch (state) {
      case 'Sheep': return colors.info;
      case 'Goat': return colors.warning;
      case 'Lamb': return colors.success;
      default: return colors.textLight;
    }
  };

  const renderMemberItem = ({ item }) => {
    if (!item || !item.id) return null;
    return (
      <TouchableOpacity
        style={styles.memberCard}
        onPress={() => {
          setSelectedMember(item);
          setShowActionsModal(true);
        }}
      >
        <View style={styles.memberHeader}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>
              {(item.first_name || '?')[0]}{(item.last_name || '?')[0]}
            </Text>
          </View>
          <View style={styles.memberInfo}>
            <Text style={styles.memberName}>
              {item.first_name || 'N/A'} {item.last_name || 'N/A'}
            </Text>
            <Text style={styles.memberPhone}>
              {item.phone_primary || 'Pas de téléphone'}
            </Text>
            <View style={styles.memberMeta}>
              <Text style={styles.memberZone}>
                {item.area?.name || 'Zone non assignée'}
              </Text>
              <Text style={styles.memberLeader}>
                {item.leader ? `${item.leader.first_name || 'N/A'} ${item.leader.last_name || 'N/A'}` : 'Leader non assigné'}
              </Text>
            </View>
          </View>
          <View style={styles.memberStatus}>
            <View style={[styles.stateBadge, { backgroundColor: getStateColor(item.state) }]}>
              <Text style={styles.stateText}>{item.state || 'Sheep'}</Text>
            </View>
          </View>
        </View>

        <View style={styles.memberActions}>
          <TouchableOpacity
            style={[styles.actionButton, styles.callButton]}
            onPress={() => handleCall(item.phone_primary)}
          >
            <Icon name="phone" size={16} color={colors.card} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.whatsappButton]}
            onPress={() => handleWhatsApp(item.phone_primary, `${item.first_name || 'N/A'} ${item.last_name || 'N/A'}`)}
          >
            <Icon name="whatsapp" size={16} color={colors.card} />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  const renderStatsCard = ({ title, value, icon, color }) => (
    <View style={[styles.statsCard, { borderLeftColor: color }]}>
      <View style={[styles.statsIcon, { backgroundColor: `${color}20` }]}>
        <Icon name={icon} size={20} color={color} />
      </View>
      <View>
        <Text style={styles.statsValue}>{value}</Text>
        <Text style={styles.statsTitle}>{title}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerBackground} />
        <View style={styles.headerContent}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Icon name="arrow-left" size={24} color={colors.card} />
          </TouchableOpacity>

          <View style={styles.headerInfo}>
            <Text style={styles.headerTitle}>Membres de l'Église</Text>
            <Text style={styles.headerSubtitle}>
              {filteredMembers.length} membre{filteredMembers.length > 1 ? 's' : ''}
            </Text>
          </View>

          <TouchableOpacity
            onPress={() => setShowFilters(true)}
            style={styles.filterButton}
          >
            <Icon name="filter-variant" size={24} color={colors.card} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Stats Bar */}
      <View style={styles.statsBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.statsContainer}>
          {renderStatsCard({
            title: 'Total',
            value: stats.total,
            icon: 'account-group',
            color: colors.primary
          })}
          {renderStatsCard({
            title: 'Zones',
            value: Object.keys(stats.byZone).length,
            icon: 'map-marker',
            color: colors.info
          })}
          {renderStatsCard({
            title: 'Leaders',
            value: Object.keys(stats.byLeader).length,
            icon: 'crown',
            color: colors.warning
          })}
          {renderStatsCard({
            title: 'Sheep',
            value: stats.byState.Sheep || 0,
            icon: 'baby-face',
            color: colors.info
          })}
          {renderStatsCard({
            title: 'Goat',
            value: stats.byState.Goat || 0,
            icon: 'cow',
            color: colors.warning
          })}
        </ScrollView>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Icon name="magnify" size={20} color={colors.textLight} />
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher par nom ou téléphone..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor={colors.textLight}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Icon name="close-circle" size={20} color={colors.textLight} />
          </TouchableOpacity>
        )}
      </View>

      {/* Active Filters */}
      {(selectedZone || selectedLeader) && (
        <View style={styles.activeFilters}>
          <Text style={styles.filtersTitle}>Filtres actifs:</Text>
          <View style={styles.filterTags}>
            {selectedZone && (
              <View style={styles.filterTag}>
                <Text style={styles.filterTagText}>Zone: {selectedZone.name}</Text>
                <TouchableOpacity onPress={() => setSelectedZone(null)}>
                  <Icon name="close" size={16} color={colors.primary} />
                </TouchableOpacity>
              </View>
            )}
            {selectedLeader && (
              <View style={styles.filterTag}>
                <Text style={styles.filterTagText}>Leader: {selectedLeader.name}</Text>
                <TouchableOpacity onPress={() => setSelectedLeader(null)}>
                  <Icon name="close" size={16} color={colors.primary} />
                </TouchableOpacity>
              </View>
            )}
            <TouchableOpacity onPress={clearFilters} style={styles.clearButton}>
              <Text style={styles.clearButtonText}>Effacer tout</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Members List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Chargement des membres...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredMembers}
          renderItem={renderMemberItem}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[colors.primary]}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Icon name="account-group" size={64} color={colors.border} />
              <Text style={styles.emptyTitle}>Aucun membre trouvé</Text>
              <Text style={styles.emptyText}>
                {searchQuery || selectedZone || selectedLeader
                  ? 'Essayez de modifier vos filtres'
                  : 'Aucun membre dans l\'église'
                }
              </Text>
            </View>
          }
        />
      )}

      {/* Filters Modal */}
      <Modal
        visible={showFilters}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowFilters(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filtres</Text>
              <TouchableOpacity onPress={() => setShowFilters(false)}>
                <Icon name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              {/* Zone Filter */}
              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>Filtrer par Zone</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <TouchableOpacity
                    style={[styles.filterOption, !selectedZone && styles.filterOptionActive]}
                    onPress={() => setSelectedZone(null)}
                  >
                    <Text style={[styles.filterOptionText, !selectedZone && styles.filterOptionTextActive]}>
                      Toutes les zones
                    </Text>
                  </TouchableOpacity>
                  {zones.map(zone => (
                    <TouchableOpacity
                      key={zone.id}
                      style={[styles.filterOption, selectedZone?.id === zone.id && styles.filterOptionActive]}
                      onPress={() => setSelectedZone(zone)}
                    >
                      <Text style={[styles.filterOptionText, selectedZone?.id === zone.id && styles.filterOptionTextActive]}>
                        {zone.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* Leader Filter */}
              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>Filtrer par Leader</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <TouchableOpacity
                    style={[styles.filterOption, !selectedLeader && styles.filterOptionActive]}
                    onPress={() => setSelectedLeader(null)}
                  >
                    <Text style={[styles.filterOptionText, !selectedLeader && styles.filterOptionTextActive]}>
                      Tous les leaders
                    </Text>
                  </TouchableOpacity>
                  {leaders.map(leader => (
                    <TouchableOpacity
                      key={leader.id}
                      style={[styles.filterOption, selectedLeader?.id === leader.id && styles.filterOptionActive]}
                      onPress={() => setSelectedLeader(leader)}
                    >
                      <Text style={[styles.filterOptionText, selectedLeader?.id === leader.id && styles.filterOptionTextActive]}>
                        {leader.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.applyButton}
                onPress={() => setShowFilters(false)}
              >
                <Text style={styles.applyButtonText}>Appliquer les filtres</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Actions Modal */}
      <Modal
        visible={showActionsModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowActionsModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedMember && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Actions pour {selectedMember.first_name || 'N/A'}</Text>
                  <TouchableOpacity onPress={() => setShowActionsModal(false)}>
                    <Icon name="close" size={24} color={colors.text} />
                  </TouchableOpacity>
                </View>

                <View style={styles.modalBody}>
                  <View style={styles.memberDetail}>
                    <Text style={styles.detailName}>
                      {selectedMember.first_name || 'N/A'} {selectedMember.last_name || 'N/A'}
                    </Text>
                    <Text style={styles.detailPhone}>
                      {selectedMember.phone_primary || 'Pas de téléphone'}
                    </Text>
                    <Text style={styles.detailZone}>
                      Zone: {selectedMember.area?.name || 'Non assignée'}
                    </Text>
                    <Text style={styles.detailLeader}>
                      Leader: {selectedMember.leader ? `${selectedMember.leader.first_name || 'N/A'} ${selectedMember.leader.last_name || 'N/A'}` : 'Non assigné'}
                    </Text>
                  </View>

                  <View style={styles.actionButtons}>
                    <TouchableOpacity
                      style={[styles.modalAction, styles.callAction]}
                      onPress={() => {
                        handleCall(selectedMember.phone_primary);
                        setShowActionsModal(false);
                      }}
                    >
                      <Icon name="phone" size={20} color={colors.card} />
                      <Text style={styles.modalActionText}>Appeler</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.modalAction, styles.whatsappAction]}
                      onPress={() => {
                        handleWhatsApp(selectedMember.phone_primary, `${selectedMember.first_name || 'N/A'} ${selectedMember.last_name || 'N/A'}`);
                        setShowActionsModal(false);
                      }}
                    >
                      <Icon name="whatsapp" size={20} color={colors.card} />
                      <Text style={styles.modalActionText}>WhatsApp</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    backgroundColor: '#DC2626',
    height: 120,
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
    backgroundColor: '#DC2626',
    opacity: 0.95,
  },
  headerContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
  },
  backButton: {
    padding: 8,
  },
  headerInfo: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
    marginTop: 2,
  },
  filterButton: {
    padding: 8,
  },
  statsBar: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  statsContainer: {
    paddingHorizontal: 16,
  },
  statsCard: {
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 12,
    borderLeftWidth: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minWidth: 100,
    marginRight: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  statsIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  statsTitle: {
    fontSize: 10,
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    margin: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  searchInput: {
    flex: 1,
    height: 48,
    marginLeft: 12,
    fontSize: 16,
    color: '#1F2937',
  },
  activeFilters: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 8,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  filtersTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  filterTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
    gap: 6,
  },
  filterTagText: {
    fontSize: 12,
    color: '#DC2626',
    fontWeight: '500',
  },
  clearButton: {
    backgroundColor: '#DC2626',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  clearButtonText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
  listContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  memberCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  memberHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    color: '#4B5563',
    fontSize: 18,
    fontWeight: 'bold',
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 2,
  },
  memberPhone: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  memberMeta: {
    flexDirection: 'row',
    gap: 12,
  },
  memberZone: {
    fontSize: 12,
    color: '#3B82F6',
    fontWeight: '500',
  },
  memberLeader: {
    fontSize: 12,
    color: '#D97706',
    fontWeight: '500',
  },
  memberStatus: {
    alignItems: 'flex-end',
  },
  stateBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  stateText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  memberActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  callButton: {
    backgroundColor: '#10B981',
  },
  whatsappButton: {
    backgroundColor: '#25D366',
  },
  detailButton: {
    backgroundColor: '#6B7280',
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6B7280',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
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
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  modalBody: {
    padding: 20,
  },
  filterSection: {
    marginBottom: 24,
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  filterOption: {
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  filterOptionActive: {
    backgroundColor: '#DC2626',
    borderColor: '#DC2626',
  },
  filterOptionText: {
    fontSize: 14,
    color: '#6B7280',
  },
  filterOptionTextActive: {
    color: '#FFFFFF',
  },
  modalFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  applyButton: {
    backgroundColor: '#DC2626',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  applyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  memberDetail: {
    marginBottom: 24,
  },
  detailName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  detailPhone: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 4,
  },
  detailZone: {
    fontSize: 14,
    color: '#3B82F6',
    marginBottom: 2,
  },
  detailLeader: {
    fontSize: 14,
    color: '#D97706',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
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
  callAction: {
    backgroundColor: '#10B981',
  },
  whatsappAction: {
    backgroundColor: '#25D366',
  },
  detailAction: {
    backgroundColor: '#6B7280',
  },
  modalActionText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default ChurchMembersScreen;