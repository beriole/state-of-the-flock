import './i18n'; // Initialize i18n first
import React from 'react'
import { NavigationContainer } from '@react-navigation/native';
import Stack from './Stack'
import Toast from "react-native-toast-message";
import { AuthProvider } from './contexts/AuthContext';


export default function App() {

  return (
    <AuthProvider>
      <NavigationContainer>
        <Stack />
        <Toast />
      </NavigationContainer>
    </AuthProvider>
  )
}
