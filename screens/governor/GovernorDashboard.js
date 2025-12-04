import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    StatusBar,
    RefreshControl,
    ActivityIndicator
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { governorAPI } from '../../utils/api';

const GovernorDashboard = () => {
    const navigation = useNavigation();
    const { t } = useTranslation();
    const { user } = useAuth();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchStats = async () => {
        try {
            const response = await governorAPI.getGlobalStats();
            setStats(response.data);
        } catch (error) {
            console.error('Error fetching governor stats:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchStats();
    };

    const StatCard = ({ title, value, icon, color }) => (
        <View style={styles.statCard}>
            <View style={[styles.iconContainer, { backgroundColor: `${color}20` }]}>
                <Icon name={icon} size={24} color={color} />
            </View>
            <View>
                <Text style={styles.statValue}>{value}</Text>
                <Text style={styles.statTitle}>{title}</Text>
            </View>
        </View>
    );

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
            <View style={styles.header}>
                <View style={styles.headerBackground} />
                <View style={styles.headerContent}>
                    <View style={styles.headerLeft}>
                        <Text style={styles.welcomeText}>Bienvenue</Text>
                        <Text style={styles.userName}>{user?.first_name} {user?.last_name}</Text>
                        <Text style={styles.userRole}>Gouverneur</Text>
                    </View>
                    <TouchableOpacity
                        style={styles.profileButton}
                        onPress={() => navigation.navigate('ProfileScreen')}
                    >
                        <Icon name="account-circle" size={40} color="#FFFFFF" />
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView
                style={styles.scrollContent}
                contentContainerStyle={{ paddingBottom: 48 }}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#DC2626']} />
                }
            >
                <View style={styles.statsGrid}>
                    <StatCard
                        title="Total Membres"
                        value={stats?.summary?.total_members || 0}
                        icon="account-group"
                        color="#DC2626"
                    />
                    <StatCard
                        title="Total Leaders"
                        value={stats?.summary?.total_leaders || 0}
                        icon="crown"
                        color="#D97706"
                    />
                    <StatCard
                        title="Taux Présence"
                        value={`${stats?.summary?.current_week_attendance || 0}%`}
                        icon="chart-line"
                        color="#16A34A"
                    />
                    <StatCard
                        title="Évolution"
                        value={`${stats?.summary?.attendance_change >= 0 ? '+' : ''}${stats?.summary?.attendance_change || 0}%`}
                        icon={stats?.summary?.attendance_change >= 0 ? "trending-up" : "trending-down"}
                        color={stats?.summary?.attendance_change >= 0 ? "#16A34A" : "#DC2626"}
                    />
                    <StatCard
                        title="Appels Suivi"
                        value={stats?.summary?.recent_call_logs || 0}
                        icon="phone"
                        color="#7C3AED"
                    />
                    <StatCard
                        title="Réunions Bacenta"
                        value={stats?.summary?.recent_bacenta_meetings || 0}
                        icon="home-group"
                        color="#F59E0B"
                    />
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Actions Rapides</Text>
                    <View style={styles.actionsGrid}>
                        <TouchableOpacity
                            style={styles.actionButton}
                            onPress={() => navigation.navigate('ChurchMembers')}
                        >
                            <View style={[styles.actionIcon, { backgroundColor: '#DC2626' }]}>
                                <Icon name="account-group" size={24} color="#FFFFFF" />
                            </View>
                            <Text style={styles.actionText}>Tous les Membres</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.actionButton}
                            onPress={() => navigation.navigate('BacentaLeaderManagement')}
                        >
                            <View style={[styles.actionIcon, { backgroundColor: '#7C3AED' }]}>
                                <Icon name="crown" size={24} color="#FFFFFF" />
                            </View>
                            <Text style={styles.actionText}>Gestion Leaders</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.actionButton}
                            onPress={() => navigation.navigate('Reports')}
                        >
                            <View style={[styles.actionIcon, { backgroundColor: '#16A34A' }]}>
                                <Icon name="chart-bar" size={24} color="#FFFFFF" />
                            </View>
                            <Text style={styles.actionText}>Rapports</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.actionButton}
                            onPress={() => navigation.navigate('GovernorAttendanceReport')}
                        >
                            <View style={[styles.actionIcon, { backgroundColor: '#D97706' }]}>
                                <Icon name="calendar-check" size={24} color="#FFFFFF" />
                            </View>
                            <Text style={styles.actionText}>Présences</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.actionButton}
                            onPress={() => navigation.navigate('Setting')}
                        >
                            <View style={[styles.actionIcon, { backgroundColor: '#7C3AED' }]}>
                                <Icon name="cog" size={24} color="#FFFFFF" />
                            </View>
                            <Text style={styles.actionText}>Paramètres</Text>
                        </TouchableOpacity>
                    </View>
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
    },
    welcomeText: {
        fontSize: 14,
        color: '#FFFFFF',
    },
    userName: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    userRole: {
        fontSize: 14,
        color: '#FFFFFF',
        fontWeight: '500',
    },
    profileButton: {
        padding: 8,
    },
    scrollContent: {
        flex: 1,
        paddingHorizontal: 16,
        marginTop: -20,
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: 24,
    },
    statCard: {
        width: '48%',
        backgroundColor: '#FFFFFF',
        padding: 16,
        borderRadius: 12,
        marginBottom: 16,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    statValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: 4,
    },
    statTitle: {
        fontSize: 12,
        color: '#6B7280',
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: 16,
    },
    actionsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 16,
    },
    actionButton: {
        flex: 1,
        minWidth: '45%',
        backgroundColor: '#FFFFFF',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    actionIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    actionText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#374151',
        textAlign: 'center',
    },
});

export default GovernorDashboard;
