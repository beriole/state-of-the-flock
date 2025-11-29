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
  Alert,
  ActivityIndicator
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { dashboardAPI } from '../../utils/api';

const EditProfile = () => {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    current_password: '',
    new_password: '',
    confirm_password: ''
  });

  useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        phone: user.phone || '',
        current_password: '',
        new_password: '',
        confirm_password: ''
      });
    }
  }, [user]);

  const handleSave = async () => {
    try {
      setSaving(true);

      // Validation
      if (!formData.first_name.trim() || !formData.last_name.trim()) {
        Alert.alert('Erreur', 'Le prénom et le nom sont obligatoires');
        return;
      }

      if (!formData.email.trim()) {
        Alert.alert('Erreur', 'L\'email est obligatoire');
        return;
      }

      // Check if password change is requested
      if (formData.new_password) {
        if (!formData.current_password) {
          Alert.alert('Erreur', 'Le mot de passe actuel est requis pour changer le mot de passe');
          return;
        }
        if (formData.new_password !== formData.confirm_password) {
          Alert.alert('Erreur', 'Les nouveaux mots de passe ne correspondent pas');
          return;
        }
      }

      const updateData = {
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim()
      };

      // Update profile
      await dashboardAPI.updateProfile(updateData);

      // Update password if provided
      if (formData.new_password) {
        await dashboardAPI.changePassword({
          current_password: formData.current_password,
          new_password: formData.new_password
        });
      }

      // Update local user state
      updateUser(updateData);

      Alert.alert('Succès', 'Profil mis à jour avec succès');
      navigation.goBack();

    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Erreur', error.response?.data?.error || 'Erreur lors de la mise à jour du profil');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#DC2626" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#DC2626" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerBackground} />
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Icon name="arrow-left" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Modifier le profil</Text>
          </View>
        </View>
      </View>

      <ScrollView style={styles.scrollContent} contentContainerStyle={{ paddingBottom: 48 }}>
        <View style={styles.form}>
          {/* Personal Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Informations personnelles</Text>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Prénom *</Text>
              <TextInput
                style={styles.input}
                value={formData.first_name}
                onChangeText={(text) => setFormData({ ...formData, first_name: text })}
                placeholder="Entrez votre prénom"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Nom *</Text>
              <TextInput
                style={styles.input}
                value={formData.last_name}
                onChangeText={(text) => setFormData({ ...formData, last_name: text })}
                placeholder="Entrez votre nom"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email *</Text>
              <TextInput
                style={styles.input}
                value={formData.email}
                onChangeText={(text) => setFormData({ ...formData, email: text })}
                placeholder="Entrez votre email"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Téléphone</Text>
              <TextInput
                style={styles.input}
                value={formData.phone}
                onChangeText={(text) => setFormData({ ...formData, phone: text })}
                placeholder="Entrez votre numéro de téléphone"
                keyboardType="phone-pad"
              />
            </View>
          </View>

          {/* Password Change */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Changer le mot de passe</Text>
            <Text style={styles.sectionSubtitle}>Laissez vide si vous ne voulez pas changer le mot de passe</Text>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Mot de passe actuel</Text>
              <TextInput
                style={styles.input}
                value={formData.current_password}
                onChangeText={(text) => setFormData({ ...formData, current_password: text })}
                placeholder="Entrez votre mot de passe actuel"
                secureTextEntry
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Nouveau mot de passe</Text>
              <TextInput
                style={styles.input}
                value={formData.new_password}
                onChangeText={(text) => setFormData({ ...formData, new_password: text })}
                placeholder="Entrez le nouveau mot de passe"
                secureTextEntry
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Confirmer le nouveau mot de passe</Text>
              <TextInput
                style={styles.input}
                value={formData.confirm_password}
                onChangeText={(text) => setFormData({ ...formData, confirm_password: text })}
                placeholder="Confirmez le nouveau mot de passe"
                secureTextEntry
              />
            </View>
          </View>
        </View>

        {/* Save Button */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.saveButton, saving && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <Icon name="content-save" size={20} color="#FFFFFF" />
                <Text style={styles.saveButtonText}>Enregistrer</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: '#DC2626',
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
    backgroundColor: '#DC2626',
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
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    padding: 8,
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  scrollContent: {
    flex: 1,
    paddingHorizontal: 16,
    marginTop: -20,
  },
  form: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginTop: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
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
    backgroundColor: '#F9FAFB',
  },
  buttonContainer: {
    marginTop: 20,
    marginBottom: 20,
  },
  saveButton: {
    backgroundColor: '#DC2626',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default EditProfile;