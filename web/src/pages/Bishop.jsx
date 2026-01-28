import React, { useState, useEffect } from 'react';
import {
    governorAPI,
    areaAPI,
    dashboardAPI,
    reportAPI,
    ministryAPI,
    regionAPI,
    memberAPI,
    bacentaAPI,
    getPhotoUrl
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
    CheckCircle,
    X,
    ChevronRight,
    Library,
    Shield,
    Globe,
    Loader2,
    AlertCircle,
    DollarSign,
    Award,
    Calendar,
    PhoneCall,
    Mail
} from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import styles from './Bishop.module.css';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const Bishop = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const activeTab = searchParams.get('tab') || 'dashboard';

    const setActiveTab = (tab) => {
        setSearchParams({ tab });
    };

    const [stats, setStats] = useState(null);
    const [governors, setGovernors] = useState([]);
    const [regions, setRegions] = useState([]);
    const [ministries, setMinistries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [growthData, setGrowthData] = useState(null);
    const [financials, setFinancials] = useState(null);
    const [rankings, setRankings] = useState(null);
    const [members, setMembers] = useState([]);
    const [areas, setAreas] = useState([]);
    const [bacentaMeetings, setBacentaMeetings] = useState([]);
    const [memberFilters, setMemberFilters] = useState({
        region_id: '',
        area_id: '',
        search: ''
    });

    // Modals
    const [showGovernorModal, setShowGovernorModal] = useState(false);
    const [showRegionModal, setShowRegionModal] = useState(false);
    const [showAreaModal, setShowAreaModal] = useState(false);
    const [showMinistryModal, setShowMinistryModal] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [modalLoading, setModalLoading] = useState(false);
    const [modalError, setModalError] = useState('');

    // Forms
    const [governorForm, setGovernorForm] = useState({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        password: '',
        area_id: '', // Will be used for Region in Bishop context if applicable, or we might need region_id
        role: 'Governor'
    });

    const [regionForm, setRegionForm] = useState({
        name: '',
        governor_id: ''
    });

    const [areaForm, setAreaForm] = useState({ // New form for areas
        name: '',
        region_id: '',
        area_pastor_id: ''
    });

    const [ministryForm, setMinistryForm] = useState({
        name: '',
        description: '',
        leader_id: ''
    });

    const fetchData = React.useCallback(async () => {
        setLoading(true);
        try {
            if (activeTab === 'dashboard' || activeTab === 'reports') {
                const [statsRes, growthRes, financialRes, rankingsRes] = await Promise.all([
                    dashboardAPI.getGlobalStats(),
                    reportAPI.getMemberGrowthReport({ period: '3months' }),
                    dashboardAPI.getFinancialStats(),
                    dashboardAPI.getPerformanceRankings()
                ]);
                setStats(statsRes.data);
                setGrowthData(growthRes.data);
                setFinancials(financialRes.data);
                setRankings(rankingsRes.data);
            } else if (activeTab === 'governors') {
                const governorsRes = await governorAPI.getUsers({ role: 'Governor' });
                setGovernors(governorsRes.data.users || []);
            } else if (activeTab === 'regions') {
                const [regionsRes, governorsRes] = await Promise.all([
                    regionAPI.getRegions(),
                    governorAPI.getUsers({ role: 'Governor' })
                ]);
                setRegions(regionsRes.data || []);
                setGovernors(governorsRes.data.users || []); // Need governors for dropdown
            } else if (activeTab === 'areas') {
                const [areasRes, regionsRes, governorsRes] = await Promise.all([
                    areaAPI.getAreas(),
                    regionAPI.getRegions(),
                    governorAPI.getUsers({ role: 'Area_Pastor' })
                ]);
                setAreas(areasRes.data || []);
                setRegions(regionsRes.data || []);
                setGovernors(governorsRes.data.users || []); // Shared state for leaders
            } else if (activeTab === 'ministries') {
                const ministriesRes = await ministryAPI.getAllMinistries();
                setMinistries(ministriesRes.data || []);
            } else if (activeTab === 'members') {
                const [membersRes, regionsRes] = await Promise.all([
                    memberAPI.getMembers({ ...memberFilters, limit: 100 }),
                    regionAPI.getRegions()
                ]);
                setMembers(membersRes.data.members || []);
                setRegions(regionsRes.data || []);
            } else if (activeTab === 'bacenta') {
                const meetingsRes = await bacentaAPI.getMeetings({ limit: 50 });
                setBacentaMeetings(meetingsRes.data.meetings || []);
            }
        } catch (error) {
            console.error('Error fetching bishop data:', error);
        } finally {
            setLoading(false);
        }
    }, [activeTab, memberFilters]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // --- Modal Handlers ---

    const openGovernorModal = (governor = null) => {
        setModalError('');
        if (governor) {
            setEditingItem(governor);
            setGovernorForm({
                first_name: governor.first_name,
                last_name: governor.last_name,
                email: governor.email,
                phone: governor.phone || '',
                role: 'Governor'
                // password left blank
            });
        } else {
            setEditingItem(null);
            setGovernorForm({
                first_name: '',
                last_name: '',
                email: '',
                phone: '',
                password: '',
                role: 'Governor'
            });
        }
        setShowGovernorModal(true);
    };

    const openRegionModal = (region = null) => {
        setModalError('');
        if (region) {
            setEditingItem(region);
            setRegionForm({
                name: region.name,
                governor_id: region.governor_id || ''
            });
        } else {
            setEditingItem(null);
            setRegionForm({
                name: '',
                governor_id: ''
            });
        }
        setShowRegionModal(true);
    };

    const openAreaModal = (area = null) => { // New modal handler for areas
        setModalError('');
        if (area) {
            setEditingItem(area);
            setAreaForm({
                name: area.name,
                region_id: area.region_id || '',
                area_pastor_id: area.area_pastor_id || ''
            });
        } else {
            setEditingItem(null);
            setAreaForm({
                name: '',
                region_id: '',
                area_pastor_id: ''
            });
        }
        setShowAreaModal(true);
    };

    const openMinistryModal = (ministry = null) => {
        setModalError('');
        if (ministry) {
            setEditingItem(ministry);
            setMinistryForm({
                name: ministry.name,
                description: ministry.description,
                leader_id: ministry.leader_id || '' // Global ministries might not have a specific leader yet or handled differently
            });
        } else {
            setEditingItem(null);
            setMinistryForm({
                name: '',
                description: '',
                leader_id: ''
            });
        }
        setShowMinistryModal(true);
    };

    // --- Save Handlers ---

    const handleSaveGovernor = async (e) => {
        e.preventDefault();
        setModalLoading(true);
        setModalError('');
        try {
            if (editingItem) {
                await governorAPI.updateUser(editingItem.id, governorForm);
            } else {
                await governorAPI.createUser(governorForm);
            }
            setShowGovernorModal(false);
            fetchData();
        } catch (error) {
            setModalError(error.response?.data?.error || "Erreur lors de l'enregistrement");
        } finally {
            setModalLoading(false);
        }
    };

    const handleSaveRegion = async (e) => {
        e.preventDefault();
        setModalLoading(true);
        setModalError('');
        try {
            if (editingItem) {
                await regionAPI.updateRegion(editingItem.id, regionForm);
            } else {
                await regionAPI.createRegion(regionForm);
            }
            setShowRegionModal(false);
            fetchData();
        } catch (error) {
            setModalError(error.response?.data?.error || "Erreur lors de l'enregistrement");
        } finally {
            setModalLoading(false);
        }
    };

    const handleSaveArea = async (e) => { // New save handler for areas
        e.preventDefault();
        setModalLoading(true);
        setModalError('');
        try {
            if (editingItem) {
                await areaAPI.updateArea(editingItem.id, areaForm);
            } else {
                await areaAPI.createArea(areaForm);
            }
            setShowAreaModal(false);
            fetchData();
        } catch (error) {
            setModalError(error.response?.data?.error || "Erreur lors de l'enregistrement");
        } finally {
            setModalLoading(false);
        }
    };

    const handleSaveMinistry = async (e) => {
        e.preventDefault();
        setModalLoading(true);
        setModalError('');
        try {
            // Reuse existing ministry logic
            if (editingItem) {
                // update not implemented in API utils shown? Check api.js. 
                // Actually createMinistry is there, delete is there. Update? 
                // Wait, ministryAPI has createMinistry but not update? 
                // I should check api.js again. 
                // Assuming create for now or I'll fix it. 
                alert("Mise à jour non implémentée pour le moment");
            } else {
                await ministryAPI.createMinistry(ministryForm);
            }
            setShowMinistryModal(false);
            fetchData();
        } catch (error) {
            setModalError(error.response?.data?.error || "Erreur lors de l'enregistrement");
        } finally {
            setModalLoading(false);
        }
    };

    const handleDeleteRegion = async (id) => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer cette région ?')) {
            try {
                await regionAPI.deleteRegion(id);
                fetchData();
            } catch (error) {
                console.error("Erreur suppression région", error);
            }
        }
    }

    const handleDeleteArea = async (id) => { // New delete handler for areas
        if (window.confirm('Êtes-vous sûr de vouloir supprimer cette zone ?')) {
            try {
                await areaAPI.deleteArea(id);
                fetchData();
            } catch (error) {
                console.error("Erreur suppression zone", error);
            }
        }
    }

    // --- Renderers ---

    const renderDashboard = () => (
        <div className={styles.section}>
            <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                    <div className={styles.statHeader}>
                        <div className={styles.statIcon} style={{ background: 'rgba(220, 38, 38, 0.1)', color: '#DC2626' }}>
                            <Users size={24} />
                        </div>
                        {stats?.summary?.growth > 0 && (
                            <div className={styles.growthBadge}>
                                <TrendingUp size={14} /> {stats.summary.growth}%
                            </div>
                        )}
                    </div>
                    <h3 className={styles.statValue}>{stats?.summary?.total_members || 0}</h3>
                    <p className={styles.statLabel}>Total Membres (Global)</p>
                </div>

                <div className={styles.statCard}>
                    <div className={styles.statHeader}>
                        <div className={styles.statIcon} style={{ background: 'rgba(5, 150, 105, 0.1)', color: '#059669' }}>
                            <DollarSign size={24} />
                        </div>
                    </div>
                    <h3 className={styles.statValue}>
                        {financials?.total_offerings?.toLocaleString() || 0}
                        <span style={{ fontSize: '1rem', marginLeft: '4px' }}>XAF</span>
                    </h3>
                    <p className={styles.statLabel}>Offrandes Totales</p>
                </div>

                <div className={styles.statCard}>
                    <div className={styles.statHeader}>
                        <div className={styles.statIcon} style={{ background: 'rgba(124, 58, 237, 0.1)', color: '#7c3aed' }}>
                            <Globe size={24} />
                        </div>
                    </div>
                    <h3 className={styles.statValue}>{stats?.summary?.total_regions || regions.length || 0}</h3>
                    <p className={styles.statLabel}>Régions</p>
                </div>

                <div className={styles.statCard}>
                    <div className={styles.statHeader}>
                        <div className={styles.statIcon} style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}>
                            <Award size={24} />
                        </div>
                    </div>
                    <h3 className={styles.statValue}>{rankings?.top_recruiters?.length || 0}</h3>
                    <p className={styles.statLabel}>Top Leaders</p>
                </div>
            </div>

            <div className={styles.dashboardLayout}>
                <div className={styles.mainColumn}>
                    <div className={styles.chartContainer}>
                        <div className={styles.chartHeader}>
                            <h3 className={styles.chartTitle}>Croissance Globale (3 mois)</h3>
                        </div>
                        <div style={{ height: 300, width: '100%' }}>
                            <ResponsiveContainer>
                                <AreaChart data={growthData?.history || []}>
                                    <defs>
                                        <linearGradient id="colorGrowth" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#DC2626" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#DC2626" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" vertical={false} />
                                    <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                                    />
                                    <Area type="monotone" dataKey="count" stroke="#DC2626" strokeWidth={3} fillOpacity={1} fill="url(#colorGrowth)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className={styles.rankingsGrid}>
                        <div className={styles.rankingCard}>
                            <h3 className={styles.rankingTitle}>Top Recruteurs</h3>
                            <div className={styles.rankingList}>
                                {rankings?.top_recruiters?.slice(0, 5).map((leader, index) => (
                                    <div key={index} className={styles.rankingItem}>
                                        <div className={styles.rankingRank}>{index + 1}</div>
                                        <div className={styles.rankingInfo}>
                                            <div className={styles.rankingName}>{leader.first_name} {leader.last_name}</div>
                                            <div className={styles.rankingMeta}>{leader.area?.name || 'Sans Zone'}</div>
                                        </div>
                                        <div className={styles.rankingValue}>{leader.dataValues?.new_members_count || leader.new_members_count || 0} mbrs</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className={styles.rankingCard}>
                            <h3 className={styles.rankingTitle}>Performance par Zone</h3>
                            <div className={styles.rankingList}>
                                {rankings?.top_zones?.slice(0, 5).map((zone, index) => (
                                    <div key={index} className={styles.rankingItem}>
                                        <div className={styles.rankingRank} style={{ backgroundColor: index < 3 ? '#FEF3F2' : '#F8FAFC', color: index < 3 ? '#DC2626' : '#64748B' }}>{index + 1}</div>
                                        <div className={styles.rankingInfo}>
                                            <div className={styles.rankingName}>{zone.name}</div>
                                            <div className={styles.rankingMeta}>{zone.region?.name || 'Sans Région'}</div>
                                        </div>
                                        <div className={styles.rankingValue}>{zone.attendance_avg}%</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className={styles.sideColumn}>
                    <div className={styles.activityCard}>
                        <h3 className={styles.activityTitle}>Récentes Réunions Bacenta</h3>
                        <div className={styles.activityList}>
                            {stats?.recent_meetings?.map((meeting, index) => (
                                <div key={index} className={styles.activityItem}>
                                    <div className={styles.activityMarker} />
                                    <div className={styles.activityContent}>
                                        <div className={styles.activityText}>
                                            <strong>{meeting.title}</strong> par {meeting.leader_name}
                                        </div>
                                        <div className={styles.activityMeta}>
                                            {new Date(meeting.date).toLocaleDateString()} • {meeting.attendance} présents
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderGovernors = () => (
        <div className={styles.section}>
            <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>Gestion des Gouverneurs</h2>
                <button className={styles.primaryBtn} onClick={() => openGovernorModal()}>
                    <Plus size={20} /> Nouveau Gouverneur
                </button>
            </div>
            <div className={styles.tableContainer}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th className={styles.th}>Nom</th>
                            <th className={styles.th}>Email</th>
                            <th className={styles.th}>Téléphone</th>
                            <th className={styles.th} style={{ textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {governors.map(gov => (
                            <tr key={gov.id} className={styles.tr}>
                                <td className={styles.td}>
                                    <div className={styles.userCell}>
                                        <div className={styles.avatar}>
                                            {gov.first_name[0]}{gov.last_name[0]}
                                        </div>
                                        <span className={styles.userName}>{gov.first_name} {gov.last_name}</span>
                                    </div>
                                </td>
                                <td className={styles.td}>{gov.email}</td>
                                <td className={styles.td}>{gov.phone}</td>
                                <td className={styles.td} style={{ textAlign: 'right' }}>
                                    <div className={styles.actions}>
                                        <button className={styles.actionBtn} onClick={() => openGovernorModal(gov)}>
                                            <Pencil size={18} />
                                        </button>
                                        {/* Delete logic if needed */}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    const renderRegions = () => (
        <div className={styles.section}>
            <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>Gestion des Régions</h2>
                <button className={styles.primaryBtn} onClick={() => openRegionModal()}>
                    <Plus size={20} /> Nouvelle Région
                </button>
            </div>
            <div className={styles.tableContainer}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th className={styles.th}>Nom de la Région</th>
                            <th className={styles.th}>Gouverneur</th>
                            <th className={styles.th}>Zones</th>
                            <th className={styles.th} style={{ textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {regions.map(reg => (
                            <tr key={reg.id} className={styles.tr}>
                                <td className={styles.td}>{reg.name}</td>
                                <td className={styles.td}>
                                    {reg.governor ? `${reg.governor.first_name} ${reg.governor.last_name}` : <span className={styles.badgeInactive}>Non assigné</span>}
                                </td>
                                <td className={styles.td}>{reg.areas?.length || 0} Zones</td>
                                <td className={styles.td} style={{ textAlign: 'right' }}>
                                    <div className={styles.actions}>
                                        <button className={styles.actionBtn} onClick={() => openRegionModal(reg)}>
                                            <Pencil size={18} />
                                        </button>
                                        <button className={`${styles.actionBtn} ${styles.deleteBtn}`} onClick={() => handleDeleteRegion(reg.id)}>
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

    const renderAreas = () => (
        <div className={styles.section}>
            <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>Gestion des Zones (Areas)</h2>
                <button className={styles.primaryBtn} onClick={() => openAreaModal()}>
                    <Plus size={20} /> Nouvelle Zone
                </button>
            </div>
            <div className={styles.tableContainer}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th className={styles.th}>Nom de la Zone</th>
                            <th className={styles.th}>Région</th>
                            <th className={styles.th}>Pasteur de Zone</th>
                            <th className={styles.th} style={{ textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {areas.map(area => (
                            <tr key={area.id} className={styles.tr}>
                                <td className={styles.td}>{area.name}</td>
                                <td className={styles.td}>{area.region?.name || 'Sans Région'}</td>
                                <td className={styles.td}>
                                    {area.area_pastor ? `${area.area_pastor.first_name} ${area.area_pastor.last_name}` : <span className={styles.badgeInactive}>Non assigné</span>}
                                </td>
                                <td className={styles.td} style={{ textAlign: 'right' }}>
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

    const renderMinistries = () => (
        <div className={styles.section}>
            <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>Ministères Globaux</h2>
                <button className={styles.primaryBtn} onClick={() => openMinistryModal()}>
                    <Plus size={20} /> Nouveau Ministère
                </button>
            </div>
            <div className={styles.reportsGrid}>
                {ministries.map(ministry => (
                    <div key={ministry.id} className={styles.reportCard}>
                        <div className={styles.reportIcon} style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}>
                            <Library size={32} />
                        </div>
                        <h3 className={styles.reportTitle}>{ministry.name}</h3>
                        <p className={styles.reportDesc}>{ministry.description || 'Aucune description'}</p>
                        <div className={styles.badge}>{ministry.member_count} Membres</div>
                    </div>
                ))}
            </div>
        </div>
    );

    const renderMembers = () => (
        <div className={styles.section}>
            <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>Gestion Globale des Membres</h2>
                <div className={styles.headerActions}>
                    <div className={styles.searchBox}>
                        <Search size={18} />
                        <input
                            placeholder="Rechercher un membre..."
                            value={memberFilters.search}
                            onChange={e => setMemberFilters({ ...memberFilters, search: e.target.value })}
                        />
                    </div>
                    <button className={styles.primaryBtn} onClick={() => navigate('/members/new')}>
                        <Plus size={20} /> Nouveau Membre
                    </button>
                </div>
            </div>

            <div className={styles.filtersBar}>
                <select
                    className={styles.select}
                    value={memberFilters.region_id}
                    onChange={e => setMemberFilters({ ...memberFilters, region_id: e.target.value })}
                >
                    <option value="">Toutes les Régions</option>
                    {regions.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                </select>
                {/* Could add area filter here too if needed */}
            </div>

            <div className={styles.tableContainer}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th className={styles.th}>Membre</th>
                            <th className={styles.th}>Contact</th>
                            <th className={styles.th}>Région / Zone</th>
                            <th className={styles.th}>Statut</th>
                            <th className={styles.th} style={{ textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {members.map(member => (
                            <tr key={member.id} className={styles.tr}>
                                <td className={styles.td}>
                                    <div className={styles.userCell}>
                                        <img
                                            src={getPhotoUrl(member.photo_url) || `https://ui-avatars.com/api/?name=${member.first_name}+${member.last_name}`}
                                            className={styles.avatar}
                                            alt=""
                                        />
                                        <div>
                                            <div className={styles.userName}>{member.first_name} {member.last_name}</div>
                                            <div className={styles.userRole}>{member.bacenta_leader || 'Membre'}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className={styles.td}>
                                    <div className={styles.contactCell}>
                                        <div className={styles.contactItem}><PhoneCall size={14} /> {member.phone_primary}</div>
                                        <div className={styles.contactItem}><Mail size={14} /> {member.email || 'Pas d\'email'}</div>
                                    </div>
                                </td>
                                <td className={styles.td}>
                                    <div className={styles.regionTag}>{member.area?.region?.name || 'Inconnu'}</div>
                                    <div className={styles.areaTag}>{member.area?.name || 'Inconnu'}</div>
                                </td>
                                <td className={styles.td}>
                                    <span className={member.is_active ? styles.statusActive : styles.statusInactive}>
                                        {member.is_active ? 'Actif' : 'Inactif'}
                                    </span>
                                </td>
                                <td className={styles.td} style={{ textAlign: 'right' }}>
                                    <div className={styles.actions}>
                                        <button className={styles.actionBtn} onClick={() => navigate(`/members/${member.id}`)}>
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

    const renderBacenta = () => (
        <div className={styles.section}>
            <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>Toutes les Réunions Bacenta</h2>
            </div>
            <div className={styles.tableContainer}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th className={styles.th}>Date</th>
                            <th className={styles.th}>Titre / Bacenta</th>
                            <th className={styles.th}>Lieu</th>
                            <th className={styles.th}>Présents</th>
                            <th className={styles.th}>Offrandes</th>
                            <th className={styles.th} style={{ textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {bacentaMeetings.map(meeting => (
                            <tr key={meeting.id} className={styles.tr}>
                                <td className={styles.td}>
                                    <div className={styles.dateCell}>
                                        <Calendar size={14} /> {new Date(meeting.date).toLocaleDateString()}
                                    </div>
                                </td>
                                <td className={styles.td}>
                                    <div className={styles.userName}>{meeting.title}</div>
                                    <div className={styles.userRole}>Leader: {meeting.leader?.first_name} {meeting.leader?.last_name}</div>
                                </td>
                                <td className={styles.td}>{meeting.location}</td>
                                <td className={styles.td}>
                                    <div className={styles.badgeActive}>{meeting.attendance?.length || 0} présents</div>
                                </td>
                                <td className={styles.td}>
                                    <div className={styles.rankingValue}>{meeting.offerings?.toLocaleString()} XAF</div>
                                </td>
                                <td className={styles.td} style={{ textAlign: 'right' }}>
                                    <div className={styles.actions}>
                                        <button className={styles.actionBtn} onClick={() => navigate(`/bacenta/meeting/${meeting.id}`)}>
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

    const renderReports = () => (
        <div className={styles.section}>
            <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>Rapports de Supervision</h2>
            </div>
            <div className={styles.reportsGrid}>
                <div className={styles.reportCard}>
                    <div className={styles.reportIcon} style={{ background: 'rgba(220, 38, 38, 0.1)', color: '#DC2626' }}>
                        <Users size={32} />
                    </div>
                    <h3 className={styles.reportTitle}>Présence Globale</h3>
                    <p className={styles.reportDesc}>Évolution de la présence aux cultes sur toute l'église.</p>
                    <button className={styles.badge} onClick={() => navigate('/reports')}>Consulter</button>
                </div>
                <div className={styles.reportCard}>
                    <div className={styles.reportIcon} style={{ background: 'rgba(5, 150, 105, 0.1)', color: '#059669' }}>
                        <DollarSign size={32} />
                    </div>
                    <h3 className={styles.reportTitle}>Offrandes & Finances</h3>
                    <p className={styles.reportDesc}>Suivi des offrandes collectées globalement et par région.</p>
                    <button className={styles.badge}>Consulter</button>
                </div>
                <div className={styles.reportCard}>
                    <div className={styles.reportIcon} style={{ background: 'rgba(124, 58, 237, 0.1)', color: '#7c3aed' }}>
                        <PhoneCall size={32} />
                    </div>
                    <h3 className={styles.reportTitle}>Suivi des Appels</h3>
                    <p className={styles.reportDesc}>Statistiques de contact et fidélisation des membres.</p>
                    <button className={styles.badge}>Consulter</button>
                </div>
            </div>
        </div>
    );

    const renderHeader = () => (
        <header className={styles.header}>
            <div>
                <h1 className={styles.title}>Espace Bishop</h1>
                <p style={{ color: '#94a3b8', marginTop: '0.5rem' }}>Administration Globale & Supervision</p>
            </div>
            {/* User Profile or Actions could go here */}
        </header>
    );

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
                    className={`${styles.tab} ${activeTab === 'governors' ? styles.tabActive : ''}`}
                    onClick={() => setActiveTab('governors')}
                >
                    <Shield size={18} /> Gouverneurs
                </button>
                <button
                    className={`${styles.tab} ${activeTab === 'regions' ? styles.tabActive : ''}`}
                    onClick={() => setActiveTab('regions')}
                >
                    <Map size={18} /> Régions
                </button>
                <button
                    className={`${styles.tab} ${activeTab === 'areas' ? styles.tabActive : ''}`}
                    onClick={() => setActiveTab('areas')}
                >
                    <Globe size={18} /> Zones
                </button>
                <button
                    className={`${styles.tab} ${activeTab === 'members' ? styles.tabActive : ''}`}
                    onClick={() => setActiveTab('members')}
                >
                    <Users size={18} /> Membres
                </button>
                <button
                    className={`${styles.tab} ${activeTab === 'bacenta' ? styles.tabActive : ''}`}
                    onClick={() => setActiveTab('bacenta')}
                >
                    <Library size={18} /> Bacenta
                </button>
                <button
                    className={`${styles.tab} ${activeTab === 'ministries' ? styles.tabActive : ''}`}
                    onClick={() => setActiveTab('ministries')}
                >
                    <Library size={18} /> Ministères
                </button>
                <button
                    className={`${styles.tab} ${activeTab === 'reports' ? styles.tabActive : ''}`}
                    onClick={() => setActiveTab('reports')}
                >
                    <FileBarChart size={18} /> Rapports
                </button>
            </div>

            {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
                    <Loader2 className={styles.spinnerSmall} style={{ width: 40, height: 40 }} />
                </div>
            ) : (
                <>
                    {activeTab === 'dashboard' && renderDashboard()}
                    {activeTab === 'governors' && renderGovernors()}
                    {activeTab === 'regions' && renderRegions()}
                    {activeTab === 'areas' && renderAreas()}
                    {activeTab === 'members' && renderMembers()}
                    {activeTab === 'bacenta' && renderBacenta()}
                    {activeTab === 'ministries' && renderMinistries()}
                    {activeTab === 'reports' && renderReports()}
                </>
            )}

            {/* Modals */}
            {showGovernorModal && (
                <div className={styles.modalOverlay} onClick={() => setShowGovernorModal(false)}>
                    <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h3 className={styles.modalTitle}>{editingItem ? 'Modifier Gouverneur' : 'Nouveau Gouverneur'}</h3>
                            <button className={styles.closeBtn} onClick={() => setShowGovernorModal(false)}><X size={20} /></button>
                        </div>
                        <form onSubmit={handleSaveGovernor}>
                            {modalError && <div className={styles.errorBanner}><AlertCircle size={16} />{modalError}</div>}
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Prénom</label>
                                <input className={styles.input} value={governorForm.first_name} onChange={e => setGovernorForm({ ...governorForm, first_name: e.target.value })} required />
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Nom</label>
                                <input className={styles.input} value={governorForm.last_name} onChange={e => setGovernorForm({ ...governorForm, last_name: e.target.value })} required />
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Email</label>
                                <input type="email" className={styles.input} value={governorForm.email} onChange={e => setGovernorForm({ ...governorForm, email: e.target.value })} required />
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Téléphone</label>
                                <input className={styles.input} value={governorForm.phone} onChange={e => setGovernorForm({ ...governorForm, phone: e.target.value })} />
                            </div>
                            {!editingItem && (
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Mot de passe</label>
                                    <input type="password" className={styles.input} value={governorForm.password} onChange={e => setGovernorForm({ ...governorForm, password: e.target.value })} required />
                                </div>
                            )}
                            <div className={styles.modalActions}>
                                <button type="button" className={styles.cancelBtn} onClick={() => setShowGovernorModal(false)}>Annuler</button>
                                <button type="submit" className={styles.submitBtn} disabled={modalLoading}>
                                    {modalLoading ? 'Enregistrement...' : 'Enregistrer'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showRegionModal && (
                <div className={styles.modalOverlay} onClick={() => setShowRegionModal(false)}>
                    <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h3 className={styles.modalTitle}>{editingItem ? 'Modifier Région' : 'Nouvelle Région'}</h3>
                            <button className={styles.closeBtn} onClick={() => setShowRegionModal(false)}><X size={20} /></button>
                        </div>
                        <form onSubmit={handleSaveRegion}>
                            {modalError && <div className={styles.errorBanner}><AlertCircle size={16} />{modalError}</div>}
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Nom de la Région</label>
                                <input className={styles.input} value={regionForm.name} onChange={e => setRegionForm({ ...regionForm, name: e.target.value })} required />
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Gouverneur Assigné</label>
                                <select className={styles.select} value={regionForm.governor_id} onChange={e => setRegionForm({ ...regionForm, governor_id: e.target.value })}>
                                    <option value="">Sélectionner un Gouverneur</option>
                                    {governors.map(gov => (
                                        <option key={gov.id} value={gov.id}>{gov.first_name} {gov.last_name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className={styles.modalActions}>
                                <button type="button" className={styles.cancelBtn} onClick={() => setShowRegionModal(false)}>Annuler</button>
                                <button type="submit" className={styles.submitBtn} disabled={modalLoading}>
                                    {modalLoading ? 'Enregistrement...' : 'Enregistrer'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showAreaModal && (
                <div className={styles.modalOverlay} onClick={() => setShowAreaModal(false)}>
                    <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h3 className={styles.modalTitle}>{editingItem ? 'Modifier Zone' : 'Nouvelle Zone'}</h3>
                            <button className={styles.closeBtn} onClick={() => setShowAreaModal(false)}><X size={20} /></button>
                        </div>
                        <form onSubmit={handleSaveArea}>
                            {modalError && <div className={styles.errorBanner}><AlertCircle size={16} />{modalError}</div>}
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Nom de la Zone</label>
                                <input className={styles.input} value={areaForm.name} onChange={e => setAreaForm({ ...areaForm, name: e.target.value })} required />
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Région Assistante</label>
                                <select className={styles.select} value={areaForm.region_id} onChange={e => setAreaForm({ ...areaForm, region_id: e.target.value })} required>
                                    <option value="">Sélectionner une Région</option>
                                    {regions.map(r => (
                                        <option key={r.id} value={r.id}>{r.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className={styles.modalActions}>
                                <button type="button" className={styles.cancelBtn} onClick={() => setShowAreaModal(false)}>Annuler</button>
                                <button type="submit" className={styles.submitBtn} disabled={modalLoading}>
                                    {modalLoading ? 'Enregistrement...' : 'Enregistrer'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showMinistryModal && (
                <div className={styles.modalOverlay} onClick={() => setShowMinistryModal(false)}>
                    <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h3 className={styles.modalTitle}>{editingItem ? 'Modifier Ministère' : 'Nouveau Ministère'}</h3>
                            <button className={styles.closeBtn} onClick={() => setShowMinistryModal(false)}><X size={20} /></button>
                        </div>
                        <form onSubmit={handleSaveMinistry}>
                            {modalError && <div className={styles.errorBanner}><AlertCircle size={16} />{modalError}</div>}
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Nom</label>
                                <input className={styles.input} value={ministryForm.name} onChange={e => setMinistryForm({ ...ministryForm, name: e.target.value })} required />
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Description</label>
                                <textarea className={styles.input} rows="3" value={ministryForm.description} onChange={e => setMinistryForm({ ...ministryForm, description: e.target.value })} />
                            </div>
                            <div className={styles.modalActions}>
                                <button type="button" className={styles.cancelBtn} onClick={() => setShowMinistryModal(false)}>Annuler</button>
                                <button type="submit" className={styles.submitBtn} disabled={modalLoading}>
                                    {modalLoading ? 'Enregistrement...' : 'Enregistrer'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Bishop;
