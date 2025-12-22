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
    Crown,
    Map,
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
    Calendar
} from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { useSearchParams } from 'react-router-dom';
import styles from './Governor.module.css';

const Governor = () => {
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

    // Leader Detail
    const [selectedLeader, setSelectedLeader] = useState(null);
    const [leaderStats, setLeaderStats] = useState(null);
    const [leaderMembers, setLeaderMembers] = useState([]);
    const [leaderMeetings, setLeaderMeetings] = useState([]);

    // Reports
    const [reportFilters, setReportFilters] = useState({
        startDate: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
        groupBy: 'area' // area, leader
    });

    // Modals
    const [showLeaderModal, setShowLeaderModal] = useState(false);
    const [showAreaModal, setShowAreaModal] = useState(false);
    const [editingItem, setEditingItem] = useState(null);

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
                const res = await reportAPI.getGovernorAttendanceReport(reportFilters);
                setAttendanceReportData(res.data.report || []);
            }
        } catch (error) {
            console.error('Error fetching governor data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveLeader = async (e) => {
        e.preventDefault();
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
            const res = await reportAPI.getGovernorAttendanceReport(reportFilters);
            const data = res.data.report || [];

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

            const tableColumn = reportFilters.groupBy === 'area' ? ["Zone", "Total Membres", "Présents", "Taux %"] : ["Leader", "Zone", "Présents", "Taux %"];
            const tableRows = data.map(item => {
                if (reportFilters.groupBy === 'area') {
                    return [
                        item.area_name,
                        item.total_members,
                        item.attendance_count,
                        `${item.attendance_rate}%`
                    ];
                } else {
                    return [
                        `${item.leader_first_name} ${item.leader_last_name}`,
                        item.area_name,
                        item.attendance_count,
                        `${item.attendance_rate}%`
                    ];
                }
            });

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
        const range = max - min || 10;
        const width = 800;
        const height = 200;
        const padding = 20;

        const points = data.map((val, i) => {
            const x = (i / (data.length - 1)) * (width - padding * 2) + padding;
            const y = height - ((val - min) / range) * (height - padding * 2) - padding;
            return `${x},${y}`;
        }).join(' ');

        return (
            <div className={styles.chartContainer}>
                <div className={styles.chartHeader}>
                    <h3 className={styles.chartTitle}>Évolution des Membres</h3>
                    <div className={styles.chartLegend}>
                        <span className={styles.legendDot}></span> Total Cumulé
                    </div>
                </div>
                <svg viewBox={`0 0 ${width} ${height}`} className={styles.svgChart}>
                    <defs>
                        <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="rgba(220, 38, 38, 0.2)" />
                            <stop offset="100%" stopColor="rgba(220, 38, 38, 0)" />
                        </linearGradient>
                    </defs>
                    <path
                        d={`M ${padding},${height} L ${points} L ${width - padding},${height} Z`}
                        fill="url(#chartGradient)"
                    />
                    <polyline
                        fill="none"
                        stroke="#DC2626"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        points={points}
                    />
                    {data.map((val, i) => {
                        const x = (i / (data.length - 1)) * (width - padding * 2) + padding;
                        const y = height - ((val - min) / range) * (height - padding * 2) - padding;
                        return (
                            <g key={i} className={styles.chartPoint}>
                                <circle cx={x} cy={y} r="4" fill="#DC2626" />
                                <text x={x} y={y - 10} textAnchor="middle" fontSize="10" fill="#94a3b8">{val}</text>
                                <text x={x} y={height - 2} textAnchor="middle" fontSize="8" fill="#475569">{labels[i]}</text>
                            </g>
                        );
                    })}
                </svg>
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
                                            <span className={styles.userEmail}>{member.phone || 'Pas de téléphone'}</span>
                                        </div>
                                    </div>
                                </td>
                                <td className={styles.td}>
                                    <span className={`${styles.badge} ${styles.badgeArea}`}>
                                        {member.Area?.name || 'N/A'}
                                    </span>
                                </td>
                                <td className={styles.td}>
                                    {member.Leader ? `${member.Leader.first_name} ${member.Leader.last_name}` : 'N/A'}
                                </td>
                                <td className={styles.td}>
                                    <span className={`${styles.badge} ${member.status === 'active' ? styles.badgeActive : styles.badgeInactive}`}>
                                        {member.status === 'active' ? 'Actif' : 'Inactif'}
                                    </span>
                                </td>
                                <td className={styles.td}>
                                    <div className={styles.actions}>
                                        <button className={styles.actionBtn} title="Appeler">
                                            <Phone size={18} />
                                        </button>
                                        <button className={styles.actionBtn} title="Détails">
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

    const renderReports = () => (
        <div className={styles.section}>
            <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>Rapports & Analyses</h2>
                <div className={styles.headerActions} style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <div className={styles.formGroup} style={{ marginBottom: 0 }}>
                        <label className={styles.label} style={{ fontSize: '0.7rem' }}>Du</label>
                        <input
                            type="date"
                            className={styles.input}
                            style={{ padding: '0.4rem' }}
                            value={reportFilters.startDate}
                            onChange={e => setReportFilters({ ...reportFilters, startDate: e.target.value })}
                        />
                    </div>
                    <div className={styles.formGroup} style={{ marginBottom: 0 }}>
                        <label className={styles.label} style={{ fontSize: '0.7rem' }}>Au</label>
                        <input
                            type="date"
                            className={styles.input}
                            style={{ padding: '0.4rem' }}
                            value={reportFilters.endDate}
                            onChange={e => setReportFilters({ ...reportFilters, endDate: e.target.value })}
                        />
                    </div>
                    <div className={styles.formGroup} style={{ marginBottom: 0 }}>
                        <label className={styles.label} style={{ fontSize: '0.7rem' }}>Grouper par</label>
                        <select
                            className={styles.select}
                            style={{ padding: '0.4rem' }}
                            value={reportFilters.groupBy}
                            onChange={e => setReportFilters({ ...reportFilters, groupBy: e.target.value })}
                        >
                            <option value="area">Zone</option>
                            <option value="leader">Leader</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className={styles.reportsGrid}>
                <div className={styles.reportCard} onClick={generateAttendancePDF}>
                    <div className={styles.reportIcon} style={{ background: 'rgba(220, 38, 38, 0.1)', color: '#DC2626' }}>
                        <Calendar size={32} />
                    </div>
                    <h3 className={styles.reportTitle}>Rapport de Présence</h3>
                    <p className={styles.reportDesc}>Analyse détaillée de la présence hebdomadaire par zone et par leader.</p>
                    <button className={styles.primaryBtn} style={{ marginTop: 'auto', width: '100%' }}>
                        <Download size={18} /> Générer PDF
                    </button>
                </div>
                <div className={styles.reportCard}>
                    <div className={styles.reportIcon} style={{ background: 'rgba(124, 58, 237, 0.1)', color: '#7c3aed' }}>
                        <TrendingUp size={32} />
                    </div>
                    <h3 className={styles.reportTitle}>Croissance des Membres</h3>
                    <p className={styles.reportDesc}>Suivi de l'évolution du nombre de membres et des nouveaux convertis.</p>
                    <button className={styles.primaryBtn} style={{ marginTop: 'auto', width: '100%' }} disabled>
                        <Download size={18} /> Bientôt
                    </button>
                </div>
                <div className={styles.reportCard}>
                    <div className={styles.reportIcon} style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
                        <Phone size={32} />
                    </div>
                    <h3 className={styles.reportTitle}>Suivi des Appels</h3>
                    <p className={styles.reportDesc}>Statistiques sur les appels de suivi effectués par les leaders.</p>
                    <button className={styles.primaryBtn} style={{ marginTop: 'auto', width: '100%' }} disabled>
                        <Download size={18} /> Bientôt
                    </button>
                </div>
            </div>

            <div className={styles.tableContainer} style={{ marginTop: '2rem' }}>
                <div className={styles.sectionHeader} style={{ padding: '1rem' }}>
                    <h3 className={styles.sectionTitle} style={{ fontSize: '1.1rem' }}>Données du Rapport</h3>
                </div>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th className={styles.th}>{reportFilters.groupBy === 'area' ? 'Zone' : 'Leader'}</th>
                            {reportFilters.groupBy === 'leader' && <th className={styles.th}>Zone</th>}
                            <th className={styles.th}>Total Membres</th>
                            <th className={styles.th}>Présents</th>
                            <th className={styles.th}>Taux %</th>
                        </tr>
                    </thead>
                    <tbody>
                        {attendanceReportData.length > 0 ? (
                            attendanceReportData.map((item, idx) => (
                                <tr key={idx} className={styles.tr}>
                                    <td className={styles.td}>
                                        {reportFilters.groupBy === 'area'
                                            ? item.area_name
                                            : `${item.leader_first_name} ${item.leader_last_name}`}
                                    </td>
                                    {reportFilters.groupBy === 'leader' && <td className={styles.td}>{item.area_name}</td>}
                                    <td className={styles.td}>{item.total_members}</td>
                                    <td className={styles.td}>{item.attendance_count}</td>
                                    <td className={styles.td}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <div className={styles.progressContainer} style={{ width: '60px', height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px' }}>
                                                <div
                                                    className={styles.progressBar}
                                                    style={{
                                                        width: `${item.attendance_rate}%`,
                                                        height: '100%',
                                                        background: item.attendance_rate > 70 ? '#10b981' : item.attendance_rate > 40 ? '#f59e0b' : '#ef4444',
                                                        borderRadius: '3px'
                                                    }}
                                                />
                                            </div>
                                            <span>{item.attendance_rate}%</span>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={5} className={styles.td} style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                                    Aucune donnée disponible pour cette période.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );

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
                <div className={styles.modalOverlay} onClick={() => setShowLeaderModal(false)}>
                    <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h2 className={styles.modalTitle}>{editingItem ? 'Modifier Leader' : 'Nouveau Leader'}</h2>
                            <button className={styles.closeBtn} onClick={() => setShowLeaderModal(false)}><X size={20} /></button>
                        </div>
                        <form onSubmit={handleSaveLeader}>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Prénom</label>
                                <input
                                    className={styles.input}
                                    value={leaderForm.first_name}
                                    onChange={e => setLeaderForm({ ...leaderForm, first_name: e.target.value })}
                                    required
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Nom</label>
                                <input
                                    className={styles.input}
                                    value={leaderForm.last_name}
                                    onChange={e => setLeaderForm({ ...leaderForm, last_name: e.target.value })}
                                    required
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Email</label>
                                <input
                                    type="email"
                                    className={styles.input}
                                    value={leaderForm.email}
                                    onChange={e => setLeaderForm({ ...leaderForm, email: e.target.value })}
                                    required
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Téléphone</label>
                                <input
                                    className={styles.input}
                                    value={leaderForm.phone}
                                    onChange={e => setLeaderForm({ ...leaderForm, phone: e.target.value })}
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Zone</label>
                                <select
                                    className={styles.select}
                                    value={leaderForm.area_id}
                                    onChange={e => setLeaderForm({ ...leaderForm, area_id: e.target.value })}
                                    required
                                >
                                    <option value="">Sélectionner une zone</option>
                                    {areas.map(area => (
                                        <option key={area.id} value={area.id}>{area.name} (N°{area.number})</option>
                                    ))}
                                </select>
                            </div>
                            {!editingItem && (
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Mot de passe</label>
                                    <input
                                        type="password"
                                        className={styles.input}
                                        value={leaderForm.password}
                                        onChange={e => setLeaderForm({ ...leaderForm, password: e.target.value })}
                                        required
                                    />
                                </div>
                            )}
                            <div className={styles.modalActions}>
                                <button type="button" className={styles.cancelBtn} onClick={() => setShowLeaderModal(false)}>Annuler</button>
                                <button type="submit" className={styles.submitBtn}>Enregistrer</button>
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
        </div>
    );
};

export default Governor;
