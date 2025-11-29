import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    SafeAreaView,
    TouchableOpacity,
    ActivityIndicator,
    Dimensions
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { LineChart, BarChart } from 'react-native-chart-kit';
import { reportAPI } from '../../utils/api';
import Toast from 'react-native-toast-message';

const screenWidth = Dimensions.get('window').width;

const ReportsScreen = () => {
    const navigation = useNavigation();
    const { t } = useTranslation();
    const [loading, setLoading] = useState(true);
    const [bacentaData, setBacentaData] = useState(null);
    const [attendanceData, setAttendanceData] = useState(null);
    const [period, setPeriod] = useState('3months'); // 1month, 3months, 6months

    useEffect(() => {
        fetchReports();
    }, [period]);

    const fetchReports = async () => {
        setLoading(true);
        try {
            // Calculate start date based on period
            const endDate = new Date();
            const startDate = new Date();
            if (period === '1month') startDate.setMonth(endDate.getMonth() - 1);
            if (period === '3months') startDate.setMonth(endDate.getMonth() - 3);
            if (period === '6months') startDate.setMonth(endDate.getMonth() - 6);

            const formattedStartDate = startDate.toISOString().split('T')[0];
            const formattedEndDate = endDate.toISOString().split('T')[0];

            const [bacentaRes, attendanceRes] = await Promise.all([
                reportAPI.getBacentaReport({ start_date: formattedStartDate, end_date: formattedEndDate }),
                reportAPI.getAttendanceReport({ start_date: formattedStartDate, end_date: formattedEndDate })
            ]);

            setBacentaData(bacentaRes.data);
            setAttendanceData(attendanceRes.data);
        } catch (error) {
            console.error('Error fetching reports:', error);
            Toast.show({
                type: 'error',
                text1: t('common.error'),
                text2: t('governor.fetchReportsError') || 'Erreur lors du chargement des rapports'
            });
        } finally {
            setLoading(false);
        }
    };

    const processChartData = () => {
        if (!bacentaData || !bacentaData.meetings) return null;

        // Group by week or month depending on data density
        // For simplicity, let's take the last 6 meetings
        const meetings = [...bacentaData.meetings].reverse().slice(-6);

        const labels = meetings.map(m => {
            const date = new Date(m.meeting_date);
            return `${date.getDate()}/${date.getMonth() + 1}`;
        });

        const attendanceValues = meetings.map(m => m.total_members_present);
        const offeringValues = meetings.map(m => parseFloat(m.offering_amount));

        return {
            labels,
            attendance: [
                {
                    data: attendanceValues,
                    color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`, // Green
                    strokeWidth: 2
                }
            ],
            offerings: [
                {
                    data: offeringValues,
                    color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`, // Blue
                    strokeWidth: 2
                }
            ]
        };
    };

    const chartData = processChartData();

    const chartConfig = {
        backgroundGradientFrom: "#ffffff",
        backgroundGradientTo: "#ffffff",
        decimalPlaces: 0,
        color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
        labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
        style: {
            borderRadius: 16
        },
        propsForDots: {
            r: "6",
            strokeWidth: "2",
            stroke: "#ffa726"
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Icon name="arrow-left" size={24} color="#1F2937" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{t('governor.reports') || 'Rapports'}</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.filterContainer}>
                    {['1month', '3months', '6months'].map((p) => (
                        <TouchableOpacity
                            key={p}
                            style={[styles.filterButton, period === p && styles.filterButtonActive]}
                            onPress={() => setPeriod(p)}
                        >
                            <Text style={[styles.filterText, period === p && styles.filterTextActive]}>
                                {p === '1month' ? '1 Mois' : p === '3months' ? '3 Mois' : '6 Mois'}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {loading ? (
                    <ActivityIndicator size="large" color="#DC2626" style={styles.loader} />
                ) : (
                    <>
                        {chartData && (
                            <>
                                <View style={styles.chartCard}>
                                    <Text style={styles.chartTitle}>{t('dashboard.attendance') || 'Présence'}</Text>
                                    <LineChart
                                        data={{
                                            labels: chartData.labels,
                                            datasets: chartData.attendance
                                        }}
                                        width={screenWidth - 48}
                                        height={220}
                                        chartConfig={chartConfig}
                                        bezier
                                        style={styles.chart}
                                    />
                                </View>

                                <View style={styles.chartCard}>
                                    <Text style={styles.chartTitle}>{t('bacenta.offerings') || 'Offrandes'}</Text>
                                    <LineChart
                                        data={{
                                            labels: chartData.labels,
                                            datasets: chartData.offerings
                                        }}
                                        width={screenWidth - 48}
                                        height={220}
                                        chartConfig={{
                                            ...chartConfig,
                                            color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
                                        }}
                                        bezier
                                        style={styles.chart}
                                        yAxisSuffix="€"
                                    />
                                </View>
                            </>
                        )}

                        <View style={styles.summaryCard}>
                            <Text style={styles.summaryTitle}>Résumé de la Période</Text>
                            <View style={styles.summaryRow}>
                                <View style={styles.summaryItem}>
                                    <Text style={styles.summaryLabel}>Total Réunions</Text>
                                    <Text style={styles.summaryValue}>{bacentaData?.summary?.total_meetings || 0}</Text>
                                </View>
                                <View style={styles.summaryItem}>
                                    <Text style={styles.summaryLabel}>Moy. Présence</Text>
                                    <Text style={styles.summaryValue}>{bacentaData?.summary?.average_attendance || 0}</Text>
                                </View>
                                <View style={styles.summaryItem}>
                                    <Text style={styles.summaryLabel}>Total Offrandes</Text>
                                    <Text style={styles.summaryValue}>{bacentaData?.summary?.total_offering || 0} €</Text>
                                </View>
                            </View>
                        </View>
                    </>
                )}
            </ScrollView>
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
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1F2937',
    },
    content: {
        padding: 16,
    },
    filterContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 20,
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
        padding: 4,
    },
    filterButton: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 6,
    },
    filterButtonActive: {
        backgroundColor: '#DC2626',
    },
    filterText: {
        color: '#6B7280',
        fontWeight: '600',
    },
    filterTextActive: {
        color: '#FFFFFF',
    },
    loader: {
        marginTop: 40,
    },
    chartCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        alignItems: 'center'
    },
    chartTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#374151',
        marginBottom: 16,
        alignSelf: 'flex-start'
    },
    chart: {
        marginVertical: 8,
        borderRadius: 16
    },
    summaryCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        elevation: 2,
    },
    summaryTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#374151',
        marginBottom: 16,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    summaryItem: {
        alignItems: 'center',
    },
    summaryLabel: {
        fontSize: 12,
        color: '#6B7280',
        marginBottom: 4,
    },
    summaryValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1F2937',
    }
});

export default ReportsScreen;
