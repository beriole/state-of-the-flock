import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    ActivityIndicator,
    SafeAreaView,
    StatusBar
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Feather from 'react-native-vector-icons/Feather';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import DateTimePicker from '@react-native-community/datetimepicker';
import { reportAPI } from '../../utils/api';

const GovernorAttendanceReportScreen = () => {
    const navigation = useNavigation();
    const { t } = useTranslation();

    // States
    const [loading, setLoading] = useState(false);
    const [reportData, setReportData] = useState([]);
    const [groupBy, setGroupBy] = useState('region'); // 'region', 'leader', 'center_leader'

    // Date states
    const [startDate, setStartDate] = useState(new Date(new Date().setDate(new Date().getDate() - 30))); // Last 30 days
    const [endDate, setEndDate] = useState(new Date());
    const [showStartDatePicker, setShowStartDatePicker] = useState(false);
    const [showEndDatePicker, setShowEndDatePicker] = useState(false);

    // Fetch Report
    const fetchReport = async () => {
        try {
            setLoading(true);
            const response = await reportAPI.getGovernorAttendanceReport({
                start_date: startDate.toISOString().split('T')[0],
                end_date: endDate.toISOString().split('T')[0],
                group_by: groupBy
            });
            setReportData(response.data.data || []);
        } catch (error) {
            console.error('Error fetching report:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReport();
    }, [groupBy, startDate, endDate]);

    // Render Item
    const renderItem = ({ item, index }) => (
        <View style={styles.card}>
            <View style={styles.rankBadge}>
                <Text style={styles.rankText}>#{index + 1}</Text>
            </View>
            <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>{item.label}</Text>
                {item.subLabel ? <Text style={styles.cardSubtitle}>{item.subLabel}</Text> : null}
            </View>
            <View style={styles.statsContainer}>
                <View style={styles.statItem}>
                    <Text style={styles.statValue}>{item.total_present}</Text>
                    <Text style={styles.statLabel}>Présences</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                    <Text style={styles.statValue}>{item.unique_attendees}</Text>
                    <Text style={styles.statLabel}>Personnes</Text>
                </View>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar backgroundColor="#991B1B" barStyle="light-content" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Feather name="arrow-left" size={24} color="#FFFFFF" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Rapport de Présence</Text>
                <View style={{ width: 24 }} />
            </View>

            {/* Filters */}
            <View style={styles.filtersContainer}>
                {/* Date Filter */}
                <View style={styles.dateFilterRow}>
                    <TouchableOpacity
                        style={styles.dateButton}
                        onPress={() => setShowStartDatePicker(true)}
                    >
                        <Feather name="calendar" size={16} color="#666" />
                        <Text style={styles.dateText}>{startDate.toLocaleDateString()}</Text>
                    </TouchableOpacity>
                    <Feather name="arrow-right" size={16} color="#999" />
                    <TouchableOpacity
                        style={styles.dateButton}
                        onPress={() => setShowEndDatePicker(true)}
                    >
                        <Feather name="calendar" size={16} color="#666" />
                        <Text style={styles.dateText}>{endDate.toLocaleDateString()}</Text>
                    </TouchableOpacity>
                </View>

                {/* Group By Tabs */}
                <View style={styles.tabsContainer}>
                    <TouchableOpacity
                        style={[styles.tab, groupBy === 'region' && styles.activeTab]}
                        onPress={() => setGroupBy('region')}
                    >
                        <Text style={[styles.tabText, groupBy === 'region' && styles.activeTabText]}>Par Région</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.tab, groupBy === 'leader' && styles.activeTab]}
                        onPress={() => setGroupBy('leader')}
                    >
                        <Text style={[styles.tabText, groupBy === 'leader' && styles.activeTabText]}>Par Leader</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.tab, groupBy === 'center_leader' && styles.activeTab]}
                        onPress={() => setGroupBy('center_leader')}
                    >
                        <Text style={[styles.tabText, groupBy === 'center_leader' && styles.activeTabText]}>Par Centre</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Content */}
            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#991B1B" />
                    <Text style={styles.loadingText}>Chargement des données...</Text>
                </View>
            ) : (
                <FlatList
                    data={reportData}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Icon name="chart-bar" size={64} color="#E5E7EB" />
                            <Text style={styles.emptyText}>Aucune donnée trouvée pour cette période</Text>
                        </View>
                    }
                />
            )}

            {/* Date Pickers */}
            {showStartDatePicker && (
                <DateTimePicker
                    value={startDate}
                    mode="date"
                    display="default"
                    onChange={(event, selectedDate) => {
                        setShowStartDatePicker(false);
                        if (selectedDate) setStartDate(selectedDate);
                    }}
                />
            )}
            {showEndDatePicker && (
                <DateTimePicker
                    value={endDate}
                    mode="date"
                    display="default"
                    onChange={(event, selectedDate) => {
                        setShowEndDatePicker(false);
                        if (selectedDate) setEndDate(selectedDate);
                    }}
                />
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F3F4F6',
    },
    header: {
        backgroundColor: '#991B1B',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 16,
        elevation: 4,
    },
    backButton: {
        padding: 8,
    },
    headerTitle: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
    filtersContainer: {
        backgroundColor: '#FFFFFF',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    dateFilterRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    dateButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 8,
        width: '45%',
    },
    dateText: {
        marginLeft: 8,
        color: '#374151',
        fontSize: 14,
    },
    tabsContainer: {
        flexDirection: 'row',
        backgroundColor: '#F3F4F6',
        borderRadius: 8,
        padding: 4,
    },
    tab: {
        flex: 1,
        paddingVertical: 8,
        alignItems: 'center',
        borderRadius: 6,
    },
    activeTab: {
        backgroundColor: '#FFFFFF',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    tabText: {
        fontSize: 13,
        color: '#6B7280',
        fontWeight: '500',
    },
    activeTabText: {
        color: '#991B1B',
        fontWeight: '600',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 12,
        color: '#6B7280',
        fontSize: 14,
    },
    listContent: {
        padding: 16,
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    rankBadge: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#FEF2F2',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    rankText: {
        color: '#991B1B',
        fontWeight: 'bold',
        fontSize: 14,
    },
    cardContent: {
        flex: 1,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#111827',
    },
    cardSubtitle: {
        fontSize: 12,
        color: '#6B7280',
        marginTop: 2,
    },
    statsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statItem: {
        alignItems: 'center',
        minWidth: 60,
    },
    statValue: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#111827',
    },
    statLabel: {
        fontSize: 10,
        color: '#6B7280',
    },
    statDivider: {
        width: 1,
        height: 24,
        backgroundColor: '#E5E7EB',
        marginHorizontal: 8,
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 64,
    },
    emptyText: {
        marginTop: 16,
        color: '#9CA3AF',
        fontSize: 16,
    },
});

export default GovernorAttendanceReportScreen;
