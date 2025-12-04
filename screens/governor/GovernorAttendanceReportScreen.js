import React, { useState, useEffect, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    ActivityIndicator,
    SafeAreaView,
    StatusBar,
    TextInput,
    Alert,
    Platform
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Feather from 'react-native-vector-icons/Feather';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import DateTimePicker from '@react-native-community/datetimepicker';
import { reportAPI } from '../../utils/api';
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import RNFS from 'react-native-fs';

const GovernorAttendanceReportScreen = () => {
    const navigation = useNavigation();
    const { t } = useTranslation();

    // States
    const [loading, setLoading] = useState(false);
    const [reportData, setReportData] = useState([]);
    const [groupBy, setGroupBy] = useState('region'); // 'region', 'leader', 'center_leader'
    const [viewMode, setViewMode] = useState('summary'); // 'summary', 'details'
    const [searchQuery, setSearchQuery] = useState('');

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
                group_by: groupBy,
                view: viewMode
            });
            setReportData(response.data.data || []);
        } catch (error) {
            console.error('Error fetching report:', error);
            Alert.alert('Erreur', 'Impossible de charger le rapport');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReport();
    }, [groupBy, startDate, endDate, viewMode]);

    // Filtered Data for Details View
    const filteredData = useMemo(() => {
        if (viewMode === 'summary') return reportData;
        if (!searchQuery) return reportData;

        return reportData.filter(item =>
            item.member_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.area_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.leader_name.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [reportData, searchQuery, viewMode]);

    // PDF Generation
    const generatePDF = async () => {
        try {
            setLoading(true);

            const title = viewMode === 'summary'
                ? `Rapport de Présence (Résumé) - ${startDate.toLocaleDateString()} au ${endDate.toLocaleDateString()}`
                : `Rapport de Présence (Détails) - ${startDate.toLocaleDateString()} au ${endDate.toLocaleDateString()}`;

            let htmlContent = `
                <html>
                <head>
                    <style>
                        body { font-family: 'Helvetica', sans-serif; padding: 20px; }
                        h1 { color: #991B1B; text-align: center; }
                        .subtitle { text-align: center; color: #666; margin-bottom: 20px; }
                        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                        th { background-color: #991B1B; color: white; padding: 10px; text-align: left; }
                        td { border-bottom: 1px solid #ddd; padding: 10px; }
                        tr:nth-child(even) { background-color: #f2f2f2; }
                        .badge { padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; }
                        .present { background-color: #dcfce7; color: #166534; }
                        .absent { background-color: #fee2e2; color: #991b1b; }
                    </style>
                </head>
                <body>
                    <h1>${title}</h1>
                    <div class="subtitle">Généré le ${new Date().toLocaleDateString()}</div>
            `;

            if (viewMode === 'summary') {
                htmlContent += `
                    <table>
                        <thead>
                            <tr>
                                <th>${groupBy === 'region' ? 'Région' : groupBy === 'leader' ? 'Leader' : 'Centre'}</th>
                                <th>Total Présents</th>
                                <th>Personnes Uniques</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${filteredData.map(item => `
                                <tr>
                                    <td>
                                        <strong>${item.label}</strong><br/>
                                        <small>${item.subLabel || ''}</small>
                                    </td>
                                    <td>${item.total_present}</td>
                                    <td>${item.unique_attendees}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                `;
            } else {
                htmlContent += `
                    <table>
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Membre</th>
                                <th>Région</th>
                                <th>Leader</th>
                                <th>Statut</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${filteredData.map(item => `
                                <tr>
                                    <td>${new Date(item.date).toLocaleDateString()}</td>
                                    <td>${item.member_name}</td>
                                    <td>${item.area_name}</td>
                                    <td>${item.leader_name}</td>
                                    <td><span class="badge ${item.status === 'Présent' ? 'present' : 'absent'}">${item.status}</span></td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                `;
            }

            htmlContent += `</body></html>`;

            const options = {
                html: htmlContent,
                fileName: `Rapport_Presence_${new Date().getTime()}`,
                directory: 'Documents',
            };

            const file = await RNHTMLtoPDF.convert(options);

            // Move to Downloads on Android
            if (Platform.OS === 'android') {
                const destPath = `${RNFS.DownloadDirectoryPath}/${options.fileName}.pdf`;
                await RNFS.moveFile(file.filePath, destPath);
                Alert.alert('Succès', `PDF enregistré dans :\n${destPath}`);
            } else {
                Alert.alert('Succès', `PDF généré : ${file.filePath}`);
            }

        } catch (error) {
            console.error('PDF Generation Error:', error);
            Alert.alert('Erreur', 'Échec de la génération du PDF');
        } finally {
            setLoading(false);
        }
    };

    // Render Item
    const renderItem = ({ item, index }) => {
        if (viewMode === 'summary') {
            return (
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
        } else {
            return (
                <View style={styles.detailCard}>
                    <View style={styles.detailHeader}>
                        <Text style={styles.detailDate}>{new Date(item.date).toLocaleDateString()}</Text>
                        <View style={[styles.statusBadge, item.status === 'Présent' ? styles.statusPresent : styles.statusAbsent]}>
                            <Text style={[styles.statusText, item.status === 'Présent' ? styles.textPresent : styles.textAbsent]}>
                                {item.status}
                            </Text>
                        </View>
                    </View>
                    <Text style={styles.detailName}>{item.member_name}</Text>
                    <View style={styles.detailMeta}>
                        <View style={styles.metaItem}>
                            <Icon name="map-marker" size={14} color="#6B7280" />
                            <Text style={styles.metaText}>{item.area_name}</Text>
                        </View>
                        <View style={styles.metaItem}>
                            <Icon name="account-tie" size={14} color="#6B7280" />
                            <Text style={styles.metaText}>{item.leader_name}</Text>
                        </View>
                    </View>
                </View>
            );
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar backgroundColor="#991B1B" barStyle="light-content" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Feather name="arrow-left" size={24} color="#FFFFFF" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Rapport de Présence</Text>
                <TouchableOpacity onPress={generatePDF} style={styles.pdfButton}>
                    <Icon name="file-pdf-box" size={24} color="#FFFFFF" />
                </TouchableOpacity>
            </View>

            {/* Filters */}
            <View style={styles.filtersContainer}>
                {/* View Toggle */}
                <View style={styles.viewToggle}>
                    <TouchableOpacity
                        style={[styles.toggleBtn, viewMode === 'summary' && styles.toggleBtnActive]}
                        onPress={() => setViewMode('summary')}
                    >
                        <Text style={[styles.toggleText, viewMode === 'summary' && styles.toggleTextActive]}>Résumé</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.toggleBtn, viewMode === 'details' && styles.toggleBtnActive]}
                        onPress={() => setViewMode('details')}
                    >
                        <Text style={[styles.toggleText, viewMode === 'details' && styles.toggleTextActive]}>Détails</Text>
                    </TouchableOpacity>
                </View>

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

                {/* Group By Tabs (Only for Summary) */}
                {viewMode === 'summary' && (
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
                )}

                {/* Search Bar (Only for Details) */}
                {viewMode === 'details' && (
                    <View style={styles.searchContainer}>
                        <Feather name="search" size={20} color="#9CA3AF" />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Rechercher membre, leader, région..."
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                        {searchQuery.length > 0 && (
                            <TouchableOpacity onPress={() => setSearchQuery('')}>
                                <Feather name="x" size={18} color="#9CA3AF" />
                            </TouchableOpacity>
                        )}
                    </View>
                )}
            </View>

            {/* Content */}
            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#991B1B" />
                    <Text style={styles.loadingText}>Chargement des données...</Text>
                </View>
            ) : (
                <FlatList
                    data={filteredData}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Icon name="chart-bar" size={64} color="#E5E7EB" />
                            <Text style={styles.emptyText}>Aucune donnée trouvée</Text>
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
    pdfButton: {
        padding: 8,
    },
    filtersContainer: {
        backgroundColor: '#FFFFFF',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    viewToggle: {
        flexDirection: 'row',
        backgroundColor: '#F3F4F6',
        borderRadius: 8,
        padding: 4,
        marginBottom: 16,
    },
    toggleBtn: {
        flex: 1,
        paddingVertical: 8,
        alignItems: 'center',
        borderRadius: 6,
    },
    toggleBtnActive: {
        backgroundColor: '#FFFFFF',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    toggleText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#6B7280',
    },
    toggleTextActive: {
        color: '#991B1B',
        fontWeight: '600',
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
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 8,
        paddingHorizontal: 12,
        height: 44,
    },
    searchInput: {
        flex: 1,
        marginLeft: 8,
        fontSize: 14,
        color: '#111827',
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
    detailCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    detailHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    detailDate: {
        fontSize: 12,
        color: '#6B7280',
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 12,
    },
    statusPresent: {
        backgroundColor: '#DCFCE7',
    },
    statusAbsent: {
        backgroundColor: '#FEE2E2',
    },
    statusText: {
        fontSize: 11,
        fontWeight: '600',
    },
    textPresent: {
        color: '#166534',
    },
    textAbsent: {
        color: '#991B1B',
    },
    detailName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#111827',
        marginBottom: 8,
    },
    detailMeta: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 16,
    },
    metaText: {
        fontSize: 12,
        color: '#6B7280',
        marginLeft: 4,
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
