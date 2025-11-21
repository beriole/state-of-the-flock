import { createStackNavigator } from '@react-navigation/stack';
import DashboardScreen from './screens/inscription/Home';
import LeaderNavigator from './Tab';
import LanguageSelection from './screens/inscription/LanguageSelection';
import ProfileScreen from './screens/inscription/ProfileScreen';
import NotificationScreen from './screens/inscription/NotificationScreen';
import Login from './screens/inscription/Login';
import Splash from './screens/splash';
import { useAuth } from './contexts/AuthContext';
import { View, ActivityIndicator } from 'react-native';

const stack = createStackNavigator()

function StackNavigator() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#DC2626" />
      </View>
    );
  }

  return (
    <stack.Navigator
      initialRouteName={isAuthenticated ? 'Menu' : 'Login'}
      screenOptions={{
        headerShown: false
      }}
    >
      <stack.Screen name='Splash' component={Splash} />
      <stack.Screen name='Home' component={DashboardScreen} />
      <stack.Screen name='Login' component={Login} />
      <stack.Screen name='LanguageSelection' component={LanguageSelection} />
      <stack.Screen name='ProfileScreen' component={ProfileScreen} />
      <stack.Screen name='NotificationScreen' component={NotificationScreen} />
      <stack.Screen name='Menu' >
        {() => <LeaderNavigator />}
      </stack.Screen>
    </stack.Navigator>
  );
}

export default function Stack() {
  return <StackNavigator />;
}