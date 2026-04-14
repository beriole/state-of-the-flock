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
    ArrowLeft
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

    const setActiveTab = (tab) => {
        setSearchParams({ tab });
    };

    useEffect(() => {
        const fetchOverseeContext = async () => {
            setLoading(true);
            try {
                // Fetch all oversees and find the one managed by this user
                const res = await overseeAPI.getOversees();
                const myOversee = res.data.find(o => o.overseer_id === user.id);
                
                if (myOversee) {
                    setOverseeData(myOversee);
                    // Extract areas associated with this oversee
                    setAreas(myOversee.areas || []);
                    
                    // Fetch data based on active tab
                    if (activeTab === 'dashboard') {
                        // For now we get generic stats but ideally we'd have a filtered endpoint
                        // We will filter members locally or by area_id if needed
                        const statsRes = await dashboardAPI.getGlobalStats(); 
                        setStats(statsRes.data);
                    } else if (activeTab === 'members') {
                        // Fetch members for all areas in this oversee
                        const areaIds = myOversee.areas?.map(a => a.id) || [];
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

    const renderHeader = () => (
        <header className={styles.header}>
            <div>
                <h1 className={styles.title}>Espace Overseer</h1>
                <p style={{ color: '#94a3b8', marginTop: '0.5rem' }}>
                    {overseeData ? `Groupe : ${overseeData.name}` : 'Supervision de Zone'}
                </p>
            </div>
        </header>
    );

    const renderDashboard = () => (
        <div className={styles.dashboardContainer}>
            <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                    <div className={styles.statIcon} style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}>
                        <Users size={24} />
                    </div>
                    <div>
                        <h3 className={styles.statValue}>{members.length || 0}</h3>
                        <p className={styles.statLabel}>Membres supervisés</p>
                    </div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statIcon} style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
                        <Globe size={24} />
                    </div>
                    <div>
                        <h3 className={styles.statValue}>{areas.length || 0}</h3>
                        <p className={styles.statLabel}>Zones (Areas)</p>
                    </div>
                </div>
            </div>

            <div className={styles.section} style={{ marginTop: '2rem' }}>
                <h2 className={styles.sectionTitle}>Mes Zones</h2>
                <div className={styles.tableContainer}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th className={styles.th}>Zone</th>
                                <th className={styles.th}>Nombre de Membres</th>
                                <th className={styles.th}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {areas.map(area => (
                                <tr key={area.id} className={styles.tr}>
                                    <td className={styles.td}>
                                        <div className={styles.userName}>{area.name}</div>
                                        <div className={styles.userRole}>N° {area.number}</div>
                                    </td>
                                    <td className={styles.td}>--</td>
                                    <td className={styles.td}>
                                        <button className={styles.actionBtn} onClick={() => setActiveTab('members')}>
                                            Voir membres
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );

    const renderMembers = () => (
        <div className={styles.section}>
            <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>Membres du Regroupement</h2>
                <div className={styles.searchBar}>
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
                        {members.map(member => (
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
                                            <span className={styles.userEmail}>{member.phone_primary || 'Pas de tel'}</span>
                                        </div>
                                    </div>
                                </td>
                                <td className={styles.td}>
                                    <span className={styles.badge}>{member.area?.name || 'N/A'}</span>
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
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#020617' }}>
                <Loader2 className={styles.spinnerSmall} style={{ width: 48, height: 48 }} />
            </div>
        );
    }

    if (!overseeData) {
        return (
            <div className={styles.container}>
                {renderHeader()}
                <div style={{ textAlign: 'center', padding: '4rem', color: '#94a3b8' }}>
                    <Loader2 size={48} style={{ margin: '0 auto 1rem', opacity: 0.2 }} />
                    <p>Aucun regroupement Oversee n'est assigné à votre compte.</p>
                    <button className={styles.primaryBtn} onClick={() => navigate('/')} style={{ marginTop: '1rem' }}>
                        Retour Accueil
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
                    <LayoutDashboard size={18} /> Dashboard
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
                {activeTab === 'members' && renderMembers()}
                {activeTab === 'reports' && (
                    <div className={styles.section}>
                        <h2 className={styles.sectionTitle}>Rapports de Supervision</h2>
                        <p style={{ color: '#94a3b8' }}>Les rapports détaillés pour vos zones sont en cours de préparation.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Overseer;
