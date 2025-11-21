import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Entypo from 'react-native-vector-icons/Entypo';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function LanguageSelection() {
  const Navigation = useNavigation();
  const { t, i18n } = useTranslation();

  const changeLanguage = async (lang) => {
    try {
      await AsyncStorage.setItem('language', lang);
      await i18n.changeLanguage(lang);
      Alert.alert('Language changed to ' + lang);
      // Delay to allow language change to take effect
      setTimeout(() => {
        Navigation.goBack();
      }, 100);
    } catch (error) {
      console.error('Error changing language:', error);
      Alert.alert('Error changing language');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.flexRow} onPress={() => Navigation.goBack()}>
          <Entypo name='chevron-left' size={24} color="#fff" />
          <Text style={styles.headerBack}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('language')}</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>Choose your language</Text>

        <TouchableOpacity style={styles.languageOption} onPress={() => { Alert.alert('Clicked FR'); changeLanguage('fr'); }}>
          <Text style={styles.languageText}>{t('french')}</Text>
          {i18n.language === 'fr' && <Entypo name="check" size={24} color="#3B82F6" />}
        </TouchableOpacity>

        <TouchableOpacity style={styles.languageOption} onPress={() => { Alert.alert('Clicked EN'); changeLanguage('en'); }}>
          <Text style={styles.languageText}>{t('english')}</Text>
          {i18n.language === 'en' && <Entypo name="check" size={24} color="#3B82F6" />}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D1B2A'
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
  content: {
    flex: 1,
    padding: 20,
  },
  title: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 40,
  },
  languageOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1E293B',
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
  },
  languageText: {
    color: '#fff',
    fontSize: 18,
  },
});
