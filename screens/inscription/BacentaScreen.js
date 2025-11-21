import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Modal,
  TextInput,
  FlatList,
  Platform,
  ActivityIndicator,
  Image,
  Alert,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Feather from 'react-native-vector-icons/Feather';
import AntDesign from 'react-native-vector-icons/AntDesign';
import DateTimePicker from '@react-native-community/datetimepicker';
import { launchImageLibrary } from 'react-native-image-picker';
import { useFocusEffect } from '@react-navigation/native';
import api from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext';
import Toast from 'react-native-toast-message';

const BacentaScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [showOfferingModal, setShowOfferingModal] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const [editingMeeting, setEditingMeeting] = useState(null);
  const [attendance, setAttendance] = useState({});
  const [offerings, setOfferings] = useState([
    { type: 'Offrande', amount: 0 },
    { type: 'Dîme', amount: 0 },
    { type: 'Autre', amount: 0 },
  ]);

  const [meetings, setMeetings] = useState([]);
  const [members, setMembers] = useState([]);

  const [newMeeting, setNewMeeting] = useState({
    title: '',
    date: new Date(),
    time: '18:00',
    location: '',
    host: '',
    type: 'weekly',
    expectedParticipants: 10,
    agenda: ['', '', ''],
    offerings: 0,
    familyPhoto: null,
  });

  // Fonctions manquantes ajoutées
  const getMeetingStatus = (meeting) => {
    const today = new Date();
    const meetingDate = new Date(meeting.date);

    // Réinitialiser l'heure pour comparer seulement les dates
    today.setHours(0, 0, 0, 0);
    meetingDate.setHours(0, 0, 0, 0);

    if (meetingDate.getTime() === today.getTime()) {
      return 'today';
    } else if (meetingDate < today) {
      return meeting.status === 'completed' ? 'completed' : 'late';
    } else {
      return 'planned';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const calculateTotalOfferings = () => {
    return offerings.reduce((total, offering) => total + (offering.amount || 0), 0);
  };

  const fetchMeetings = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/bacenta/meetings');
      setMeetings(response.data);
    } catch (error) {
      console.error('Error fetching meetings:', error);
      Toast.show({
        type: 'error',
        text1: t('common.error'),
        text2: 'Erreur lors du chargement des réunions',
      });
    } finally {
      setLoading(false);
    }
  }, [t]);

  const fetchMembers = useCallback(async () => {
    try {
      const response = await api.get('/bacenta/members');
      setMembers(response.data);
    } catch (error) {
      console.error('Error fetching members:', error);
    }
  }, []);

  // Correction de useFocusEffect
  useFocusEffect(
    useCallback(() => {
      fetchMeetings();
      fetchMembers();
    }, [fetchMeetings, fetchMembers])
  );

  // Populate form when editing
  useEffect(() => {
    if (editingMeeting) {
      setNewMeeting({
        title: editingMeeting.title || '',
        date: new Date(editingMeeting.date),
        time: editingMeeting.time || '18:00',
        location: editingMeeting.location || '',
        host: editingMeeting.host || '',
        type: editingMeeting.type || 'weekly',
        expectedParticipants: editingMeeting.expectedParticipants || 10,
        agenda: editingMeeting.agenda || ['', '', ''],
        offerings: editingMeeting.offerings || 0,
        familyPhoto: editingMeeting.familyPhoto || null,
      });
    }
  }, [editingMeeting]);

  const createOrUpdateMeeting = async () => {
    try {
      setLoading(true);
      let response;
      if (editingMeeting) {
        response = await api.put(`/bacenta/meetings/${editingMeeting.id}`, newMeeting);
        setMeetings(meetings.map(m => m.id === editingMeeting.id ? response.data : m));
        setEditingMeeting(null);
        Toast.show({
          type: 'success',
          text1: t('common.success'),
          text2: 'Réunion modifiée avec succès',
        });
      } else {
        response = await api.post('/bacenta/meetings', newMeeting);
        setMeetings([...meetings, response.data]);
        Toast.show({
          type: 'success',
          text1: t('common.success'),
          text2: 'Réunion créée avec succès',
        });
      }
      setShowCreateModal(false);
      setNewMeeting({
        title: '',
        date: new Date(),
        time: '18:00',
        location: '',
        host: '',
        type: 'weekly',
        expectedParticipants: 10,
        agenda: ['', '', ''],
        offerings: 0,
        familyPhoto: null,
      });
    } catch (error) {
      console.error('Error saving meeting:', error);
      Toast.show({
        type: 'error',
        text1: t('common.error'),
        text2: editingMeeting ? 'Erreur lors de la modification de la réunion' : 'Erreur lors de la création de la réunion',
      });
    } finally {
      setLoading(false);
    }
  };


  const deleteMeeting = async (meetingId) => {
    try {
      setLoading(true);
      await api.delete(`/bacenta/meetings/${meetingId}`);
      setMeetings(meetings.filter(m => m.id !== meetingId));
      setShowDetailModal(false);
      setEditingMeeting(null);
      Toast.show({
        type: 'success',
        text1: t('common.success'),
        text2: 'Réunion supprimée avec succès',
      });
    } catch (error) {
      console.error('Error deleting meeting:', error);
      Toast.show({
        type: 'error',
        text1: t('common.error'),
        text2: 'Erreur lors de la suppression de la réunion',
      });
    } finally {
      setLoading(false);
    }
  };

  const saveAttendance = async () => {
    try {
      const attendanceData = Object.keys(attendance).map(memberId => ({
        member_id: memberId,
        status: attendance[memberId],
      }));

      const response = await api.post(`/bacenta/${selectedMeeting.id}/attendance`, {
        attendance: attendanceData,
      });

      const updatedMeeting = {
        ...selectedMeeting,
        attendance: attendanceData,
      };

      setMeetings(meetings.map(m => m.id === selectedMeeting.id ? updatedMeeting : m));
      setSelectedMeeting(updatedMeeting);
      setShowAttendanceModal(false);
      Toast.show({
        type: 'success',
        text1: t('common.success'),
        text2: 'Présence enregistrée',
      });
    } catch (error) {
      console.error('Error saving attendance:', error);
      Toast.show({
        type: 'error',
        text1: t('common.error'),
        text2: 'Erreur lors de l\'enregistrement de la présence',
      });
    }
  };

  const openMeetingDetail = (meeting) => {
    setSelectedMeeting(meeting);
    setShowDetailModal(true);
  };

  const saveOfferings = async () => {
    try {
      const offeringsData = offerings.filter(o => o.amount > 0);
      const response = await api.post(`/bacenta/${selectedMeeting.id}/offerings`, { offerings: offeringsData });

      const updatedMeeting = {
        ...selectedMeeting,
        offerings: {
          total: calculateTotalOfferings(),
          breakdown: offeringsData,
        },
      };

      setMeetings(meetings.map(m => m.id === selectedMeeting.id ? updatedMeeting : m));
      setSelectedMeeting(updatedMeeting);
      setShowOfferingModal(false);
      Toast.show({
        type: 'success',
        text1: t('common.success'),
        text2: 'Offrandes enregistrées',
      });
    } catch (error) {
      console.error('Error saving offerings:', error);
      Toast.show({
        type: 'error',
        text1: t('common.error'),
        text2: 'Erreur lors de l\'enregistrement des offrandes',
      });
    }
  };

  const updateOffering = (index, field, value) => {
    const newOfferings = [...offerings];
    newOfferings[index][field] = parseInt(value) || 0;
    setOfferings(newOfferings);
  };

  const openAttendanceModal = (meeting) => {
    setSelectedMeeting(meeting);
    const initialAttendance = {};

    if (meeting.attendance) {
      if (Array.isArray(meeting.attendance)) {
        meeting.attendance.forEach(record => {
          initialAttendance[record.member_id] = record.status;
        });
      } else if (meeting.attendance.present) {
        meeting.attendance.present.forEach(id => initialAttendance[id] = 'present');
        meeting.attendance.absent.forEach(id => initialAttendance[id] = 'absent');
      }
    }

    // Initialiser les membres non marqués comme 'present' par défaut
    members.forEach(member => {
      if (!initialAttendance[member.id]) {
        initialAttendance[member.id] = 'present';
      }
    });

    setAttendance(initialAttendance);
    setShowAttendanceModal(true);
  };

  const openOfferingModal = (meeting) => {
    setSelectedMeeting(meeting);
    if (meeting.offerings?.breakdown) {
      setOfferings(meeting.offerings.breakdown);
    } else {
      setOfferings([
        { type: 'Offrande', amount: 0 },
        { type: 'Dîme', amount: 0 },
        { type: 'Autre', amount: 0 },
      ]);
    }
    setShowOfferingModal(true);
  };

  const selectPhoto = (isEditing = false) => {
    const options = {
      mediaType: 'photo',
      includeBase64: false,
      maxHeight: 2000,
      maxWidth: 2000,
      quality: 0.8,
    };

    launchImageLibrary(options, async (response) => {
      if (response.didCancel) {return;}
      if (response.errorMessage) {
        Alert.alert('Erreur', 'Erreur lors de la sélection de la photo: ' + response.errorMessage);
        return;
      }

      if (response.assets && response.assets[0]) {
        const selectedImage = response.assets[0];
        if (isEditing && editingMeeting) {
          setEditingMeeting({ ...editingMeeting, familyPhoto: selectedImage.uri });
        } else {
          setNewMeeting({ ...newMeeting, familyPhoto: selectedImage.uri });
        }
      }
    });
  };

  const filteredMeetings = meetings.filter(meeting => {
    const status = getMeetingStatus(meeting);
    if (activeTab === 'upcoming') {
      return status === 'planned' || status === 'today' || status === 'late';
    } else if (activeTab === 'completed') {
      return status === 'completed';
    }
    return true;
  });

  // Le reste du code reste inchangé...
  const renderMeetingCard = ({ item }) => {
    const status = getMeetingStatus(item);

    const getStatusColor = () => {
      switch (status) {
        case 'today': return '#F59E0B';
        case 'completed': return '#10B981';
        case 'late': return '#EF4444';
        default: return '#6B7280';
      }
    };

    const getStatusText = () => {
      switch (status) {
        case 'today': return t('bacenta.status.today');
        case 'completed': return t('bacenta.status.completed');
        case 'late': return t('common.pending');
        default: return t('bacenta.status.planned');
      }
    };

    return (
      <TouchableOpacity
        style={styles.meetingCard}
        onPress={() => openMeetingDetail(item)}
      >
        <View style={styles.meetingHeader}>
          <View style={styles.meetingTitleSection}>
            <Text style={styles.meetingTitle}>{item.title}</Text>
            <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor()}22` }]}>
              <View style={[styles.statusDot, { backgroundColor: getStatusColor() }]} />
              <Text style={[styles.statusText, { color: getStatusColor() }]}>
                {getStatusText()}
              </Text>
            </View>
          </View>
          <Text style={styles.meetingType}>
            {item.type === 'weekly' ? t('bacenta.weekly') :
              item.type === 'midweek' ? t('bacenta.midweek') :
                t('bacenta.special')}
          </Text>
        </View>

        <View style={styles.meetingDetails}>
          <View style={styles.detailRow}>
            <Feather name="calendar" size={16} color="#6B7280" />
            <Text style={styles.detailText}>
              {formatDate(item.date)} à {item.time}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Feather name="map-pin" size={16} color="#6B7280" />
            <Text style={styles.detailText}>{item.location}</Text>
          </View>
          <View style={styles.detailRow}>
            <Feather name="user" size={16} color="#6B7280" />
            <Text style={styles.detailText}>{item.host}</Text>
          </View>
        </View>

        {item.attendance && (
          <View style={styles.meetingStats}>
            <View style={styles.statItem}>
              <Feather name="users" size={14} color="#10B981" />
              <Text style={styles.statText}>
                {Array.isArray(item.attendance) ? item.attendance.filter(a => a.status === 'present').length : (item.attendance.present?.length || 0)} {t('bacenta.present')}
              </Text>
            </View>
            {item.offerings && (
              <View style={styles.statItem}>
                <Feather name="dollar-sign" size={14} color="#F59E0B" />
                <Text style={styles.statText}>
                  {(item.offerings.total || 0).toLocaleString()} XAF
                </Text>
              </View>
            )}
          </View>
        )}

        {status === 'today' && (
          <TouchableOpacity
            style={styles.startMeetingBtn}
            onPress={() => openAttendanceModal(item)}
          >
            <Feather name="check-circle" size={18} color="#FFFFFF" />
            <Text style={styles.startMeetingText}>{t('bacenta.markAttendance')}</Text>
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    );
  };

  const renderAttendanceItem = ({ item }) => (
    <View style={styles.attendanceItem}>
      <View style={styles.attendanceInfo}>
        <Text style={styles.attendanceName}>{item.first_name} {item.last_name}</Text>
        <Text style={styles.attendancePhone}>{item.phone}</Text>
      </View>
      <View style={styles.attendanceActions}>
        <TouchableOpacity
          style={[
            styles.attendanceBtn,
            attendance[item.id] === 'present' && styles.attendanceBtnActive,
          ]}
          onPress={() => setAttendance({ ...attendance, [item.id]: 'present' })}
        >
          <Feather
            name="check"
            size={18}
            color={attendance[item.id] === 'present' ? '#FFFFFF' : '#10B981'}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.attendanceBtn,
            styles.attendanceBtnAbsent,
            attendance[item.id] === 'absent' && styles.attendanceBtnAbsentActive,
          ]}
          onPress={() => setAttendance({ ...attendance, [item.id]: 'absent' })}
        >
          <Feather
            name="x"
            size={18}
            color={attendance[item.id] === 'absent' ? '#FFFFFF' : '#EF4444'}
          />
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading && meetings.length === 0) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <View style={styles.loadingContent}>
          <ActivityIndicator size="large" color="#991B1B" />
          <Text style={styles.loadingText}>Chargement...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const stats = [
    {
      key: 'total',
      icon: 'event',
      value: meetings.length,
      label: 'Total',
      color: '#991B1B',
    },
    {
      key: 'upcoming',
      icon: 'schedule',
      value: meetings.filter(m => getMeetingStatus(m) === 'planned' || getMeetingStatus(m) === 'today').length,
      label: t('bacenta.status.planned'),
      color: '#3B82F6',
    },
    {
      key: 'completed',
      icon: 'check-circle',
      value: meetings.filter(m => getMeetingStatus(m) === 'completed').length,
      label: t('bacenta.status.completed'),
      color: '#10B981',
    },
  ];

  const renderStat = (s) => (
    <View key={s.key} style={styles.statCard}>
      <View style={[styles.statIcon, { backgroundColor: `${s.color}22` }]}>
        <MaterialIcons name={s.icon} size={20} color={s.color} />
      </View>
      <Text style={styles.statValue}>{s.value}</Text>
      <Text style={styles.statLabel}>{s.label}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Le reste du JSX reste inchangé */}
      <View style={styles.header}>
        <View style={styles.headerBackground} />
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerTitle}>{t('bacenta.title')}</Text>
            <Text style={styles.headerSubtitle}>{t('bacenta.subtitle')}</Text>
          </View>
          <TouchableOpacity
            style={styles.notificationBtn}
            onPress={() => navigation.navigate('NotificationScreen')}
          >
            <Feather name="bell" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.statsRow}>
          {stats.map(renderStat)}
        </View>

        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'upcoming' && styles.tabActive]}
            onPress={() => setActiveTab('upcoming')}
          >
            <Feather
              name="calendar"
              size={16}
              color={activeTab === 'upcoming' ? '#FFFFFF' : '#6B7280'}
            />
            <Text
              style={[
                styles.tabText,
                activeTab === 'upcoming' && styles.tabTextActive,
              ]}
            >
              À venir
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'completed' && styles.tabActive]}
            onPress={() => setActiveTab('completed')}
          >
            <Feather
              name="check-circle"
              size={16}
              color={activeTab === 'completed' ? '#FFFFFF' : '#6B7280'}
            />
            <Text
              style={[
                styles.tabText,
                activeTab === 'completed' && styles.tabTextActive,
              ]}
            >
              {t('bacenta.status.completed')}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.meetingsSection}>
          {filteredMeetings.length === 0 ? (
            <View style={styles.emptyState}>
              <Feather name="calendar" size={64} color="#D1D5DB" />
              <Text style={styles.emptyStateText}>Aucune réunion</Text>
              <TouchableOpacity
                style={styles.createFirstBtn}
                onPress={() => setShowCreateModal(true)}
              >
                <Text style={styles.createFirstText}>{t('bacenta.createFirstMeeting')}</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <FlatList
              data={filteredMeetings}
              renderItem={renderMeetingCard}
              keyExtractor={(item) => item.id.toString()}
              scrollEnabled={false}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
            />
          )}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setShowCreateModal(true)}
      >
        <Feather name="plus" size={24} color="#FFFFFF" />
      </TouchableOpacity>

      {/* Les modals restent inchangés */}
      {/* Create Modal */}
      <Modal
        visible={showCreateModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCreateModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingMeeting ? t('bacenta.editMeeting') : t('bacenta.newMeeting')}
              </Text>
              <TouchableOpacity onPress={() => {
                setShowCreateModal(false);
                setEditingMeeting(null);
                setNewMeeting({
                  title: '',
                  date: new Date(),
                  time: '18:00',
                  location: '',
                  host: '',
                  type: 'weekly',
                  expectedParticipants: 10,
                  agenda: ['', '', ''],
                  offerings: 0,
                  familyPhoto: null,
                });
              }}>
                <AntDesign name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.form}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>{t('bacenta.meetingTitle')}</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder={t('bacenta.meetingTitlePlaceholder')}
                  value={newMeeting.title}
                  onChangeText={(text) => setNewMeeting({ ...newMeeting, title: text })}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>{t('bacenta.dateAndTime')}</Text>
                <View style={styles.rowInputs}>
                  <TouchableOpacity
                    style={[styles.textInput, styles.flex1]}
                    onPress={() => setShowDatePicker(true)}
                  >
                    <Text style={styles.inputText}>
                      {newMeeting.date.toLocaleDateString('fr-FR')}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.textInput, styles.flex1]}
                    onPress={() => setShowTimePicker(true)}
                  >
                    <Text style={styles.inputText}>{newMeeting.time}</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>{t('bacenta.location')}</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder={t('bacenta.locationPlaceholder')}
                  value={newMeeting.location}
                  onChangeText={(text) => setNewMeeting({ ...newMeeting, location: text })}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>{t('bacenta.host')}</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder={t('bacenta.hostPlaceholder')}
                  value={newMeeting.host}
                  onChangeText={(text) => setNewMeeting({ ...newMeeting, host: text })}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>{t('bacenta.meetingType')}</Text>
                <View style={styles.typeOptions}>
                  {['weekly', 'midweek', 'special'].map((type) => (
                    <TouchableOpacity
                      key={type}
                      style={[
                        styles.typeOption,
                        newMeeting.type === type && styles.typeOptionSelected,
                      ]}
                      onPress={() => setNewMeeting({ ...newMeeting, type })}
                    >
                      <Text style={[
                        styles.typeOptionText,
                        newMeeting.type === type && styles.typeOptionTextSelected,
                      ]}>
                        {type === 'weekly' ? t('bacenta.weekly') :
                          type === 'midweek' ? t('bacenta.midweek') :
                            t('bacenta.special')}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>{t('bacenta.expectedParticipants')}</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="10"
                  keyboardType="numeric"
                  value={newMeeting.expectedParticipants.toString()}
                  onChangeText={(text) => setNewMeeting({ ...newMeeting, expectedParticipants: parseInt(text) || 10 })}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>{t('bacenta.agenda')}</Text>
                {newMeeting.agenda.map((item, index) => (
                  <View key={index} style={styles.agendaItem}>
                    <Text style={styles.agendaNumber}>{index + 1}.</Text>
                    <TextInput
                      style={[styles.textInput, styles.agendaInput]}
                      value={item}
                      onChangeText={(text) => {
                        const newAgenda = [...newMeeting.agenda];
                        newAgenda[index] = text;
                        setNewMeeting({ ...newMeeting, agenda: newAgenda });
                      }}
                      placeholder={t('bacenta.agendaPlaceholder', { number: index + 1 })}
                    />
                  </View>
                ))}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Montant des offrandes (XAF)</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="0"
                  keyboardType="numeric"
                  value={newMeeting.offerings.toString()}
                  onChangeText={(text) => setNewMeeting({ ...newMeeting, offerings: parseInt(text) || 0 })}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Photo de famille</Text>
                {newMeeting.familyPhoto ? (
                  <View style={styles.photoPreviewContainer}>
                    <Image
                      source={{ uri: newMeeting.familyPhoto }}
                      style={styles.photoPreview}
                      resizeMode="cover"
                    />
                    <TouchableOpacity
                      style={styles.changePhotoBtn}
                      onPress={() => selectPhoto(false)}
                    >
                      <Feather name="camera" size={16} color="#FFFFFF" />
                      <Text style={styles.changePhotoText}>Changer</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={styles.photoUploadBtn}
                    onPress={() => selectPhoto(false)}
                  >
                    <Feather name="camera" size={20} color="#6B7280" />
                    <Text style={styles.photoUploadText}>Sélectionner une photo</Text>
                  </TouchableOpacity>
                )}
              </View>
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setShowCreateModal(false)}
              >
                <Text style={styles.cancelBtnText}>{t('bacenta.cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveBtn}
                onPress={createOrUpdateMeeting}
              >
                <Text style={styles.saveBtnText}>
                  {editingMeeting ? t('bacenta.save') : t('bacenta.create')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Detail Modal */}
      <Modal
        visible={showDetailModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowDetailModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{selectedMeeting?.title}</Text>
              <TouchableOpacity onPress={() => setShowDetailModal(false)}>
                <AntDesign name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.detailContent}>
              <View style={styles.detailSection}>
                <Text style={styles.detailLabel}>{t('bacenta.dateAndTime')}</Text>
                <Text style={styles.detailValue}>
                  {formatDate(selectedMeeting?.date)} à {selectedMeeting?.time}
                </Text>
              </View>

              <View style={styles.detailSection}>
                <Text style={styles.detailLabel}>{t('bacenta.location')}</Text>
                <Text style={styles.detailValue}>{selectedMeeting?.location}</Text>
              </View>

              <View style={styles.detailSection}>
                <Text style={styles.detailLabel}>{t('bacenta.host')}</Text>
                <Text style={styles.detailValue}>{selectedMeeting?.host}</Text>
              </View>

              <View style={styles.detailSection}>
                <Text style={styles.detailLabel}>{t('bacenta.meetingType')}</Text>
                <Text style={styles.detailValue}>
                  {selectedMeeting?.type === 'weekly' ? t('bacenta.weekly') :
                   selectedMeeting?.type === 'midweek' ? t('bacenta.midweek') :
                   t('bacenta.special')}
                </Text>
              </View>

              {selectedMeeting?.agenda && selectedMeeting.agenda.length > 0 && (
                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>{t('bacenta.agenda')}</Text>
                  {selectedMeeting.agenda.map((item, index) => (
                    <Text key={index} style={styles.agendaItemText}>
                      {index + 1}. {item}
                    </Text>
                  ))}
                </View>
              )}

              {selectedMeeting?.familyPhoto && (
                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>Photo de famille</Text>
                  <Image
                    source={{ uri: selectedMeeting.familyPhoto }}
                    style={styles.detailPhoto}
                    resizeMode="cover"
                  />
                </View>
              )}

              {selectedMeeting?.attendance && selectedMeeting.attendance.length > 0 && (
                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>{t('bacenta.attendance')}</Text>
                  <Text style={styles.detailValue}>
                    {selectedMeeting.attendance.filter(a => a.status === 'present').length} présents
                  </Text>
                </View>
              )}

              {selectedMeeting?.offerings && (
                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>{t('bacenta.offerings')}</Text>
                  <Text style={styles.detailValue}>
                    {selectedMeeting.offerings.toLocaleString()} XAF
                  </Text>
                </View>
              )}
            </ScrollView>

            <View style={styles.detailActions}>
              <TouchableOpacity
                style={styles.detailActionBtn}
                onPress={() => {
                  setEditingMeeting(selectedMeeting);
                  setShowDetailModal(false);
                  setShowCreateModal(true);
                }}
              >
                <Feather name="edit" size={18} color="#FFFFFF" />
                <Text style={styles.detailActionText}>{t('common.edit')}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.detailActionBtn}
                onPress={() => openAttendanceModal(selectedMeeting)}
              >
                <Feather name="users" size={18} color="#FFFFFF" />
                <Text style={styles.detailActionText}>{t('bacenta.markAttendance')}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.detailActionBtn}
                onPress={() => openOfferingModal(selectedMeeting)}
              >
                <Feather name="dollar-sign" size={18} color="#FFFFFF" />
                <Text style={styles.detailActionText}>{t('bacenta.addOfferings')}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.detailActionBtn, styles.deleteBtn]}
                onPress={() => {
                  Alert.alert(
                    t('common.confirm'),
                    'Êtes-vous sûr de vouloir supprimer cette réunion ?',
                    [
                      { text: t('common.cancel'), style: 'cancel' },
                      { text: t('common.delete'), onPress: () => deleteMeeting(selectedMeeting.id) },
                    ]
                  );
                }}
              >
                <Feather name="trash" size={18} color="#FFFFFF" />
                <Text style={styles.detailActionText}>{t('common.delete')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Attendance Modal */}
      <Modal
        visible={showAttendanceModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAttendanceModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('bacenta.markAttendance')}</Text>
              <TouchableOpacity onPress={() => setShowAttendanceModal(false)}>
                <AntDesign name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <Text style={styles.attendanceSubtitle}>
              {t('bacenta.attendanceFor')} {selectedMeeting?.title}
            </Text>

            <FlatList
              data={members}
              renderItem={renderAttendanceItem}
              keyExtractor={(item) => item.id.toString()}
              style={styles.attendanceList}
              showsVerticalScrollIndicator={false}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setShowAttendanceModal(false)}
              >
                <Text style={styles.cancelBtnText}>{t('bacenta.cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveBtn}
                onPress={saveAttendance}
              >
                <Text style={styles.saveBtnText}>{t('bacenta.save')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Offering Modal */}
      <Modal
        visible={showOfferingModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowOfferingModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('bacenta.addOfferings')}</Text>
              <TouchableOpacity onPress={() => setShowOfferingModal(false)}>
                <AntDesign name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <Text style={styles.offeringSubtitle}>
              {t('bacenta.offeringsFor')} {selectedMeeting?.title}
            </Text>

            <View style={styles.offeringForm}>
              {offerings.map((offering, index) => (
                <View key={index} style={styles.offeringItem}>
                  <Text style={styles.offeringType}>{offering.type}</Text>
                  <TextInput
                    style={styles.offeringInput}
                    placeholder="0"
                    keyboardType="numeric"
                    value={offering.amount.toString()}
                    onChangeText={(value) => updateOffering(index, 'amount', value)}
                  />
                  <Text style={styles.currencyText}>XAF</Text>
                </View>
              ))}

              <View style={styles.totalSection}>
                <Text style={styles.totalLabel}>{t('bacenta.total')}</Text>
                <Text style={styles.totalValue}>{calculateTotalOfferings().toLocaleString()} XAF</Text>
              </View>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setShowOfferingModal(false)}
              >
                <Text style={styles.cancelBtnText}>{t('bacenta.cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveBtn}
                onPress={saveOfferings}
              >
                <Text style={styles.saveBtnText}>{t('bacenta.save')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Date Pickers */}
      {showDatePicker && (
        <DateTimePicker
          value={editingMeeting ? new Date(editingMeeting.date) : newMeeting.date}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(event, date) => {
            setShowDatePicker(false);
            if (date) {
              if (editingMeeting) {
                setEditingMeeting({ ...editingMeeting, date });
              } else {
                setNewMeeting({ ...newMeeting, date });
              }
            }
          }}
        />
      )}

      {showTimePicker && (
        <DateTimePicker
          value={new Date()}
          mode="time"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(event, date) => {
            setShowTimePicker(false);
            if (date) {
              const time = date.toLocaleTimeString('fr-FR', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: false,
              });
              if (editingMeeting) {
                setEditingMeeting({ ...editingMeeting, time });
              } else {
                setNewMeeting({ ...newMeeting, time });
              }
            }
          }}
        />
      )}
    </SafeAreaView>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  loadingContent: {
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#6B7280',
  },
  header: {
    backgroundColor: '#991B1B',
    paddingTop: 50,
    paddingBottom: 20,
  },
  headerBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
    marginTop: 4,
  },
  notificationBtn: {
    padding: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 4,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginTop: 20,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
  meetingsSection: {
    flex: 1,
    marginTop: 20,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 16,
    marginBottom: 20,
  },
  createFirstBtn: {
    backgroundColor: '#991B1B',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  createFirstText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  meetingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  meetingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  meetingTitleSection: {
    flex: 1,
    marginRight: 12,
  },
  meetingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  meetingType: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  meetingDetails: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#4B5563',
    marginLeft: 8,
  },
  meetingStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 4,
  },
  startMeetingBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10B981',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 12,
  },
  startMeetingText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
  separator: {
    height: 8,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#991B1B',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
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
    fontWeight: '600',
    color: '#1F2937',
  },
  form: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#1F2937',
  },
  inputText: {
    fontSize: 16,
    color: '#1F2937',
  },
  rowInputs: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  flex1: {
    flex: 1,
  },
  typeOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  typeOption: {
    flex: 1,
    padding: 12,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 2,
  },
  typeOptionSelected: {
    borderColor: '#991B1B',
    backgroundColor: '#FEF2F2',
  },
  typeOptionText: {
    fontSize: 14,
    color: '#6B7280',
  },
  typeOptionTextSelected: {
    color: '#991B1B',
    fontWeight: '500',
  },
  agendaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  agendaNumber: {
    width: 24,
    fontSize: 14,
    color: '#6B7280',
    marginRight: 8,
  },
  agendaInput: {
    flex: 1,
  },
  photoPreviewContainer: {
    position: 'relative',
  },
  photoPreview: {
    width: '100%',
    height: 150,
    borderRadius: 8,
  },
  changePhotoBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 16,
    padding: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  changePhotoText: {
    color: '#FFFFFF',
    fontSize: 12,
    marginLeft: 4,
  },
  photoUploadBtn: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 20,
    alignItems: 'center',
    borderStyle: 'dashed',
  },
  photoUploadText: {
    color: '#6B7280',
    fontSize: 14,
    marginTop: 8,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  cancelBtn: {
    flex: 1,
    padding: 12,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    alignItems: 'center',
    marginRight: 8,
  },
  cancelBtnText: {
    fontSize: 16,
    color: '#6B7280',
  },
  saveBtn: {
    flex: 1,
    padding: 12,
    backgroundColor: '#991B1B',
    borderRadius: 8,
    alignItems: 'center',
    marginLeft: 8,
  },
  saveBtnText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  detailContent: {
    padding: 20,
  },
  detailSection: {
    marginBottom: 16,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    color: '#1F2937',
  },
  agendaItemText: {
    fontSize: 14,
    color: '#4B5563',
    marginBottom: 4,
  },
  detailPhoto: {
    width: '100%',
    height: 150,
    borderRadius: 8,
  },
  detailActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  detailActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#991B1B',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    margin: 4,
    flex: 1,
    minWidth: '45%',
  },
  detailActionText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
  deleteBtn: {
    backgroundColor: '#EF4444',
  },
  attendanceSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  attendanceList: {
    maxHeight: 400,
    paddingHorizontal: 20,
  },
  attendanceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    marginBottom: 8,
  },
  attendanceInfo: {
    flex: 1,
  },
  attendanceName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
  },
  attendancePhone: {
    fontSize: 14,
    color: '#6B7280',
  },
  attendanceActions: {
    flexDirection: 'row',
  },
  attendanceBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  attendanceBtnActive: {
    backgroundColor: '#10B981',
  },
  attendanceBtnAbsent: {
    backgroundColor: '#F3F4F6',
  },
  attendanceBtnAbsentActive: {
    backgroundColor: '#EF4444',
  },
  offeringSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  offeringForm: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  offeringItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  offeringType: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
  },
  offeringInput: {
    width: 100,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 8,
    fontSize: 16,
    textAlign: 'right',
    marginLeft: 16,
  },
  currencyText: {
    fontSize: 16,
    color: '#6B7280',
    marginLeft: 8,
  },
  totalSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#991B1B',
  },
});

export default BacentaScreen;
