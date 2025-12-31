import React, { useState, useEffect } from 'react';
import {
    governorAPI,
    areaAPI,
    dashboardAPI,
    reportAPI,
    memberAPI,
    bacentaAPI
} from '../utils/api';
import {
    LayoutDashboard,
    Users,
    User,
    Crown,
    Map,
    MapPin,
    FileBarChart,
    Plus,
    Search,
    Pencil,
    Trash2,
    TrendingUp,
    TrendingDown,
    Phone,
    Home,
    CheckCircle,
    X,
    ChevronRight,
    Download,
    Calendar,
    ArrowLeft,
    MessageCircle,
    Mail,
    Lock,
    Save,
    AlertCircle
} from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ContactModal } from '../components/ContactModals';
import styles from './Governor.module.css';
import { callLogAPI } from '../utils/api';

const Governor = () => {
    const navigate = useNavigate();
    const { user: authUser } = useAuth();
    const [searchParams, setSearchParams] = useSearchParams();
    const activeTab = searchParams.get('tab') || 'dashboard';

    const setActiveTab = (tab) => {
        setSearchParams({ tab });
    };

    const [stats, setStats] = useState(null);
    const [leaders, setLeaders] = useState([]);
    const [areas, setAreas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [members, setMembers] = useState([]);
    const [memberFilters, setMemberFilters] = useState({
        area_id: '',
        leader_id: ''
    });
    const [growthData, setGrowthData] = useState(null);
    const [attendanceReportData, setAttendanceReportData] = useState([]);
    const [attendanceReportType, setAttendanceReportType] = useState('area'); // area, leader, member_detail

    // Leader Detail
    const [selectedLeader, setSelectedLeader] = useState(null);
    const [leaderStats, setLeaderStats] = useState(null);
    const [leaderMembers, setLeaderMembers] = useState([]);
    const [leaderMeetings, setLeaderMeetings] = useState([]);

    // Reports
    const [reportFilters, setReportFilters] = useState({
        startDate: new Date(new Date().setDate(new Date().getDate() - 90)).toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
        groupBy: 'area', // area, leader
        areaId: '',
        leaderId: ''
    });

    const [selectedReportType, setSelectedReportType] = useState('attendance'); // 'attendance' or 'growth'
    const [isViewingReport, setIsViewingReport] = useState(false);
    const [callTrackingData, setCallTrackingData] = useState([]);
    const [callTrackingView, setCallTrackingView] = useState('not_called');
    const [callTrackingSummary, setCallTrackingSummary] = useState(null);
    const [bacentaReportData, setBacentaReportData] = useState([]);
    const [reportDebugInfo, setReportDebugInfo] = useState(null);
    const [selectedMeeting, setSelectedMeeting] = useState(null);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

    // Contact Modal
    const [isContactModalOpen, setIsContactModalOpen] = useState(false);
    const [selectedMemberForContact, setSelectedMemberForContact] = useState(null);

    // Modals
    const [showLeaderModal, setShowLeaderModal] = useState(false);
    const [showAreaModal, setShowAreaModal] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [modalLoading, setModalLoading] = useState(false);
    const [modalError, setModalError] = useState('');

    // Forms
    const [leaderForm, setLeaderForm] = useState({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        password: '',
        area_id: ''
    });

    const [areaForm, setAreaForm] = useState({
        name: '',
        number: ''
    });

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    const fetchData = async () => {
        setLoading(true);
        try {
            if (activeTab === 'dashboard') {
                const [statsRes, growthRes] = await Promise.all([
                    dashboardAPI.getGlobalStats(),
                    reportAPI.getMemberGrowthReport({ period: '3months' })
                ]);
                setStats(statsRes.data);
                setGrowthData(growthRes.data);
            } else if (activeTab === 'leaders') {
                const [leadersRes, areasRes] = await Promise.all([
                    governorAPI.getBacentaLeaders(),
                    areaAPI.getAreas()
                ]);
                setLeaders(leadersRes.data.users || []);
                setAreas(areasRes.data.areas || []);
            } else if (activeTab === 'zones') {
                const res = await areaAPI.getAreas();
                setAreas(res.data.areas || []);
            } else if (activeTab === 'members') {
                const [membersRes, leadersRes, areasRes] = await Promise.all([
                    memberAPI.getMembers({ ...memberFilters, search: searchQuery }),
                    governorAPI.getBacentaLeaders(),
                    areaAPI.getAreas()
                ]);
                setMembers(membersRes.data.members || []);
                setLeaders(leadersRes.data.users || []);
                setAreas(areasRes.data.areas || []);
            } else if (activeTab === 'reports') {
                const [leadersRes, areasRes] = await Promise.all([
                    governorAPI.getBacentaLeaders(),
                    areaAPI.getAreas()
                ]);
                setLeaders(leadersRes.data.users || []);
                setAreas(areasRes.data.areas || []);

                if (selectedReportType === 'attendance') {
                    fetchAttendanceData();
                } else if (selectedReportType === 'growth') {
                    fetchGrowthData();
                } else if (selectedReportType === 'call_tracking') {
                    fetchCallTrackingData();
                } else if (selectedReportType === 'bacenta_meetings') {
                    fetchBacentaReportData();
                }
            }
        } catch (error) {
            console.error('Error fetching governor data:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchAttendanceData = async () => {
        try {
            const params = {
                ...reportFilters,
                start_date: reportFilters.startDate,
                end_date: reportFilters.endDate,
                area_id: reportFilters.areaId,
                leader_id: reportFilters.leaderId
            };
            const res = await reportAPI.getGovernorAttendanceReport(params);
            setAttendanceReportData(res.data.report || []);
            setAttendanceReportType(res.data.type);
        } catch (error) {
            console.error('Error fetching attendance report:', error);
        }
    };

    const fetchGrowthData = async () => {
        try {
            const res = await reportAPI.getMemberGrowthReport({
                start_date: reportFilters.startDate,
                end_date: reportFilters.endDate
            });
            setGrowthData(res.data);
        } catch (error) {
            console.error('Error fetching growth report:', error);
        }
    };

    const fetchCallTrackingData = async () => {
        try {
            const res = await reportAPI.getCallLogReport({
                start_date: reportFilters.startDate,
                end_date: reportFilters.endDate,
                area_id: reportFilters.areaId,
                leader_id: reportFilters.leaderId,
                view_type: callTrackingView
            });
            setCallTrackingData(res.data.report || []);
            setCallTrackingSummary(res.data.summary);
        } catch (error) {
            console.error('Error fetching call tracking report:', error);
        }
    };

    const fetchBacentaReportData = async () => {
        try {
            const res = await reportAPI.getBacentaReport({
                start_date: reportFilters.startDate,
                end_date: reportFilters.endDate,
                area_id: reportFilters.areaId,
                leader_id: reportFilters.leaderId
            });
            setBacentaReportData(res.data.meetings || []);
            setReportDebugInfo(res.data.debug);
        } catch (error) {
            console.error('Error fetching bacenta report:', error);
        }
    };

    const openContactModal = (member) => {
        setSelectedMemberForContact(member);
        setIsContactModalOpen(true);
    };

    const handleActionComplete = async (type, method, templateTitle) => {
        if (!selectedMemberForContact) return;
        try {
            await callLogAPI.createCallLog({
                member_id: selectedMemberForContact.id,
                outcome: 'Contacted',
                contact_method: method === 'whatsapp' ? 'WhatsApp' : (type === 'Call' ? 'Phone' : 'SMS'),
                notes: `${type} via ${method}${templateTitle ? ` (Modèle: ${templateTitle})` : ''}`
            });
            // Si on est dans le rapport de suivi, on rafraîchit les données
            if (activeTab === 'reports' && selectedReportType === 'call_tracking') {
                fetchCallTrackingData();
            }
        } catch (error) {
            console.error('Error logging action:', error);
        }
    };

    const handleMemberDetail = (memberId) => {
        navigate(`/members/${memberId}`);
    };

    useEffect(() => {
        if (activeTab === 'reports') {
            if (selectedReportType === 'attendance') {
                fetchAttendanceData();
            } else if (selectedReportType === 'growth') {
                fetchGrowthData();
            } else if (selectedReportType === 'call_tracking') {
                fetchCallTrackingData();
            } else if (selectedReportType === 'bacenta_meetings') {
                fetchBacentaReportData();
            }
        }
    }, [reportFilters, selectedReportType, activeTab, callTrackingView]);

    const handleSaveLeader = async (e) => {
        e.preventDefault();
        setModalLoading(true);
        setModalError('');
        try {
            if (editingItem) {
                await governorAPI.updateBacentaLeader(editingItem.id, leaderForm);
            } else {
                await governorAPI.createBacentaLeader(leaderForm);
            }
            setShowLeaderModal(false);
            fetchData();
        } catch (error) {
            console.error('Error saving leader:', error);
            const message = error.response?.data?.error || 'Une erreur est survenue lors de l\'enregistrement';
            setModalError(message);
        } finally {
            setModalLoading(false);
        }
    };

    const handleSaveArea = async (e) => {
        e.preventDefault();
        try {
            if (editingItem) {
                await areaAPI.updateArea(editingItem.id, areaForm);
            } else {
                await areaAPI.createArea(areaForm);
            }
            setShowAreaModal(false);
            fetchData();
        } catch (error) {
            console.error('Error saving area:', error);
        }
    };

    const handleDeleteLeader = async (id) => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer ce leader ?')) {
            try {
                await governorAPI.deleteBacentaLeader(id);
                fetchData();
            } catch (error) {
                console.error('Error deleting leader:', error);
            }
        }
    };

    const handleDeleteArea = async (id) => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer cette zone ?')) {
            try {
                await areaAPI.deleteArea(id);
                fetchData();
            } catch (error) {
                console.error('Error deleting area:', error);
            }
        }
    };

    const fetchLeaderDetail = async (leader) => {
        setLoading(true);
        setSelectedLeader(leader);
        try {
            const [membersRes, meetingsRes] = await Promise.all([
                memberAPI.getMembers({ leader_id: leader.id }),
                bacentaAPI.getMeetings({ leader_id: leader.id })
            ]);
            setLeaderMembers(membersRes.data.members || []);
            setLeaderMeetings(meetingsRes.data.meetings || []);
            // Mock stats for now as there's no specific endpoint for leader stats in governor context
            setLeaderStats({
                totalMembers: membersRes.data.members?.length || 0,
                attendanceRate: 85, // Placeholder
                recentMeetings: meetingsRes.data.meetings?.length || 0
            });
        } catch (error) {
            console.error('Error fetching leader details:', error);
        } finally {
            setLoading(false);
        }
    };

    const generateAttendancePDF = async () => {
        setLoading(true);
        try {
            const params = {
                ...reportFilters,
                start_date: reportFilters.startDate,
                end_date: reportFilters.endDate,
                area_id: reportFilters.areaId,
                leader_id: reportFilters.leaderId
            };
            const res = await reportAPI.getGovernorAttendanceReport(params);
            const data = res.data.report || [];
            const type = res.data.type;

            const doc = new jsPDF();

            // Header
            doc.setFontSize(20);
            doc.setTextColor(220, 38, 38);
            doc.text('First Love Church', 105, 20, { align: 'center' });

            doc.setFontSize(16);
            doc.setTextColor(0, 0, 0);
            doc.text('Rapport de Présence Gouverneur', 105, 30, { align: 'center' });

            doc.setFontSize(10);
            doc.text(`Période: ${reportFilters.startDate} au ${reportFilters.endDate}`, 105, 38, { align: 'center' });

            let tableColumn = [];
            let tableRows = [];

            if (type === 'member_detail') {
                tableColumn = ["Membre", "Statut", "Présences", "Total Possible", "Taux %"];
                tableRows = data.map(item => [
                    item.member_name,
                    item.status === 'active' ? 'Actif' : 'Inactif',
                    item.attendance_count,
                    item.total_possible,
                    `${item.attendance_rate}%`
                ]);
            } else if (type === 'area_leaders' || type === 'leader') {
                tableColumn = ["Leader", "Zone", "Total Membres", "Présents", "Taux %"];
                tableRows = data.map(item => [
                    item.leader_name || `${item.leader_first_name} ${item.leader_last_name}`,
                    item.area_name || '',
                    item.total_members,
                    item.attendance_count,
                    `${item.attendance_rate}%`
                ]);
            } else {
                tableColumn = ["Zone", "Total Membres", "Présents", "Taux %"];
                tableRows = data.map(item => [
                    item.area_name,
                    item.total_members,
                    item.attendance_count,
                    `${item.attendance_rate}%`
                ]);
            }

            doc.autoTable({
                head: [tableColumn],
                body: tableRows,
                startY: 45,
                theme: 'grid',
                headStyles: { fillColor: [220, 38, 38] }
            });

            doc.save(`Rapport_Presence_${reportFilters.startDate}_${reportFilters.endDate}.pdf`);
        } catch (error) {
            console.error('Error generating PDF:', error);
            alert('Erreur lors de la génération du rapport');
        } finally {
            setLoading(false);
        }
    };

    const openLeaderModal = (leader = null) => {
        setModalError('');
        setModalLoading(false);
        if (leader) {
            setEditingItem(leader);
            setLeaderForm({
                first_name: leader.first_name,
                last_name: leader.last_name,
                email: leader.email,
                phone: leader.phone || '',
                password: '',
                area_id: leader.area_id || ''
            });
        } else {
            setEditingItem(null);
            setLeaderForm({
                first_name: '',
                last_name: '',
                email: '',
                phone: '',
                password: '',
                area_id: ''
            });
        }
        setShowLeaderModal(true);
    };

    const openAreaModal = (area = null) => {
        if (area) {
            setEditingItem(area);
            setAreaForm({
                name: area.name,
                number: area.number
            });
        } else {
            setEditingItem(null);
            setAreaForm({
                name: '',
                number: ''
            });
        }
        setShowAreaModal(true);
    };

    const filteredLeaders = leaders.filter(l =>
        `${l.first_name} ${l.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const renderGrowthChart = () => {
        if (!growthData || !growthData.chart_data || !growthData.chart_data.datasets[0]) return null;

        const data = growthData.chart_data.datasets[0].data;
        const labels = growthData.chart_data.labels;

        if (data.length < 2) return <p style={{ textAlign: 'center', padding: '2rem' }}>Pas assez de données pour le graphique.</p>;

        const max = Math.max(...data);
        const min = Math.min(...data);
        const range = max - min || 1;

        const width = 800;
        const height = 300;
        const paddingLeft = 50;
        const paddingRight = 30;
        const paddingTop = 40;
        const paddingBottom = 60;
        const chartWidth = width - paddingLeft - paddingRight;
        const chartHeight = height - paddingTop - paddingBottom;

        const getX = (i) => (i / (data.length - 1)) * chartWidth + paddingLeft;
        const getY = (val) => height - ((val - min) / range) * chartHeight - paddingBottom;

        // Générer le chemin pour la courbe lisse (Cubic Bézier)
        let pathD = `M ${getX(0)},${getY(data[0])}`;
        for (let i = 0; i < data.length - 1; i++) {
            const x1 = getX(i);
            const y1 = getY(data[i]);
            const x2 = getX(i + 1);
            const y2 = getY(data[i + 1]);
            const cp1x = x1 + (x2 - x1) / 2;
            const cp2x = x1 + (x2 - x1) / 2;
            pathD += ` C ${cp1x},${y1} ${cp2x},${y2} ${x2},${y2}`;
        }

        const areaPathD = `${pathD} L ${getX(data.length - 1)},${height - paddingBottom} L ${paddingLeft},${height - paddingBottom} Z`;

        // Grille Y (4 niveaux)
        const gridY = [0, 0.33, 0.66, 1].map(p => min + range * p);

        return (
            <div className={styles.chartContainer}>
                <div className={styles.chartHeader}>
                    <h3 className={styles.chartTitle}>Évolution de la Croissance</h3>
                    <div className={styles.chartLegend}>
                        <span className={styles.legendDot}></span> Nouveaux Membres Cumulés
                    </div>
                </div>

                <div className={styles.chartWrapper}>
                    <svg viewBox={`0 0 ${width} ${height}`} className={styles.svgChart}>
                        <defs>
                            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="rgba(220, 38, 38, 0.4)" />
                                <stop offset="100%" stopColor="rgba(220, 38, 38, 0)" />
                            </linearGradient>
                            <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
                                <feGaussianBlur in="SourceAlpha" stdDeviation="4" />
                                <feOffset dx="0" dy="4" result="offsetblur" />
                                <feComponentTransfer>
                                    <feFuncA type="linear" slope="0.5" />
                                </feComponentTransfer>
                                <feMerge>
                                    <feMergeNode />
                                    <feMergeNode in="SourceGraphic" />
                                </feMerge>
                            </filter>
                        </defs>

                        {/* Grille Y */}
                        {gridY.map((val, i) => (
                            <g key={`y-${i}`}>
                                <line
                                    x1={paddingLeft} y1={getY(val)}
                                    x2={width - paddingRight} y2={getY(val)}
                                    stroke="rgba(255,255,255,0.05)"
                                    strokeDasharray="4,4"
                                />
                                <text
                                    x={paddingLeft - 10} y={getY(val) + 4}
                                    textAnchor="end" fontSize="11" fill="#64748b"
                                >
                                    {Math.round(val)}
                                </text>
                            </g>
                        ))}

                        {/* Remplissage arrière-plan */}
                        <path d={areaPathD} fill="url(#chartGradient)" />

                        {/* Ligne principale lissée */}
                        <path
                            d={pathD}
                            fill="none"
                            stroke="#DC2626"
                            strokeWidth="4"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            filter="url(#shadow)"
                        />

                        {/* Points et Labels Axe X */}
                        {data.map((val, i) => {
                            const x = getX(i);
                            const y = getY(val);

                            // Afficher les labels de date intelligemment pour éviter le chevauchement
                            const step = Math.max(1, Math.floor(data.length / 8));
                            const showXLabel = i % step === 0 || i === data.length - 1;

                            return (
                                <g key={i} className={styles.chartPointGroup}>
                                    <circle
                                        cx={x}
                                        cy={y}
                                        r="5"
                                        fill="#fff"
                                        stroke="#DC2626"
                                        strokeWidth="3"
                                        className={styles.pointDot}
                                    />
                                    {/* Tooltip text (visible on group hover via CSS if needed, but here simple text) */}
                                    <text
                                        x={x}
                                        y={y - 15}
                                        textAnchor="middle"
                                        fontSize="12"
                                        fontWeight="bold"
                                        fill="#fff"
                                        className={styles.pointValue}
                                    >
                                        {val}
                                    </text>

                                    {showXLabel && (
                                        <text
                                            x={x}
                                            y={height - 20}
                                            textAnchor="middle"
                                            fontSize="11"
                                            fill="#94a3b8"
                                            className={styles.xAxisLabel}
                                        >
                                            {labels[i]}
                                        </text>
                                    )}
                                </g>
                            );
                        })}
                    </svg>
                </div>
            </div>
        );
    };

    const renderDashboard = () => (
        <div className={styles.section}>
            <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                    <div className={styles.statHeader}>
                        <div className={styles.statIcon} style={{ background: 'rgba(220, 38, 38, 0.1)', color: '#DC2626' }}>
                            <Users size={24} />
                        </div>
                        <div className={`${styles.statTrend} ${styles.trendUp}`}>
                            <TrendingUp size={12} /> +{growthData?.total_new || 0}
                        </div>
                    </div>
                    <h3 className={styles.statValue}>{stats?.summary?.total_members || 0}</h3>
                    <p className={styles.statLabel}>Total Membres</p>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statHeader}>
                        <div className={styles.statIcon} style={{ background: 'rgba(124, 58, 237, 0.1)', color: '#7c3aed' }}>
                            <Crown size={24} />
                        </div>
                    </div>
                    <h3 className={styles.statValue}>{stats?.summary?.total_leaders || 0}</h3>
                    <p className={styles.statLabel}>Total Leaders</p>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statHeader}>
                        <div className={styles.statIcon} style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
                            <CheckCircle size={24} />
                        </div>
                        <div className={`${styles.statTrend} ${stats?.summary?.attendance_change >= 0 ? styles.trendUp : styles.trendDown}`}>
                            {stats?.summary?.attendance_change >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                            {Math.abs(stats?.summary?.attendance_change || 0)}%
                        </div>
                    </div>
                    <h3 className={styles.statValue}>{stats?.summary?.current_week_attendance || 0}%</h3>
                    <p className={styles.statLabel}>Taux de Présence</p>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statHeader}>
                        <div className={styles.statIcon} style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}>
                            <Home size={24} />
                        </div>
                    </div>
                    <h3 className={styles.statValue}>{stats?.summary?.recent_bacenta_meetings || 0}</h3>
                    <p className={styles.statLabel}>Réunions Bacenta</p>
                </div>
            </div>

            <div className={styles.dashboardContent}>
                <div className={styles.chartWrapper}>
                    {renderGrowthChart()}
                </div>
                <div className={styles.recentActivity}>
                    <div className={styles.sectionHeader}>
                        <h2 className={styles.sectionTitle}>Rapports Récents</h2>
                        <button className={styles.primaryBtn} onClick={() => setActiveTab('reports')}>
                            Voir tous
                        </button>
                    </div>
                    <div className={styles.tableContainer}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th className={styles.th}>Période</th>
                                    <th className={styles.th}>Présence</th>
                                    <th className={styles.th}>Statut</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className={styles.tr}>
                                    <td className={styles.td}>Semaine Actuelle</td>
                                    <td className={styles.td}>{stats?.summary?.current_week_attendance || 0}%</td>
                                    <td className={styles.td}>
                                        <span className={`${styles.badge} ${styles.badgeActive}`}>À jour</span>
                                    </td>
                                </tr>
                                <tr className={styles.tr}>
                                    <td className={styles.td}>Semaine Dernière</td>
                                    <td className={styles.td}>{stats?.summary?.last_week_attendance || 0}%</td>
                                    <td className={styles.td}>
                                        <span className={`${styles.badge} ${styles.badgeActive}`}>Terminé</span>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderLeaders = () => (
        <div className={styles.section}>
            <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>Gestion des Leaders</h2>
                <button className={styles.primaryBtn} onClick={() => openLeaderModal()}>
                    <Plus size={20} /> Nouveau Leader
                </button>
            </div>

            <div className={styles.tableContainer}>
                <div className={styles.searchBar}>
                    <div className={styles.searchInputWrapper}>
                        <Search size={18} className={styles.searchIcon} />
                        <input
                            type="text"
                            className={styles.searchInput}
                            placeholder="Rechercher un leader par nom ou email..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th className={styles.th}>Leader</th>
                            <th className={styles.th}>Zone</th>
                            <th className={styles.th}>Téléphone</th>
                            <th className={styles.th} style={{ textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredLeaders.map(leader => (
                            <tr key={leader.id} className={styles.tr}>
                                <td className={styles.td}>
                                    <div className={styles.userCell}>
                                        <div className={styles.avatar}>
                                            {leader.first_name[0]}{leader.last_name[0]}
                                        </div>
                                        <div>
                                            <span className={styles.userName}>{leader.first_name} {leader.last_name}</span>
                                            <span className={styles.userEmail}>{leader.email}</span>
                                        </div>
                                    </div>
                                </td>
                                <td className={styles.td}>
                                    <span className={`${styles.badge} ${styles.badgeArea}`}>
                                        {areas.find(a => a.id === leader.area_id)?.name || 'Non assigné'}
                                    </span>
                                </td>
                                <td className={styles.td}>{leader.phone || '-'}</td>
                                <td className={styles.td}>
                                    <div className={styles.actions}>
                                        <button className={styles.actionBtn} onClick={() => fetchLeaderDetail(leader)} title="Voir détails">
                                            <ChevronRight size={18} />
                                        </button>
                                        <button className={styles.actionBtn} onClick={() => openLeaderModal(leader)}>
                                            <Pencil size={18} />
                                        </button>
                                        <button className={`${styles.actionBtn} ${styles.deleteBtn}`} onClick={() => handleDeleteLeader(leader.id)}>
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    const renderZones = () => (
        <div className={styles.section}>
            <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>Gestion des Zones</h2>
                <button className={styles.primaryBtn} onClick={() => openAreaModal()}>
                    <Plus size={20} /> Nouvelle Zone
                </button>
            </div>

            <div className={styles.tableContainer}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th className={styles.th}>Nom de la Zone</th>
                            <th className={styles.th}>Numéro</th>
                            <th className={styles.th}>Leaders Assignés</th>
                            <th className={styles.th} style={{ textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {areas.map(area => (
                            <tr key={area.id} className={styles.tr}>
                                <td className={styles.td}>
                                    <span className={styles.userName}>{area.name}</span>
                                </td>
                                <td className={styles.td}>
                                    <span className={styles.badge} style={{ background: 'rgba(255,255,255,0.05)', color: 'white' }}>
                                        N° {area.number}
                                    </span>
                                </td>
                                <td className={styles.td}>
                                    {leaders.filter(l => l.area_id === area.id).length} Leaders
                                </td>
                                <td className={styles.td}>
                                    <div className={styles.actions}>
                                        <button className={styles.actionBtn} onClick={() => openAreaModal(area)}>
                                            <Pencil size={18} />
                                        </button>
                                        <button className={`${styles.actionBtn} ${styles.deleteBtn}`} onClick={() => handleDeleteArea(area.id)}>
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    const renderMembers = () => (
        <div className={styles.section}>
            <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>Membres de l'Église</h2>
                <div className={styles.headerActions}>
                    <select
                        className={styles.select}
                        style={{ width: 'auto', marginRight: '1rem' }}
                        value={memberFilters.area_id}
                        onChange={e => setMemberFilters({ ...memberFilters, area_id: e.target.value })}
                    >
                        <option value="">Toutes les Zones</option>
                        {areas.map(area => (
                            <option key={area.id} value={area.id}>{area.name}</option>
                        ))}
                    </select>
                    <select
                        className={styles.select}
                        style={{ width: 'auto' }}
                        value={memberFilters.leader_id}
                        onChange={e => setMemberFilters({ ...memberFilters, leader_id: e.target.value })}
                    >
                        <option value="">Tous les Leaders</option>
                        {leaders.map(leader => (
                            <option key={leader.id} value={leader.id}>{leader.first_name} {leader.last_name}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className={styles.tableContainer}>
                <div className={styles.searchBar}>
                    <div className={styles.searchInputWrapper}>
                        <Search size={18} className={styles.searchIcon} />
                        <input
                            type="text"
                            className={styles.searchInput}
                            placeholder="Rechercher un membre par nom..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th className={styles.th}>Membre</th>
                            <th className={styles.th}>Zone</th>
                            <th className={styles.th}>Leader</th>
                            <th className={styles.th}>Statut</th>
                            <th className={styles.th} style={{ textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {members.map(member => (
                            <tr key={member.id} className={styles.tr}>
                                <td className={styles.td}>
                                    <div className={styles.userCell}>
                                        <div className={styles.avatar}>
                                            {member.first_name[0]}{member.last_name[0]}
                                        </div>
                                        <div>
                                            <span className={styles.userName}>{member.first_name} {member.last_name}</span>
                                            <span className={styles.userEmail}>{member.phone_primary || 'Pas de téléphone'}</span>
                                        </div>
                                    </div>
                                </td>
                                <td className={styles.td}>
                                    <span className={`${styles.badge} ${styles.badgeArea}`}>
                                        {member.area?.name || 'N/A'}
                                    </span>
                                </td>
                                <td className={styles.td}>
                                    {member.leader ? `${member.leader.first_name} ${member.leader.last_name}` : 'N/A'}
                                </td>
                                <td className={styles.td}>
                                    <span className={`${styles.badge} ${member.status === 'active' ? styles.badgeActive : styles.badgeInactive}`}>
                                        {member.status === 'active' ? 'Actif' : 'Inactif'}
                                    </span>
                                </td>
                                <td className={styles.td}>
                                    <div className={styles.actions} style={{ justifyContent: 'flex-end' }}>
                                        <button className={styles.actionBtn} title="Appeler" onClick={() => openContactModal(member)}>
                                            <Phone size={18} />
                                        </button>
                                        <button className={styles.actionBtn} title="Détails" onClick={() => handleMemberDetail(member.id)}>
                                            <ChevronRight size={18} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    const renderLeaderDetail = () => (
        <div className={styles.section}>
            <div className={styles.sectionHeader}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <button className={styles.actionBtn} onClick={() => setSelectedLeader(null)}>
                        <X size={20} />
                    </button>
                    <h2 className={styles.sectionTitle}>Détail Leader : {selectedLeader.first_name} {selectedLeader.last_name}</h2>
                </div>
            </div>

            <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                    <h3 className={styles.statValue}>{leaderStats?.totalMembers || 0}</h3>
                    <p className={styles.statLabel}>Membres</p>
                </div>
                <div className={styles.statCard}>
                    <h3 className={styles.statValue}>{leaderStats?.attendanceRate || 0}%</h3>
                    <p className={styles.statLabel}>Taux de Présence</p>
                </div>
                <div className={styles.statCard}>
                    <h3 className={styles.statValue}>{leaderStats?.recentMeetings || 0}</h3>
                    <p className={styles.statLabel}>Réunions Récentes</p>
                </div>
            </div>

            <div className={styles.detailGrid} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginTop: '2rem' }}>
                <div className={styles.tableContainer}>
                    <h3 className={styles.sectionTitle} style={{ padding: '1rem', fontSize: '1.1rem' }}>Membres Assignés</h3>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th className={styles.th}>Membre</th>
                                <th className={styles.th}>Statut</th>
                            </tr>
                        </thead>
                        <tbody>
                            {leaderMembers.map(member => (
                                <tr key={member.id} className={styles.tr}>
                                    <td className={styles.td}>{member.first_name} {member.last_name}</td>
                                    <td className={styles.td}>
                                        <span className={`${styles.badge} ${member.status === 'active' ? styles.badgeActive : styles.badgeInactive}`}>
                                            {member.status === 'active' ? 'Actif' : 'Inactif'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className={styles.tableContainer}>
                    <h3 className={styles.sectionTitle} style={{ padding: '1rem', fontSize: '1.1rem' }}>Réunions Récentes</h3>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th className={styles.th}>Date</th>
                                <th className={styles.th}>Présents</th>
                            </tr>
                        </thead>
                        <tbody>
                            {leaderMeetings.map(meeting => (
                                <tr key={meeting.id} className={styles.tr}>
                                    <td className={styles.td}>{new Date(meeting.date).toLocaleDateString()}</td>
                                    <td className={styles.td}>{meeting.attendance_count || 0}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );

    const renderBacentaStats = () => {
        if (!bacentaReportData.length) return null;

        const totalOfferings = bacentaReportData.reduce((sum, m) => sum + (Number(m.offering_amount) || 0), 0);
        const totalMeetings = bacentaReportData.length;
        const totalPresence = bacentaReportData.reduce((sum, m) => sum + (m.total_members_present || 0), 0);
        const avgPresence = Math.round(totalPresence / totalMeetings);

        return (
            <div className={styles.statsGrid} style={{ marginBottom: '2rem' }}>
                <div className={styles.statCard} style={{ borderLeft: '4px solid #10b981' }}>
                    <div className={styles.statHeader}>
                        <div className={styles.statIcon} style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
                            <TrendingUp size={20} />
                        </div>
                    </div>
                    <div className={styles.statValue}>{totalOfferings.toLocaleString()} <span style={{ fontSize: '1rem' }}>CFA</span></div>
                    <div className={styles.statLabel}>Total des Offrandes</div>
                </div>
                <div className={styles.statCard} style={{ borderLeft: '4px solid #3b82f6' }}>
                    <div className={styles.statHeader}>
                        <div className={styles.statIcon} style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}>
                            <Calendar size={20} />
                        </div>
                    </div>
                    <div className={styles.statValue}>{totalMeetings}</div>
                    <div className={styles.statLabel}>Réunions Tenues</div>
                </div>
                <div className={styles.statCard} style={{ borderLeft: '4px solid #f59e0b' }}>
                    <div className={styles.statHeader}>
                        <div className={styles.statIcon} style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}>
                            <Users size={20} />
                        </div>
                    </div>
                    <div className={styles.statValue}>{avgPresence}</div>
                    <div className={styles.statLabel}>Moyenne de Présence</div>
                </div>
            </div>
        );
    };

    const renderReports = () => {
        if (!isViewingReport) {
            return (
                <div className={styles.section}>
                    <div className={styles.sectionHeader}>
                        <h2 className={styles.sectionTitle}>Analyse & Rapports</h2>
                    </div>
                    <div className={styles.reportsGrid}>
                        <div
                            className={styles.reportCard}
                            onClick={() => {
                                setSelectedReportType('attendance');
                                setIsViewingReport(true);
                            }}
                        >
                            <div className={styles.reportIcon} style={{ background: 'rgba(220, 38, 38, 0.1)', color: '#DC2626' }}>
                                <Calendar size={32} />
                            </div>
                            <h3 className={styles.reportTitle}>Rapport de Présence</h3>
                            <p className={styles.reportDesc}>Analyse détaillée de la présence hebdomadaire par zone et par leader.</p>
                            <div className={styles.reportBadge}>Prêt</div>
                        </div>
                        <div
                            className={styles.reportCard}
                            onClick={() => {
                                setSelectedReportType('growth');
                                setIsViewingReport(true);
                            }}
                        >
                            <div className={styles.reportIcon} style={{ background: 'rgba(124, 58, 237, 0.1)', color: '#7c3aed' }}>
                                <TrendingUp size={32} />
                            </div>
                            <h3 className={styles.reportTitle}>Croissance des Membres</h3>
                            <p className={styles.reportDesc}>Suivi de l'évolution du nombre de membres et des nouveaux convertis.</p>
                            <div className={styles.reportBadge}>Premium</div>
                        </div>
                        <div
                            className={styles.reportCard}
                            onClick={() => {
                                setSelectedReportType('bacenta_meetings');
                                setIsViewingReport(true);
                            }}
                        >
                            <div className={styles.reportIcon} style={{ background: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8' }}>
                                <MessageCircle size={32} />
                            </div>
                            <h3 className={styles.reportTitle}>Comptes rendus Bacenta</h3>
                            <p className={styles.reportDesc}>Rapports détaillés des réunions hebdomadaires effectués par les leaders.</p>
                            <div className={styles.reportBadge} style={{ background: '#38bdf8' }}>Récent</div>
                        </div>
                    </div>
                </div>
            );
        }

        return (
            <div className={styles.section}>
                <div className={styles.sectionHeader} style={{ marginBottom: '2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <button
                            className={styles.actionBtn}
                            onClick={() => setIsViewingReport(false)}
                            style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '50%', padding: '0.6rem' }}
                        >
                            <ArrowLeft size={20} />
                        </button>
                        <div>
                            <h2 className={styles.sectionTitle}>
                                {selectedReportType === 'attendance' ? 'Rapport de Présence' :
                                    selectedReportType === 'growth' ? 'Croissance des Membres' :
                                        selectedReportType === 'call_tracking' ? 'Suivi des Appels' : 'Comptes rendus Bacenta'}
                            </h2>
                            <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
                                {selectedReportType === 'attendance' ? 'Analyse filtrée par zone, leader et période' :
                                    selectedReportType === 'growth' ? 'Analyse d\'évolution temporelle premium' :
                                        selectedReportType === 'call_tracking' ? 'Membres contactés et non contactés par période' :
                                            'Détails des réunions de partage et activités par zone'}
                            </p>
                        </div>
                    </div>

                    <div className={styles.headerActions} style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        {selectedReportType !== 'growth' && (
                            <>
                                <div className={styles.formGroup} style={{ marginBottom: 0 }}>
                                    <label className={styles.label} style={{ fontSize: '0.7rem' }}>Zone</label>
                                    <select
                                        className={styles.select}
                                        style={{ padding: '0.4rem' }}
                                        value={reportFilters.areaId}
                                        onChange={e => setReportFilters({ ...reportFilters, areaId: e.target.value, leaderId: '' })}
                                    >
                                        <option value="">Toutes les Zones</option>
                                        {areas.map(area => (
                                            <option key={area.id} value={area.id}>{area.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className={styles.formGroup} style={{ marginBottom: 0 }}>
                                    <label className={styles.label} style={{ fontSize: '0.7rem' }}>Leader</label>
                                    <select
                                        className={styles.select}
                                        style={{ padding: '0.4rem' }}
                                        value={reportFilters.leaderId}
                                        onChange={e => setReportFilters({ ...reportFilters, leaderId: e.target.value })}
                                    >
                                        <option value="">Tous les Leaders</option>
                                        {leaders
                                            .filter(l => !reportFilters.areaId || l.area_id === parseInt(reportFilters.areaId))
                                            .map(leader => (
                                                <option key={leader.id} value={leader.id}>{leader.first_name} {leader.last_name}</option>
                                            ))
                                        }
                                    </select>
                                </div>
                                <div className={styles.formGroup} style={{ marginBottom: 0 }}>
                                    <label className={styles.label} style={{ fontSize: '0.7rem' }}>Début</label>
                                    <input
                                        type="date"
                                        className={styles.input}
                                        style={{ padding: '0.4rem', width: 'auto' }}
                                        value={reportFilters.startDate}
                                        onChange={e => setReportFilters({ ...reportFilters, startDate: e.target.value })}
                                    />
                                </div>
                                <div className={styles.formGroup} style={{ marginBottom: 0 }}>
                                    <label className={styles.label} style={{ fontSize: '0.7rem' }}>Fin</label>
                                    <input
                                        type="date"
                                        className={styles.input}
                                        style={{ padding: '0.4rem', width: 'auto' }}
                                        value={reportFilters.endDate}
                                        onChange={e => setReportFilters({ ...reportFilters, endDate: e.target.value })}
                                    />
                                </div>
                            </>
                        )}
                        {selectedReportType === 'call_tracking' && (
                            <div className={styles.formGroup} style={{ marginBottom: 0 }}>
                                <label className={styles.label} style={{ fontSize: '0.7rem' }}>Vue</label>
                                <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', padding: '2px' }}>
                                    <button
                                        onClick={() => setCallTrackingView('not_called')}
                                        style={{
                                            padding: '0.4rem 0.8rem',
                                            borderRadius: '6px',
                                            border: 'none',
                                            background: callTrackingView === 'not_called' ? '#DC2626' : 'transparent',
                                            color: 'white',
                                            fontSize: '0.8rem',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        Non Appelés
                                    </button>
                                    <button
                                        onClick={() => setCallTrackingView('called')}
                                        style={{
                                            padding: '0.4rem 0.8rem',
                                            borderRadius: '6px',
                                            border: 'none',
                                            background: callTrackingView === 'called' ? '#10B981' : 'transparent',
                                            color: 'white',
                                            fontSize: '0.8rem',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        Appelés
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className={styles.tableContainer} style={{ background: 'rgba(15, 23, 42, 0.3)', backdropFilter: 'blur(10px)' }}>
                    {selectedReportType === 'call_tracking' ? (
                        <>
                            <div style={{ padding: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <h3 className={styles.sectionTitle} style={{ fontSize: '1rem', margin: 0 }}>
                                    {callTrackingView === 'not_called'
                                        ? `Membres sans appel (${callTrackingSummary?.count || 0})`
                                        : `Historique des appels (Période: ${callTrackingSummary?.total_in_period_debug ?? 0} / Total Absolu DB: ${callTrackingSummary?.total_all_time ?? '?'}) [V:${callTrackingSummary?.backend_version || '?'}]`
                                    }
                                </h3>
                            </div>
                            <table className={styles.table}>
                                <thead>
                                    <tr>
                                        <th className={styles.th}>Membre</th>
                                        <th className={styles.th}>Téléphone</th>
                                        <th className={styles.th}>Zone</th>
                                        <th className={styles.th}>Leader</th>
                                        {callTrackingView === 'not_called' ? (
                                            <th className={styles.th}>Dernière Présence</th>
                                        ) : (
                                            <>
                                                <th className={styles.th}>Date Appel</th>
                                                <th className={styles.th}>Résultat</th>
                                                <th className={styles.th}>Appelé par</th>
                                            </>
                                        )}
                                        <th className={styles.th} style={{ textAlign: 'right' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {callTrackingData.length > 0 ? (
                                        callTrackingData.map((item, idx) => {
                                            const targetMember = item.member || item;
                                            return (
                                                <tr key={idx} className={styles.tr}>
                                                    <td className={styles.td}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                            <div style={{
                                                                width: '32px', height: '32px', borderRadius: '50%',
                                                                background: targetMember.photo_url ? `url(${targetMember.photo_url}) center/cover` : 'rgba(255,255,255,0.1)',
                                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                                color: 'white', fontSize: '0.8rem'
                                                            }}>
                                                                {!targetMember.photo_url && (targetMember.first_name?.[0] || 'M')}
                                                            </div>
                                                            <div>
                                                                <div style={{ color: 'white', fontWeight: '500' }}>
                                                                    {`${targetMember.first_name} ${targetMember.last_name}`}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className={styles.td} style={{ color: '#94a3b8' }}>
                                                        {targetMember.phone_primary}
                                                    </td>
                                                    <td className={styles.td}>
                                                        <span className={styles.badge} style={{ background: 'rgba(59, 130, 246, 0.2)', color: '#60a5fa' }}>
                                                            {targetMember.area?.name || targetMember.Area?.name || '-'}
                                                        </span>
                                                    </td>
                                                    <td className={styles.td}>
                                                        {targetMember.leader ? `${targetMember.leader.first_name} ${targetMember.leader.last_name}` :
                                                            targetMember.Leader ? `${targetMember.Leader.first_name} ${targetMember.Leader.last_name}` : '-'}
                                                    </td>
                                                    {callTrackingView === 'not_called' ? (
                                                        <td className={styles.td} style={{ color: '#ef4444' }}>
                                                            {item.last_attendance_date ? new Date(item.last_attendance_date).toLocaleDateString() : 'Jamais'}
                                                        </td>
                                                    ) : (
                                                        <>
                                                            <td className={styles.td}>
                                                                {new Date(item.call_date).toLocaleDateString()}
                                                            </td>
                                                            <td className={styles.td}>
                                                                <span className={styles.badge} style={{
                                                                    background: item.outcome === 'Contacted' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                                                                    color: item.outcome === 'Contacted' ? '#34d399' : '#f87171'
                                                                }}>
                                                                    {item.outcome}
                                                                </span>
                                                            </td>
                                                            <td className={styles.td} style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                                                                {item.caller ? `${item.caller.first_name} ${item.caller.last_name}` : '-'}
                                                            </td>
                                                        </>
                                                    )}
                                                    <td className={styles.td}>
                                                        <div className={styles.actions} style={{ justifyContent: 'flex-end' }}>
                                                            <button className={styles.actionBtn} title="Appeler" onClick={() => openContactModal(targetMember)}>
                                                                <Phone size={18} />
                                                            </button>
                                                            <button className={styles.actionBtn} title="Détails" onClick={() => handleMemberDetail(targetMember.id)}>
                                                                <ChevronRight size={18} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    ) : (
                                        <tr>
                                            <td colSpan={callTrackingView === 'not_called' ? 6 : 8} style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                                                Aucune donnée trouvée pour cette période.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </>
                    ) : selectedReportType === 'bacenta_meetings' ? (
                        <div className={styles.bacentaReportWrapper}>
                            {renderBacentaStats()}
                            <div className={styles.tableWrapper}>
                                <table className={styles.table}>
                                    <thead>
                                        <tr>
                                            <th className={styles.th}>Date</th>
                                            <th className={styles.th}>Leader</th>
                                            <th className={styles.th}>Zone</th>
                                            <th className={styles.th}>Type</th>
                                            <th className={styles.th}>Présents</th>
                                            <th className={styles.th}>Offrande</th>
                                            <th className={styles.th} style={{ textAlign: 'right' }}>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {bacentaReportData.length > 0 ? (
                                            bacentaReportData.map((meeting, idx) => (
                                                <tr key={idx} className={styles.tr}>
                                                    <td className={styles.td}>
                                                        <div style={{ fontWeight: '600', color: 'white' }}>
                                                            {new Date(meeting.meeting_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                                                        </div>
                                                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                                                            {new Date(meeting.meeting_date).getFullYear()}
                                                        </div>
                                                    </td>
                                                    <td className={styles.td}>
                                                        {meeting.leader ? (
                                                            <div className={styles.userCell}>
                                                                <div className={styles.avatar} style={{ width: '32px', height: '32px', fontSize: '0.7rem' }}>
                                                                    {meeting.leader.first_name?.[0]}{meeting.leader.last_name?.[0]}
                                                                </div>
                                                                <span className={styles.userName}>{meeting.leader.first_name} {meeting.leader.last_name}</span>
                                                            </div>
                                                        ) : 'N/A'}
                                                    </td>
                                                    <td className={styles.td}>
                                                        <span className={styles.badge} style={{ background: 'rgba(99, 102, 241, 0.1)', color: '#a5b4fc', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
                                                            {meeting.area?.name || 'N/A'}
                                                        </span>
                                                    </td>
                                                    <td className={styles.td}>
                                                        <span className={styles.badge} style={{ background: 'rgba(255,255,255,0.05)', color: '#cbd5e1' }}>
                                                            {meeting.meeting_type?.replace('_', ' ')}
                                                        </span>
                                                    </td>
                                                    <td className={styles.td}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                            <strong style={{ color: meeting.total_members_present > 0 ? '#10b981' : '#ef4444' }}>
                                                                {meeting.total_members_present}
                                                            </strong>
                                                            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                                                                / {meeting.expected_participants || '-'}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className={styles.td}>
                                                        <span style={{ fontWeight: '600' }}>{Number(meeting.offering_amount).toLocaleString()}</span>
                                                        <span style={{ fontSize: '0.7rem', color: '#64748b', marginLeft: '4px' }}>CFA</span>
                                                    </td>
                                                    <td className={styles.td} style={{ textAlign: 'right' }}>
                                                        <button
                                                            className={styles.primaryBtn}
                                                            style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', boxShadow: 'none' }}
                                                            onClick={() => {
                                                                setSelectedMeeting(meeting);
                                                                setIsDetailsModalOpen(true);
                                                            }}
                                                        >
                                                            Voir Détails
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={7} className={styles.td} style={{ textAlign: 'center', padding: '4rem', color: '#64748b' }}>
                                                    <div className={styles.emptyState}>
                                                        <p>Aucun compte rendu trouvé pour cette période.</p>
                                                        <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.5rem' }}>
                                                            Diagnostic : {areas.length} Zones, {leaders.length} Leaders.
                                                            <br />
                                                            <strong>Total Réunions en Base (Sans Filtre) : {reportDebugInfo?.count ?? '?'}</strong>
                                                            {reportDebugInfo?.count === 0 && <span style={{ color: '#ef4444', display: 'block', marginTop: '4px' }}>🔴 BASE VIDE : Aucune réunion trouvée sur ce serveur.</span>}
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ) : selectedReportType === 'attendance' ? (
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th className={styles.th}>
                                        {attendanceReportType === 'area' ? 'Zone' :
                                            attendanceReportType === 'member_detail' ? 'Membre' : 'Leader'}
                                    </th>
                                    {attendanceReportType === 'leader' && <th className={styles.th}>Zone</th>}
                                    {attendanceReportType === 'member_detail' && <th className={styles.th}>Statut</th>}
                                    <th className={styles.th}>{attendanceReportType === 'member_detail' ? 'Présences' : 'Total Membres'}</th>
                                    {attendanceReportType !== 'member_detail' && <th className={styles.th}>Présents</th>}
                                    <th className={styles.th}>{attendanceReportType === 'member_detail' ? 'Taux (Indiv)' : 'Taux %'}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {attendanceReportData.length > 0 ? (
                                    attendanceReportData.map((item, idx) => (
                                        <tr key={idx} className={styles.tr}>
                                            <td className={styles.td}>
                                                <strong>
                                                    {attendanceReportType === 'area' ? item.area_name :
                                                        attendanceReportType === 'member_detail' ? item.member_name :
                                                            (item.leader_name || (item.leader_first_name ? `${item.leader_first_name} ${item.leader_last_name}` : 'Leader'))}
                                                </strong>
                                            </td>
                                            {attendanceReportType === 'leader' && <td className={styles.td}>{item.area_name}</td>}
                                            {attendanceReportType === 'member_detail' && (
                                                <td className={styles.td}>
                                                    <span className={`${styles.badge} ${item.status === 'active' ? styles.badgeActive : styles.badgeInactive}`}>
                                                        {item.status === 'active' ? 'Actif' : 'Inactif'}
                                                    </span>
                                                </td>
                                            )}
                                            <td className={styles.td}>
                                                {attendanceReportType === 'member_detail' ? item.attendance_count : item.total_members}
                                            </td>
                                            {attendanceReportType !== 'member_detail' && (
                                                <td className={styles.td}>{item.attendance_count}</td>
                                            )}
                                            <td className={styles.td}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                    <div className={styles.progressContainer} style={{ width: '80px', height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px' }}>
                                                        <div
                                                            className={styles.progressBar}
                                                            style={{
                                                                width: `${item.attendance_rate}%`,
                                                                height: '100%',
                                                                background: item.attendance_rate > 70 ? '#10b981' : item.attendance_rate > 40 ? '#f59e0b' : '#ef4444',
                                                                borderRadius: '4px'
                                                            }}
                                                        />
                                                    </div>
                                                    <span style={{ fontWeight: 'bold' }}>{item.attendance_rate}%</span>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={6} className={styles.td} style={{ textAlign: 'center', padding: '4rem', color: '#64748b' }}>
                                            <div style={{ opacity: 0.5, marginBottom: '1rem' }}><Calendar size={48} style={{ margin: '0 auto' }} /></div>
                                            Aucune donnée disponible pour cette sélection.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    ) : (
                        <div style={{ padding: '2rem' }}>
                            {renderGrowthChart()}
                            <div style={{ marginTop: '2rem', textAlign: 'center', color: '#94a3b8', background: 'rgba(255,255,255,0.02)', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                <p style={{ fontSize: '1.1rem' }}>Total nouveaux membres identifiés : <strong style={{ color: '#fff', fontSize: '1.4rem' }}>{growthData?.total_new || 0}</strong></p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>Espace Gouverneur</h1>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '4rem', color: '#94a3b8' }}>Chargement des données...</div>
            ) : (
                <>
                    {selectedLeader ? (
                        renderLeaderDetail()
                    ) : (
                        <>
                            {activeTab === 'dashboard' && renderDashboard()}
                            {activeTab === 'leaders' && renderLeaders()}
                            {activeTab === 'zones' && renderZones()}
                            {activeTab === 'members' && renderMembers()}
                            {activeTab === 'reports' && renderReports()}
                        </>
                    )}
                </>
            )}

            {/* Leader Modal */}
            {showLeaderModal && (
                <div className={styles.modalOverlay} onClick={() => !modalLoading && setShowLeaderModal(false)}>
                    <div className={`${styles.modalContent} ${styles.modalContentPremium}`} style={{ width: '100%', maxWidth: '700px' }} onClick={e => e.stopPropagation()}>
                        <div className={styles.modalHeaderPremium}>
                            <div>
                                <h2 className={styles.modalTitle} style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>
                                    {editingItem ? 'Modifier le Leader' : 'Nouveau Leader'}
                                </h2>
                                <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
                                    {editingItem ? 'Mettre à jour les informations du leader' : 'Ajouter un nouveau leader à votre zone'}
                                </p>
                            </div>
                            <button
                                className={styles.closeBtn}
                                onClick={() => setShowLeaderModal(false)}
                                disabled={modalLoading}
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSaveLeader}>
                            <div className={styles.modalBodyPremium}>
                                {modalError && (
                                    <div className={styles.errorBanner}>
                                        <AlertCircle size={20} />
                                        <span>{modalError}</span>
                                    </div>
                                )}

                                <div className={styles.formGridPremium}>
                                    <div className={styles.formGroupPremium}>
                                        <label className={styles.label}>Prénom</label>
                                        <div className={styles.inputWrapperPremium}>
                                            <User className={styles.inputIcon} size={18} />
                                            <input
                                                className={styles.inputPremium}
                                                placeholder="ex: Jean"
                                                value={leaderForm.first_name}
                                                onChange={e => setLeaderForm({ ...leaderForm, first_name: e.target.value })}
                                                required
                                                disabled={modalLoading}
                                            />
                                        </div>
                                    </div>

                                    <div className={styles.formGroupPremium}>
                                        <label className={styles.label}>Nom de famille</label>
                                        <div className={styles.inputWrapperPremium}>
                                            <User className={styles.inputIcon} size={18} />
                                            <input
                                                className={styles.inputPremium}
                                                placeholder="ex: Dupont"
                                                value={leaderForm.last_name}
                                                onChange={e => setLeaderForm({ ...leaderForm, last_name: e.target.value })}
                                                required
                                                disabled={modalLoading}
                                            />
                                        </div>
                                    </div>

                                    <div className={`${styles.formGroupPremium} ${styles.fullWidth}`}>
                                        <label className={styles.label}>Adresse Email</label>
                                        <div className={styles.inputWrapperPremium}>
                                            <Mail className={styles.inputIcon} size={18} />
                                            <input
                                                type="email"
                                                className={styles.inputPremium}
                                                placeholder="leader@example.com"
                                                value={leaderForm.email}
                                                onChange={e => setLeaderForm({ ...leaderForm, email: e.target.value })}
                                                required
                                                disabled={modalLoading}
                                            />
                                        </div>
                                    </div>

                                    <div className={styles.formGroupPremium}>
                                        <label className={styles.label}>Téléphone</label>
                                        <div className={styles.inputWrapperPremium}>
                                            <Phone className={styles.inputIcon} size={18} />
                                            <input
                                                className={styles.inputPremium}
                                                placeholder="ex: 06 12 34 56 78"
                                                value={leaderForm.phone}
                                                onChange={e => setLeaderForm({ ...leaderForm, phone: e.target.value })}
                                                disabled={modalLoading}
                                            />
                                        </div>
                                    </div>

                                    <div className={styles.formGroupPremium}>
                                        <label className={styles.label}>Zone Assignée</label>
                                        <div className={styles.inputWrapperPremium}>
                                            <MapPin className={styles.inputIcon} size={18} />
                                            <select
                                                className={styles.selectPremium}
                                                value={leaderForm.area_id}
                                                onChange={e => setLeaderForm({ ...leaderForm, area_id: e.target.value })}
                                                required
                                                disabled={modalLoading}
                                            >
                                                <option value="">Sélectionner une zone</option>
                                                {areas.map(area => (
                                                    <option key={area.id} value={area.id}>{area.name} (N°{area.number})</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    {!editingItem && (
                                        <div className={`${styles.formGroupPremium} ${styles.fullWidth}`}>
                                            <label className={styles.label}>Mot de passe initial</label>
                                            <div className={styles.inputWrapperPremium}>
                                                <Lock className={styles.inputIcon} size={18} />
                                                <input
                                                    type="password"
                                                    className={styles.inputPremium}
                                                    placeholder="Minimum 6 caractères"
                                                    value={leaderForm.password}
                                                    onChange={e => setLeaderForm({ ...leaderForm, password: e.target.value })}
                                                    required
                                                    disabled={modalLoading}
                                                    minLength={6}
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className={styles.modalFooterPremium}>
                                <button
                                    type="button"
                                    className={styles.cancelBtn}
                                    onClick={() => setShowLeaderModal(false)}
                                    disabled={modalLoading}
                                >
                                    Annuler
                                </button>
                                <button
                                    type="submit"
                                    className={styles.submitBtnPremium}
                                    disabled={modalLoading}
                                >
                                    {modalLoading ? (
                                        <>
                                            <div className={styles.spinnerSmall}></div>
                                            <span>Enregistrement...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Save size={18} />
                                            <span>Enregistrer le Leader</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Area Modal */}
            {showAreaModal && (
                <div className={styles.modalOverlay} onClick={() => setShowAreaModal(false)}>
                    <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h2 className={styles.modalTitle}>{editingItem ? 'Modifier Zone' : 'Nouvelle Zone'}</h2>
                            <button className={styles.closeBtn} onClick={() => setShowAreaModal(false)}><X size={20} /></button>
                        </div>
                        <form onSubmit={handleSaveArea}>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Nom de la Zone</label>
                                <input
                                    className={styles.input}
                                    value={areaForm.name}
                                    onChange={e => setAreaForm({ ...areaForm, name: e.target.value })}
                                    placeholder="Ex: Zone Nord"
                                    required
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Numéro de Zone</label>
                                <input
                                    type="number"
                                    className={styles.input}
                                    value={areaForm.number}
                                    onChange={e => setAreaForm({ ...areaForm, number: e.target.value })}
                                    placeholder="Ex: 1"
                                    required
                                />
                            </div>
                            <div className={styles.modalActions}>
                                <button type="button" className={styles.cancelBtn} onClick={() => setShowAreaModal(false)}>Annuler</button>
                                <button type="submit" className={styles.submitBtn}>Enregistrer</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <ContactModal
                isOpen={isContactModalOpen}
                onClose={() => setIsContactModalOpen(false)}
                member={selectedMemberForContact}
                authUser={authUser}
                onActionComplete={handleActionComplete}
            />

            <MeetingDetailsModal
                isOpen={isDetailsModalOpen}
                onClose={() => setIsDetailsModalOpen(false)}
                meeting={selectedMeeting}
            />
        </div>
    );
};

const MeetingDetailsModal = ({ isOpen, onClose, meeting }) => {
    if (!isOpen || !meeting) return null;

    const attendanceRate = meeting.expected_participants > 0
        ? Math.round((meeting.total_members_present / meeting.expected_participants) * 100)
        : 0;

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modalContentPremium} onClick={e => e.stopPropagation()}>
                <div className={styles.modalHeaderPremium}>
                    <div>
                        <h2 className={styles.modalTitle}>Rapport de Réunion</h2>
                        <p className={styles.modalSubtitle}>
                            {new Date(meeting.meeting_date).toLocaleDateString('fr-FR', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}
                        </p>
                    </div>
                    <button className={styles.closeBtn} onClick={onClose}><X size={24} /></button>
                </div>

                <div className={styles.infoGrid}>
                    <div className={styles.metricCard}>
                        <div className={styles.metricIcon} style={{ background: 'rgba(99, 102, 241, 0.1)', color: '#818cf8' }}>
                            <FileBarChart size={18} />
                        </div>
                        <span className={styles.metricLabel}>Type</span>
                        <span className={styles.metricValue}>{meeting.meeting_type?.replace('_', ' ') || 'Réunion'}</span>
                    </div>
                    <div className={styles.metricCard}>
                        <div className={styles.metricIcon} style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#34d399' }}>
                            <Map size={18} />
                        </div>
                        <span className={styles.metricLabel}>Lieu</span>
                        <span className={styles.metricValue}>{meeting.location || 'Bériole'}</span>
                    </div>
                    <div className={styles.metricCard}>
                        <div className={styles.metricIcon} style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#fbbf24' }}>
                            <Users size={18} />
                        </div>
                        <span className={styles.metricLabel}>Présence</span>
                        <span className={styles.metricValue}>
                            {meeting.total_members_present} / {meeting.expected_participants}
                            <span style={{ fontSize: '0.8rem', color: '#64748b', marginLeft: '0.5rem' }}>({attendanceRate}%)</span>
                        </span>
                    </div>
                    <div className={styles.metricCard}>
                        <div className={styles.metricIcon} style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#f87171' }}>
                            <TrendingUp size={18} />
                        </div>
                        <span className={styles.metricLabel}>Offrande</span>
                        <span className={styles.metricValue}>{Number(meeting.offering_amount).toLocaleString()} CFA</span>
                    </div>
                </div>

                <div className={styles.modalBody}>
                    <div className={styles.contentSection}>
                        <div className={styles.infoSection}>
                            <h3 className={styles.sectionTitlePremium}><MessageCircle size={16} /> Contenu & Message</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                <div>
                                    <span className={styles.metricLabel}>Prédicateur</span>
                                    <p className={styles.metricValue} style={{ fontSize: '1rem', marginTop: '0.25rem' }}>
                                        {meeting.preacher || <span className={styles.emptyText}>Non renseigné</span>}
                                    </p>
                                </div>
                                <div>
                                    <span className={styles.metricLabel}>Thème du message</span>
                                    <p className={styles.metricValue} style={{ fontSize: '1rem', marginTop: '0.25rem' }}>
                                        {meeting.theme || <span className={styles.emptyText}>À définir</span>}
                                    </p>
                                </div>
                                <div>
                                    <span className={styles.metricLabel}>Notes & Ordre du jour</span>
                                    <p className={styles.mainContent} style={{ marginTop: '0.5rem' }}>
                                        {meeting.notes || <span className={styles.emptyText}>Aucune note particulière pour cette réunion.</span>}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {meeting.photo_url && (
                            <div className={styles.infoSection}>
                                <h3 className={styles.sectionTitlePremium}><Home size={16} /> Photo de la Réunion</h3>
                                <img
                                    src={meeting.photo_url}
                                    alt="Compte rendu"
                                    className={styles.meetingPhoto}
                                    style={{ marginTop: '0.5rem' }}
                                    onClick={() => window.open(meeting.photo_url, '_blank')}
                                />
                            </div>
                        )}
                    </div>

                    <div className={styles.contentSection}>
                        <div className={styles.infoSection}>
                            <h3 className={styles.sectionTitlePremium}><Users size={16} /> Liste des Présences</h3>
                            <div className={styles.attendanceListPremium}>
                                {meeting.attendances?.length > 0 ? (
                                    meeting.attendances.map((att, i) => (
                                        <div key={i} className={styles.attendanceRow}>
                                            <div className={styles.memberMeta}>
                                                <div className={styles.avatarSmall}>
                                                    {att.member?.first_name?.[0] || 'M'}
                                                </div>
                                                <span style={{ fontWeight: '500' }}>
                                                    {att.member ? `${att.member.first_name} ${att.member.last_name}` : 'Membre inconnu'}
                                                </span>
                                            </div>
                                            <div className={styles.statusIndicator} style={{ color: att.status === 'present' ? '#10b981' : '#ef4444' }}>
                                                {att.status === 'present' ? <CheckCircle size={14} /> : <X size={14} />}
                                                <span>{att.status === 'present' ? 'Présent' : 'Absent'}</span>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div style={{ textAlign: 'center', padding: '3rem 1rem', opacity: 0.5 }}>
                                        <Users size={32} style={{ margin: '0 auto 1rem' }} />
                                        <p className={styles.emptyText}>Aucune liste nominative enregistrée.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className={styles.modalActions} style={{ padding: '0 2rem 2rem' }}>
                    <button className={styles.submitBtn} onClick={onClose} style={{ width: '100%', borderRadius: '12px' }}>
                        Fermer le Rapport
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Governor;
