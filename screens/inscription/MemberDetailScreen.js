// screens/inscription/MemberDetailScreen.jsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Image,
  Alert,
  ActivityIndicator,
  FlatList,
  Linking,
  Platform,
  Modal
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Feather from 'react-native-vector-icons/Feather';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { useTranslation } from 'react-i18next';
import { useNavigation, useRoute } from '@react-navigation/native';
import api from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext';

const MemberDetailScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const route = useRoute();
  const { memberId } = route.params;
  const { user: authUser } = useAuth();

  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);
  const [attendances, setAttendances] = useState([]);
  const [callLogs, setCallLogs] = useState([]);
  const [showSmsModal, setShowSmsModal] = useState(false);
  const [showCallModal, setShowCallModal] = useState(false);

  // Charger les détails du membre
  const loadMemberDetails = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/members/${memberId}`);
      setMember(response.data);

      // Charger les présences récentes
      const attendanceResponse = await api.get('/attendance', {
        params: { member_id: memberId, limit: 10 }
      });
      setAttendances(attendanceResponse.data.attendance || []);

      // Charger les logs d'appels récents
      const callLogsResponse = await api.get('/call-logs', {
        params: { member_id: memberId, limit: 10 }
      });
      setCallLogs(callLogsResponse.data.call_logs || []);

    } catch (error) {
      console.error('Erreur lors du chargement des détails:', error);
      Alert.alert(t('error'), t('members.loadDetailError'));
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  // SMS Templates
  const smsTemplates = [
    {
      id: 1,
      title: 'Message de bienvenue / suivi',
      message: (memberName, leaderName) => `Bonjour ${memberName},
C'est ${leaderName}. Je voulais prendre un moment pour vous saluer et vous rappeler que vous êtes une partie précieuse de notre Bacenta. 🙏
Si vous avez besoin de prières ou d'assistance, n'hésitez pas à me contacter.
Que Dieu vous bénisse !`
    },
    {
      id: 2,
      title: 'Invitation à un événement',
      message: (memberName, leaderName) => `Bonjour ${memberName},
