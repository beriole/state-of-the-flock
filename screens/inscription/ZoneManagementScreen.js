// screens/inscription/ZoneManagementScreen.jsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TextInput,
  FlatList,
  Modal,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Feather from 'react-native-vector-icons/Feather';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthContext';
import { areaAPI, governorAPI } from '../../utils/api';

const ZoneManagementScreen = () => {
  const { t } = useTranslation();
  const { user: authUser } = useAuth();
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [areas, setAreas] = useState([]);
  const [bacentaLeaders, setBacentaLeaders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedArea, setSelectedArea] = useState(null);
  const [selectedLeader, setSelectedLeader] = useState(null);

  const [newArea, setNewArea] = useState({
    name: '',
    number: '',
    description: ''
  });

  // Filtrage des zones
  const filteredAreas = areas.filter(area => {
    const searchLower = searchQuery.toLowerCase();
    return area.name.toLowerCase().includes(searchLower) ||
           area.number.toString().includes(searchQuery);
  });

  // Stats des zones
  const stats = [
    { key: 'total', label: 'Total Zones', value: areas.length, color: '#DC2626', icon: 'map-marker-multiple' },
    { key: 'assigned', label: 'Zones Assignées', value: areas.filter(a => a.overseer_id).length, color: '#16A34A', icon: 'check-circle' },
    { key: 'unassigned', label: 'Zones Non Assignées', value: areas.filter(a => !a.overseer_id).length, color: '#D97706', icon: 'clock' },
  ];

  // Charger les zones
  const loadAreas = async () => {
    try {
      setRefreshing(true);
      const response = await areaAPI.getAreas({ limit: 50, page: 1 });
      setAreas(response.data.areas);
    } catch (error) {
      console.error('Erreur lors du chargement des zones:', error);
      Alert.alert(t('common.error'), 'Erreur lors du chargement des zones');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Charger les Bacenta Leaders
  const loadBacentaLeaders = async () => {
    try {
      const response = await governorAPI.getBacentaLeaders();
      setBacentaLeaders(response.data.members || []);
    } catch (error) {
      console.error('Erreur lors du chargement des leaders:', error);
    }
  };

  useEffect(() => {
    loadAreas();
    loadBacentaLeaders();
  }, []);

  // Créer une nouvelle zone
  const handleAddArea = async () => {
    if (!newArea.name.trim() || !newArea.number.trim()) {
      Alert.alert(t('common.error'), 'Le nom et le numéro sont obligatoires');
      return;
    }

    setSaving(true);

    try {
      const areaData = {
        name: newArea.name.trim(),
        number: parseInt(newArea.number.trim()),
        description: newArea.description.trim() || null
      };

      const response = await areaAPI.createArea(areaData);

      setAreas([response.data, ...areas]);
      setNewArea({
        name: '',
        number: '',
        description: ''
      });
      setShowAddModal(false);

    } catch (error) {
      console.error('Erreur lors de la création de la zone:', error);
      Alert.alert(t('common.error'), error.response?.data?.error || 'Erreur lors de la création de la zone');
    } finally {
      setSaving(false);
    }
  };

  // Assigner une zone à un leader
  const handleAssignArea = async () => {
    if (!selectedArea || !selectedLeader) {
      Alert.alert(t('common.error'), 'Veuillez sélectionner une zone et un leader');
      return;
    }

    setSaving(true);

    try {
      await areaAPI.assignAreaToUser({
        user_id: selectedLeader.id,
        area_id: selectedArea.id
      });

      // Recharger les données
      await loadAreas();
      await loadBacentaLeaders();

      setShowAssignModal(false);
      setSelectedArea(null);
      setSelectedLeader(null);

      Alert.alert('Succès', 'Zone assignée avec succès au leader');

    } catch (error) {
      console.error('Erreur lors de l\'assignation:', error);
      Alert.alert(t('common.error'), error.response?.data?.error || 'Erreur lors de l\'assignation');
    } finally {
      setSaving(false);
    }
  };

  // Ouvrir modal d'assignation
  const openAssignModal = (area) => {
    setSelectedArea(area);
    setShowAssignModal(true);
  };

  // Rendu des statistiques
  const renderStat = (s) => (
    <View key={s.key} style={styles.statCard}>
      <View style={[styles.statIcon, { backgroundColor: `${s.color} 22` }]}>
        <Icon name={s.icon} size={20} color={s.color} />
      </View>
      <Text style={styles.statValue}>{s.value}</Text>
      <Text style={styles.statLabel}>{s.label}</Text>
    </View>
  );

  // Rendu d'une zone
  const renderArea = ({ item }) => (
    <TouchableOpacity
      style={styles.areaCard}
      activeOpacity={0.7}
    >
      <View style={styles.areaHeader}>
        <View style={styles.areaAvatar}>
          <Text style={styles.areaAvatarText}>{item.number}</Text>
        </View>
        <View style={styles.areaInfo}>
          <Text style={styles.areaName}>{item.name}</Text>
          <Text style={styles.areaDescription}>
            {item.overseer ? `Superviseur: ${item.overseer.first_name} ${item.overseer.last_name}` : 'Aucun superviseur'}
          </Text>
        </View>
        <View style={[styles.statusBadge, item.overseer_id ? styles.assignedBadge : styles.unassignedBadge]}>
          <Text style={styles.statusText}>
            {item.overseer_id ? 'Assignée' : 'Non assignée'}
          </Text>
        </View>
      </View>

      <View style={styles.areaActions}>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => openAssignModal(item)}
        >
          <Feather name="user-plus" size={16} color="#DC2626" />
          <Text style={styles.actionText}>Assigner</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn}>
          <Feather name="edit-2" size={16} color="#DC2626" />
          <Text style={styles.actionText}>Modifier</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#991B1B" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerBackground} />
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerTitle}>Gestion des Zones</Text>
            <Text style={styles.headerSubtitle}>Administration des zones</Text>
          </View>
          <View style={{ flexDirection: 'row' }}>
            <TouchableOpacity style={styles.notificationBtn}>
              <Feather name="bell" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Statistiques */}
        <View style={styles.statsRow}>
          {stats.map(renderStat)}
        </View>

        {/* Barre de recherche */}
        <View style={styles.searchSection}>
          <View style={styles.searchContainer}>
            <Feather name="search" size={20} color="#9CA3AF" />
            <TextInput
              style={styles.searchInput}
              placeholder="Rechercher une zone..."
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
        </View>

        {/* Liste des zones */}
        <View style={styles.areasSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {filteredAreas.length} Zone{filteredAreas.length > 1 ? 's' : ''} trouvée{filteredAreas.length > 1 ? 's' : ''}
            </Text>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#DC2626" />
              <Text style={styles.loadingText}>Chargement des zones...</Text>
            </View>
          ) : (
            <FlatList
              data={filteredAreas}
              renderItem={renderArea}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
              refreshing={refreshing}
              onRefresh={loadAreas}
            />
          )}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bouton flottant Ajouter */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setShowAddModal(true)}
      >
        <Feather name="plus" size={24} color="#FFFFFF" />
      </TouchableOpacity>

      {/* Modal Ajouter Zone */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Ajouter une Zone</Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <AntDesign name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Nom de la zone *</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Ex: Zone Yaoundé"
                  value={newArea.name}
                  onChangeText={(text) => setNewArea({ ...newArea, name: text })}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Numéro *</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Ex: 1"
                  value={newArea.number}
                  onChangeText={(text) => setNewArea({ ...newArea, number: text })}
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Description (optionnel)</Text>
                <TextInput
                  style={[styles.textInput, { height: 80 }]}
                  placeholder="Description de la zone..."
                  value={newArea.description}
                  onChangeText={(text) => setNewArea({ ...newArea, description: text })}
                  multiline
                  numberOfLines={3}
                />
              </View>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setShowAddModal(false)}
              >
                <Text style={styles.cancelBtnText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
                onPress={handleAddArea}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.saveBtnText}>Créer</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal Assigner Zone */}
      <Modal
        visible={showAssignModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAssignModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                Assigner la zone "{selectedArea?.name}"
              </Text>
              <TouchableOpacity onPress={() => setShowAssignModal(false)}>
                <AntDesign name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <View style={styles.form}>
              <Text style={styles.label}>Sélectionner un Bacenta Leader</Text>
              <ScrollView style={styles.leadersList}>
                {bacentaLeaders.map((leader) => (
                  <TouchableOpacity
                    key={leader.id}
                    style={[
                      styles.leaderItem,
                      selectedLeader?.id === leader.id && styles.leaderItemSelected
                    ]}
                    onPress={() => setSelectedLeader(leader)}
                  >
                    <View style={styles.leaderInfo}>
                      <Text style={styles.leaderName}>
                        {leader.first_name} {leader.last_name}
                      </Text>
                      <Text style={styles.leaderEmail}>{leader.email}</Text>
                      <Text style={styles.leaderZone}>
                        {leader.area_id ? 'Zone assignée' : 'Aucune zone'}
                      </Text>
                    </View>
                    {selectedLeader?.id === leader.id && (
                      <Feather name="check" size={20} color="#16A34A" />
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setShowAssignModal(false)}
              >
                <Text style={styles.cancelBtnText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
                onPress={handleAssignArea}
                disabled={saving || !selectedLeader}
              >
                {saving ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.saveBtnText}>Assigner</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FEF7F7',
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
  searchSection: {
    marginBottom: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#111827',
  },
  areasSection: {
    marginTop: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
  },
  areaCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  areaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  areaAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FEF2F2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  areaAvatarText: {
    color: '#991B1B',
    fontWeight: '800',
    fontSize: 18,
  },
  areaInfo: {
    flex: 1,
  },
  areaName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  areaDescription: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  assignedBadge: {
    backgroundColor: '#DCFCE7',
  },
  unassignedBadge: {
    backgroundColor: '#FEF3C7',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  areaActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 12,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  actionText: {
    color: '#DC2626',
    fontWeight: '600',
    fontSize: 14,
  },
  separator: {
    height: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 30,
    width: 60,
    height: 60,
    backgroundColor: '#991B1B',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
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
    padding: 20,
    minHeight: '60%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  form: {
    gap: 20,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  textInput: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111827',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 32,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
  },
  cancelBtnText: {
    color: '#6B7280',
    fontWeight: '600',
    fontSize: 16,
  },
  saveBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#991B1B',
    alignItems: 'center',
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  saveBtnDisabled: {
    opacity: 0.6,
  },
  leadersList: {
    maxHeight: 300,
    marginTop: 10,
  },
  leaderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  leaderItemSelected: {
    backgroundColor: '#FEF2F2',
    borderColor: '#DC2626',
  },
  leaderInfo: {
    flex: 1,
  },
  leaderName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  leaderEmail: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 2,
  },
  leaderZone: {
    fontSize: 12,
    color: '#9CA3AF',
  },
});

export default ZoneManagementScreen;