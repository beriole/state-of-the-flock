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
  Switch,
  Alert,
  Modal,
  TextInput,
  ActivityIndicator
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Feather from 'react-native-vector-icons/Feather';
import { useTranslation } from 'react-i18next';
import i18n from '../../i18n';
import api from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext';
import Toast from 'react-native-toast-message';

const ProfileScreen = () => {
  const { t } = useTranslation();
  const { user: authUser, updateUser } = useAuth();
  const [languageModalVisible, setLanguageModalVisible] = useState(false);
  const [editProfileVisible, setEditProfileVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const [user, setUser] = useState({
    name: '',
    email: '',
    phone: '',
    role: '',
    zone: '',
    memberSince: '',
    avatar: require('../../assets/logo/image.png'),
  });

  const [editForm, setEditForm] = useState({
    first_name: '',
    last_name: '',
    phone: ''
  });

  const [settings, setSettings] = useState({
    notifications: true,
    darkMode: false,
    syncAuto: true,
    weeklyReports: true
  });

  useEffect(() => {
    if (authUser) {
      fetchUserData();
    }
  }, [authUser]);

  const fetchUserData = async () => {
    try {
      const response = await api.get(`/users/${authUser.id}`);
      const userData = response.data;

      setUser({
        name: `${userData.first_name} ${userData.last_name}`,
        email: userData.email,
        phone: userData.phone || '-',
        role: userData.role.replace('_', ' '),
        zone: userData.area ? userData.area.name : 'N/A',
        memberSince: new Date(userData.created_at).toLocaleDateString(),
        avatar: require('../../assets/logo/image.png')
      });

      setEditForm({
        first_name: userData.first_name,
        last_name: userData.last_name,
        phone: userData.phone || ''
      });

      if (userData.settings) {
        setSettings(prev => ({ ...prev, ...userData.settings }));
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      Toast.show({
        type: 'error',
        text1: t('common.error'),
        text2: 'Impossible de charger le profil'
      });
    }
  };

  const toggleSetting = async (key) => {
    const newSettings = { ...settings, [key]: !settings[key] };
    setSettings(newSettings); // Optimistic update

    try {
      await api.put('/users/settings', { settings: newSettings });
    } catch (error) {
      console.error('Error updating settings:', error);
      setSettings(settings); // Revert on error
      Toast.show({
        type: 'error',
        text1: t('common.error'),
        text2: 'Erreur lors de la mise à jour des paramètres'
      });
    }
  };

  const handleUpdateProfile = async () => {
    setLoading(true);
    try {
      const response = await api.put(`/users/${authUser.id}`, editForm);
      await updateUser(response.data); // Update context
      fetchUserData(); // Refresh local state
      setEditProfileVisible(false);
      Toast.show({
        type: 'success',
        text1: t('common.success'),
        text2: 'Profil mis à jour avec succès'
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      Toast.show({
        type: 'error',
        text1: t('common.error'),
        text2: 'Erreur lors de la mise à jour du profil'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      t('logout'),
      t('logoutConfirm'),
      [
        { text: t('cancel'), style: 'cancel' },
        { text: t('logout'), style: 'destructive', onPress: () => console.log('Logout') } // Implement actual logout logic here
      ]
    );
  };

  const changeLanguage = (lang) => {
    i18n.changeLanguage(lang);
    setLanguageModalVisible(false);
    // Optionally save language preference to backend
    toggleSetting('language', lang); // This might need adjustment if toggleSetting only handles booleans
  };

  const menuSections = [
    {
      title: t('account'),
      items: [
        {
          icon: 'account-edit',
          title: t('editProfile'),
          description: t('editProfileDesc'),
          color: '#DC2626',
          onPress: () => setEditProfileVisible(true)
        },
        {
          icon: 'shield-account',
          title: t('security'),
          description: t('securityDesc'),
          color: '#059669',
          onPress: () => console.log('Security')
        },
        {
          icon: 'cellphone',
          title: t('connectedDevices'),
          description: t('connectedDevicesDesc'),
          color: '#7C3AED',
          onPress: () => console.log('Devices')
        }
      ]
    },
    {
      title: t('settings'),
      items: [
        {
          icon: 'translate',
          title: t('language'),
          description: i18n.language === 'fr' ? t('french') : t('english'),
          color: '#2563EB',
          onPress: () => setLanguageModalVisible(true)
        },
        {
          icon: 'bell',
          title: t('notifications'),
          type: 'switch',
          value: settings.notifications,
          onToggle: () => toggleSetting('notifications'),
          color: '#D97706'
        },
        {
          icon: 'weather-night',
          title: t('darkMode'),
          type: 'switch',
          value: settings.darkMode,
          onToggle: () => toggleSetting('darkMode'),
          color: '#4B5563'
        },
        {
          icon: 'cloud-sync',
          title: t('autoSync'),
          type: 'switch',
          value: settings.syncAuto,
          onToggle: () => toggleSetting('syncAuto'),
          color: '#0369A1'
        },
        {
          icon: 'chart-box',
          title: t('weeklyReports'),
          type: 'switch',
          value: settings.weeklyReports,
          onToggle: () => toggleSetting('weeklyReports'),
          color: '#7C3AED'
        }
      ]
    },
    {
      title: t('support'),
      items: [
        {
          icon: 'help-circle',
          title: t('helpCenter'),
          description: t('helpCenterDesc'),
          color: '#6B7280',
          onPress: () => console.log('Help')
        },
        {
          icon: 'information',
          title: t('about'),
          description: t('aboutDesc'),
          color: '#0369A1',
          onPress: () => console.log('About')
        },
        {
          icon: 'logout',
          title: t('logout'),
          color: '#DC2626',
          onPress: handleLogout
        }
      ]
    }
  ];

  const renderMenuItem = (item, index) => (
    <TouchableOpacity
      key={index}
      style={styles.menuItem}
      onPress={item.onPress}
      disabled={item.type === 'switch'}
    >
      <View style={styles.menuItemLeft}>
        <View style={[styles.menuIcon, { backgroundColor: `${item.color}15` }]}>
          <Icon name={item.icon} size={20} color={item.color} />
        </View>
        <View style={styles.menuText}>
          <Text style={styles.menuTitle}>{item.title}</Text>
          {item.description && (
            <Text style={styles.menuDescription}>{item.description}</Text>
          )}
        </View>
      </View>

      {item.type === 'switch' ? (
        <Switch
          value={item.value}
          onValueChange={item.onToggle}
          trackColor={{ false: '#D1D5DB', true: `${item.color}50` }}
          thumbColor={item.value ? item.color : '#F3F4F6'}
        />
      ) : (
        <Feather name="chevron-right" size={20} color="#9CA3AF" />
      )}
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
            <Text style={styles.headerTitle}>{t('profile')}</Text>
            <Text style={styles.headerSubtitle}>{t('manageAccount')}</Text>
          </View>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Carte profil */}
        <View style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              <Image source={user.avatar} style={styles.avatar} />
              <TouchableOpacity style={styles.editAvatarButton}>
                <Feather name="camera" size={16} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            <View style={styles.profileInfo}>
              <Text style={styles.userName}>{user.name}</Text>
              <Text style={styles.userRole}>{user.role}</Text>
              <Text style={styles.userZone}>{user.zone}</Text>
            </View>
          </View>

          <View style={styles.profileStats}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>45</Text>
              <Text style={styles.statLabel}>{t('members')}</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>85%</Text>
              <Text style={styles.statLabel}>{t('attendance')}</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>12</Text>
              <Text style={styles.statLabel}>{t('months')}</Text>
            </View>
          </View>

          <View style={styles.contactInfo}>
            <View style={styles.contactItem}>
              <Feather name="mail" size={16} color="#6B7280" />
              <Text style={styles.contactText}>{user.email}</Text>
            </View>
            <View style={styles.contactItem}>
              <Feather name="phone" size={16} color="#6B7280" />
              <Text style={styles.contactText}>{user.phone}</Text>
            </View>
          </View>
        </View>

        {/* Menu sections */}
        {menuSections.map((section, sectionIndex) => (
          <View key={sectionIndex} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.menuList}>
              {section.items.map((item, itemIndex) => renderMenuItem(item, itemIndex))}
            </View>
          </View>
        ))}

        <View style={{ height: 48 }} />
      </ScrollView>

      {/* Language Selection Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={languageModalVisible}
        onRequestClose={() => setLanguageModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('selectLanguage')}</Text>
              <TouchableOpacity onPress={() => setLanguageModalVisible(false)}>
                <Feather name="x" size={24} color="#111827" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.languageOption, i18n.language === 'en' && styles.selectedOption]}
              onPress={() => changeLanguage('en')}
            >
              <Text style={[styles.languageText, i18n.language === 'en' && styles.selectedText]}>
                🇬🇧 {t('english')}
              </Text>
              {i18n.language === 'en' && <Feather name="check" size={20} color="#DC2626" />}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.languageOption, i18n.language === 'fr' && styles.selectedOption]}
              onPress={() => changeLanguage('fr')}
            >
              <Text style={[styles.languageText, i18n.language === 'fr' && styles.selectedText]}>
                🇫🇷 {t('french')}
              </Text>
              {i18n.language === 'fr' && <Feather name="check" size={20} color="#DC2626" />}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Edit Profile Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={editProfileVisible}
        onRequestClose={() => setEditProfileVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('editProfile')}</Text>
              <TouchableOpacity onPress={() => setEditProfileVisible(false)}>
                <Feather name="x" size={24} color="#111827" />
              </TouchableOpacity>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>{t('firstName')}</Text>
              <TextInput
                style={styles.input}
                value={editForm.first_name}
                onChangeText={(text) => setEditForm(prev => ({ ...prev, first_name: text }))}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>{t('lastName')}</Text>
              <TextInput
                style={styles.input}
                value={editForm.last_name}
                onChangeText={(text) => setEditForm(prev => ({ ...prev, last_name: text }))}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>{t('phone')}</Text>
              <TextInput
                style={styles.input}
                value={editForm.phone}
                onChangeText={(text) => setEditForm(prev => ({ ...prev, phone: text }))}
                keyboardType="phone-pad"
              />
            </View>

            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleUpdateProfile}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.saveButtonText}>{t('save')}</Text>
              )}
            </TouchableOpacity>
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
  content: {
    flex: 1,
    paddingHorizontal: 16,
    marginTop: -20,
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#FECACA',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    borderColor: '#FEF2F2',
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#DC2626',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 2,
  },
  userRole: {
    fontSize: 16,
    color: '#DC2626',
    fontWeight: '600',
    marginBottom: 2,
  },
  userZone: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  profileStats: {
    flexDirection: 'row',
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#FECACA',
    marginHorizontal: 8,
  },
  contactInfo: {
    gap: 8,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  contactText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  menuList: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuText: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  menuDescription: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    minHeight: 250,
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
  languageOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  selectedOption: {
    backgroundColor: '#FEF2F2',
    marginHorizontal: -24,
    paddingHorizontal: 24,
  },
  languageText: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
  },
  selectedText: {
    color: '#DC2626',
    fontWeight: '700',
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#111827',
  },
  saveButton: {
    backgroundColor: '#DC2626',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 24,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default ProfileScreen;
