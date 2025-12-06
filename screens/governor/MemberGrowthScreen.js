import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    Dimensions,
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { useTranslation } from 'react-i18next';
import { reportAPI } from '../../utils/api';
import Toast from 'react-native-toast-message';
import LinearGradient from 'react-native-linear-gradient';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const screenWidth = Dimensions.get('window').width;

const FilterPill = ({ label, value, period, setPeriod }) => (
    <TouchableOpacity
        onPress={() => setPeriod(value)}
        style={[
            styles.filterPill,
            period === value && styles.filterPillActive
        ]}
    >
        {period === value && (
            <LinearGradient
                colors={['#DC2626', '#B91C1C']}
                style={StyleSheet.absoluteFill}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            />
        )}
        <Text style={[
            styles.filterText,
            period === value && styles.filterTextActive
        ]}>
            {label}
        </Text>
    </TouchableOpacity>
);

const StatCard = ({ label, value, icon, color, delay }) => (
    <Animated.View
        entering={FadeInDown.delay(delay).springify()}
        style={styles.statCardContainer}
    >
        <View style={styles.statCard}>
            <View style={[styles.iconContainer, { backgroundColor: `${color}15` }]}>
                <Icon name={icon} size={24} color={color} />
            </View>
            <View>
                <Text style={styles.statLabel}>{label}</Text>
                <Text style={[styles.statValue, { color }]}>{value}</Text>
            </View>
        </View>
    </Animated.View>
);

