
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
  Linking,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Feather from 'react-native-vector-icons/Feather';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthContext';
import { memberAPI, callLogAPI } from '../../utils/api';

const MemberDetailScreen = ({ route, navigation }) => {
  // Add necessary imports and state here
  const { t } = useTranslation();
  const { user: authUser } = useAuth();
  const { memberId } = route.params;

  const [member, setMember] = useState(null);
  const [callLogs, setCallLogs] = useState([]);
  const [callStats, setCallStats] = useState({
    totalCalls: 0,
    contacted: 0,
    noAnswer: 0,
    callbackRequested: 0,
    lastCallDate: null
  });
  const [attendances, setAttendances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSmsModal, setShowSmsModal] = useState(false);
  const [showCallModal, setShowCallModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);

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

  // Add useEffect to fetch data
  useEffect(() => {
    fetchMemberDetails();
    fetchCallLogs();
    fetchAttendances();
  }, [memberId]);

  const fetchMemberDetails = async () => {
    try {
      const response = await memberAPI.getMemberById(memberId);
      setMember(response.data);
    } catch (error) {
      console.error('Error fetching member:', error);
    }
  };

  const fetchCallLogs = async () => {
    try {
      const response = await callLogAPI.getCallLogs({ member_id: memberId });
      const logs = response.data.callLogs || [];
      setCallLogs(logs);

      // Calculate stats
      const stats = {
        totalCalls: logs.length,
        contacted: logs.filter(log => log.outcome === 'Contacted').length,
        noAnswer: logs.filter(log => log.outcome === 'No_Answer').length,
        callbackRequested: logs.filter(log => log.outcome === 'Callback_Requested').length,
        lastCallDate: logs.length > 0 ? logs[0].call_date : null
      };
      setCallStats(stats);
    } catch (error) {
      console.error('Error fetching call logs:', error);
    }
  };

  const fetchAttendances = async () => {
    try {
      // Assuming there's an API to get attendances for a member
      // This might need to be implemented
      setAttendances([]);
    } catch (error) {
      console.error('Error fetching attendances:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCall = (member) => {
    setSelectedMember(member);
    setShowCallModal(true);
  };

  const handleSms = (member) => {
    setSelectedMember(member);
    setShowSmsModal(true);
  };

  const executeCall = async (method) => {
    if (!selectedMember) return;

    const phoneNumber = selectedMember.phone_primary || selectedMember.phone;
    let url;
    let contactMethod = 'Phone';

    if (method === 'phone') {
      url = `tel:${phoneNumber}`;
      contactMethod = 'Phone';
    } else if (method === 'whatsapp') {
      url = `whatsapp://send?phone=${phoneNumber}`;
      contactMethod = 'WhatsApp';
    }

    try {
      if (method === 'phone') {
        await Linking.openURL(url);
      } else if (method === 'whatsapp') {
        try {
          await Linking.openURL(url);
        } catch (error) {
          const webUrl = `https://wa.me/${phoneNumber}`;
          await Linking.openURL(webUrl);
        }
      }

      // Log the call attempt
      try {
        await callLogAPI.createCallLog({
          member_id: selectedMember.id,
          outcome: 'Contacted',
          contact_method: contactMethod,
          notes: `Appel initié via ${contactMethod}`
        });
        console.log('Call logged successfully');
        // Refresh call logs
        fetchCallLogs();
      } catch (logError) {
        console.error('Error logging call:', logError);
      }

      setShowCallModal(false);
      setSelectedMember(null);
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de passer l\'appel');
    }
  };

  const executeSmsSend = async (method) => {
    // Similar to executeCall but for SMS
    setShowCallModal(false);
    setSelectedMember(null);
  };

  const sendSms = (template) => {
    // Handle SMS template selection
    setShowSmsModal(false);
    setTimeout(() => setShowCallModal(true), 300);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

const renderCallLogItem = ({ item }) => {
  const getOutcomeIcon = (outcome) => {
    switch (outcome) {
      case 'Contacted': return 'phone-check';
      case 'No_Answer': return 'phone-missed';
      case 'Callback_Requested': return 'rotate-ccw';
      case 'Wrong_Number': return 'phone-off';
      default: return 'phone';
    }
  };

  const getOutcomeColor = (outcome) => {
    switch (outcome) {
      case 'Contacted': return '#16A34A';
      case 'No_Answer': return '#D97706';
      case 'Callback_Requested': return '#DC2626';
      case 'Wrong_Number': return '#7C3AED';
      default: return '#6B7280';
    }
  };

  const getContactMethodIcon = (method) => {
    switch (method) {
      case 'WhatsApp': return 'message-circle';
      case 'SMS': return 'message-square';
      case 'Phone': return 'phone';
      default: return 'phone';
    }
  };

  return (
    <View style={styles.callLogItem}>
      <View style={styles.callLogHeader}>
        <View style={styles.callLogIcon}>
          <Icon
            name={getOutcomeIcon(item.outcome)}
            size={20}
            color={getOutcomeColor(item.outcome)}
          />
        </View>
        <View style={styles.callLogMain}>
          <View style={styles.callLogTop}>
            <Text style={styles.callLogDate}>{formatDate(item.call_date)}</Text>
            <View style={styles.contactMethodBadge}>
              <Feather name={getContactMethodIcon(item.contact_method)} size={12} color="#6B7280" />
              <Text style={styles.contactMethodText}>{item.contact_method}</Text>
            </View>
          </View>
          <Text style={styles.callLogOutcome}>{t(`callLog.${item.outcome.toLowerCase()}`)}</Text>
        </View>
        <View style={styles.callerInfo}>
          <Text style={styles.callerName}>
            {item.caller?.first_name} {item.caller?.last_name}
          </Text>
          <Text style={styles.callerRole}>
            {item.caller?.role === 'Bacenta_Leader' ? 'Leader' : 'Admin'}
          </Text>
        </View>
      </View>

      {item.notes && (
        <View style={styles.callLogNotes}>
          <Text style={styles.callLogNotesText}>{item.notes}</Text>
        </View>
      )}

      {item.next_followup_date && (
        <View style={styles.followupInfo}>
          <Feather name="calendar" size={14} color="#D97706" />
          <Text style={styles.followupText}>
            {t('followup')}: {formatDate(item.next_followup_date)}
          </Text>
        </View>
      )}

      {item.followup_notes && (
        <View style={styles.followupNotes}>
          <Text style={styles.followupNotesText}>{item.followup_notes}</Text>
        </View>
      )}
    </View>
  );
};

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

      {/* Statistiques d'appels */}
      <View style={styles.statsSection}>
        <Text style={styles.sectionTitle}>{t('callStatistics')}</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: '#DBEAFE' }]}>
              <Feather name="phone" size={20} color="#2563EB" />
            </View>
            <Text style={styles.statValue}>{callStats.totalCalls}</Text>
            <Text style={styles.statLabel}>{t('totalCalls')}</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: '#D1FAE5' }]}>
              <Feather name="check-circle" size={20} color="#16A34A" />
            </View>
            <Text style={styles.statValue}>{callStats.contacted}</Text>
            <Text style={styles.statLabel}>{t('contacted')}</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: '#FEF3C7' }]}>
              <Feather name="phone-missed" size={20} color="#D97706" />
            </View>
            <Text style={styles.statValue}>{callStats.noAnswer}</Text>
            <Text style={styles.statLabel}>{t('noAnswer')}</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: '#FEE2E2' }]}>
              <Feather name="rotate-ccw" size={20} color="#DC2626" />
            </View>
            <Text style={styles.statValue}>{callStats.callbackRequested}</Text>
            <Text style={styles.statLabel}>{t('callbackRequested')}</Text>
          </View>
        </View>

        {callStats.lastCallDate && (
          <View style={styles.lastCallInfo}>
            <Feather name="clock" size={16} color="#6B7280" />
            <Text style={styles.lastCallText}>
              {t('lastCall')}: {formatDate(callStats.lastCallDate)}
            </Text>
          </View>
        )}
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
      <View style={styles.historySection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{t('callHistory')}</Text>
          <Text style={styles.sectionCount}>{callLogs.length} {t('calls')}</Text>
        </View>

        {callLogs.length > 0 ? (
          <FlatList
            data={callLogs}
            renderItem={renderCallLogItem}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            ItemSeparatorComponent={() => <View style={styles.callLogSeparator} />}
          />
        ) : (
          <View style={styles.emptyCallHistory}>
            <Feather name="phone" size={48} color="#D1D5DB" />
            <Text style={styles.emptyCallHistoryText}>{t('noCallHistory')}</Text>
            <Text style={styles.emptyCallHistorySubtext}>{t('startCalling')}</Text>
          </View>
        )}
      </View>

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
                    {member?.generatedMessage ? 'WhatsApp' : 'Appel WhatsApp'}
                  </Text>
                  <Text style={styles.methodDescription}>
                    {member?.generatedMessage ? 'Envoyer via WhatsApp' : 'Appeler via WhatsApp'}
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
                    <Text style={styles.methodTitle}>SMS</Text>
                    <Text style={styles.methodDescription}>Envoyer par SMS classique</Text>
                  </View>
                  <Feather name="chevron-right" size={20} color="#FFFFFF" />
                </TouchableOpacity>
              )}
            </View>
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
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#DC2626',
    marginBottom: 20,
    textAlign: 'center',
  },
  backBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#DC2626',
    borderRadius: 8,
  },
  backBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    backgroundColor: '#991B1B',
    height: 60,
    position: 'relative',
  },
  headerBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#991B1B',
  },
  headerContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  backButton: {
    padding: 8,
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
  },
  profileSection: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#FECACA',
  },
  photoContainer: {
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  photo: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: '#FEF2F2',
  },
  photoPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#FCA5A5',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#FEF2F2',
  },
  photoPlaceholderText: {
    fontSize: 36,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  basicInfo: {
    alignItems: 'center',
  },
  memberName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  stateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 8,
    gap: 6,
  },
  stateText: {
    fontSize: 14,
    fontWeight: '600',
  },
  areaText: {
    fontSize: 14,
    color: '#6B7280',
  },
  statsSection: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    marginTop: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#FECACA',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F3F4F6',
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
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  lastCallInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    gap: 8,
  },
  lastCallText: {
    fontSize: 14,
    color: '#6B7280',
    fontStyle: 'italic',
  },
  detailsSection: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    marginTop: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#FECACA',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
    gap: 16,
  },
  detailContent: {
    flex: 1,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    paddingBottom: 12,
  },
  detailLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  detailValue: {
    fontSize: 16,
    color: '#111827',
    fontWeight: '500',
  },
  notesSection: {
    marginTop: 8,
    backgroundColor: '#FEF2F2',
    padding: 16,
    borderRadius: 12,
  },
  notesText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  historySection: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    marginTop: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#FECACA',
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 12,
    gap: 12,
  },
  historyIcon: {
    marginTop: 2,
  },
  historyContent: {
    flex: 1,
  },
  historyDate: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  historyStatus: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  historyNotes: {
    fontSize: 14,
    color: '#4B5563',
    fontStyle: 'italic',
  },
  historySeparator: {
    height: 1,
    backgroundColor: '#F3F4F6',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionCount: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  callLogItem: {
    paddingVertical: 12,
  },
  callLogHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  callLogIcon: {
    marginTop: 2,
  },
  callLogMain: {
    flex: 1,
  },
  callLogTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  callLogDate: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  contactMethodBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    gap: 4,
  },
  contactMethodText: {
    fontSize: 10,
    color: '#4B5563',
  },
  callLogOutcome: {
    fontSize: 14,
    color: '#4B5563',
    fontWeight: '500',
  },
  callerInfo: {
    alignItems: 'flex-end',
  },
  callerName: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '500',
  },
  callerRole: {
    fontSize: 10,
    color: '#9CA3AF',
  },
  callLogNotes: {
    marginTop: 8,
    marginLeft: 32,
    backgroundColor: '#F9FAFB',
    padding: 8,
    borderRadius: 8,
  },
  callLogNotesText: {
    fontSize: 13,
    color: '#4B5563',
    fontStyle: 'italic',
  },
  followupInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    marginLeft: 32,
    gap: 6,
  },
  followupText: {
    fontSize: 12,
    color: '#D97706',
    fontWeight: '500',
  },
  followupNotes: {
    marginTop: 4,
    marginLeft: 32,
    paddingLeft: 8,
    borderLeftWidth: 2,
    borderLeftColor: '#D97706',
  },
  followupNotesText: {
    fontSize: 12,
    color: '#6B7280',
  },
  callLogSeparator: {
    height: 1,
    backgroundColor: '#F3F4F6',
  },
  emptyCallHistory: {
    alignItems: 'center',
    padding: 32,
  },
  emptyCallHistoryText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#9CA3AF',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyCallHistorySubtext: {
    fontSize: 14,
    color: '#D1D5DB',
    textAlign: 'center',
  },
  fabContainer: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    gap: 16,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  callFab: {
    backgroundColor: '#2563EB',
  },
  messageFab: {
    backgroundColor: '#16A34A',
  },
  editFab: {
    backgroundColor: '#DC2626',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
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
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  templatesList: {
    padding: 20,
  },
  templateItem: {
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F3F4F6',
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
  },
  templatePreview: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  modalActions: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  cancelBtn: {
    padding: 16,
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
  },
  cancelBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4B5563',
  },
  methodSelection: {
    padding: 20,
  },
  methodSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 20,
    textAlign: 'center',
  },
  methodOptions: {
    gap: 12,
  },
  methodOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    gap: 16,
  },
  phoneOption: {
    backgroundColor: '#2563EB',
  },
  whatsappOption: {
    backgroundColor: '#25D366',
  },
  whatsappCallOption: {
    backgroundColor: '#25D366',
  },
  smsOption: {
    backgroundColor: '#F59E0B',
  },
  methodIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  methodInfo: {
    flex: 1,
  },
  methodTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  methodDescription: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
  },
});

export default MemberDetailScreen;