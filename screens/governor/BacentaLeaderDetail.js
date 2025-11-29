import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    ActivityIndicator,
    RefreshControl
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { dashboardAPI } from '../../utils/api';

const BacentaLeaderDetail = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { t } = useTranslation();
    const { leaderId, leaderName } = route.params;

    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchLeaderStats = async () => {
        try {
            // Fetch dashboard stats specifically for this leader
            const response = await dashboardAPI.getStats({ user_id: leaderId });
            setStats(response.data);
        } catch (error) {
            console.error('Error fetching leader stats:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchLeaderStats();
    }, [leaderId]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchLeaderStats();
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
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Icon name="arrow-left" size={24} color="#1F2937" />
                </TouchableOpacity>
                <View>
                    <Text style={styles.headerTitle}>{leaderName}</Text>
                    <Text style={styles.headerSubtitle}>{t('roles.bacenta_leader')}</Text>
                </View>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#DC2626']} />
                }
            >
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>{t('dashboard.overview')}</Text>
                    <View style={styles.statsGrid}>
                        <StatCard
                            title={t('dashboard.totalMembers')}
                            value={stats?.summary?.total_members || 0}
                            icon="account-group"
                            color="#DC2626"
                        />
                        <StatCard
                            title={t('dashboard.attendanceRate')}
                            value={`${stats?.summary?.last_attendance_percentage || 0}%`}
                            icon="chart-line"
                            color="#16A34A"
                        />
                        <StatCard
                            title={t('dashboard.pendingCalls')}
                            value={stats?.summary?.pending_follow_ups || 0}
                            icon="phone-clock"
                            color="#D97706"
                        />
                        <StatCard
                            title={t('dashboard.recentMeetings')}
                            value={stats?.summary?.recent_bacenta_meetings || 0}
                            icon="home-group"
                            color="#7C3AED"
                        />
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>{t('dashboard.bacentaPerformance')}</Text>
                    <View style={styles.detailCard}>
                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>{t('dashboard.avgAttendance')}</Text>
                            <Text style={styles.detailValue}>{stats?.bacenta_stats?.average_attendance || 0}</Text>
                        </View>
                        <View style={styles.divider} />
                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>{t('dashboard.totalOffering')}</Text>
                            <Text style={styles.detailValue}>{stats?.bacenta_stats?.total_offering?.toFixed(2) || '0.00'} €</Text>
                        </View>
                        <View style={styles.divider} />
                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>{t('dashboard.meetingsLast30Days')}</Text>
                            <Text style={styles.detailValue}>{stats?.bacenta_stats?.recent_meetings || 0}</Text>
                        </View>
                    </View>
                </View>

                {/* Future: Add buttons to view specific lists (Members, Meetings) for this leader */}
                <View style={styles.section}>
                    <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => navigation.navigate('LeaderMembers', { leaderId, leaderName })}
                    >
                        <Text style={styles.actionButtonText}>{t('governor.viewLeaderMembers')}</Text>
                        <Icon name="chevron-right" size={24} color="#DC2626" />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => navigation.navigate('LeaderMeetings', { leaderId, leaderName })}
                    >
                        <Text style={styles.actionButtonText}>{t('governor.viewLeaderMeetings')}</Text>
                        <Icon name="chevron-right" size={24} color="#DC2626" />
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
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    backButton: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1F2937',
        textAlign: 'center',
    },
    headerSubtitle: {
        fontSize: 12,
        color: '#6B7280',
        textAlign: 'center',
    },
    scrollContent: {
        padding: 20,
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
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
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
    detailCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
    },
    detailLabel: {
        fontSize: 16,
        color: '#4B5563',
    },
    detailValue: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1F2937',
    },
    divider: {
        height: 1,
        backgroundColor: '#E5E7EB',
    },
    actionButton: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        elevation: 1,
    },
    actionButtonText: {
        fontSize: 16,
        fontWeight: '500',
        color: '#1F2937',
    },
});

export default BacentaLeaderDetail;