const MemberGrowthScreen = () => {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);
    const [period, setPeriod] = useState('3months'); // 1month, 3months, 6months, 1year
    const groupBy = 'global' // global, region

    useEffect(() => {
        fetchGrowthReport();
    }, [fetchGrowthReport]);

    const fetchGrowthReport = useCallback(async () => {
        setLoading(true);
        try {
            const response = await reportAPI.getMemberGrowthReport({ period, group_by: groupBy });
            setData(response.data);
        } catch (error) {
            console.error('Error fetching member growth report:', error);
            Toast.show({
                type: 'error',
                text1: t('common.error'),
                text2: 'Erreur lors du chargement du rapport de croissance'
            });
        } finally {
            setLoading(false);
        }
    }, [period, t]);

    const chartConfig = {
        backgroundGradientFrom: '#ffffff',
        backgroundGradientTo: '#ffffff',
        fillShadowGradientFrom: '#DC2626',
        fillShadowGradientTo: '#ffffff',
        fillShadowGradientOpacity: 0.3,
        decimalPlaces: 0,
        color: (opacity = 1) => `rgba(220, 38, 38, ${opacity})`,
        labelColor: (opacity = 1) => `rgba(107, 114, 128, ${opacity})`,
        style: {
            borderRadius: 24,
        },
        propsForDots: {
            r: '5',
            strokeWidth: '2',
            stroke: '#DC2626',
        },
        propsForBackgroundLines: {
            strokeDasharray: '', // solid lines
            stroke: '#E5E7EB',
            strokeWidth: 1,
        },
    };


    return (
        <View style={styles.container}>
            <ScrollView
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >
                <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.headerSection}>
                    <Text style={styles.mainTitle}>Croissance de l'Église</Text>
                    <Text style={styles.subTitle}>Suivez l'évolution de vos membres</Text>
                </Animated.View>

                <View style={styles.filterContainer}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
                        <FilterPill label="1 Mois" value="1month" period={period} setPeriod={setPeriod} />
                        <FilterPill label="3 Mois" value="3months" period={period} setPeriod={setPeriod} />
                        <FilterPill label="6 Mois" value="6months" period={period} setPeriod={setPeriod} />
                        <FilterPill label="1 An" value="1year" period={period} setPeriod={setPeriod} />
                    </ScrollView>
                </View>

                {loading ? (
                    <View style={styles.loaderContainer}>
                        <ActivityIndicator size="large" color="#DC2626" />
                    </View>
                ) : (
                    <>
                        {data && data.chart_data && (
                            <Animated.View entering={FadeInUp.delay(200).springify()} style={styles.chartCard}>
                                <View style={styles.chartHeader}>
                                    <View>
                                        <Text style={styles.chartTitle}>Évolution Totale</Text>
                                        <Text style={styles.chartSubtitle}>
                                            {data.chart_data.labels[0]} - {data.chart_data.labels[data.chart_data.labels.length - 1]}
                                        </Text>
                                    </View>
                                    <View style={styles.trendBadge}>
                                        <Icon name="trending-up" size={16} color="#16A34A" />
                                        <Text style={styles.trendText}>+{data.total_new}</Text>
                                    </View>
                                </View>

                                <LineChart
                                    data={data.chart_data}
                                    width={screenWidth - 48}
                                    height={240}
                                    chartConfig={chartConfig}
                                    bezier
                                    style={styles.chart}
                                    withInnerLines={true}
                                    withOuterLines={false}
                                    withVerticalLines={false}
                                    withHorizontalLines={true}
                                    withVerticalLabels={true}
                                    withHorizontalLabels={true}
                                    yAxisInterval={1}
                                />
                            </Animated.View>
                        )}

                        <View style={styles.statsGrid}>
                            <StatCard
                                label="Membres au Début"
                                value={data?.initial_count || 0}
                                icon="account-clock"
                                color="#6B7280"
                                delay={300}
                            />
                            <StatCard
                                label="Nouveaux Membres"
                                value={`+${data?.total_new || 0}`}
                                icon="account-plus"
                                color="#16A34A"
                                delay={400}
                            />
                            <StatCard
                                label="Total Actuel"
                                value={data?.final_count || 0}
                                icon="account-group"
                                color="#DC2626"
                                delay={500}
                            />
                        </View>
                    </>
                )}
                <View style={styles.bottomSpacer} />
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F3F4F6',
    },
    content: {
        padding: 16,
    },
    headerSection: {
        marginBottom: 20,
        marginTop: 8,
    },
    mainTitle: {
        fontSize: 24,
        fontWeight: '800',
        color: '#111827',
        letterSpacing: -0.5,
    },
    subTitle: {
        fontSize: 14,
        color: '#6B7280',
        marginTop: 4,
    },
    filterContainer: {
        marginBottom: 24,
    },
    filterScroll: {
        paddingRight: 16,
    },
    filterPill: {
        paddingVertical: 8,
        paddingHorizontal: 20,
        borderRadius: 20,
        marginRight: 10,
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        overflow: 'hidden',
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 1,
    },
    filterPillActive: {
        backgroundColor: '#DC2626',
        borderWidth: 0,
        borderColor: 'transparent',
    },
    filterText: {
        color: '#4B5563',
        fontWeight: '600',
        fontSize: 13,
    },
    filterTextActive: {
        color: '#FFFFFF',
        fontWeight: '700',
    },
    loaderContainer: {
        height: 300,
        justifyContent: 'center',
        alignItems: 'center',
    },
    chartCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        padding: 20,
        marginBottom: 24,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
    },
    chartHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 20,
    },
    chartTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#111827',
    },
    chartSubtitle: {
        fontSize: 12,
        color: '#9CA3AF',
        marginTop: 2,
    },
    trendBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#DCFCE7',
        paddingVertical: 4,
        paddingHorizontal: 8,
        borderRadius: 12,
    },
    trendText: {
        color: '#16A34A',
        fontWeight: '700',
        fontSize: 12,
        marginLeft: 4,
    },
    chart: {
        marginVertical: 8,
        borderRadius: 16,
        paddingRight: 0,
        paddingLeft: 0,
    },
    statsGrid: {
        gap: 16,
    },
    statCardContainer: {
        width: '100%',
    },
    statCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    statLabel: {
        fontSize: 13,
        color: '#6B7280',
        marginBottom: 4,
        fontWeight: '500',
    },
    statValue: {
        fontSize: 20,
        fontWeight: '800',
    },
    bottomSpacer: {
        height: 40,
    },
});

export default MemberGrowthScreen;