Ici ${leaderName}. Nous organisons [Nom de l'événement] ce [Jour] à [Heure]. Votre présence sera une grande joie pour nous !
Merci de confirmer votre participation. 🙌`
    },
    {
      id: 3,
      title: 'Message de motivation / encouragement spirituel',
      message: (memberName, leaderName) => `Salut ${memberName},
${leaderName} ici. Je prie pour vous aujourd'hui et vous encourage à rester fort dans la foi.
Que Dieu vous guide et vous protège dans toutes vos démarches. ✨`
    },
    {
      id: 4,
      title: 'Message pour prise de nouvelles',
      message: (memberName, leaderName) => `Bonjour ${memberName},
C'est ${leaderName}. Juste un petit message pour prendre de vos nouvelles et savoir comment vous allez spirituellement et personnellement.
N'hésitez pas à me répondre ou à demander de la prière. 🙏`
    },
    {
      id: 5,
      title: 'Rappel de réunion / rencontre Bacenta',
      message: (memberName, leaderName) => `Bonjour ${memberName},
Ici ${leaderName}. Nous avons notre prochaine réunion Bacenta le [Jour] à [Heure].
Votre présence est très importante, merci de ne pas oublier ! ✨`
    },
    {
      id: 6,
      title: 'Message de félicitations / encouragement personnel',
      message: (memberName, leaderName) => `Bonjour ${memberName},
${leaderName} ici. Je tenais à vous féliciter pour [Événement / Réussite du membre]. Que le Seigneur continue de bénir vos efforts et votre chemin ! 🎉`
    }
  ];

  // Handle phone call
  const handleCall = () => {
    if (!member) return;

    const phoneNumber = member.phone_primary || member.phone;
    if (!phoneNumber) {
      Alert.alert('Erreur', 'Aucun numéro de téléphone disponible');
      return;
    }

    setShowCallModal(true);
  };

  // Execute call with selected method
  const executeCall = (method) => {
    if (!member) return;

    const phoneNumber = member.phone_primary || member.phone;
    let url;

    if (method === 'phone') {
      url = `tel:${phoneNumber}`;
    } else if (method === 'whatsapp') {
      url = `whatsapp://send?phone=${phoneNumber}`;
    }

    Linking.canOpenURL(url).then(supported => {
      if (supported) {
        Linking.openURL(url);
        setShowCallModal(false);
      } else {
        Alert.alert('Erreur', method === 'phone' ? 'Impossible de passer l\'appel' : 'WhatsApp n\'est pas installé');
      }
    });
  };

  // Handle SMS
  const handleSms = () => {
    setShowSmsModal(true);
  };

  // Send SMS with selected template
  const sendSms = (template) => {
    if (!member) return;

    const phoneNumber = member.phone_primary || member.phone;
    if (!phoneNumber) {
      Alert.alert('Erreur', 'Aucun numéro de téléphone disponible');
      return;
    }

    const memberName = `${member.first_name} ${member.last_name}`;
    const leaderName = `${authUser.first_name} ${authUser.last_name}`;

    // Generate message using function
    const message = template.message(memberName, leaderName);

    // Store template and message for the send method modal
    setMember({
      ...member,
      selectedTemplate: template,
      generatedMessage: message
    });
    setShowSmsModal(false);
    setTimeout(() => setShowCallModal(true), 300); // Show send method modal
  };

  // Execute SMS send with selected method
  const executeSmsSend = (method) => {
    if (!member || !member.generatedMessage) return;

    const phoneNumber = member.phone_primary || member.phone;
    const message = member.generatedMessage;
    let url;

    if (method === 'whatsapp') {
      url = `whatsapp://send?phone=${phoneNumber}&text=${encodeURIComponent(message)}`;
    } else if (method === 'sms') {
      url = `sms:${phoneNumber}${Platform.OS === 'ios' ? '&' : '?'}body=${encodeURIComponent(message)}`;
    }

    Linking.canOpenURL(url).then(supported => {
      if (supported) {
        Linking.openURL(url);
        setShowCallModal(false);
      } else {
        Alert.alert('Erreur', method === 'whatsapp' ? 'WhatsApp n\'est pas installé' : 'Impossible d\'envoyer un SMS');
      }
    });
  };

  useEffect(() => {
    loadMemberDetails();
  }, [memberId]);

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR');
  };

  const getStateColor = (state) => {
    switch (state) {
      case 'Sheep': return '#16A34A';
      case 'Goat': return '#D97706';
      case 'Deer': return '#DC2626';
      default: return '#6B7280';
    }
  };

  const getStateIcon = (state) => {
    switch (state) {
      case 'Sheep': return 'sheep';
      case 'Goat': return 'goat';
      case 'Deer': return 'deer';
      default: return 'account';
    }
  };

  const renderAttendanceItem = ({ item }) => (
    <View style={styles.historyItem}>
      <View style={styles.historyIcon}>
        <Icon
          name={item.present ? 'check-circle' : 'close-circle'}
          size={20}
          color={item.present ? '#16A34A' : '#DC2626'}
        />
      </View>
      <View style={styles.historyContent}>
        <Text style={styles.historyDate}>{formatDate(item.sunday_date)}</Text>
        <Text style={styles.historyStatus}>
          {item.present ? t('present') : t('absent')}
        </Text>
        {item.notes && <Text style={styles.historyNotes}>{item.notes}</Text>}
      </View>
    </View>
  );

  const renderCallLogItem = ({ item }) => (
    <View style={styles.historyItem}>
      <View style={styles.historyIcon}>
        <Icon
          name={item.outcome === 'Contacted' ? 'phone-check' : 'phone-missed'}
          size={20}
          color={item.outcome === 'Contacted' ? '#16A34A' : '#D97706'}
        />
      </View>
      <View style={styles.historyContent}>
        <Text style={styles.historyDate}>{formatDate(item.call_date)}</Text>
        <Text style={styles.historyStatus}>{t(`callLog.${item.outcome.toLowerCase()}`)}</Text>
        {item.notes && <Text style={styles.historyNotes}>{item.notes}</Text>}
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#DC2626" />
          <Text style={styles.loadingText}>{t('common.loading')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!member) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{t('members.notFound')}</Text>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.backBtnText}>{t('common.back')}</Text>
          </TouchableOpacity>
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
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <AntDesign name="arrowleft" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>{t('member_details')}</Text>
          </View>
          <View style={styles.headerRight} />
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Photo et informations principales */}
        <View style={styles.profileSection}>
          <View style={styles.photoContainer}>
            {member.photo_url ? (
              <Image source={{ uri: member.photo_url }} style={styles.photo} />
            ) : (
              <View style={styles.photoPlaceholder}>
                <Text style={styles.photoPlaceholderText}>
                  {member.first_name?.charAt(0)}{member.last_name?.charAt(0)}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.basicInfo}>
            <Text style={styles.memberName}>
              {member.first_name} {member.last_name}
            </Text>
            <View style={styles.stateBadge}>
              <Icon name={getStateIcon(member.state)} size={16} color={getStateColor(member.state)} />
              <Text style={[styles.stateText, { color: getStateColor(member.state) }]}>
                {t(`${member.state.toLowerCase()}`)}
              </Text>
            </View>
            <Text style={styles.areaText}>
              {member.area?.name} • {t('members.ledBy')} {member.leader?.first_name} {member.leader?.last_name}
            </Text>
          </View>
        </View>

        {/* Informations détaillées */}
        <View style={styles.detailsSection}>
          <Text style={styles.sectionTitle}>{t('contactInfo')}</Text>

          <View style={styles.detailRow}>
            <Feather name="phone" size={18} color="#6B7280" />
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>{t('primary_phone')}</Text>
              <Text style={styles.detailValue}>{member.phone_primary || '-'}</Text>
            </View>
          </View>

          {member.phone_secondary && (
            <View style={styles.detailRow}>
              <Feather name="phone" size={18} color="#6B7280" />
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>{t('secondary_phone')}</Text>
                <Text style={styles.detailValue}>{member.phone_secondary}</Text>
              </View>
            </View>
          )}

          <View style={styles.detailRow}>
            <Feather name="user" size={18} color="#6B7280" />
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>{t('gender')}</Text>
              <Text style={styles.detailValue}>
                {member.gender === 'M' ? t('male') : member.gender === 'F' ? t('female') : '-'}
              </Text>
            </View>
          </View>

          {member.ministry && (
            <View style={styles.detailRow}>
              <Feather name="heart" size={18} color="#6B7280" />
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>{t('ministry')}</Text>
                <Text style={styles.detailValue}>{member.ministry}</Text>
              </View>
            </View>
          )}

          {member.profession && (
            <View style={styles.detailRow}>
              <Feather name="briefcase" size={18} color="#6B7280" />
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>{t('profession')}</Text>
                <Text style={styles.detailValue}>{member.profession}</Text>
              </View>
            </View>
          )}

          <View style={styles.detailRow}>
            <Feather name="calendar" size={18} color="#6B7280" />
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>{t('registration_date')}</Text>
              <Text style={styles.detailValue}>{formatDate(member.createdAt)}</Text>
            </View>
          </View>

          {member.last_attendance_date && (
            <View style={styles.detailRow}>
              <Feather name="clock" size={18} color="#6B7280" />
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>{t('last_attendance')}</Text>
                <Text style={styles.detailValue}>{formatDate(member.last_attendance_date)}</Text>
              </View>
            </View>
          )}

          {member.notes && (
            <View style={styles.notesSection}>
              <Text style={styles.sectionTitle}>{t('notes')}</Text>
              <Text style={styles.notesText}>{member.notes}</Text>
            </View>
          )}
        </View>

        {/* Historique des présences */}
        {attendances.length > 0 && (
          <View style={styles.historySection}>
            <Text style={styles.sectionTitle}>{t('attendance_history')}</Text>
            <FlatList
              data={attendances}
              renderItem={renderAttendanceItem}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              ItemSeparatorComponent={() => <View style={styles.historySeparator} />}
            />
          </View>
        )}

        {/* Historique des appels */}
        {callLogs.length > 0 && (
          <View style={styles.historySection}>
            <Text style={styles.sectionTitle}>{t('recentCalls')}</Text>
            <FlatList
              data={callLogs}
              renderItem={renderCallLogItem}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              ItemSeparatorComponent={() => <View style={styles.historySeparator} />}
            />
          </View>
        )}

        <View style={{ height: 30 }} />
      </ScrollView>

      {/* Actions flottantes */}
      <View style={styles.fabContainer}>
        <TouchableOpacity style={[styles.fab, styles.callFab]} onPress={handleCall}>
          <Feather name="phone" size={20} color="#FFFFFF" />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.fab, styles.messageFab]} onPress={handleSms}>
          <Feather name="message-circle" size={20} color="#FFFFFF" />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.fab, styles.editFab]}>
          <Feather name="edit-2" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Modal SMS Templates */}
      <Modal
        visible={showSmsModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowSmsModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Choisir un modèle de message</Text>
              <TouchableOpacity onPress={() => setShowSmsModal(false)}>
                <AntDesign name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.templatesList}>
              {smsTemplates.map((template) => (
                <TouchableOpacity
                  key={template.id}
                  style={styles.templateItem}
                  onPress={() => sendSms(template)}
                >
                  <View style={styles.templateHeader}>
                    <Text style={styles.templateTitle}>{template.title}</Text>
                    <Feather name="chevron-right" size={20} color="#6B7280" />
                  </View>
                  <Text style={styles.templatePreview} numberOfLines={2}>
                    {member ? template.message(
                      `${member.first_name} ${member.last_name}`,
                      `${authUser.first_name} ${authUser.last_name}`
                    ).substring(0, 100) + '...' : 'Chargement...'}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setShowSmsModal(false)}
              >
                <Text style={styles.cancelBtnText}>{t('common.cancel')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal Méthode d'appel */}
      <Modal
        visible={showCallModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCallModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {member?.generatedMessage ? 'Envoyer le message' : 'Appeler le membre'}
              </Text>
              <TouchableOpacity onPress={() => setShowCallModal(false)}>
                <AntDesign name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <View style={styles.methodSelection}>
              <Text style={styles.methodSubtitle}>
                {member?.generatedMessage
                  ? `Choisir la méthode d'envoi pour ${member.first_name} ${member.last_name}`
                  : `Choisir la méthode d'appel pour ${member?.first_name} ${member?.last_name}`
                }
              </Text>

              <View style={styles.methodOptions}>
                {!member?.generatedMessage && (
                  <TouchableOpacity
                    style={[styles.methodOption, styles.phoneOption]}
                    onPress={() => executeCall('phone')}
                  >
                    <View style={styles.methodIcon}>
                      <Feather name="phone" size={24} color="#FFFFFF" />
                    </View>
                    <View style={styles.methodInfo}>
                      <Text style={styles.methodTitle}>Appel téléphonique</Text>
                      <Text style={styles.methodDescription}>Appel vocal classique</Text>
                    </View>
                    <Feather name="chevron-right" size={20} color="#FFFFFF" />
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  style={[styles.methodOption, member?.generatedMessage ? styles.whatsappOption : styles.whatsappCallOption]}
                  onPress={() => member?.generatedMessage ? executeSmsSend('whatsapp') : executeCall('whatsapp')}
                >
                  <View style={styles.methodIcon}>
                    <AntDesign name={member?.generatedMessage ? "message1" : "phone"} size={24} color="#FFFFFF" />
                  </View>
                  <View style={styles.methodInfo}>
                    <Text style={styles.methodTitle}>
                      {member?.generatedMessage ? 'WhatsApp Message' : 'WhatsApp Call'}
                    </Text>
                    <Text style={styles.methodDescription}>
                      {member?.generatedMessage ? 'Envoyer via WhatsApp' : 'Appel via WhatsApp'}
                    </Text>
                  </View>
                  <Feather name="chevron-right" size={20} color="#FFFFFF" />
                </TouchableOpacity>

                {member?.generatedMessage && (
                  <TouchableOpacity
                    style={[styles.methodOption, styles.smsOption]}
                    onPress={() => executeSmsSend('sms')}
                  >
                    <View style={styles.methodIcon}>
                      <Feather name="message-square" size={24} color="#FFFFFF" />
                    </View>
                    <View style={styles.methodInfo}>
                      <Text style={styles.methodTitle}>SMS Classique</Text>
                      <Text style={styles.methodDescription}>Message texte standard</Text>
                    </View>
                    <Feather name="chevron-right" size={20} color="#FFFFFF" />
                  </TouchableOpacity>
                )}
              </View>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setShowCallModal(false)}
              >
                <Text style={styles.cancelBtnText}>Annuler</Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 20,
  },
  backBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#DC2626',
    borderRadius: 8,
  },
  backBtnText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  header: {
    backgroundColor: '#991B1B',
    height: 100,
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  headerRight: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    marginTop: -20,
  },
  profileSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  photoContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  photo: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#FECACA',
  },
  photoPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#FEF2F2',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FECACA',
  },
  photoPlaceholderText: {
    color: '#991B1B',
    fontSize: 32,
    fontWeight: '800',
  },
  basicInfo: {
    alignItems: 'center',
  },
  memberName: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  stateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 8,
  },
  stateText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  areaText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  detailsSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  detailContent: {
    flex: 1,
    marginLeft: 12,
  },
  detailLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 16,
    color: '#111827',
    fontWeight: '600',
  },
  notesSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  notesText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  historySection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 12,
  },
  historyIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  historyContent: {
    flex: 1,
  },
  historyDate: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  historyStatus: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
  historyNotes: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 4,
    fontStyle: 'italic',
  },
  historySeparator: {
    height: 1,
    backgroundColor: '#F3F4F6',
  },
  fabContainer: {
    position: 'absolute',
    right: 20,
    bottom: 30,
    flexDirection: 'row',
    gap: 12,
  },
  fab: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  callFab: {
    backgroundColor: '#16A34A',
  },
  messageFab: {
    backgroundColor: '#2563EB',
  },
  editFab: {
    backgroundColor: '#DC2626',
  },
  templatesList: {
    flex: 1,
    paddingVertical: 10,
  },
  templateItem: {
    backgroundColor: '#F9FAFB',
    marginHorizontal: 20,
    marginVertical: 5,
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  templateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  templateTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
  },
  templatePreview: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  methodSelection: {
    padding: 20,
  },
  methodSubtitle: {
    fontSize: 16,
    color: '#374151',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  methodOptions: {
    gap: 16,
  },
  methodOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  phoneOption: {
    backgroundColor: '#16A34A',
  },
  whatsappCallOption: {
    backgroundColor: '#25D366',
  },
  whatsappOption: {
    backgroundColor: '#25D366',
  },
  smsOption: {
    backgroundColor: '#2563EB',
  },
  methodIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  methodInfo: {
    flex: 1,
  },
  methodTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  methodDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 20,
  },
});

export default MemberDetailScreen;