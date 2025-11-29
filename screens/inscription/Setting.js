import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Switch, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Entypo from 'react-native-vector-icons/Entypo';
import AntDesign from 'react-native-vector-icons/AntDesign';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { userAPI } from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext';
import Toast from 'react-native-toast-message';

export default function Setting() {
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    notifications: true,
    budgetAlert: true,
    darkMode: false,
    biometric: false,
    language: 'fr'
  });

  const Navigation = useNavigation();
  const { t } = useTranslation();
  const { user, updateUser } = useAuth();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      // If user context has settings, use them initially
      if (user && user.settings) {
        setSettings(prev => ({ ...prev, ...user.settings }));
      }

      // Fetch latest from API
      const response = await userAPI.getUserById(user.id);
      if (response.data && response.data.settings) {
        setSettings(prev => ({ ...prev, ...response.data.settings }));
        // Update context if needed
        updateUser({ ...user, settings: response.data.settings });
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      Toast.show({
        type: 'error',
        text1: t('common.error'),
        text2: 'Impossible de charger les paramètres'
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleSetting = async (key, value) => {
    // Optimistic update
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);

    try {
      await userAPI.updateSettings({ settings: { [key]: value } });

      // Update context
      updateUser({ ...user, settings: { ...user.settings, [key]: value } });

    } catch (error) {
      console.error(`Error updating setting ${key}:`, error);
      // Revert on error
      setSettings(prev => ({ ...prev, [key]: !value }));
      Toast.show({
        type: 'error',
        text1: t('common.error'),
        text2: 'Erreur lors de la mise à jour'
      });
    }
  };

  if (loading && !settings) {
    return (
      <SafeAreaView style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.flexRow} onPress={() => Navigation.goBack()}>
          <Entypo name='chevron-left' size={24} color="#fff" />
          <Text style={styles.headerBack}>{t('common.back')}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('settings.title')}</Text>
        <AntDesign name='user' size={24} color="#fff" />
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 30 }}>

        {/* Security */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>{t('settings.security')}</Text>

          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <MaterialIcons name="fingerprint" size={22} color="#3B82F6" />
              <Text style={styles.rowText}>{t('settings.biometric')}</Text>
            </View>
            <Switch
              value={settings.biometric}
              onValueChange={(val) => toggleSetting('biometric', val)}
              trackColor={{ false: '#767577', true: '#3B82F6' }}
              thumbColor={settings.biometric ? '#1E40AF' : '#f4f3f4'}
            />
          </View>

          <TouchableOpacity
            style={styles.row}
            onPress={() => Toast.show({
              type: 'info',
              text1: 'Info',
              text2: 'Fonctionnalité à venir'
            })}
          >
            <View style={styles.rowLeft}>
              <AntDesign name="lock" size={22} color="#3B82F6" />
              <Text style={styles.rowText}>{t('settings.changePassword')}</Text>
            </View>
            <Entypo name="chevron-right" size={20} color="#94A3B8" />
          </TouchableOpacity>
        </View>

        {/* Notifications */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>{t('settings.notifications')}</Text>

          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <MaterialIcons name="notifications" size={22} color="#3B82F6" />
              <Text style={styles.rowText}>{t('settings.enableNotifications')}</Text>
            </View>
            <Switch
              value={settings.notifications}
              onValueChange={(val) => toggleSetting('notifications', val)}
              trackColor={{ false: '#767577', true: '#3B82F6' }}
              thumbColor={settings.notifications ? '#1E40AF' : '#f4f3f4'}
            />
          </View>

          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <MaterialIcons name="warning" size={22} color="#3B82F6" />
              <Text style={styles.rowText}>{t('settings.budgetAlerts')}</Text>
            </View>
            <Switch
              value={settings.budgetAlert}
              onValueChange={(val) => toggleSetting('budgetAlert', val)}
              trackColor={{ false: '#767577', true: '#3B82F6' }}
              thumbColor={settings.budgetAlert ? '#1E40AF' : '#f4f3f4'}
            />
          </View>
        </View>

        {/* Preferences */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>{t('settings.preferences')}</Text>

          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <MaterialIcons name="dark-mode" size={22} color="#3B82F6" />
              <Text style={styles.rowText}>{t('settings.darkMode')}</Text>
            </View>
            <Switch
              value={settings.darkMode}
              onValueChange={(val) => toggleSetting('darkMode', val)}
              trackColor={{ false: '#767577', true: '#3B82F6' }}
              thumbColor={settings.darkMode ? '#1E40AF' : '#f4f3f4'}
            />
          </View>

          <TouchableOpacity
            style={styles.row}
            onPress={() => Navigation.navigate('LanguageSelection')}
          >
            <View style={styles.rowLeft}>
              <Entypo name="globe" size={22} color="#3B82F6" />
              <Text style={styles.rowText}>{t('language')}</Text>
            </View>
            <View style={styles.rowRight}>
              <Text style={styles.valueText}>
                {settings.language === 'en' ? 'English' : 'Français'}
              </Text>
              <Entypo name="chevron-right" size={20} color="#94A3B8" />
            </View>
          </TouchableOpacity>
        </View>

        {/* Privacy & Policy */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>{t('settings.privacy')}</Text>

          <TouchableOpacity style={styles.row}>
            <View style={styles.rowLeft}>
              <AntDesign name="filetext1" size={22} color="#3B82F6" />
              <Text style={styles.rowText}>{t('settings.privacyPolicy')}</Text>
            </View>
            <Entypo name="chevron-right" size={20} color="#94A3B8" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.row}>
            <View style={styles.rowLeft}>
              <AntDesign name="exclamationcircleo" size={22} color="#3B82F6" />
              <Text style={styles.rowText}>{t('settings.termsOfUse')}</Text>
            </View>
            <Entypo name="chevron-right" size={20} color="#94A3B8" />
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D1B2A'
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center'
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#1E293B',
  },
  flexRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  headerBack: {
    color: '#fff',
    fontSize: 16,
    marginLeft: 6
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold'
  },
  card: {
    backgroundColor: '#1E293B',
    marginHorizontal: 16,
    marginVertical: 10,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3
  },
  sectionTitle: {
    color: '#CBD5E1',
    fontSize: 14,
    marginBottom: 12,
    fontWeight: 'bold'
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#334155'
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  rowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  rowText: {
    color: '#fff',
    fontSize: 16
  },
  valueText: {
    color: '#94A3B8',
    fontSize: 14
  }
});
