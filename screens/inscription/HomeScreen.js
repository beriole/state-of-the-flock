import React from 'react';
import { View, Text, SafeAreaView, Image, TouchableOpacity, StyleSheet, StatusBar, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#991B1B" />

      <LinearGradient
        colors={['#DC2626', '#991B1B', '#7F1D1D']}
        style={styles.background}
      >
        {/* Decorative Circles */}
        <View style={styles.circle1} />
        <View style={styles.circle2} />

        <View style={styles.content}>
          {/* Logo Section */}
          <View style={styles.logoContainer}>
            <View style={styles.logoWrapper}>
              <Image
                source={require('../../assets/logo/logo-church.png')}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.appName}>First Love Church</Text>
            <Text style={styles.tagline}>State of the Flock</Text>
          </View>

          {/* Welcome Text */}
          <View style={styles.textContainer}>
            <Text style={styles.welcomeTitle}>Bienvenue</Text>
            <Text style={styles.description}>
              Gérez votre ministère avec excellence.
              Suivi des membres, rapports et statistiques en un seul endroit.
            </Text>
          </View>

          {/* Action Button */}
          <View style={styles.actions}>
            <TouchableOpacity
              onPress={() => navigation.navigate('Login')}
              style={styles.loginButton}
              activeOpacity={0.9}
            >
              <LinearGradient
                colors={['#FFFFFF', '#F3F4F6']}
                style={styles.gradientButton}
              >
                <Text style={styles.loginButtonText}>Se connecter</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <Text style={styles.footerText}>© 2025 First Love Church</Text>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
    justifyContent: 'center',
  },
  circle1: {
    position: 'absolute',
    top: -100,
    right: -50,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  circle2: {
    position: 'absolute',
    bottom: 100,
    left: -100,
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 60,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 40,
  },
  logoWrapper: {
    width: 160,
    height: 160,
    backgroundColor: '#FFFFFF',
    borderRadius: 80,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    marginBottom: 24,
    padding: 10,
  },
  logo: {
    width: '80%',
    height: '80%',
  },
  appName: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  tagline: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 8,
    fontWeight: '500',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  textContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  welcomeTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  description: {
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    fontSize: 16,
    lineHeight: 24,
    maxWidth: 300,
  },
  actions: {
    width: '100%',
    marginBottom: 20,
  },
  loginButton: {
    width: '100%',
    borderRadius: 16,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
  },
  gradientButton: {
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
  },
  loginButtonText: {
    color: '#991B1B',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  footerText: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 12,
  },
});