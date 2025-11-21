
// components/DashboardScreen.jsx
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
  FlatList,
  ActivityIndicator
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Feather from 'react-native-vector-icons/Feather';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../utils/api';

/**
 * DashboardScreen - design avec palette rouge pour l'amour
 */

const DashboardScreen = () => {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const { user: authUser } = useAuth();

  const [dashboardData, setDashboardData] = useState(null);
  const [recentMembers, setRecentMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  const user = {
    name: authUser ? `${authUser.first_name} ${authUser.last_name}` : 'Utilisateur',
    role: authUser ? `${authUser.role.replace('_', ' ')}` : 'Rôle inconnu',
    avatar: require('../../assets/logo/image.png'),
    unreadNotifications: 0, // TODO: fetch from API
  };

  const stats = dashboardData ? [
    { key: 'members', label: t('dashboard.totalMembers'), value: dashboardData.summary?.total_members || 0, color: '#DC2626', icon: 'account-group' },
    { key: 'presence', label: t('dashboard.sundayAttendance'), value: `${dashboardData.summary?.last_attendance_percentage || 0}%`, color: '#16A34A', icon: 'check-circle' },
    { key: 'calls', label: t('dashboard.calls'), value: dashboardData.summary?.pending_follow_ups || 0, color: '#D97706', icon: 'phone' },
    { key: 'bacenta', label: t('dashboard.bacenta'), value: dashboardData.summary?.recent_bacenta_meetings || 0, color: '#7C3AED', icon: 'home-group' },
  ] : [];

  const quickActions = [
    { key: 'attendance', title: t('dashboard.markAttendance'), icon: 'clipboard-check' },
    { key: 'members', title: t('dashboard.members'), icon: 'account-multiple' },
    { key: 'calllist', title: t('dashboard.callLists'), icon: 'phone' },
    { key: 'bacenta', title: t('dashboard.bacenta'), icon: 'home-group' },
  ];

  useEffect(() => {
    fetchDashboardData();
    fetchRecentMembers();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await api.get('/dashboard');
      setDashboardData(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement du tableau de bord:', error);
    }
  };

  const fetchRecentMembers = async () => {
    try {
      const response = await api.get('/members', { params: { limit: 10, page: 1 } });
      const members = response.data.members.map(member => ({
        id: member.id,
        name: `${member.first_name} ${member.last_name}`,
        phone: member.phone_primary || '-',
        date: member.created_at ? new Date(member.created_at).toLocaleDateString('fr-FR') : '-'
      }));
      setRecentMembers(members);
    } catch (error) {
      console.error('Erreur lors du chargement des membres récents:', error);
    } finally {
      setLoading(false);
    }
  };

  // --- RENDERERS
  const renderStat = (s) => (
    <View key={s.key} style={styles.statCard}>
      <View style={[styles.statIcon, { backgroundColor: `${s.color}22` }]}>
        <Icon name={s.icon} size={20} color={s.color} />
      </View>
      <Text style={styles.statValue}>{s.value}</Text>
      <Text style={styles.statLabel}>{s.label}</Text>
    </View>
  );

  const handleQuickAction = (key) => {
    switch (key) {
      case 'attendance':
        navigation.navigate('Menu', { screen: 'Attendance' });
        break;
      case 'members':
        navigation.navigate('Menu', { screen: 'Members' });
        break;
      case 'calllist':
        navigation.navigate('Menu', { screen: 'Calls' });
        break;
      case 'bacenta':
        navigation.navigate('Menu', { screen: 'Bacenta' });
        break;
      default:
        break;
    }
  };

  const renderAction = ({ item }) => (
    <TouchableOpacity style={styles.actionBtn} activeOpacity={0.7} onPress={() => handleQuickAction(item.key)}>
      <View style={styles.actionIcon}>
        <Icon name={item.icon} size={22} color="#991B1B" />
      </View>
      <Text style={styles.actionText} numberOfLines={1}>{item.title}</Text>
    </TouchableOpacity>
  );

  const renderMember = ({ item }) => (
    <View style={styles.memberRow}>
      <View style={styles.memberAvatar}>
        <Text style={styles.memberAvatarText}>{item.name.charAt(0)}</Text>
      </View>
      <View style={styles.memberInfo}>
        <Text style={styles.memberName}>{item.name}</Text>
        <Text style={styles.memberMeta}>{item.phone} • {item.date}</Text>
      </View>
      <TouchableOpacity style={styles.memberAction}>
        <Feather name="chevrons-right" size={18} color="#9CA3AF" />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#991B1B" />

      {/* Header redesigné */}
      <View style={styles.header}>
        <View style={styles.headerBackground} />
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <View>
              <Text style={styles.greeting}>Hello, <Text style={styles.userName}>{user.name}</Text></Text>
              <Text style={styles.role}>{user.role}</Text>
            </View>
          </View>

          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.profileBtn} onPress={() => navigation.navigate('ProfileScreen')}>
              <View style={styles.avatarContainer}>
                <Image source={user.avatar} style={styles.avatar} />
              </View>
            </TouchableOpacity>
            <TouchableOpacity style={styles.notificationBtn} onPress={() => navigation.navigate('NotificationScreen')}>
              <Feather name="bell" size={20} color="#991B1B" />
              {user.unreadNotifications > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{user.unreadNotifications}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#DC2626" />
        </View>
      ) : (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Stats compactes: ligne en haut */}
          <View style={styles.statsRow}>
            {stats.map(renderStat)}
          </View>

        {/* Quick actions (compact) */}
        <View style={styles.quickActionsContainer}>
          <Text style={styles.sectionTitle}>{t('dashboard.quickActions')}</Text>
          <FlatList
            data={quickActions}
            renderItem={renderAction}
            keyExtractor={(i) => i.key}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 4 }}
          />
        </View>

        {/* Derniers membres (10 derniers) */}
        <View style={styles.recentContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t('dashboard.recentMembers')}</Text>
            <TouchableOpacity>
              <Text style={styles.seeAll}>{t('dashboard.seeAll')}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.recentList}>
            <FlatList
              data={recentMembers}
              renderItem={renderMember}
              keyExtractor={(i) => i.id}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
              scrollEnabled={false}
            />
          </View>
        </View>

        {/* Espace bottom padding */}
        <View style={{ height: 48 }} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  // layout
  container: {
    flex: 1,
    backgroundColor: '#FEF7F7', // Fond rouge très clair
  },
  header: {
    backgroundColor: '#991B1B',
    height: 160, // Header plus grand et designé
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
  greeting: {
    fontSize: 20,
    color: '#FFFFFF',
    fontWeight: '400',
  },
  userName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  role: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 4,
    fontWeight: '500',
  },

  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  notificationBtn: {
    width: 44,
    height: 44,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 20,
    height: 20,
    paddingHorizontal: 5,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#991B1B',
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '800',
  },

  profileBtn: {
    width: 50,
    height: 50,
  },
  avatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.3)',
    backgroundColor: '#FFFFFF',
  },
  avatar: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },

  content: {
    flex: 1,
    paddingHorizontal: 16,
    marginTop: -20, // Remonte le contenu sur le header
  },

  // stats
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    marginHorizontal: 4,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  statIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
  },
  statLabel: {
    fontSize: 11,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 4,
    fontWeight: '500',
  },

  // quick actions
  quickActionsContainer: {
    marginTop: 8,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 12,
  },
  actionBtn: {
    width: 100,
    height: 90,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  actionIcon: {
    width: 46,
    height: 46,
    borderRadius: 12,
    backgroundColor: '#FEF2F2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  actionText: {
    fontSize: 12,
    textAlign: 'center',
    color: '#991B1B',
    fontWeight: '700',
  },

  // recent members
  recentContainer: {
    marginTop: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  seeAll: {
    color: '#DC2626',
    fontWeight: '700',
    fontSize: 14,
  },
  recentList: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
  },
  memberAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FEF2F2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  memberAvatarText: {
    color: '#991B1B',
    fontWeight: '800',
    fontSize: 16,
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 15,
    color: '#111827',
    fontWeight: '700',
  },
  memberMeta: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
    fontWeight: '500',
  },
  memberAction: {
    paddingLeft: 8,
    paddingRight: 4,
  },
  separator: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginHorizontal: 8,
  },
});

export default DashboardScreen;
