import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    ActivityIndicator
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { bacentaAPI } from '../../utils/api';
import Toast from 'react-native-toast-message';

const LeaderMeetingsScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { t } = useTranslation();
    const { leaderId, leaderName } = route.params;

    const [meetings, setMeetings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchMeetings();
    }, [leaderId]);

    const fetchMeetings = async () => {
        try {
            const response = await bacentaAPI.getMeetings({ leader_id: leaderId });
            setMeetings(response.data.meetings || []);
        } catch (error) {
            console.error('Error fetching leader meetings:', error);
            Toast.show({
                type: 'error',
                text1: t('common.error'),
                text2: t('governor.fetchMeetingsError') || 'Erreur lors du chargement des réunions'
            });
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'completed': return '#10B981';
            case 'planned': return '#3B82F6';
            default: return '#9CA3AF';
        }
    };

    const renderItem = ({ item }) => (
        <TouchableOpacity
            style={styles.card}
        // Future: Navigate to meeting detail if needed, currently just viewing list
        // onPress={() => navigation.navigate('MeetingDetail', { meetingId: item.id })}
        >
            <View style={styles.cardHeader}>
                <Text style={styles.date}>{new Date(item.date).toLocaleDateString()}</Text>
                <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(item.status)}20` }]}>
                    <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
                        {t(`bacenta.status.${item.status}`) || item.status}
                    </Text>
                </View>
            </View>

            <Text style={styles.title}>{item.title}</Text>

            <View style={styles.statsRow}>
                <View style={styles.statItem}>
                    <Icon name="account-group" size={16} color="#6B7280" />
                    <Text style={styles.statText}>
                        {item.attendance ? item.attendance.filter(a => a.status === 'present').length : 0} Présents
                    </Text>
                </View>
                <View style={styles.statItem}>
                    <Icon name="cash" size={16} color="#6B7280" />
                    <Text style={styles.statText}>{item.offerings || 0} €</Text>
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Icon name="arrow-left" size={24} color="#1F2937" />
                </TouchableOpacity>
                <View>
                    <Text style={styles.headerTitle}>{t('governor.meetingsOf')}</Text>
                    <Text style={styles.headerSubtitle}>{leaderName}</Text>
                </View>
                <View style={{ width: 40 }} />
            </View>

            {loading ? (
                <ActivityIndicator size="large" color="#DC2626" style={styles.loader} />
            ) : (
                <FlatList
                    data={meetings}
                    renderItem={renderItem}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={
                        <Text style={styles.emptyText}>{t('bacenta.noMeetingsFound') || 'Aucune réunion trouvée'}</Text>
                    }
                />
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
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
        fontSize: 16,
        color: '#6B7280',
        textAlign: 'center',
    },
    headerSubtitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1F2937',
        textAlign: 'center',
    },
    listContent: {
        padding: 16,
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        marginBottom: 12,
        padding: 16,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    date: {
        fontSize: 14,
        color: '#6B7280',
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
        textTransform: 'capitalize',
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: 12,
    },
    statsRow: {
        flexDirection: 'row',
        gap: 16,
    },
    statItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    statText: {
        fontSize: 14,
        color: '#4B5563',
    },
    loader: {
        marginTop: 20,
    },
    emptyText: {
        textAlign: 'center',
        color: '#6B7280',
        marginTop: 20,
    },
});

export default LeaderMeetingsScreen;
