import React, { useState, useEffect } from 'react';
import {
    LayoutDashboard,
    Users,
    Map,
    Globe,
    FileBarChart,
    ChevronRight,
    Search,
    Phone,
    Loader2,
    Calendar,
    ArrowLeft,
    Plus,
    Filter,
    LogOut
} from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    dashboardAPI,
    areaAPI,
    memberAPI,
    reportAPI,
    overseeAPI,
    getPhotoUrl
} from '../utils/api';
import styles from './Bishop.module.css'; // Reusing Bishop styles for consistency

const Overseer = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [searchParams, setSearchParams] = useSearchParams();
    const activeTab = searchParams.get('tab') || 'dashboard';

    const [overseeData, setOverseeData] = useState(null);
    const [areas, setAreas] = useState([]);
    const [stats, setStats] = useState(null);
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [memberFilters, setMemberFilters] = useState({
        search: '',
        page: 1,
        limit: 50
    });

    // Report State
    const [reports, setReports] = useState({
        attendance: null,
        meetings: [],
        calls: null
    });
    const [reportLoading, setReportLoading] = useState(false);

    const setActiveTab = (tab) => {
        setSearchParams({ tab });
    };

    // Load initial context
    useEffect(() => {
        const fetchOverseeContext = async () => {
            setLoading(true);
            try {
                let currentOversee = user?.managed_oversee;

                if (!currentOversee) {
                    const res = await overseeAPI.getOversees();
                    currentOversee = res.data.find(o => o.overseer_id === user?.id);
                }

                if (currentOversee) {
                    setOverseeData(currentOversee);
                    setAreas(currentOversee.areas || []);
                    
                    const areaIds = currentOversee.areas?.map(a => a.id) || [];

                    if (activeTab === 'dashboard') {
                        const statsRes = await dashboardAPI.getGlobalStats(); 
                        setStats(statsRes.data);
                    } else if (activeTab === 'members') {
                        if (areaIds.length > 0) {
                            const membersRes = await memberAPI.getMembers({ 
                                area_id: areaIds.join(','),
                                ...memberFilters 
                            });
                            setMembers(membersRes.data.members || []);
                        }
                    }
                }
            } catch (error) {
                console.error("Error fetching oversee data:", error);
            } finally {
                setLoading(false);
            }
        };

        if (user) fetchOverseeContext();
    }, [user, activeTab, memberFilters]);

    // Load reports when tab is active
    useEffect(() => {
        const fetchReportData = async () => {
            if (activeTab !== 'reports' || !overseeData) return;
            setReportLoading(true);
            try {
                const [attRes, meetRes] = await Promise.all([
                    reportAPI.getAttendanceReport(),
                    reportAPI.getBacentaReport()
                ]);
                setReports({
                    attendance: attRes.data,
                    meetings: meetRes.data.meetings || [],
                    calls: null
                });
            } catch (error) {
                console.error("Error fetching report data:", error);
            } finally {
                setReportLoading(false);
            }
        };

        fetchReportData();
    }, [activeTab, overseeData]);

    const renderHeader = () => (
        <header className={styles.header}>
            <div>
                <h1 className={styles.title}>Espace Overseer</h1>
                <p style={{ color: '#94a3b8', marginTop: '0.5rem', fontWeight: 500 }}>
                    {overseeData ? `Groupe : ${overseeData.name}` : 'Supervision de Zone'}
                </p>
            </div>
        </header>
    );

    const renderDashboard = () => (
        <div className={styles.section}>
            <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                    <div className={styles.statHeader}>
                        <div className={styles.statIcon} style={{ background: 'rgba(220, 38, 38, 0.1)', color: '#DC2626' }}>
                            <Users size={24} />
                        </div>
                    </div>
                    <div>
                        <h3 className={styles.statValue}>{stats?.summary?.total_members || 0}</h3>
                        <p className={styles.statLabel}>Membres supervisés</p>
                    </div>
                </div>

                <div className={styles.statCard}>
                    <div className={styles.statHeader}>
                        <div className={styles.statIcon} style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}>
                            <Globe size={24} />
                        </div>
                    </div>
                    <div>
                        <h3 className={styles.statValue}>{areas.length || 0}</h3>
                        <p className={styles.statLabel}>Zones (Areas)</p>
                    </div>
                </div>

                <div className={styles.statCard}>
                    <div className={styles.statHeader}>
                        <div className={styles.statIcon} style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
                            <FileBarChart size={24} />
                        </div>
                    </div>
                    <div>
                        <h3 className={styles.statValue}>{stats?.summary?.last_attendance_percentage || 0}%</h3>
                        <p className={styles.statLabel}>Présence Dimanche Dernier</p>
                    </div>
                </div>

                <div className={styles.statCard}>
                    <div className={styles.statHeader}>
                        <div className={styles.statIcon} style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}>
                            <Phone size={24} />
                        </div>
                    </div>
                    <div>
                        <h3 className={styles.statValue}>{stats?.summary?.pending_follow_ups || 0}</h3>
                        <p className={styles.statLabel}>Suivis en attente</p>
                    </div>
                </div>
            </div>

            <div className={styles.dashboardLayout}>
                <div className={styles.mainColumn}>
                    <div className={styles.section}>
                        <div className={styles.sectionHeader}>
                            <h2 className={styles.sectionTitle}>Mes Secteurs</h2>
                            <button className={styles.actionBtn} onClick={() => setActiveTab('areas')}>Voir tout</button>
                        </div>
                        <div className={styles.tableContainer}>
                            <table className={styles.table}>
                                <thead>
                                    <tr>
                                        <th className={styles.th}>Zone</th>
                                        <th className={styles.th}>Responsable</th>
                                        <th className={styles.th} style={{ textAlign: 'right' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {areas.slice(0, 5).map(area => (
                                        <tr key={area.id} className={styles.tr}>
                                            <td className={styles.td}>
                                                <div className={styles.userName}>{area.name}</div>
                                                <div className={styles.userRole}>Secteur N° {area.number}</div>
                                            </td>
                                            <td className={styles.td}>
                                                {area.leader_user ? `${area.leader_user.first_name} ${area.leader_user.last_name}` : 'Non assigné'}
                                            </td>
                                            <td className={styles.td} style={{ textAlign: 'right' }}>
                                                <button className={styles.actionBtn} onClick={() => setActiveTab('members')}>
                                                    <ChevronRight size={18} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <div className={styles.sideColumn}>
                    <div className={styles.activityCard}>
                        <h3 className={styles.activityTitle}>Actions Rapides</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <button className={styles.primaryBtn} style={{ width: '100%' }} onClick={() => setActiveTab('members')}>
                                <Users size={18} /> Gérer les Membres
                            </button>
                            <button className={styles.primaryBtn} style={{ width: '100%', background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid rgba(255,255,255,0.1)' }} onClick={() => setActiveTab('reports')}>
                                <FileBarChart size={18} /> Voir Rapports
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderAreas = () => (
        <div className={styles.section}>
            <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>Liste des Zones Supervisées</h2>
            </div>
            <div className={styles.tableContainer}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th className={styles.th}>Nom de la Zone</th>
                            <th className={styles.th}>Numéro</th>
                            <th className={styles.th}>Région</th>
                            <th className={styles.th} style={{ textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {areas.map(area => (
                            <tr key={area.id} className={styles.tr}>
                                <td className={styles.td}>
                                    <div className={styles.userName}>{area.name}</div>
                                </td>
                                <td className={styles.td}>
                                    <span className={styles.badge} style={{ background: 'rgba(255,255,255,0.05)' }}>N° {area.number}</span>
                                </td>
                                <td className={styles.td}>
                                    <span className={styles.userRole}>{area.region?.name || 'N/A'}</span>
                                </td>
                                <td className={styles.td} style={{ textAlign: 'right' }}>
                                    <button className={styles.actionBtn} onClick={() => {
                                        setActiveTab('members');
                                    }}>
                                        Voir les membres
                                    </button>
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
                <h2 className={styles.sectionTitle}>Membres de votre Regroupement</h2>
                <div className={styles.searchBox}>
                    <Search size={18} />
                    <input 
                        type="text" 
                        placeholder="Rechercher un membre..." 
                        value={memberFilters.search}
                        onChange={(e) => setMemberFilters({...memberFilters, search: e.target.value})}
                    />
                </div>
            </div>

            <div className={styles.tableContainer}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th className={styles.th}>Membre</th>
                            <th className={styles.th}>Zone</th>
                            <th className={styles.th}>Statut</th>
                            <th className={styles.th} style={{ textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {members.length > 0 ? members.map(member => (
                            <tr key={member.id} className={styles.tr}>
                                <td className={styles.td}>
                                    <div className={styles.userCell}>
                                        <div className={styles.avatar}>
                                            {member.photo_url ? (
                                                <img src={getPhotoUrl(member.photo_url)} alt="Profile" className={styles.avatarImage} />
                                            ) : (
                                                <>{member.first_name[0]}{member.last_name[0]}</>
                                            )}
                                        </div>
                                        <div>
                                            <span className={styles.userName}>{member.first_name} {member.last_name}</span>
                                            <span className={styles.userEmail}>{member.phone_primary || 'Pas de téléphone'}</span>
                                        </div>
                                    </div>
                                </td>
                                <td className={styles.td}>
                                    <span className={styles.badgeArea}>{member.area?.name || 'N/A'}</span>
                                </td>
                                <td className={styles.td}>
                                    <span className={member.is_active ? styles.badgeActive : styles.badgeInactive}>
                                        {member.is_active ? 'Actif' : 'Inactif'}
                                    </span>
                                </td>
                                <td className={styles.td} style={{ textAlign: 'right' }}>
                                    <button className={styles.actionBtn} onClick={() => navigate(`/members/${member.id}`)}>
                                        <ChevronRight size={18} />
                                    </button>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="4" className={styles.td} style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                                    Aucun membre trouvé pour ce regroupement.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );

    const renderReports = () => {
        if (reportLoading) {
            return (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem' }}>
                    <Loader2 className={styles.spinnerSmall} style={{ width: 48, height: 48, color: '#DC2626' }} />
                    <p style={{ marginTop: '1rem', opacity: 0.5 }}>Génération des rapports...</p>
                </div>
            );
        }

        const attendance = reports.attendance;
        const meetings = reports.meetings;

        return (
            <div className={styles.section}>
                <div className={styles.sectionHeader}>
                    <h2 className={styles.sectionTitle}>Statistiques de Supervision</h2>
                </div>

                <div className={styles.statsGrid}>
                    <div className={styles.statCard}>
                        <div className={styles.statHeader}>
                            <div className={styles.statIcon} style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
                                <FileBarChart size={24} />
                            </div>
                        </div>
                        <div>
                            <h3 className={styles.statValue}>{attendance?.summary?.overall_percentage || 0}%</h3>
                            <p className={styles.statLabel}>Taux de Présence Moyen</p>
                        </div>
                    </div>
                    <div className={styles.statCard}>
                        <div className={styles.statHeader}>
                            <div className={styles.statIcon} style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}>
                                <Calendar size={24} />
                            </div>
                        </div>
                        <div>
                            <h3 className={styles.statValue}>{meetings.length}</h3>
                            <p className={styles.statLabel}>Session Bacenta Rapportées</p>
                        </div>
                    </div>
                    <div className={styles.statCard}>
                        <div className={styles.statHeader}>
                            <div className={styles.statIcon} style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}>
                                <Users size={24} />
                            </div>
                        </div>
                        <div>
                            <h3 className={styles.statValue}>{attendance?.summary?.total_members || 0}</h3>
                            <p className={styles.statLabel}>Membres dans le Périmètre</p>
                        </div>
                    </div>
                </div>

                <div className={styles.dashboardLayout}>
                    <div className={styles.mainColumn}>
                        <div className={styles.section}>
                            <div className={styles.sectionHeader}>
                                <h3 className={styles.rankingTitle}>Classement des Zones par Présence</h3>
                            </div>
                            <div className={styles.tableContainer}>
                                <table className={styles.table}>
                                    <thead>
                                        <tr>
                                            <th className={styles.th}>Zone</th>
                                            <th className={styles.th}>Membres</th>
                                            <th className={styles.th} style={{ textAlign: 'right' }}>Performance</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {attendance?.by_area?.length > 0 ? attendance.by_area.sort((a,b) => b.percentage - a.percentage).map(item => (
                                            <tr key={item.id} className={styles.tr}>
                                                <td className={styles.td}>
                                                    <div className={styles.userName}>{item.name}</div>
                                                </td>
                                                <td className={styles.td}>{item.total}</td>
                                                <td className={styles.td} style={{ textAlign: 'right' }}>
                                                    <span className={styles.statTrend} style={{ 
                                                        background: item.percentage > 70 ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', 
                                                        color: item.percentage > 70 ? '#10B981' : '#EF4444',
                                                        display: 'inline-flex',
                                                        padding: '0.25rem 0.5rem',
                                                        borderRadius: '0.5rem',
                                                        fontWeight: 700
                                                    }}>
                                                        {item.percentage}%
                                                    </span>
                                                </td>
                                            </tr>
                                        )) : (
                                            <tr>
                                                <td colSpan="3" className={styles.td} style={{ textAlign: 'center', padding: '2rem', opacity: 0.5 }}>Pas de données de présence.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    <div className={styles.sideColumn}>
                        <div className={styles.activityCard}>
                            <h3 className={styles.activityTitle}>Réunions Récentes</h3>
                            <div className={styles.activityList}>
                                {meetings.length > 0 ? meetings.slice(0, 5).map((m, i) => (
                                    <div key={i} className={styles.activityItem}>
                                        <div className={styles.activityMarker} />
                                        <div className={styles.activityContent}>
                                            <div className={styles.activityText}><strong>{m.area?.name || 'Secteur'}</strong></div>
                                            <div className={styles.activityMeta}>
                                                {new Date(m.meeting_date).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })} • {m.total_members_present} présents
                                            </div>
                                        </div>
                                    </div>
                                )) : (
                                    <p style={{ opacity: 0.5, fontSize: '0.8rem' }}>Aucune réunion récente.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#020617', color: 'white' }}>
                <Loader2 className={styles.spinnerSmall} style={{ width: 48, height: 48, marginBottom: '1rem', color: '#DC2626' }} />
                <p style={{ opacity: 0.5 }}>Chargement de l'espace Overseer...</p>
            </div>
        );
    }

    if (!overseeData) {
        return (
            <div className={styles.container}>
                {renderHeader()}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '6.5rem 2rem', background: 'rgba(255,255,255,0.02)', borderRadius: '2rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <Loader2 size={64} style={{ marginBottom: '2rem', opacity: 0.1 }} />
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>Aucun regroupement assigné</h2>
                    <p style={{ color: '#94a3b8', textAlign: 'center', maxWidth: '400px', marginBottom: '2.5rem' }}>
                        Votre compte Overseer n'est lié à aucune supervision active. Veuillez contacter l'administration.
                    </p>
                    <button className={styles.primaryBtn} onClick={() => navigate('/')}>
                        <ArrowLeft size={18} /> Retour Accueil
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            {renderHeader()}

            <div className={styles.tabs}>
                <button
                    className={`${styles.tab} ${activeTab === 'dashboard' ? styles.tabActive : ''}`}
                    onClick={() => setActiveTab('dashboard')}
                >
                    <LayoutDashboard size={18} /> Tableau de bord
                </button>
                <button
                    className={`${styles.tab} ${activeTab === 'areas' ? styles.tabActive : ''}`}
                    onClick={() => setActiveTab('areas')}
                >
                    <Globe size={18} /> Mes Zones
                </button>
                <button
                    className={`${styles.tab} ${activeTab === 'members' ? styles.tabActive : ''}`}
                    onClick={() => setActiveTab('members')}
                >
                    <Users size={18} /> Membres
                </button>
                <button
                    className={`${styles.tab} ${activeTab === 'reports' ? styles.tabActive : ''}`}
                    onClick={() => setActiveTab('reports')}
                >
                    <FileBarChart size={18} /> Rapports
                </button>
            </div>

            <div className={styles.content}>
                {activeTab === 'dashboard' && renderDashboard()}
                {activeTab === 'areas' && renderAreas()}
                {activeTab === 'members' && renderMembers()}
                {activeTab === 'reports' && renderReports()}
            </div>
        </div>
    );
};

export default Overseer;
