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
    authAPI,
    callLogAPI,
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
    Clock,
    MapPin,
    User,

    Mail,
    ArrowLeft,
    ClipboardCheck,
    HomeIcon,
    LogIn
} from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from './Bishop.module.css';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const Bishop = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [searchParams, setSearchParams] = useSearchParams();
    const activeTab = searchParams.get('tab') || 'dashboard';
    const selectedReport = searchParams.get('report');

    const setActiveTab = (tab) => {
        setSearchParams({ tab });
    };

    const setSelectedReport = (report) => {
        if (report) {
            setSearchParams({ tab: activeTab, report });
        } else {
            setSearchParams({ tab: activeTab });
        }
    };

    const [stats, setStats] = useState(null);
    const [governors, setGovernors] = useState([]);
    const [regions, setRegions] = useState([]);
    const [areas, setAreas] = useState([]);
    const [ministries, setMinistries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [growthData, setGrowthData] = useState(null);
    const [financials, setFinancials] = useState(null);
    const [rankings, setRankings] = useState(null);
    const [members, setMembers] = useState([]);
    const [bacentaMeetings, setBacentaMeetings] = useState([]);
    const [memberFilters, setMemberFilters] = useState({
        region_id: '',
        area_id: '',
        governor_id: '',
        leader_id: '',
        search: '',
        page: 1,
        limit: 50
    });
    const [memberPagination, setMemberPagination] = useState({
        total: 0,
        totalPages: 0,
        currentPage: 1
    });
    const [areaFilters, setAreaFilters] = useState({
        region_id: '',
        search: ''
    });

    const [selectedMinistry, setSelectedMinistry] = useState(null);
    const [ministryMembers, setMinistryMembers] = useState([]);
    const [ministryStats, setMinistryStats] = useState(null);

    const [selectedAreaDetails, setSelectedAreaDetails] = useState(null);
    const [areaLeaders, setAreaLeaders] = useState([]);

    const [reportData, setReportData] = useState(null);
    const [reportError, setReportError] = useState(null);
    const [reportDateRange, setReportDateRange] = useState({
        startDate: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0]
    });

    const [showBacentaModal, setShowBacentaModal] = useState(false);
    const [selectedBacentaMeeting, setSelectedBacentaMeeting] = useState(null);

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
        region_id: '',
        area_id: '',
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

    const [localSearch, setLocalSearch] = useState('');

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            setMemberFilters(prev => ({ ...prev, search: localSearch, page: 1 }));
        }, 500);

        return () => clearTimeout(timer);
    }, [localSearch]);

    const [ministryDate, setMinistryDate] = useState(new Date().toISOString().split('T')[0]);

    const fetchMinistryDetails = async (id, date = null) => {
        setLoading(true);
        try {
            const targetDate = date || ministryDate;
            const [membersRes, statsRes] = await Promise.all([
                ministryAPI.getMinistryMembers(id),
                ministryAPI.getMinistryStats(id, { date: targetDate })
            ]);
            setMinistryMembers(membersRes.data || []);
            setMinistryStats(statsRes.data || null);
            setSelectedMinistry(ministries.find(m => m.id === id));
        } catch (error) {
            console.error("Error fetching ministry details:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchAreaDetails = async (id) => {
        setLoading(true);
        try {
            const leadersRes = await areaAPI.getAreaLeaders(id);
            setAreaLeaders(leadersRes.data || []);
            setSelectedAreaDetails(areas.find(a => a.id === id));
        } catch (error) {
            console.error("Error fetching area details:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchReportDetail = React.useCallback(async (type) => {
        if (!type) return;
        try {
            // Removing setSelectedReport(type) from here to avoid re-render loops
            // since this function is usually triggered BY a URL change.
            setReportData(null);
            setReportError(null);

            const params = {
                start_date: reportDateRange.startDate,
                end_date: reportDateRange.endDate
            };

            let res;
            if (type === 'offerings') {
                res = await dashboardAPI.getFinancialStats(params);
            } else if (type === 'presence') {
                res = await reportAPI.getAttendanceReport(params);
            } else if (type === 'calls') {
                res = await callLogAPI.getCallLogs({ limit: 100, ...params });
                // Handle potential different response formats
                const logs = res.data.logs || res.data.data || (Array.isArray(res.data) ? res.data : []);
                setReportData(logs);
                return;
            } else if (type === 'growth') {
                res = await reportAPI.getMemberGrowthReport(params);
            } else if (type === 'ministries') {
                const targetDate = reportDateRange.endDate || new Date().toISOString().split('T')[0];
                res = await ministryAPI.getAttendanceOverview(targetDate);
            }

            if (res && res.data) {
                // Extract array from various possible formats
                const cleanData = res.data.data || res.data.reports || res.data.meetings || res.data;
                setReportData(cleanData);
            } else {
                setReportError("Aucune donnée reçue du serveur");
            }
        } catch (error) {
            console.error("Error fetching report detail:", error);
            setReportError("Erreur lors de la récupération des données. Veuillez réessayer.");
        }
    }, [reportDateRange, setSelectedReport]);

    const fetchData = React.useCallback(async () => {
        setLoading(true);
        try {
            if ((activeTab === 'dashboard' || activeTab === 'reports') && !selectedReport) {
                const [statsRes, growthRes, financialRes, rankingsRes] = await Promise.all([
                    dashboardAPI.getGlobalStats().catch(e => ({ data: {} })),
                    reportAPI.getMemberGrowthReport({ period: '3months' }).catch(e => ({ data: {} })),
                    dashboardAPI.getFinancialStats().catch(e => ({ data: {} })),
                    dashboardAPI.getPerformanceRankings().catch(e => ({ data: {} }))
                ]);
                setStats(statsRes.data);
                setGrowthData(growthRes.data);
                setFinancials(financialRes.data);
                setRankings(rankingsRes.data);
            } else if (activeTab === 'governors') {
                const [governorsRes, regionsRes, areasRes] = await Promise.all([
                    governorAPI.getUsers({ role: 'Governor' }),
                    regionAPI.getRegions(),
                    areaAPI.getAreas({ limit: 1000 })
                ]);
                setGovernors(governorsRes.data.users || []);
                setRegions(regionsRes.data || []);
                setAreas(areasRes.data.areas || []);
            } else if (activeTab === 'regions') {
                const [regionsRes, governorsRes] = await Promise.all([
                    regionAPI.getRegions(),
                    governorAPI.getUsers({ role: 'Governor' })
                ]);
                setRegions(regionsRes.data || []);
                setGovernors(governorsRes.data.users || []); // Need governors for dropdown
            } else if (activeTab === 'areas') {
                const [areasRes, regionsRes, governorsRes] = await Promise.all([
                    areaAPI.getAreas(areaFilters),
                    regionAPI.getRegions(),
                    governorAPI.getUsers({ role: 'Area_Pastor' })
                ]);
                setAreas(areasRes.data.areas || []);
                setRegions(regionsRes.data || []);
                setGovernors(governorsRes.data.users || []); // Shared state for leaders
            } else if (activeTab === 'ministries') {
                const ministriesRes = await ministryAPI.getAllMinistries();
                setMinistries(ministriesRes.data || []);
            } else if (activeTab === 'members') {
                const [membersRes, regionsRes, areasRes, governorsRes] = await Promise.all([
                    memberAPI.getMembers({ 
                        ...memberFilters, 
                        page: memberFilters.page || 1, 
                        limit: memberFilters.limit || 50 
                    }),
                    regionAPI.getRegions(),
                    areaAPI.getAreas({ limit: 1000 }),
                    governorAPI.getUsers({ role: 'Governor' }) // Fetch governors for member filters
                ]);
                setMembers(membersRes.data.members || []);
                setMemberPagination({
                    total: membersRes.data.total || 0,
                    totalPages: membersRes.data.totalPages || 0,
                    currentPage: membersRes.data.page || 1
                });
                setRegions(regionsRes.data || []);
                setAreas(areasRes.data.areas || []);
                setGovernors(governorsRes.data.users || []);
            } else if (activeTab === 'bacenta') {
                const meetingsRes = await bacentaAPI.getMeetings({ limit: 50 });
                setBacentaMeetings(meetingsRes.data.meetings || []);
            }
        } catch (error) {
            console.error('Error fetching bishop data:', error);
        } finally {
            setLoading(false);
        }
    }, [activeTab, selectedReport, memberFilters, areaFilters]);

    useEffect(() => {
        fetchData();
        // Reset report selection when tab changes to avoid sticking on a detail view
        if (activeTab !== 'reports') {
            // No need to explicitly reset selectedReport as it's driven by searchParams
        }
    }, [fetchData, activeTab]);

    // Effect to fetch report details automatically when URL param is present
    useEffect(() => {
        if (activeTab === 'reports' && selectedReport) {
            fetchReportDetail(selectedReport);
        }
    }, [activeTab, selectedReport]);

    // --- Impersonation ---
    const handleConnectAs = async (governor) => {
        if (!window.confirm(`Voulez-vous vous connecter en tant que ${governor.first_name} ${governor.last_name} ?`)) return;

        try {
            setLoading(true);
            const res = await authAPI.impersonate(governor.id);
            const { user, token } = res.data;
            await login(user, token);
            window.location.href = '/dashboard';
        } catch (error) {
            console.error('Impersonation failed:', error);
            alert("Erreur lors de la connexion à l'espace de travail.");
        } finally {
            setLoading(false);
        }
    };

    // --- Modal Handlers ---

    // Filtrer les zones par région sélectionnée
    const filteredAreasForForm = governorForm.region_id
        ? areas.filter(a => a.region_id === governorForm.region_id)
        : [];

    const openGovernorModal = (governor = null) => {
        setModalError('');
        if (governor) {
            setEditingItem(governor);
            // Find region for this governor
            const govRegion = regions.find(r => r.governor_id === governor.id);
            setGovernorForm({
                first_name: governor.first_name,
                last_name: governor.last_name,
                email: governor.email,
                phone: governor.phone || '',
                region_id: govRegion ? govRegion.id : '',
                area_id: governor.area_id || '',
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
                region_id: '',
                area_id: '',
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
            let userId;
            // Préparer les données avec region_id et area_id
            const userData = {
                first_name: governorForm.first_name,
                last_name: governorForm.last_name,
                email: governorForm.email,
                phone: governorForm.phone,
                role: 'Governor',
                area_id: governorForm.area_id || null
            };

            // Ajouter le mot de passe seulement pour un nouveau governor
            if (!editingItem && governorForm.password) {
                userData.password = governorForm.password;
            }

            if (editingItem) {
                await governorAPI.updateUser(editingItem.id, userData);
                userId = editingItem.id;
            } else {
                const res = await governorAPI.createUser(userData);
                userId = res.data?.user?.id || res.data?.id;
            }

            // Handle Region Assignment
            if (governorForm.region_id) {
                // If it's a new assignment or changed
                await regionAPI.updateRegion(governorForm.region_id, { governor_id: userId });
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
                        <div className={styles.statIcon} style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}>
                            <ClipboardCheck size={24} />
                        </div>
                        {stats?.summary?.current_week_attendance > 0 && (
                            <div className={styles.statusActive}>
                                {stats.summary.current_week_attendance}%
                            </div>
                        )}
                    </div>
                    <h3 className={styles.statValue}>{stats?.summary?.present_members || 0}</h3>
                    <p className={styles.statLabel}>Membres Présents (Semaine)</p>
                </div>

                <div className={styles.statCard}>
                    <div className={styles.statHeader}>
                        <div className={styles.statIcon} style={{ background: 'rgba(217, 119, 6, 0.1)', color: '#d97706' }}>
                            <HomeIcon size={24} />
                        </div>
                    </div>
                    <h3 className={styles.statValue}>{stats?.summary?.total_areas || 0}</h3>
                    <p className={styles.statLabel}>Total Zones (Areas)</p>
                </div>

                <div className={styles.statCard}>
                    <div className={styles.statHeader}>
                        <div className={styles.statIcon} style={{ background: 'rgba(124, 58, 237, 0.1)', color: '#7c3aed' }}>
                            <Globe size={24} />
                        </div>
                    </div>
                    <h3 className={styles.statValue}>{stats?.summary?.total_regions || 0}</h3>
                    <p className={styles.statLabel}>Régions</p>
                </div>

                <div className={styles.statCard}>
                    <div className={styles.statHeader}>
                        <div className={styles.statIcon} style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}>
                            <Crown size={24} />
                        </div>
                    </div>
                    <h3 className={styles.statValue}>{stats?.summary?.total_governors || 0}</h3>
                    <p className={styles.statLabel}>Gouverneurs</p>
                </div>

                <div className={styles.statCard}>
                    <div className={styles.statHeader}>
                        <div className={styles.statIcon} style={{ background: 'rgba(236, 72, 153, 0.1)', color: '#ec4899' }}>
                            <Shield size={24} />
                        </div>
                    </div>
                    <h3 className={styles.statValue}>{stats?.summary?.total_area_pastors || 0}</h3>
                    <p className={styles.statLabel}>Area Pastors</p>
                </div>

                <div className={styles.statCard}>
                    <div className={styles.statHeader}>
                        <div className={styles.statIcon} style={{ background: 'rgba(124, 58, 237, 0.1)', color: '#7c3aed' }}>
                            <Award size={24} />
                        </div>
                    </div>
                    <h3 className={styles.statValue}>{stats?.summary?.total_leaders || 0}</h3>
                    <p className={styles.statLabel}>Bacenta Leaders</p>
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
                            <th className={styles.th}>Région</th>
                            <th className={styles.th}>Zone</th>
                            <th className={styles.th} style={{ textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {governors.map(gov => {
                            // Trouver la zone du governor
                            const govArea = areas.find(a => a.id === gov.area_id) || gov.area;
                            // Trouver la région du governor (la région de sa zone)
                            const govRegion = gov.area?.region || regions.find(r => r.id === govArea?.region_id) || regions.find(r => r.governor_id === gov.id);

                            return (
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
                                    <td className={styles.td}>{gov.phone || '-'}</td>
                                    <td className={styles.td}>{govRegion?.name || '-'}</td>
                                    <td className={styles.td}>{govArea ? `${govArea.name} (Zone ${govArea.number})` : '-'}</td>
                                    <td className={styles.td} style={{ textAlign: 'right' }}>
                                        <div className={styles.actions}>
                                            <button
                                                className={styles.actionBtn}
                                                onClick={() => handleConnectAs(gov)}
                                                title="Se connecter à son espace"
                                                style={{ color: '#059669' }}
                                            >
                                                <LogIn size={18} />
                                            </button>
                                            <button className={styles.actionBtn} onClick={() => openGovernorModal(gov)}>
                                                <Pencil size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )
                        })}
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

    const renderAreaDetail = () => (
        <div className={styles.section}>
            <div className={styles.sectionHeader}>
                <button className={styles.actionBtn} onClick={() => setSelectedAreaDetails(null)} style={{ marginRight: '1rem' }}>
                    <Plus size={20} style={{ transform: 'rotate(45deg)' }} /> Retour
                </button>
                <h2 className={styles.sectionTitle}>Détails de la Zone: {selectedAreaDetails?.name}</h2>
            </div>

            <div className={styles.detailGrid}>
                <div className={styles.detailCard}>
                    <h3>Pasteur de Zone</h3>
                    <p>{selectedAreaDetails?.leader_user ? `${selectedAreaDetails.leader_user.first_name} ${selectedAreaDetails.leader_user.last_name}` : 'Non assigné'}</p>
                </div>
                <div className={styles.detailCard}>
                    <h3>Région</h3>
                    <p>{selectedAreaDetails?.region?.name || 'Inconnu'}</p>
                </div>
            </div>

            <h3 className={styles.subTitle}>Bacenta Leaders dans cette zone</h3>
            <div className={styles.tableContainer}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th className={styles.th}>Nom</th>
                            <th className={styles.th}>Email</th>
                            <th className={styles.th}>Role</th>
                        </tr>
                    </thead>
                    <tbody>
                        {areaLeaders.map(leader => (
                            <tr key={leader.id} className={styles.tr}>
                                <td className={styles.td}>{leader.first_name} {leader.last_name}</td>
                                <td className={styles.td}>{leader.email}</td>
                                <td className={styles.td}>{leader.role}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    const renderAreas = () => {
        if (selectedAreaDetails) return renderAreaDetail();
        return (
            <div className={styles.section}>
                <div className={styles.sectionHeader}>
                    <h2 className={styles.sectionTitle}>Gestion des Zones (Areas)</h2>
                    <div className={styles.headerActions}>
                        <div className={styles.searchBox}>
                            <Search size={18} />
                            <input
                                placeholder="Rechercher une zone..."
                                value={areaFilters.search}
                                onChange={e => setAreaFilters({ ...areaFilters, search: e.target.value })}
                            />
                        </div>
                        <button className={styles.primaryBtn} onClick={() => openAreaModal()}>
                            <Plus size={20} /> Nouvelle Zone
                        </button>
                    </div>
                </div>
                <div className={styles.filtersBar}>
                    <select
                        className={styles.select}
                        value={areaFilters.region_id}
                        onChange={e => setAreaFilters({ ...areaFilters, region_id: e.target.value })}
                    >
                        <option value="">Toutes les Régions</option>
                        {regions.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                    </select>
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
                                        {area.leader_user ? `${area.leader_user.first_name} ${area.leader_user.last_name}` : <span className={styles.badgeInactive}>Non assigné</span>}
                                    </td>
                                    <td className={styles.td} style={{ textAlign: 'right' }}>
                                        <div className={styles.actions}>
                                            <button className={styles.actionBtn} onClick={() => fetchAreaDetails(area.id)} title="Détails">
                                                <Search size={18} />
                                            </button>
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
    };

    const renderMinistryDetail = () => (
        <div className={styles.section}>
            <div className={styles.sectionHeader}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <button className={styles.actionBtn} onClick={() => setSelectedMinistry(null)}>
                        <ArrowLeft size={20} /> Retour
                    </button>
                    <h2 className={styles.sectionTitle}>Ministère: {selectedMinistry?.name}</h2>
                </div>
                <div className={styles.headerActions}>
                    <input
                        type="date"
                        className={styles.input}
                        style={{ width: 'auto', padding: '0.3rem' }}
                        value={ministryDate}
                        onChange={e => {
                            setMinistryDate(e.target.value);
                            fetchMinistryDetails(selectedMinistry.id, e.target.value);
                        }}
                    />
                </div>
            </div>

            <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                    <h3 className={styles.statValue}>{ministryMembers.length}</h3>
                    <p className={styles.statLabel}>Membres Actifs</p>
                </div>
                <div className={styles.statCard}>
                    <h3 className={styles.statValue}>{ministryStats?.total_present || 0}</h3>
                    <p className={styles.statLabel}>Présents (Aujourd'hui)</p>
                </div>
            </div>

            <h3 className={styles.subTitle}>Liste des Membres</h3>
            <div className={styles.tableContainer}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th className={styles.th}>Nom</th>
                            <th className={styles.th}>Leader Bacenta</th>
                            <th className={styles.th}>Statut ({new Date(ministryDate).toLocaleDateString()})</th>
                        </tr>
                    </thead>
                    <tbody>
                        {ministryMembers.map(member => {
                            const attendance = ministryStats?.details?.find(d => d.member_id === member.id);
                            return (
                                <tr key={member.id} className={styles.tr}>
                                    <td className={styles.td}>{member.first_name} {member.last_name}</td>
                                    <td className={styles.td}>{member.leader ? `${member.leader.first_name} ${member.leader.last_name}` : 'Aucun'}</td>
                                    <td className={styles.td}>
                                        <span className={styles.badge} style={{
                                            background: attendance?.present ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                                            color: attendance?.present ? '#34d399' : '#f87171'
                                        }}>
                                            {attendance?.present ? 'Présent' : 'Absent'}
                                        </span>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );

    const renderMinistries = () => {
        if (selectedMinistry) return renderMinistryDetail();
        return (
            <div className={styles.section}>
                <div className={styles.sectionHeader}>
                    <h2 className={styles.sectionTitle}>Ministères Globaux</h2>
                    <button className={styles.primaryBtn} onClick={() => openMinistryModal()}>
                        <Plus size={20} /> Nouveau Ministère
                    </button>
                </div>
                <div className={styles.reportsGrid}>
                    {ministries.map(ministry => (
                        <div key={ministry.id} className={styles.reportCard} onClick={() => fetchMinistryDetails(ministry.id)} style={{ cursor: 'pointer' }}>
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
    };

    const renderMembers = () => (
        <div className={styles.section}>
            <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>Gestion Globale des Membres</h2>
                <div className={styles.headerActions}>
                    <div className={styles.searchBox}>
                        <Search size={18} />
                        <input
                            placeholder="Rechercher un membre..."
                            value={localSearch}
                            onChange={e => setLocalSearch(e.target.value)}
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
                    onChange={e => setMemberFilters({ ...memberFilters, region_id: e.target.value, page: 1 })}
                >
                    <option value="">Toutes les Régions</option>
                    {regions.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                </select>
                <select
                    className={styles.select}
                    value={memberFilters.area_id}
                    onChange={e => setMemberFilters({ ...memberFilters, area_id: e.target.value, page: 1 })}
                >
                    <option value="">Toutes les Zones</option>
                    {areas.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                </select>
                <select
                    className={styles.select}
                    value={memberFilters.governor_id}
                    onChange={e => setMemberFilters({ ...memberFilters, governor_id: e.target.value, page: 1 })}
                >
                    <option value="">Tous les Gouverneurs</option>
                    {governors.map(g => <option key={g.id} value={g.id}>{g.first_name} {g.last_name}</option>)}
                </select>
                <select
                    className={styles.select}
                    value={memberFilters.leader_id}
                    onChange={e => setMemberFilters({ ...memberFilters, leader_id: e.target.value, page: 1 })}
                >
                    <option value="">Tous les Leaders</option>
                    {governors.filter(g => g.role === 'Area_Pastor' || g.role === 'Bacenta_Leader').map(l => <option key={l.id} value={l.id}>{l.first_name} {l.last_name}</option>)}
                </select>
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
                                            <div className={styles.userName}>{member.first_name} {member.last_name === 'Inconnu' ? '' : member.last_name}</div>
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

            {/* Pagination Controls */}
            <div className={styles.pagination}>
                <div className={styles.paginationInfo}>
                    Affichage de {(memberPagination.currentPage - 1) * 50 + 1} à {Math.min(memberPagination.currentPage * 50, memberPagination.total)} sur {memberPagination.total} membres
                </div>
                <div className={styles.paginationControls}>
                    <button
                        className={styles.paginationBtn}
                        disabled={memberPagination.currentPage === 1}
                        onClick={() => setMemberFilters({ ...memberFilters, page: memberPagination.currentPage - 1 })}
                    >
                        <ChevronLeft size={18} /> Précédent
                    </button>
                    <div className={styles.pageNumbers}>
                        <span className={styles.activePage}>{memberPagination.currentPage}</span>
                        <span className={styles.pageSeparator}>/</span>
                        <span>{memberPagination.totalPages}</span>
                    </div>
                    <button
                        className={styles.paginationBtn}
                        disabled={memberPagination.currentPage >= memberPagination.totalPages}
                        onClick={() => setMemberFilters({ ...memberFilters, page: memberPagination.currentPage + 1 })}
                    >
                        Suivant <ChevronRight size={18} />
                    </button>
                </div>
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
                                        <button className={styles.actionBtn} onClick={() => {
                                            setSelectedBacentaMeeting(meeting);
                                            setShowBacentaModal(true);
                                        }}>
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

    const renderReportDetail = () => (
        <div className={styles.section}>
            <div className={styles.sectionHeader}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <button className={styles.actionBtn} onClick={() => setSelectedReport(null)}>
                        <ArrowLeft size={20} /> Retour
                    </button>
                    <h2 className={styles.sectionTitle}>
                        {selectedReport === 'presence' ? 'Détails Présence Globale' :
                            selectedReport === 'offerings' ? 'Détails Offrandes & Finances' :
                                selectedReport === 'calls' ? 'Détails Appels' :
                                    selectedReport === 'growth' ? 'Détails Croissance' : 'Détails Ministères'}
                    </h2>
                </div>

                <div className={styles.headerActions} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <input
                        type="date"
                        className={styles.input}
                        style={{ width: 'auto', padding: '0.3rem' }}
                        value={reportDateRange.startDate}
                        onChange={e => setReportDateRange({ ...reportDateRange, startDate: e.target.value })}
                    />
                    <span style={{ color: '#64748b' }}>au</span>
                    <input
                        type="date"
                        className={styles.input}
                        style={{ width: 'auto', padding: '0.3rem' }}
                        value={reportDateRange.endDate}
                        onChange={e => setReportDateRange({ ...reportDateRange, endDate: e.target.value })}
                    />
                    <button
                        className={styles.primaryBtn}
                        onClick={() => fetchReportDetail(selectedReport)}
                        style={{ padding: '0.3rem 0.8rem', fontSize: '0.9rem' }}
                    >
                        Filtrer
                    </button>
                </div>
            </div>

            {reportError ? (
                <div style={{ padding: '4rem', textAlign: 'center' }}>
                    <AlertCircle size={48} color="#ef4444" style={{ margin: '0 auto 1rem' }} />
                    <p style={{ color: '#ef4444', marginBottom: '1.5rem', fontWeight: 500 }}>{reportError}</p>
                    <button
                        className={styles.primaryBtn}
                        onClick={() => fetchReportDetail(selectedReport)}
                        style={{ padding: '0.5rem 1.5rem' }}
                    >
                        Réessayer
                    </button>
                </div>
            ) : !reportData ? (
                <div style={{ padding: '4rem', textAlign: 'center', color: '#64748b' }}>
                    <Loader2 className="animate-spin" size={32} style={{ margin: '0 auto 1rem' }} />
                    Chargement des données...
                </div>
            ) : (
                <>

                    {selectedReport === 'offerings' && reportData && (
                        <div className={styles.tableContainer}>
                            <table className={styles.table}>
                                <thead>
                                    <tr>
                                        <th className={styles.th}>Zone</th>
                                        <th className={styles.th}>Total Offrandes</th>
                                        <th className={styles.th}>Nombre de Réunions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {reportData.by_zone?.map((item, idx) => item && (
                                        <tr key={idx} className={styles.tr}>
                                            <td className={styles.td}>{item.name || 'Zone'}</td>
                                            <td className={styles.td}>{(item.total || 0).toLocaleString()} CFA</td>
                                            <td className={styles.td}>{item.meeting_count}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {selectedReport === 'presence' && reportData && (
                        <div className={styles.tableContainer}>
                            <table className={styles.table}>
                                <thead>
                                    <tr>
                                        <th className={styles.th}>Zone</th>
                                        <th className={styles.th}>Taux de Présence</th>
                                        <th className={styles.th}>Membres Présents</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {reportData.by_area?.map((item, idx) => item && (
                                        <tr key={idx} className={styles.tr}>
                                            <td className={styles.td}>{item.name || 'Zone'}</td>
                                            <td className={styles.td}>{item.percentage}%</td>
                                            <td className={styles.td}>{item.present} / {item.total}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {selectedReport === 'calls' && reportData && (
                        <div className={styles.tableContainer}>
                            <table className={styles.table}>
                                <thead>
                                    <tr>
                                        <th className={styles.th}>Membre</th>
                                        <th className={styles.th}>Date</th>
                                        <th className={styles.th}>Type</th>
                                        <th className={styles.th}>Statut</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(Array.isArray(reportData) ? reportData : (reportData.data || reportData.logs || [])).map((log, idx) => log && (
                                        <tr key={idx} className={styles.tr}>
                                            <td className={styles.td}>{log.member ? `${log.member.first_name || ''} ${log.member.last_name || ''}` : 'Membre inconnu'}</td>
                                            <td className={styles.td}>{new Date(log.call_date || log.created_at).toLocaleDateString()}</td>
                                            <td className={styles.td}>{log.contact_method || 'Phone'}</td>
                                            <td className={styles.td}>
                                                <span className={`${styles.statusBadge} ${styles[log.outcome?.toLowerCase()]}`}>
                                                    {log.outcome}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {selectedReport === 'growth' && reportData && (
                        <div className={styles.chartContainer}>
                            <h3 className={styles.chartTitle}>Évolution des Membres (12 derniers mois)</h3>
                            <div style={{ height: 400, width: '100%' }}>
                                <ResponsiveContainer>
                                    <AreaChart data={reportData.history || []}>
                                        <defs>
                                            <linearGradient id="colorGrowthReport" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" vertical={false} />
                                        <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                        <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                                        />
                                        <Area type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorGrowthReport)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                            <div className={styles.statsGrid} style={{ marginTop: '2rem' }}>
                                <div className={styles.statCard}>
                                    <h3 className={styles.statValue}>{reportData.total_members || 0}</h3>
                                    <p className={styles.statLabel}>Membres Totaux</p>
                                </div>
                                <div className={styles.statCard}>
                                    <div className={styles.statHeader}>
                                        {reportData.growth_rate >= 0 ? <TrendingUp size={20} color="#10b981" /> : <TrendingDown size={20} color="#ef4444" />}
                                    </div>
                                    <h3 className={styles.statValue}>{reportData.growth_rate}%</h3>
                                    <p className={styles.statLabel}>Taux de Croissance</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {selectedReport === 'ministries' && reportData && (
                        <div className={styles.tableContainer}>
                            <div className={styles.sectionHeader} style={{ marginBottom: '1rem', fontSize: '0.9rem', color: '#64748b' }}>
                                * Affichage pour la date du: {new Date(reportDateRange.endDate || new Date()).toLocaleDateString()}
                            </div>
                            <table className={styles.table}>
                                <thead>
                                    <tr>
                                        <th className={styles.th}>Ministère</th>
                                        <th className={styles.th}>Présents</th>
                                        <th className={styles.th}>Total Membres</th>
                                        <th className={styles.th}>Taux</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {Array.isArray(reportData) ? reportData.map((item, idx) => item && (
                                        <tr key={idx} className={styles.tr}>
                                            <td className={styles.td}>{item.name || 'Ministère'}</td>
                                            <td className={styles.td}>{item.present_count}</td>
                                            <td className={styles.td}>{item.total_members}</td>
                                            <td className={styles.td}>
                                                <div className={styles.progressBar}>
                                                    <div
                                                        className={styles.progressFill}
                                                        style={{ width: `${item.attendance_rate}%`, backgroundColor: item.attendance_rate > 50 ? '#10b981' : '#f59e0b' }}
                                                    />
                                                </div>
                                                <span style={{ fontSize: '0.8rem', marginLeft: '0.5rem' }}>{item.attendance_rate}%</span>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan={4} className={styles.td} style={{ textAlign: 'center', padding: '2rem', opacity: 0.5 }}>
                                                Aucune donnée disponible pour cette date.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </>
            )}
        </div>
    );

    const renderReports = () => {
        if (selectedReport) return renderReportDetail();
        return (
            <div className={styles.section}>
                <div className={styles.sectionHeader}>
                    <h2 className={styles.sectionTitle}>Rapports de Supervision</h2>
                </div>
                <div className={styles.reportsGrid}>
                    <div className={styles.reportCard} onClick={() => setSelectedReport('presence')} style={{ cursor: 'pointer' }}>
                        <div className={styles.reportIcon} style={{ background: 'rgba(220, 38, 38, 0.1)', color: '#DC2626' }}>
                            <Users size={32} />
                        </div>
                        <h3 className={styles.reportTitle}>Présence Globale</h3>
                        <p className={styles.reportDesc}>Évolution de la présence aux cultes sur toute l'église.</p>
                        <button className={styles.primaryBtn} style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}>Consulter</button>
                    </div>
                    <div className={styles.reportCard} onClick={() => setSelectedReport('offerings')} style={{ cursor: 'pointer' }}>
                        <div className={styles.reportIcon} style={{ background: 'rgba(5, 150, 105, 0.1)', color: '#059669' }}>
                            <DollarSign size={32} />
                        </div>
                        <h3 className={styles.reportTitle}>Offrandes & Finances</h3>
                        <p className={styles.reportDesc}>Suivi des offrandes collectées globalement et par région.</p>
                        <button className={styles.primaryBtn} style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}>Consulter</button>
                    </div>
                    <div className={styles.reportCard} onClick={() => setSelectedReport('calls')} style={{ cursor: 'pointer' }}>
                        <div className={styles.reportIcon} style={{ background: 'rgba(124, 58, 237, 0.1)', color: '#7c3aed' }}>
                            <PhoneCall size={32} />
                        </div>
                        <h3 className={styles.reportTitle}>Suivi des Appels</h3>
                        <p className={styles.reportDesc}>Statistiques de contact et fidélisation des membres.</p>
                        <button className={styles.primaryBtn} style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}>Consulter</button>
                    </div>
                    <div className={styles.reportCard} onClick={() => setSelectedReport('growth')} style={{ cursor: 'pointer' }}>
                        <div className={styles.reportIcon} style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}>
                            <TrendingUp size={32} />
                        </div>
                        <h3 className={styles.reportTitle}>Croissance</h3>
                        <p className={styles.reportDesc}>Évolution du nombre de membres et nouvelles âmes.</p>
                        <button className={styles.primaryBtn} style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}>Consulter</button>
                    </div>
                    <div className={styles.reportCard} onClick={() => setSelectedReport('ministries')} style={{ cursor: 'pointer' }}>
                        <div className={styles.reportIcon} style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}>
                            <Library size={32} />
                        </div>
                        <h3 className={styles.reportTitle}>Ministères</h3>
                        <p className={styles.reportDesc}>Présences et statistiques par ministère.</p>
                        <button className={styles.primaryBtn} style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}>Consulter</button>
                    </div>
                </div>
            </div>
        );
    };

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
                    <LayoutDashboard size={18} /> Dashboard
                </button>
                <button
                    className={`${styles.tab} ${activeTab === 'governors' ? styles.tabActive : ''}`}
                    onClick={() => setActiveTab('governors')}
                >
                    <Crown size={18} /> Gouverneurs
                </button>
                <button
                    className={`${styles.tab} ${activeTab === 'regions' ? styles.tabActive : ''}`}
                    onClick={() => setActiveTab('regions')}
                >
                    <Shield size={18} /> Régions
                </button>
                <button
                    className={`${styles.tab} ${activeTab === 'areas' ? styles.tabActive : ''}`}
                    onClick={() => setActiveTab('areas')}
                >
                    <Map size={18} /> Zones
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
                    <Globe size={18} /> Bacenta
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
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Région Assignée (Zone de Supervision)</label>
                                <select
                                    className={styles.select}
                                    value={governorForm.region_id}
                                    onChange={e => setGovernorForm({ ...governorForm, region_id: e.target.value, area_id: '' })}
                                >
                                    <option value="">Sélectionner une région</option>
                                    {regions.map(r => (
                                        <option key={r.id} value={r.id}>
                                            {r.name} {r.governor_id && r.governor_id !== editingItem?.id ? '(Déjà assignée)' : ''}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Zone (Cellule Principale)</label>
                                <select
                                    className={styles.select}
                                    value={governorForm.area_id}
                                    onChange={e => setGovernorForm({ ...governorForm, area_id: e.target.value })}
                                >
                                    <option value="">Sélectionner une zone</option>
                                    {filteredAreasForForm.map(a => (
                                        <option key={a.id} value={a.id}>
                                            {a.name} (Zone {a.number})
                                        </option>
                                    ))}
                                </select>
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

            {showBacentaModal && renderBacentaDetailModal()}
        </div>
    );

    function renderBacentaDetailModal() {
        if (!selectedBacentaMeeting) return null;
        return (
            <div className={styles.modalOverlay} onClick={() => setShowBacentaModal(false)}>
                <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                    <div className={styles.modalHeader}>
                        <h2 className={styles.modalTitle}>Détails de la Réunion</h2>
                        <button className={styles.closeBtn} onClick={() => setShowBacentaModal(false)}>
                            <X size={24} />
                        </button>
                    </div>

                    <div className={styles.meetingInfo} style={{ maxHeight: '70vh', overflowY: 'auto', paddingRight: '10px' }}>
                        <h3 style={{ color: '#DC2626', marginBottom: '1rem', fontSize: '1.5rem' }}>{selectedBacentaMeeting.title}</h3>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
                            <div className={styles.detailRow}><Calendar size={18} /> <div><strong>Date</strong><br />{new Date(selectedBacentaMeeting.date || selectedBacentaMeeting.meeting_date || new Date()).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</div></div>
                            <div className={styles.detailRow}><Clock size={18} /> <div><strong>Heure</strong><br />{selectedBacentaMeeting.time}</div></div>
                            <div className={styles.detailRow}><MapPin size={18} /> <div><strong>Lieu</strong><br />{selectedBacentaMeeting.location}</div></div>
                            <div className={styles.detailRow}><User size={18} /> <div><strong>Hôte / Leader</strong><br />{selectedBacentaMeeting.host}<br /><small style={{ color: '#64748b' }}>Leader: {selectedBacentaMeeting.leader?.first_name} {selectedBacentaMeeting.leader?.last_name}</small></div></div>
                        </div>

                        {selectedBacentaMeeting.agenda && Array.isArray(selectedBacentaMeeting.agenda) && selectedBacentaMeeting.agenda.some(a => a) && (
                            <div style={{ marginTop: '2rem' }}>
                                <h4 className={styles.label} style={{ marginBottom: '0.5rem' }}>Agenda de la réunion</h4>
                                <div className={styles.agendaList} style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '12px' }}>
                                    {selectedBacentaMeeting.agenda.filter(a => a).map((item, index) => (
                                        <div key={index} className={styles.agendaItem} style={{ marginBottom: '0.5rem' }}>
                                            <span className={styles.agendaNumber}>{index + 1}</span>
                                            <span style={{ color: '#e2e8f0' }}>{item}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {(selectedBacentaMeeting.photo_url || selectedBacentaMeeting.familyPhoto) && (
                            <div style={{ marginTop: '2rem' }}>
                                <h4 className={styles.label} style={{ marginBottom: '0.5rem' }}>Photo de la réunion</h4>
                                <div className={styles.photoPreviewContainer}>
                                    <img
                                        src={getPhotoUrl(selectedBacentaMeeting.photo_url || selectedBacentaMeeting.familyPhoto)}
                                        alt="Réunion"
                                        className={styles.photoPreview}
                                        style={{ width: '100%', height: 'auto', borderRadius: '12px' }}
                                    />
                                </div>
                            </div>
                        )}

                        {selectedBacentaMeeting.notes && (
                            <div style={{ marginTop: '2rem' }}>
                                <h4 className={styles.label} style={{ marginBottom: '0.5rem' }}>Notes & Témoignages</h4>
                                <p style={{ color: '#94a3b8', background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '12px', lineHeight: '1.6' }}>
                                    {selectedBacentaMeeting.notes}
                                </p>
                            </div>
                        )}

                        {selectedBacentaMeeting.attendance && selectedBacentaMeeting.attendance.length > 0 && (
                            <div style={{ marginTop: '2rem' }}>
                                <h4 className={styles.label} style={{ marginBottom: '0.5rem' }}>Liste de Présences</h4>
                                <div className={styles.membersList} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '1rem' }}>
                                    {selectedBacentaMeeting.attendance.map((att, idx) => (
                                        <div key={idx} className={styles.memberTag} style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem',
                                            background: att.status === 'present' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                            padding: '0.4rem 0.8rem',
                                            borderRadius: '8px',
                                            fontSize: '0.8rem'
                                        }}>
                                            <div style={{
                                                width: 8,
                                                height: 8,
                                                borderRadius: '50%',
                                                background: att.status === 'present' ? '#10b981' : '#ef4444'
                                            }} />
                                            <span style={{ color: '#e2e8f0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                {att.member ? `${att.member.first_name} ${att.member.last_name}` : 'Membre'}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div style={{ marginTop: '2rem' }}>
                            <h4 className={styles.label} style={{ marginBottom: '0.5rem' }}>Statistiques</h4>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div style={{ background: 'rgba(59, 130, 246, 0.05)', padding: '1rem', borderRadius: '12px', textAlign: 'center' }}>
                                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#3b82f6' }}>{selectedBacentaMeeting.attendance?.length || 0}</div>
                                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Présents</div>
                                </div>
                                <div style={{ background: 'rgba(16, 185, 129, 0.05)', padding: '1rem', borderRadius: '12px', textAlign: 'center' }}>
                                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#10b981' }}>{(selectedBacentaMeeting.offerings?.total || selectedBacentaMeeting.offerings || 0).toLocaleString()} XAF</div>
                                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Offrandes</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className={styles.modalActions}>
                        <button className={styles.submitBtn} onClick={() => setShowBacentaModal(false)} style={{ width: '100%' }}>
                            Fermer
                        </button>
                    </div>
                </div>
            </div>
        );
    }
};

export default Bishop;

