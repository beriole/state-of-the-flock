import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTranslation } from 'react-i18next';
import DashboardScreen from './screens/inscription/Home';
import MembersScreen from './screens/inscription/MemberScreen';
import MemberDetailScreen from './screens/inscription/MemberDetailScreen';
import AttendanceScreen from './screens/inscription/AttendanceScreen';
import BacentaScreen from './screens/inscription/BacentaScreen';
import CallsScreen from './screens/inscription/CallsScreen';

import GovernorDashboard from './screens/governor/GovernorDashboard';
import BacentaLeaderManagement from './screens/governor/BacentaLeaderManagement';
import BacentaLeaderDetail from './screens/governor/BacentaLeaderDetail';
import LeaderMembersScreen from './screens/governor/LeaderMembersScreen';
import LeaderMeetingsScreen from './screens/governor/LeaderMeetingsScreen';
import ReportsScreen from './screens/governor/ReportsScreen';
import ZoneManagementScreen from './screens/inscription/ZoneManagementScreen';
import { useAuth } from './contexts/AuthContext';

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

// Stack navigator for Governor's Home (Dashboard + Reports)
const GovernorHomeStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="GovernorDashboardMain" component={GovernorDashboard} />
      <Stack.Screen name="Reports" component={ReportsScreen} />
      <Stack.Screen name="BacentaLeaderManagement" component={BacentaLeaderManagement} />
    </Stack.Navigator>
  );
};

// Stack navigator for Governor's Leader Management
const GovernorLeadersStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="BacentaLeaderManagementList" component={BacentaLeaderManagement} />
      <Stack.Screen name="BacentaLeaderDetail" component={BacentaLeaderDetail} />
      <Stack.Screen name="LeaderMembers" component={LeaderMembersScreen} />
      <Stack.Screen name="LeaderMeetings" component={LeaderMeetingsScreen} />
    </Stack.Navigator>
  );
};

const LeaderNavigator = () => {
  const { t } = useTranslation();
  const { user } = useAuth();

  // Governor Navigation
  if (user?.role === 'Governor' || user?.role === 'Bishop') {
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
          name="GovernorDashboard"
          component={GovernorHomeStack}
          options={{
            tabBarIcon: ({ focused }) => (
              <View style={[styles.iconContainer, focused && styles.activeIconContainer]}>
                <Icon
                  name="view-dashboard"
                  size={24}
                  color={focused ? colors.primary : colors.inactive}
                />
                {focused && <View style={styles.activeDot} />}
              </View>
            ),
            tabBarLabel: ({ focused }) => (
              <Text style={[styles.label, focused && styles.activeLabel]}>{t('dashboard.title')}</Text>
            ),
          }}
        />

        <Tab.Screen
          name="Leaders"
          component={GovernorLeadersStack}
          options={{
            tabBarIcon: ({ focused }) => (
              <View style={[styles.iconContainer, focused && styles.activeIconContainer]}>
                <Icon
                  name="account-supervisor"
                  size={24}
                  color={focused ? colors.primary : colors.inactive}
                />
              </View>
            ),
            tabBarLabel: ({ focused }) => (
              <Text style={[styles.label, focused && styles.activeLabel]}>{t('governor.leaders')}</Text>
            ),
          }}
        />

        <Tab.Screen
          name="Zones"
          component={ZoneManagementScreen}
          options={{
            tabBarIcon: ({ focused }) => (
              <View style={[styles.iconContainer, focused && styles.activeIconContainer]}>
                <Icon
                  name="map-marker-multiple"
                  size={24}
                  color={focused ? colors.primary : colors.inactive}
                />
              </View>
            ),
            tabBarLabel: ({ focused }) => (
              <Text style={[styles.label, focused && styles.activeLabel]}>Zones</Text>
            ),
          }}
        />
      </Tab.Navigator>
    );
  }

  // Standard Bacenta Leader Navigation
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
              <Icon
                name="view-dashboard"
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
              <Icon
                name="account-group"
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
              <Icon
                name="calendar-check"
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
              <Icon
                name="account-multiple"
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
              <Icon
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
