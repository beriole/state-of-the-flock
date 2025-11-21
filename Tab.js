import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { View, Text, StyleSheet } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useTranslation } from 'react-i18next';
import DashboardScreen from './screens/inscription/Home';
import MembersScreen from './screens/inscription/MemberScreen';
import MemberDetailScreen from './screens/inscription/MemberDetailScreen';
import AttendanceScreen from './screens/inscription/AttendanceScreen';
import BacentaScreen from './screens/inscription/BacentaScreen';
import CallsScreen from './screens/inscription/CallsScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const colors = {
  primary: '#DC2626', // rouge
  inactive: '#9CA3AF', // gris
  activeBackground: '#FEE2E2', // rose clair
  white: '#FFFFFF',
};

// Stack navigator for Members section
const MembersStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MembersList" component={MembersScreen} />
      <Stack.Screen name="MemberDetail" component={MemberDetailScreen} />
    </Stack.Navigator>
  );
};

const LeaderNavigator = () => {
  const { t } = useTranslation();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.inactive,
        tabBarShowLabel: true,
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <View style={[styles.iconContainer, focused && styles.activeIconContainer]}>
              <MaterialIcons
                name="dashboard"
                size={24}
                color={focused ? colors.primary : colors.inactive}
              />
              {focused && <View style={styles.activeDot} />}
            </View>
          ),
          tabBarLabel: ({ focused }) => (
            <Text style={[styles.label, focused && styles.activeLabel]}>{t('home')}</Text>
          ),
        }}
      />

      <Tab.Screen
        name="Members"
        component={MembersStack}
        options={{
          tabBarIcon: ({ focused }) => (
            <View style={[styles.iconContainer, focused && styles.activeIconContainer]}>
              <MaterialIcons
                name="people"
                size={24}
                color={focused ? colors.primary : colors.inactive}
              />
            </View>
          ),
          tabBarLabel: ({ focused }) => (
            <Text style={[styles.label, focused && styles.activeLabel]}>{t('tabMembers')}</Text>
          ),
        }}
      />

      <Tab.Screen
        name="Attendance"
        component={AttendanceScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <View style={[styles.iconContainer, focused && styles.activeIconContainer]}>
              <MaterialIcons
                name="event-available"
                size={24}
                color={focused ? colors.primary : colors.inactive}
              />
            </View>
          ),
          tabBarLabel: ({ focused }) => (
            <Text style={[styles.label, focused && styles.activeLabel]}>{t('tabAttendance')}</Text>
          ),
        }}
      />

      <Tab.Screen
        name="Bacenta"
        component={BacentaScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <View style={[styles.iconContainer, focused && styles.activeIconContainer]}>
              <MaterialIcons
                name="groups"
                size={24}
                color={focused ? colors.primary : colors.inactive}
              />
            </View>
          ),
          tabBarLabel: ({ focused }) => (
            <Text style={[styles.label, focused && styles.activeLabel]}>{t('tabBacenta')}</Text>
          ),
        }}
      />

      <Tab.Screen
        name="Calls"
        component={CallsScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <View style={[styles.iconContainer, focused && styles.activeIconContainer]}>
              <MaterialIcons
                name="phone"
                size={24}
                color={focused ? colors.primary : colors.inactive}
              />
            </View>
          ),
          tabBarLabel: ({ focused }) => (
            <Text style={[styles.label, focused && styles.activeLabel]}>{t('tabCalls')}</Text>
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: '#F5F5F5',
    height: 70,
    paddingBottom: 8,
    paddingTop: 8,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeIconContainer: {
    backgroundColor: colors.activeBackground,
    borderRadius: 25,
    padding: 6,
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
    marginTop: 2,
  },
  label: {
    fontSize: 12,
    color: colors.inactive,
  },
  activeLabel: {
    color: colors.primary,
    fontWeight: '600',
  },
});

export default LeaderNavigator;
