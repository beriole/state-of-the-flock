import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { View, ActivityIndicator } from 'react-native';
import { useAuth } from './contexts/AuthContext';

// Import all screen components
import Menu from './Tab'; // The Tab Navigator
import Home from './screens/inscription/Home';
import HomeScreen from './screens/inscription/HomeScreen';
import MemberScreen from './screens/inscription/MemberScreen';
import AttendanceScreen from './screens/inscription/AttendanceScreen';
import Login from './screens/inscription/Login';
import ProfileScreen from './screens/inscription/ProfileScreen';
import Setting from './screens/inscription/Setting';
import LanguageSelection from './screens/inscription/LanguageSelection';
import MemberDetailScreen from './screens/inscription/MemberDetailScreen';
import NotificationScreen from './screens/inscription/NotificationScreen';
import CallsScreen from './screens/inscription/CallsScreen';
import BacentaScreen from './screens/inscription/BacentaScreen';
import editProfile from './screens/inscription/editProfile';
import ZoneManagementScreen from './screens/inscription/ZoneManagementScreen';

// Governor screens
import GovernorDashboard from './screens/governor/GovernorDashboard';
import BacentaLeaderManagement from './screens/governor/BacentaLeaderManagement';
import BacentaLeaderDetail from './screens/governor/BacentaLeaderDetail';
import LeaderMeetingsScreen from './screens/governor/LeaderMeetingsScreen';
import LeaderMembersScreen from './screens/governor/LeaderMembersScreen';
import ReportsScreen from './screens/governor/ReportsScreen';
import GovernorAttendanceReportScreen from './screens/governor/GovernorAttendanceReportScreen';

const Stack = createStackNavigator();

const StackNavigator = () => {
  const { loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#991B1B" />
      </View>
    );
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        gestureEnabled: true,
        cardStyle: { backgroundColor: '#FEF7F7' }
      }}
    >
      {!isAuthenticated ? (
        <>
          {/* Authentication Screens */}
          <Stack.Screen name="HomeScreen" component={HomeScreen} />
          <Stack.Screen name="Login" component={Login} />
          <Stack.Screen name="LanguageSelection" component={LanguageSelection} />
        </>
      ) : (
        <>
          {/* Main App (Tab Navigator) */}
          <Stack.Screen name="Menu" component={Menu} />

          {/* Individual Screens (for deep linking or specific navigation) */}
          <Stack.Screen name="Home" component={Home} />

          {/* Member Management */}
          <Stack.Screen name="MemberScreen" component={MemberScreen} />
          <Stack.Screen name="MemberDetail" component={MemberDetailScreen} />
          <Stack.Screen name="AddMember" component={MemberScreen} />
          <Stack.Screen name="EditMember" component={MemberScreen} />

          {/* Attendance */}
          <Stack.Screen name="AttendanceScreen" component={AttendanceScreen} />

          {/* Governor Screens */}
          <Stack.Screen name="GovernorDashboard" component={GovernorDashboard} />
          <Stack.Screen name="BacentaLeaderManagement" component={BacentaLeaderManagement} />
          <Stack.Screen name="BacentaLeaderDetail" component={BacentaLeaderDetail} />
          <Stack.Screen name="LeaderMeetingsScreen" component={LeaderMeetingsScreen} />
          <Stack.Screen name="LeaderMembersScreen" component={LeaderMembersScreen} />
          <Stack.Screen name="ReportsScreen" component={ReportsScreen} />
          <Stack.Screen name="GovernorAttendanceReport" component={GovernorAttendanceReportScreen} />

          {/* Other Screens */}
          <Stack.Screen name="ProfileScreen" component={ProfileScreen} />
          <Stack.Screen name="Setting" component={Setting} />
          <Stack.Screen name="NotificationScreen" component={NotificationScreen} />
          <Stack.Screen name="CallsScreen" component={CallsScreen} />
          <Stack.Screen name="BacentaScreen" component={BacentaScreen} />
          <Stack.Screen name="editProfile" component={editProfile} />
          <Stack.Screen name="ZoneManagementScreen" component={ZoneManagementScreen} />
        </>
      )}
    </Stack.Navigator>
  );
};

export default StackNavigator;