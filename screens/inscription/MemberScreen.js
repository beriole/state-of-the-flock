
// screens/inscription/MembersScreen.jsx
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
  Platform
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Feather from 'react-native-vector-icons/Feather';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthContext';
import { memberAPI, callLogAPI } from '../../utils/api';
import { NativeModules } from 'react-native';
import Share from 'react-native-share';

// Robustly find the native module
const RNHTMLtoPDF = NativeModules.RNHTMLtoPDF || NativeModules.HtmlToPdf || NativeModules.RNHTMLToPdf;

console.log('NativeModules keys:', Object.keys(NativeModules));
console.log('Selected PDF Module:', RNHTMLtoPDF);

const MembersScreen = () => {
  const { t } = useTranslation();
  const { user: authUser } = useAuth();
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showSmsModal, setShowSmsModal] = useState(false);
  const [showCallModal, setShowCallModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [saving, setSaving] = useState(false);

  const [newMember, setNewMember] = useState({
    first_name: '',
    last_name: '',
    phone_primary: '',
    phone_secondary: '',
    gender: 'M',
    area_id: authUser?.area_id || '',
    leader_id: authUser?.id || ''
  });

  // Update area_id and leader_id when authUser changes
  useEffect(() => {
    if (authUser) {
      setNewMember(prev => ({
        ...prev,
        area_id: authUser.area_id || prev.area_id,
        leader_id: authUser.id || prev.leader_id
      }));
    }
  }, [authUser]);

  // Filtrage des membres
  const filteredMembers = members.filter(member => {
    const fullName = member.name || `${member.first_name || ''} ${member.last_name || ''}`.trim();
    const phone = member.phone_primary || member.phone || '';
    const searchLower = searchQuery.toLowerCase();

    return fullName.toLowerCase().includes(searchLower) ||
      phone.includes(searchQuery);
  });

  const stats = [
    { key: 'total', label: t('members.total'), value: members.length, color: '#DC2626', icon: 'account-group' },
    { key: 'active', label: t('members.active'), value: members.filter(m => m.status === 'active').length, color: '#16A34A', icon: 'check-circle' },
    { key: 'inactive', label: t('members.inactive'), value: members.filter(m => m.status === 'inactive').length, color: '#D97706', icon: 'clock' },
  ];

  const groups = ['Bacenta A', 'Bacenta B', 'Bacenta C'];

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
  const handleCall = (member) => {
    const phoneNumber = member.phone_primary || member.phone;
    if (!phoneNumber) {
      Alert.alert('Erreur', 'Aucun numéro de téléphone disponible');
      return;
    }

    setSelectedMember(member);
    setShowCallModal(true);
  };

  // Execute call with selected method
  const executeCall = async (method) => {
    if (!selectedMember) return;

    const phoneNumber = selectedMember.phone_primary || selectedMember.phone;
    let url;
    let contactMethod = 'Phone';

    if (method === 'phone') {
      url = `tel:${phoneNumber}`;
      contactMethod = 'Phone';
    } else if (method === 'whatsapp') {
      // Essayer d'ouvrir WhatsApp directement
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
          // Si WhatsApp n'est pas disponible, essayer l'URL web
          const webUrl = `https://wa.me/${phoneNumber}`;
          await Linking.openURL(webUrl);
        }
      }

      // Log the call attempt
      try {
        await callLogAPI.createCallLog({
          member_id: selectedMember.id,
          outcome: 'Contacted', // Default outcome for initiated calls
          contact_method: contactMethod,
          notes: `Appel initié via ${contactMethod}`
        });
        console.log('Call logged successfully');
      } catch (logError) {
        console.error('Error logging call:', logError);
        // Don't show error to user as the call was successful
      }

      setShowCallModal(false);
      setSelectedMember(null);
    } catch (error) {
      if (method === 'phone') {
        Alert.alert('Erreur', 'Impossible de passer l\'appel');
      } else if (method === 'whatsapp') {
        // Si rien ne fonctionne, proposer d'installer WhatsApp
        Alert.alert(
          'WhatsApp non disponible',
          'WhatsApp n\'est pas installé ou le numéro n\'est pas valide. Voulez-vous ouvrir le Play Store pour installer WhatsApp ?',
          [
            { text: 'Annuler', style: 'cancel' },
            {
              text: 'Installer WhatsApp',
              onPress: () => Linking.openURL('market://details?id=com.whatsapp')
            }
          ]
        );
      }
    }
  };

  // Handle SMS
  const handleSms = (member) => {
    setSelectedMember(member);
    setShowSmsModal(true);
  };

  // Send SMS with selected template
  const sendSms = (template) => {
    if (!selectedMember) return;

    const phoneNumber = selectedMember.phone_primary || selectedMember.phone;
    if (!phoneNumber) {
      Alert.alert('Erreur', 'Aucun numéro de téléphone disponible');
      return;
    }

    const memberName = `${selectedMember.first_name} ${selectedMember.last_name}`;
    const leaderName = `${authUser.first_name} ${authUser.last_name}`;

    // Generate message using function
    const message = template.message(memberName, leaderName);

    // Store template and message for the send method modal
    setSelectedMember({
      ...selectedMember,
      selectedTemplate: template,
      generatedMessage: message
    });
    setShowSmsModal(false);
    setTimeout(() => setShowCallModal(true), 300); // Show send method modal
  };

  // Execute SMS send with selected method
  const executeSmsSend = async (method) => {
    if (!selectedMember || !selectedMember.generatedMessage) return;

    const phoneNumber = selectedMember.phone_primary || selectedMember.phone;
    const message = selectedMember.generatedMessage;
    let url;
    let contactMethod = 'SMS';

    if (method === 'whatsapp') {
      // Essayer d'ouvrir WhatsApp directement
      url = `whatsapp://send?phone=${phoneNumber}&text=${encodeURIComponent(message)}`;
      contactMethod = 'WhatsApp';
    } else if (method === 'sms') {
      url = `sms:${phoneNumber}${Platform.OS === 'ios' ? '&' : '?'}body=${encodeURIComponent(message)}`;
      contactMethod = 'SMS';
    }

    try {
      if (method === 'whatsapp') {
        try {
          await Linking.openURL(url);
        } catch (error) {
          // Si WhatsApp n'est pas disponible, essayer l'URL web
          const webUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
          await Linking.openURL(webUrl);
        }
      } else if (method === 'sms') {
        await Linking.openURL(url);
      }

      // Log the message send attempt
      try {
        await callLogAPI.createCallLog({
          member_id: selectedMember.id,
          outcome: 'Contacted', // Default outcome for sent messages
          contact_method: contactMethod,
          notes: `Message envoyé via ${contactMethod}: ${selectedMember.selectedTemplate?.title || 'Message personnalisé'}`
        });
        console.log('Message send logged successfully');
      } catch (logError) {
        console.error('Error logging message send:', logError);
        // Don't show error to user as the message send was successful
      }

      setShowCallModal(false);
      setSelectedMember(null);
    } catch (error) {
      if (method === 'whatsapp') {
        // Si rien ne fonctionne, proposer d'installer WhatsApp
        Alert.alert(
          'WhatsApp non disponible',
          'WhatsApp n\'est pas installé ou le numéro n\'est pas valide. Voulez-vous ouvrir le Play Store pour installer WhatsApp ?',
          [
            { text: 'Annuler', style: 'cancel' },
            {
              text: 'Installer WhatsApp',
              onPress: () => Linking.openURL('market://details?id=com.whatsapp')
            }
          ]
        );
      } else if (method === 'sms') {
        Alert.alert('Erreur', 'Impossible d\'envoyer un SMS');
      }
    }
  };

  // Helper function to show file location
  const showFileLocation = (filePath) => {
    const isDocumentsDir = filePath.includes('Documents');
    const folderName = isDocumentsDir ? 'Documents' : 'Download';

    const locationMessage = `Le PDF a été généré avec succès !\n\n📁 Emplacement du fichier :\n${filePath}\n\n📱 Pour accéder au fichier :\n1. Ouvrez un gestionnaire de fichiers (comme "Fichiers" ou "File Manager")\n2. Allez dans "Android" > "data" > "com.stage1" > "files" > "${folderName}"\n3. Trouvez le fichier PDF et ouvrez-le\n\n💡 Astuce : Si vous ne voyez pas le dossier Android, activez "Afficher les fichiers cachés" dans les paramètres du gestionnaire de fichiers.`;

    Alert.alert(
      '✅ PDF généré avec succès',
      locationMessage,
      [{ text: 'Compris' }]
    );
  };

  // Generate PDF for members
  const generateMembersPDF = async () => {
    try {
      setLoading(true);

      // Validate data
      if (!members || members.length === 0) {
        Alert.alert('Erreur', 'Aucun membre à exporter');
        return;
      }

      // Create HTML content
      let htmlContent = `
        <html>
          <head>
            <style>
              body { font-family: 'Helvetica', sans-serif; padding: 40px; color: #333; }
              .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #991B1B; padding-bottom: 20px; }
              h1 { color: #991B1B; margin: 0; font-size: 24px; text-transform: uppercase; }
              .meta { color: #666; font-size: 12px; margin-top: 5px; }
              table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 12px; }
              th, td { border: 1px solid #e5e7eb; padding: 10px; text-align: left; }
              th { background-color: #f9fafb; color: #374151; font-weight: bold; text-transform: uppercase; font-size: 11px; }
              tr:nth-child(even) { background-color: #f9fafb; }
              .status-active { color: #059669; font-weight: bold; background-color: #ecfdf5; padding: 2px 6px; borderRadius: 4px; display: inline-block; }
              .status-inactive { color: #dc2626; font-weight: bold; background-color: #fef2f2; padding: 2px 6px; borderRadius: 4px; display: inline-block; }
              .footer { margin-top: 40px; text-align: center; font-size: 10px; color: #9ca3af; border-top: 1px solid #e5e7eb; padding-top: 20px; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>Liste des Membres</h1>
              <div class="meta">
                Généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}
                <br/>
                Total membres: ${members.length}
              </div>
            </div>

            <table>
              <thead>
                <tr>
                  <th>Nom</th>
                  <th>Téléphone</th>
                  <th>Genre</th>
                  <th>Statut</th>
                  <th>Groupe</th>
                </tr>
              </thead>
              <tbody>
                ${members.map(member => `
                  <tr>
                    <td><strong>${member.name || (member.first_name + ' ' + member.last_name)}</strong></td>
                    <td>${member.phone_primary || member.phone || '-'}</td>
                    <td>${member.gender === 'M' ? 'Homme' : 'Femme'}</td>
                    <td><span class="${member.status === 'active' ? 'status-active' : 'status-inactive'}">${member.status === 'active' ? 'Actif' : 'Inactif'}</span></td>
                    <td>${member.area?.name || member.group || '-'}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>

            <div class="footer">
              <p>Document généré par l'application Bacenta Leader</p>
            </div>
          </body>
        </html>
      `;

      // Create PDF with error handling - use Download directory
      const fileName = `Membres_Bacenta_${new Date().getTime()}`; // Remove .pdf extension as library adds it

      const options = {
        html: htmlContent,
        fileName: fileName,
        directory: 'Documents' // Try Documents directory which might be more accessible
      };

      console.log('Generating PDF with options:', options);
      console.log('RNHTMLtoPDF available:', !!RNHTMLtoPDF);
      console.log('RNHTMLtoPDF.convert available:', typeof RNHTMLtoPDF.convert);

      try {
        const file = await RNHTMLtoPDF.convert(options);
        console.log('PDF generated:', file);

        // Validate file object
        if (!file || !file.filePath) {
          console.error('PDF generation failed: invalid file object', file);
          throw new Error('PDF generation failed: no file path returned');
        }

        // Use the generated file path
        let accessibleFilePath = file.filePath;
        console.log('PDF file path:', accessibleFilePath);

        // Since file sharing from private directories doesn't work on Android,
        // we'll show the file location with clear instructions for manual access
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

  // Load members from API
  const loadMembers = async () => {
    try {
      setRefreshing(true);
      const response = await memberAPI.getMembers({ limit: 50, page: 1 });
      const apiMembers = response.data.members.map(member => ({
        id: member.id,
        name: `${member.first_name} ${member.last_name}`,
        phone: member.phone_primary || '-',
        status: member.is_active ? 'active' : 'inactive',
        lastSeen: member.last_attendance_date ? 'recent' : 'unknown',
        group: 'Bacenta A', // Default group since API doesn't have groups yet
        first_name: member.first_name,
        last_name: member.last_name,
        phone_primary: member.phone_primary,
        phone_secondary: member.phone_secondary,
        gender: member.gender,
        state: member.state,
        area: member.area,
        leader: member.leader
      }));
      setMembers(apiMembers);
    } catch (error) {
      console.error('Erreur lors du chargement des membres:', error);
      Alert.alert(t('error'), t('members.loadError'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadMembers();
  }, []);

  // Add a new member
  const handleAddMember = async () => {
    if (!newMember.first_name.trim() || !newMember.last_name.trim()) {
      Alert.alert(t('common.error'), 'Le prénom et le nom sont obligatoires');
      return;
    }

    if (!newMember.phone_primary.trim()) {
      Alert.alert(t('common.error'), 'Le numéro de téléphone principal est obligatoire');
      return;
    }

    // Allow Bishops to create members without area_id
    if (authUser?.role !== 'Bishop' && !newMember.area_id) {
      Alert.alert(t('common.error'), 'Zone non définie. Veuillez vous reconnecter.');
      return;
    }

    setSaving(true);

    try {
      const memberData = {
        first_name: newMember.first_name.trim(),
        last_name: newMember.last_name.trim(),
        phone_primary: newMember.phone_primary.trim(),
        phone_secondary: newMember.phone_secondary.trim() || null,
        gender: newMember.gender,
        leader_id: newMember.leader_id,
        is_registered: false,
        state: 'Sheep',
        is_active: true
      };

      // Only include area_id if it exists (Bishops can create members without area)
      if (newMember.area_id) {
        memberData.area_id = newMember.area_id;
      }

      const response = await memberAPI.createMember(memberData);

      // Convertir la réponse API au format local
      const newMemberData = {
        id: response.data.id,
        name: `${response.data.first_name} ${response.data.last_name}`,
        phone: response.data.phone_primary || '-',
        status: response.data.is_active ? 'active' : 'inactive',
        lastSeen: 'today',
        first_name: response.data.first_name,
        last_name: response.data.last_name,
        phone_primary: response.data.phone_primary,
        phone_secondary: response.data.phone_secondary,
        gender: response.data.gender,
        state: response.data.state,
        area: response.data.area,
        leader: response.data.leader
      };

      setMembers([newMemberData, ...members]);
      setNewMember({
        first_name: '',
        last_name: '',
        phone_primary: '',
        phone_secondary: '',
        gender: 'M',
        area_id: authUser?.area_id || '',
        leader_id: authUser?.id || ''
      });
      setShowAddModal(false);

    } catch (error) {
      console.error('Erreur lors de la création du membre:', error);
      Alert.alert(t('common.error'), 'Erreur lors de la création du membre');
    } finally {
      setSaving(false);
    }
  };

  const formatLastSeen = (lastSeen) => {
    switch (lastSeen) {
      case 'today': return t('common.today');
      case 'yesterday': return t('common.yesterday');
      case '3_days_ago': return t('common.daysAgo', { count: 3 });
      case '1_week_ago': return t('common.weekAgo', { count: 1 });
      case '2_weeks_ago': return t('common.weeksAgo', { count: 2 });
      default: return lastSeen;
    }
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

  // Rendu d'un membre
  const renderMember = ({ item }) => (
    <TouchableOpacity
      style={styles.memberCard}
      activeOpacity={0.7}
      onPress={() => navigation.navigate('MemberDetail', { memberId: item.id })}
    >
      <View style={styles.memberHeader}>
        <View style={styles.memberAvatar}>
          <Text style={styles.memberAvatarText}>{item.first_name?.charAt(0) || item.name?.charAt(0) || '?'}</Text>
        </View>
        <View style={styles.memberInfo}>
          <Text style={styles.memberName}>{item.name || `${item.first_name} ${item.last_name}`}</Text>
          <Text style={styles.memberGroup}>
            {item.area?.name || item.group || 'Bacenta A'} • {item.state || 'Membre'}
          </Text>
        </View>
        <View style={[styles.statusBadge, item.status === 'active' ? styles.activeBadge : styles.inactiveBadge]}>
          <Text style={styles.statusText}>
            {item.status === 'active' ? t('members.active') : t('members.inactive')}
          </Text>
        </View>
      </View>

      <View style={styles.memberDetails}>
        <View style={styles.detailItem}>
          <Feather name="phone" size={14} color="#6B7280" />
          <Text style={styles.detailText}>{item.phone_primary || item.phone || '-'}</Text>
        </View>
        <View style={styles.detailItem}>
          <Feather name="user" size={14} color="#6B7280" />
          <Text style={styles.detailText}>{item.gender === 'M' ? 'Homme' : item.gender === 'F' ? 'Femme' : '-'}</Text>
        </View>
      </View>

      <View style={styles.memberActions}>
        <TouchableOpacity style={styles.actionBtn} onPress={() => handleCall(item)}>
          <Feather name="phone" size={16} color="#DC2626" />
          <Text style={styles.actionText}>{t('members.call')}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={() => handleSms(item)}>
          <Feather name="message-circle" size={16} color="#DC2626" />
          <Text style={styles.actionText}>{t('members.sms')}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('MemberDetail', { memberId: item.id })}>
          <Feather name="edit-2" size={16} color="#DC2626" />
          <Text style={styles.actionText}>{t('common.edit')}</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#991B1B" />

      {/* Header cohérent avec le dashboard */}
      <View style={styles.header}>
        <View style={styles.headerBackground} />
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerTitle}>{t('members.management')}</Text>
            <Text style={styles.headerSubtitle}>{t('members.bacentaLeader')}</Text>
          </View>
          <View style={{ flexDirection: 'row' }}>
            <TouchableOpacity
              style={[styles.notificationBtn, { marginRight: 10 }]}
              onPress={generateMembersPDF}
            >
              <Feather name="download" size={20} color="#FFFFFF" />
            </TouchableOpacity>
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

        {/* Barre de recherche et filtre */}
        <View style={styles.searchSection}>
          <View style={styles.searchContainer}>
            <Feather name="search" size={20} color="#9CA3AF" />
            <TextInput
              style={styles.searchInput}
              placeholder={t('members.searchPlaceholder')}
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
          <TouchableOpacity style={styles.filterBtn}>
            <Feather name="filter" size={20} color="#991B1B" />
          </TouchableOpacity>
        </View>

        {/* Liste des membres */}
        <View style={styles.membersSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {filteredMembers.length} {t('members.found')}
            </Text>
            <TouchableOpacity style={styles.sortBtn}>
              <Text style={styles.sortText}>{t('members.sortAZ')}</Text>
              <Feather name="chevron-down" size={16} color="#991B1B" />
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#DC2626" />
              <Text style={styles.loadingText}>{t('common.loading')}</Text>
            </View>
          ) : (
            <FlatList
              data={filteredMembers}
              renderItem={renderMember}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
              refreshing={refreshing}
              onRefresh={loadMembers}
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

      {/* Modal Ajouter Membre */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('members.addMember')}</Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <AntDesign name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Prénom *</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Entrez le prénom"
                  value={newMember.first_name}
                  onChangeText={(text) => setNewMember({ ...newMember, first_name: text })}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Nom *</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Entrez le nom"
                  value={newMember.last_name}
                  onChangeText={(text) => setNewMember({ ...newMember, last_name: text })}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Téléphone principal *</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Numéro de téléphone"
                  value={newMember.phone_primary}
                  onChangeText={(text) => setNewMember({ ...newMember, phone_primary: text })}
                  keyboardType="phone-pad"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Téléphone secondaire</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Numéro de téléphone secondaire (optionnel)"
                  value={newMember.phone_secondary}
                  onChangeText={(text) => setNewMember({ ...newMember, phone_secondary: text })}
                  keyboardType="phone-pad"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Genre *</Text>
                <View style={styles.pickerContainer}>
                  <TouchableOpacity
                    style={[
                      styles.groupOption,
                      newMember.gender === 'M' && styles.groupOptionSelected
                    ]}
                    onPress={() => setNewMember({ ...newMember, gender: 'M' })}
                  >
                    <Text style={[
                      styles.groupOptionText,
                      newMember.gender === 'M' && styles.groupOptionTextSelected
                    ]}>
                      Homme
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.groupOption,
                      newMember.gender === 'F' && styles.groupOptionSelected
                    ]}
                    onPress={() => setNewMember({ ...newMember, gender: 'F' })}
                  >
                    <Text style={[
                      styles.groupOptionText,
                      newMember.gender === 'F' && styles.groupOptionTextSelected
                    ]}>
                      Femme
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setShowAddModal(false)}
              >
                <Text style={styles.cancelBtnText}>{t('common.cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
                onPress={handleAddMember}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.saveBtnText}>{t('common.save')}</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

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
                    {selectedMember ? template.message(
                      `${selectedMember.first_name} ${selectedMember.last_name}`,
                      `${authUser.first_name} ${authUser.last_name}`
                    ).substring(0, 100) + '...' : 'Sélectionnez un membre...'}
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
        onRequestClose={() => {
          setShowCallModal(false);
          setSelectedMember(null);
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {selectedMember?.generatedMessage ? 'Envoyer le message' : 'Appeler le membre'}
              </Text>
              <TouchableOpacity onPress={() => {
                setShowCallModal(false);
                setSelectedMember(null);
              }}>
                <AntDesign name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <View style={styles.methodSelection}>
              <Text style={styles.methodSubtitle}>
                {selectedMember?.generatedMessage
                  ? `Choisir la méthode d'envoi pour ${selectedMember.first_name} ${selectedMember.last_name}`
                  : `Choisir la méthode d'appel pour ${selectedMember?.first_name} ${selectedMember?.last_name}`
                }
              </Text>

              <View style={styles.methodOptions}>
                {!selectedMember?.generatedMessage && (
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
                  style={[styles.methodOption, selectedMember?.generatedMessage ? styles.whatsappOption : styles.whatsappCallOption]}
                  onPress={() => selectedMember?.generatedMessage ? executeSmsSend('whatsapp') : executeCall('whatsapp')}
                >
                  <View style={styles.methodIcon}>
                    <AntDesign name={selectedMember?.generatedMessage ? "message1" : "phone"} size={24} color="#FFFFFF" />
                  </View>
                  <View style={styles.methodInfo}>
                    <Text style={styles.methodTitle}>
                      {selectedMember?.generatedMessage ? 'WhatsApp Message' : 'WhatsApp Call'}
                    </Text>
                    <Text style={styles.methodDescription}>
                      {selectedMember?.generatedMessage ? 'Envoyer via WhatsApp' : 'Appel via WhatsApp'}
                    </Text>
                  </View>
                  <Feather name="chevron-right" size={20} color="#FFFFFF" />
                </TouchableOpacity>

                {selectedMember?.generatedMessage && (
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
                onPress={() => {
                  setShowCallModal(false);
                  setSelectedMember(null);
                }}
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
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 12,
  },
  searchContainer: {
    flex: 1,
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
  filterBtn: {
    width: 50,
    height: 50,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  membersSection: {
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
  sortBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  sortText: {
    color: '#991B1B',
    fontWeight: '600',
    fontSize: 14,
  },
  memberCard: {
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
  memberHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  memberAvatar: {
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
  memberAvatarText: {
    color: '#991B1B',
    fontWeight: '800',
    fontSize: 18,
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  memberGroup: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  activeBadge: {
    backgroundColor: '#DCFCE7',
  },
  inactiveBadge: {
    backgroundColor: '#FEF3C7',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  memberDetails: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  memberActions: {
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
  pickerContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  groupOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  groupOptionSelected: {
    backgroundColor: '#FEE2E2',
    borderColor: '#DC2626',
  },
  groupOptionText: {
    color: '#6B7280',
    fontWeight: '500',
  },
  groupOptionTextSelected: {
    color: '#DC2626',
    fontWeight: '600',
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

export default MembersScreen;
