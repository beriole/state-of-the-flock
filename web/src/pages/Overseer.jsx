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
    LogOut,
    Edit2,
    UserPlus,
    Shield,
    X,
    Repeat,
    UserCheck
} from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    dashboardAPI,
    areaAPI,
    memberAPI,
    reportAPI,
    overseeAPI,
    governorAPI,
    getPhotoUrl
} from '../utils/api';
import styles from './Bishop.module.css';

const Overseer = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [searchParams, setSearchParams] = useSearchParams();
    const activeTab = searchParams.get('tab') || 'dashboard';

    const [overseeData, setOverseeData] = useState(null);
    const [areas, setAreas] = useState([]);
    const [stats, setStats] = useState(null);
    
    // Data states
    const [members, setMembers] = useState([]);
    const [staffList, setStaffList] = useState([]);
    
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    
    const [memberFilters, setMemberFilters] = useState({
        search: '',
        area: 'all',
        status: 'all'
    });

    // Modals state
    const [showMemberModal, setShowMemberModal] = useState(false);
    const [showAreaModal, setShowAreaModal] = useState(false);
    const [showTransferModal, setShowTransferModal] = useState(false);
    
    const [selectedArea, setSelectedArea] = useState(null);
    const [selectedMember, setSelectedMember] = useState(null);
    
    // Forms state
    const [memberForm, setMemberForm] = useState({
        first_name: '', last_name: '', phone_primary: '', email: '', area_id: ''
    });
    const [areaForm, setAreaForm] = useState({ name: '', number: '' });
    const [transferForm, setTransferForm] = useState({ new_area_id: '' });

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
                            area_id: areaIds.join(',') 
                        });
                        setMembers(membersRes.data.members || []);
                    }
                } else if (activeTab === 'staff') {
                    // Fetch governors and bacenta leaders
                    Promise.all([
                        governorAPI.getUsers({ role: 'Governor' }),
                        governorAPI.getUsers({ role: 'Bacenta_Leader' })
                    ]).then(([govRes, bacentasRes]) => {
                        setStaffList([...(govRes.data.users || []), ...(bacentasRes.data.users || [])]);
                    }).catch(err => console.error("Error fetching staff:", err));
                }
            }
        } catch (error) {
            console.error("Error fetching oversee data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) fetchOverseeContext();
    }, [user, activeTab]);

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

    const handleCreateMember = async (e) => {
        e.preventDefault();
        setActionLoading(true);
        try {
            await memberAPI.createMember(memberForm);
            setShowMemberModal(false);
            setMemberForm({ first_name: '', last_name: '', phone_primary: '', email: '', area_id: '' });
            fetchOverseeContext();
        } catch (error) {
            console.error("Error creating member", error);
            alert("Erreur lors de la création du membre.");
        } finally {
            setActionLoading(false);
        }
    };

    const handleUpdateArea = async (e) => {
        e.preventDefault();
        if (!selectedArea) return;
        setActionLoading(true);
        try {
            await areaAPI.updateArea(selectedArea.id, areaForm);
            setShowAreaModal(false);
            setSelectedArea(null);
            fetchOverseeContext();
        } catch (error) {
            console.error("Error updating area", error);
            alert("Erreur lors de la modification de la zone.");
        } finally {
            setActionLoading(false);
        }
    };

    const handleTransferMember = async (e) => {
        e.preventDefault();
        if (!selectedMember || !transferForm.new_area_id) return;
        setActionLoading(true);
        try {
            await memberAPI.updateMember(selectedMember.id, { area_id: transferForm.new_area_id });
            setShowTransferModal(false);
            setSelectedMember(null);
            fetchOverseeContext();
        } catch (error) {
            console.error("Error transferring member: ", error);
            alert("Erreur lors du transfert du membre.");
        } finally {
            setActionLoading(false);
        }
    };

    // Filter members locally
    const filteredMembers = members.filter(member => {
        if (memberFilters.search && !`${member.first_name} ${member.last_name}`.toLowerCase().includes(memberFilters.search.toLowerCase())) return false;
        if (memberFilters.area !== 'all' && member.area_id !== memberFilters.area) return false;
        if (memberFilters.status !== 'all') {
            const isActive = memberFilters.status === 'active';
            if (member.is_active !== isActive) return false;
        }
        return true;
    });

    const renderHeader = () => (
        <header className={styles.header}>
            <div>
                <h1 className={styles.title}>Espace Overseer Prémium</h1>
                <p style={{ color: '#94a3b8', marginTop: '0.5rem', fontWeight: 500, fontSize: '1.1rem' }}>
                    {overseeData ? `Responsable du Groupe : ${overseeData.name}` : 'Supervision Principale'}
                </p>
            </div>
            <div className={styles.headerActions}>
                <button className={styles.primaryBtn} onClick={() => setShowMemberModal(true)}>
                    <UserPlus size={18} /> Ajouter Membre
                </button>
            </div>
        </header>
    );

    const renderDashboard = () => (
        <div className={styles.section}>
            <div className={styles.statsGrid}>
                {/* Stats cards unchanged */}
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
                        <p className={styles.statLabel}>Zones Officielles</p>
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
                        <p className={styles.statLabel}>Présence Globale Actuelle</p>
                    </div>
                </div>
            </div>

            <div className={styles.dashboardLayout}>
                <div className={styles.mainColumn}>
                    <div className={styles.sectionHeader}>
                        <h2 className={styles.sectionTitle}>Aperçu de vos Secteurs</h2>
                        <button className={styles.actionBtn} onClick={() => setActiveTab('areas')}>Gérer</button>
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
                                            {area.leader_user ? (
                                                <span className={styles.userIdentity}>
                                                    <Shield size={14} style={{ display: 'inline', marginRight: 4, color: '#f59e0b'}} />
                                                    {area.leader_user.first_name} {area.leader_user.last_name}
                                                </span>
                                            ) : (
                                                <span style={{ color: '#64748b' }}>Non assigné</span>
                                            )}
                                        </td>
                                        <td className={styles.td} style={{ textAlign: 'right' }}>
                                            <button className={styles.actionBtn} onClick={() => {
                                                setSelectedArea(area);
                                                setAreaForm({ name: area.name, number: area.number });
                                                setShowAreaModal(true);
                                            }}>
                                                <Edit2 size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderAreas = () => (
        <div className={styles.section}>
            <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>Gestion Administrative des Zones</h2>
            </div>
            <div className={styles.tableContainer}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th className={styles.th}>Détail de la Zone</th>
                            <th className={styles.th}>Numéro</th>
                            <th className={styles.th}>Status Leader</th>
                            <th className={styles.th} style={{ textAlign: 'right' }}>Gestion</th>
                        </tr>
                    </thead>
                    <tbody>
                        {areas.map(area => (
                            <tr key={area.id} className={styles.tr}>
                                <td className={styles.td}>
                                    <div className={styles.userName}>{area.name}</div>
                                </td>
                                <td className={styles.td}>
                                    <span className={styles.badge} style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', border: '1px solid rgba(59, 130, 246, 0.3)' }}>N° {area.number}</span>
                                </td>
                                <td className={styles.td}>
                                    <span className={area.leader_user ? styles.badgeActive : styles.badgeInactive}>
                                        {area.leader_user ? 'Leader Assigné' : 'En Attente'}
                                    </span>
                                </td>
                                <td className={styles.td} style={{ textAlign: 'right' }}>
                                    <button className={styles.actionBtn} title="Modifier la zone" onClick={() => {
                                        setSelectedArea(area);
                                        setAreaForm({ name: area.name, number: area.number });
                                        setShowAreaModal(true);
                                    }}>
                                        <Edit2 size={18} /> Éditer
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
                <h2 className={styles.sectionTitle}>Répertoire des Membres ({filteredMembers.length})</h2>
            </div>
            
            <div className={styles.filtersBar} style={{ marginBottom: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <div className={styles.searchBox} style={{ width: '250px' }}>
                    <Search size={18} />
                    <input 
                        type="text" 
                        placeholder="Chercher un nom..." 
                        value={memberFilters.search}
                        onChange={(e) => setMemberFilters({...memberFilters, search: e.target.value})}
                    />
                </div>
                <select className={styles.select} style={{ width: '200px' }} value={memberFilters.area} onChange={(e) => setMemberFilters({...memberFilters, area: e.target.value})}>
                    <option value="all">Toutes les Zones</option>
                    {areas.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                </select>
                <select className={styles.select} style={{ width: '200px' }} value={memberFilters.status} onChange={(e) => setMemberFilters({...memberFilters, status: e.target.value})}>
                    <option value="all">Tous les Statuts</option>
                    <option value="active">Actifs (Fidèles)</option>
                    <option value="inactive">Inactifs / Départs</option>
                </select>
            </div>

            <div className={styles.tableContainer}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th className={styles.th}>Identité</th>
                            <th className={styles.th}>Zone Affectée</th>
                            <th className={styles.th}>Statut Actif</th>
                            <th className={styles.th} style={{ textAlign: 'right' }}>Actions Rapides / Détails</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredMembers.length > 0 ? filteredMembers.map(member => (
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
                                            <span className={styles.userEmail}>{member.phone_primary || 'Pas de numéro'}</span>
                                        </div>
                                    </div>
                                </td>
                                <td className={styles.td}>
                                    <span className={styles.badgeArea}>{member.area?.name || 'Aucune'}</span>
                                </td>
                                <td className={styles.td}>
                                    <span className={member.is_active ? styles.badgeActive : styles.badgeInactive}>
                                        {member.is_active ? 'Fidèle' : 'Inactif'}
                                    </span>
                                </td>
                                <td className={styles.td} style={{ textAlign: 'right', display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', alignItems: 'center' }}>
                                    
                                    <button className={styles.actionBtn} onClick={() => {
                                        setSelectedMember(member);
                                        setTransferForm({ new_area_id: member.area_id || '' });
                                        setShowTransferModal(true);
                                    }} title="Transférer vers une autre zone" style={{ color: '#3b82f6', background: 'rgba(59, 130, 246, 0.1)' }}>
                                        <Repeat size={16} /> Transférer
                                    </button>
                                    
                                    <button className={styles.actionBtn} onClick={() => navigate(`/members/${member.id}`)}>
                                        Consulter <ChevronRight size={18} style={{ display: 'inline', verticalAlign: 'middle'}}/>
                                    </button>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="4" className={styles.td} style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                                    <p style={{ marginBottom: '1rem' }}>Pas de membres correspondant aux critères.</p>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );

    const renderStaff = () => (
        <div className={styles.section}>
            <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>Hiérarchie du Regroupement (Governors & Leaders)</h2>
            </div>
            
            <div className={styles.tableContainer}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th className={styles.th}>Identité</th>
                            <th className={styles.th}>Rôle (Titre)</th>
                            <th className={styles.th}>Statut Actif</th>
                        </tr>
                    </thead>
                    <tbody>
                        {staffList.length > 0 ? staffList.map(item => (
                            <tr key={item.id} className={styles.tr}>
                                <td className={styles.td}>
                                    <div className={styles.userCell}>
                                        <div className={styles.avatar} style={{ background: item.role === 'Governor' ? 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)' : '' }}>
                                            {item.photo_url ? (
                                                <img src={getPhotoUrl(item.photo_url)} alt="Profile" className={styles.avatarImage} />
                                            ) : (
                                                <>{item.first_name[0]}{item.last_name[0]}</>
                                            )}
                                        </div>
                                        <div>
                                            <span className={styles.userName}>{item.first_name} {item.last_name}</span>
                                            <span className={styles.userEmail}>{item.email}</span>
                                        </div>
                                    </div>
                                </td>
                                <td className={styles.td}>
                                    <span className={styles.badgeArea} style={{ background: item.role === 'Governor' ? 'rgba(139, 92, 246, 0.1)' : 'rgba(59, 130, 246, 0.1)', color: item.role === 'Governor' ? '#a78bfa' : '#60a5fa', borderColor: item.role === 'Governor' ? 'rgba(139, 92, 246, 0.2)' : 'rgba(59, 130, 246, 0.2)' }}>
                                        {item.role.replace('_', ' ')}
                                    </span>
                                </td>
                                <td className={styles.td}>
                                    <span className={item.is_active ? styles.badgeActive : styles.badgeInactive}>
                                        {item.is_active ? 'Actif' : 'Inactif'}
                                    </span>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="3" className={styles.td} style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                                    Aucun membre du staff trouvé.
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
                    <Loader2 className={styles.spinnerSmall} style={{ width: 48, height: 48, color: '#DC2626', animation: 'spin 1s linear infinite' }} />
                    <p style={{ marginTop: '1rem', color: '#94a3b8' }}>Génération sécurisée des rapports et courbes...</p>
                </div>
            );
        }

        const attendance = reports.attendance;
        const meetings = reports.meetings;

        return (
            <div className={styles.section}>
                <div className={styles.sectionHeader}>
                    <h2 className={styles.sectionTitle}>Rapports de Performance & Évolution</h2>
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
                            <p className={styles.statLabel}>Indice de Présence</p>
                        </div>
                    </div>
                </div>
                
                <div className={styles.chartContainer} style={{ marginTop: '2rem' }}>
                    <div className={styles.chartHeader}>
                        <h3 className={styles.chartTitle}>Rapports consolidés par Zone affiliée</h3>
                    </div>
                    {/* Placeholder for comprehensive reports similar to Bishop */}
                    <div className={styles.tableContainer}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th className={styles.th}>Zone</th>
                                    <th className={styles.th}>Evolution (Indice)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {attendance?.by_area?.length > 0 ? attendance.by_area.map((item, idx) => (
                                    <tr key={idx} className={styles.tr}>
                                        <td className={styles.td}>{item.name}</td>
                                        <td className={styles.td}>
                                            <span style={{ color: item.percentage > 70 ? '#10b981' : '#f59e0b', fontWeight: 700 }}>
                                                {item.percentage}% des fidèles
                                            </span>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr><td colSpan="2" className={styles.td} style={{ opacity: 0.5 }}>Aucun rapport disponible.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#0f172a', color: 'white' }}>
                <Loader2 style={{ width: 64, height: 64, marginBottom: '1.5rem', color: '#DC2626', animation: 'spin 1s linear infinite' }} />
                <h2 style={{ color: 'white', fontWeight: 700 }}>Initialisation de l'Espace Overseer...</h2>
                <p style={{ opacity: 0.6, marginTop: '0.5rem' }}>Synchronisation des droits administratifs</p>
            </div>
        );
    }

    if (!overseeData) {
        return (
            <div className={styles.container}>
                {renderHeader()}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '6.5rem 2rem', background: 'rgba(255,255,255,0.02)', borderRadius: '2rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <Shield size={64} style={{ marginBottom: '2rem', opacity: 0.2, color: '#f59e0b' }} />
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>Espace Restreint</h2>
                    <p style={{ color: '#94a3b8', textAlign: 'center', maxWidth: '400px', marginBottom: '2.5rem' }}>
                        Vos droits d'Overseer ne sont pas encore liés à un regroupement fonctionnel. Veuillez contacter l'administration.
                    </p>
                    <button className={styles.primaryBtn} onClick={() => navigate('/')}>
                        <ArrowLeft size={18} /> Retour au Portail
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            {renderHeader()}

            <div className={styles.tabs}>
                <button className={`${styles.tab} ${activeTab === 'dashboard' ? styles.tabActive : ''}`} onClick={() => setActiveTab('dashboard')}>
                    <LayoutDashboard size={18} /> Tableau de bord
                </button>
                <button className={`${styles.tab} ${activeTab === 'areas' ? styles.tabActive : ''}`} onClick={() => setActiveTab('areas')}>
                    <Globe size={18} /> Administration Zones
                </button>
                <button className={`${styles.tab} ${activeTab === 'members' ? styles.tabActive : ''}`} onClick={() => setActiveTab('members')}>
                    <Users size={18} /> Registre Membres
                </button>
                <button className={`${styles.tab} ${activeTab === 'staff' ? styles.tabActive : ''}`} onClick={() => setActiveTab('staff')}>
                    <UserCheck size={18} /> Staff & Hiérarchie
                </button>
                <button className={`${styles.tab} ${activeTab === 'reports' ? styles.tabActive : ''}`} onClick={() => setActiveTab('reports')}>
                    <FileBarChart size={18} /> Évolution
                </button>
            </div>

            <div className={styles.content}>
                {activeTab === 'dashboard' && renderDashboard()}
                {activeTab === 'areas' && renderAreas()}
                {activeTab === 'members' && renderMembers()}
                {activeTab === 'staff' && renderStaff()}
                {activeTab === 'reports' && renderReports()}
            </div>

            {/* Modal: Transfer Member */}
            {showTransferModal && selectedMember && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContent} style={{ maxWidth: '500px' }}>
                        <div className={styles.modalHeaderPremium}>
                            <h2 className={styles.modalTitle} style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Repeat size={24} /> Transférer {selectedMember.first_name}
                            </h2>
                            <button className={styles.closeBtn} onClick={() => setShowTransferModal(false)}>
                                <X size={20} />
                            </button>
                        </div>
                        <div style={{ padding: '2rem' }}>
                            <p style={{ color: '#94a3b8', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                                Vous pouvez affecter ce membre à une autre zone qui dépend de votre juridiction.
                            </p>
                            <form onSubmit={handleTransferMember}>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Nouvelle Zone Affectée</label>
                                    <select required className={styles.select} value={transferForm.new_area_id} onChange={e => setTransferForm({...transferForm, new_area_id: e.target.value})}>
                                        <option value="">Sélectionner une zone d'arrivée</option>
                                        {areas.map(a => <option key={a.id} value={a.id}>{a.name} (N° {a.number})</option>)}
                                    </select>
                                </div>
                                <button type="submit" disabled={actionLoading} className={styles.primaryBtn} style={{ width: '100%', justifyContent: 'center', marginTop: '1rem', background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' }}>
                                    {actionLoading ? <Loader2 className={styles.spinnerSmall} /> : 'Valider le Transfert'}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Member Modal (Unchanged structurally, kept functional) */}
            {showMemberModal && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContent} style={{ maxWidth: '500px' }}>
                        <div className={styles.modalHeaderPremium}>
                            <h2 className={styles.modalTitle} style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <UserPlus size={24} /> Enregistrer un Membre
                            </h2>
                            <button className={styles.closeBtn} onClick={() => setShowMemberModal(false)}>
                                <X size={20} />
                            </button>
                        </div>
                        <div style={{ padding: '2rem' }}>
                            <form onSubmit={handleCreateMember}>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Prénom</label>
                                    <input required className={styles.input} value={memberForm.first_name} onChange={e => setMemberForm({...memberForm, first_name: e.target.value})} placeholder="Entrez le prénom" />
                                </div>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Nom de famille</label>
                                    <input required className={styles.input} value={memberForm.last_name} onChange={e => setMemberForm({...memberForm, last_name: e.target.value})} placeholder="Entrez le nom" />
                                </div>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Téléphone</label>
                                    <input className={styles.input} value={memberForm.phone_primary} onChange={e => setMemberForm({...memberForm, phone_primary: e.target.value})} placeholder="+225..." />
                                </div>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Affecter à une Zone</label>
                                    <select required className={styles.select} value={memberForm.area_id} onChange={e => setMemberForm({...memberForm, area_id: e.target.value})}>
                                        <option value="">Sélectionner une zone</option>
                                        {areas.map(a => <option key={a.id} value={a.id}>{a.name} (N° {a.number})</option>)}
                                    </select>
                                </div>
                                <button type="submit" disabled={actionLoading} className={styles.primaryBtn} style={{ width: '100%', justifyContent: 'center', marginTop: '1rem' }}>
                                    {actionLoading ? <Loader2 className={styles.spinnerSmall} /> : 'Valider la création'}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Area Modal (Unchanged structurally, kept functional) */}
            {showAreaModal && selectedArea && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContent} style={{ maxWidth: '500px' }}>
                        <div className={styles.modalHeaderPremium}>
                            <h2 className={styles.modalTitle} style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Edit2 size={24} /> Sécuriser la Zone
                            </h2>
                            <button className={styles.closeBtn} onClick={() => setShowAreaModal(false)}>
                                <X size={20} />
                            </button>
                        </div>
                        <div style={{ padding: '2rem' }}>
                            <form onSubmit={handleUpdateArea}>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Nom Officiel de la Zone</label>
                                    <input required className={styles.input} value={areaForm.name} onChange={e => setAreaForm({...areaForm, name: e.target.value})} />
                                </div>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Numérotation Structurale</label>
                                    <input required type="number" className={styles.input} value={areaForm.number} onChange={e => setAreaForm({...areaForm, number: e.target.value})} />
                                </div>
                                
                                <button type="submit" disabled={actionLoading} className={styles.primaryBtn} style={{ width: '100%', justifyContent: 'center', marginTop: '1rem' }}>
                                    {actionLoading ? <Loader2 className={styles.spinnerSmall} /> : 'Enregistrer les modifications'}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Overseer;
