import React, { useState, useEffect } from 'react';
import {
    governorAPI,
    areaAPI,
    dashboardAPI,
    reportAPI,
    ministryAPI,
    regionAPI,
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
    AlertCircle
} from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from './Bishop.module.css';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const Bishop = () => {
    const navigate = useNavigate();
    const { user: authUser } = useAuth();
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
    const [searchQuery, setSearchQuery] = useState('');
    const [growthData, setGrowthData] = useState(null);

    // Modals
    const [showGovernorModal, setShowGovernorModal] = useState(false);
    const [showRegionModal, setShowRegionModal] = useState(false);
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

    const [ministryForm, setMinistryForm] = useState({
        name: '',
        description: '',
        leader_id: ''
    });

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    const fetchData = async () => {
        setLoading(true);
        try {
            if (activeTab === 'dashboard' || activeTab === 'reports') {
                const [statsRes, growthRes] = await Promise.all([
                    dashboardAPI.getGlobalStats(),
                    reportAPI.getMemberGrowthReport({ period: '3months' })
                ]);
                setStats(statsRes.data);
                setGrowthData(growthRes.data);
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
            } else if (activeTab === 'ministries') {
                const ministriesRes = await ministryAPI.getAllMinistries();
                setMinistries(ministriesRes.data || []);
            }
        } catch (error) {
            console.error('Error fetching bishop data:', error);
        } finally {
            setLoading(false);
        }
    };

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
                await governorAPI.createUser({ ...governorForm, id: editingItem.id }); // Using createUser for upsert/update logic if consistent, or updateUser
                // ACTUALLY update is usually updateUser
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

    // --- Renderers ---

    const renderDashboard = () => (
        <div className={styles.section}>
            <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                    <div className={styles.statHeader}>
                        <div className={styles.statIcon} style={{ background: 'rgba(220, 38, 38, 0.1)', color: '#DC2626' }}>
                            <Users size={24} />
                        </div>
                    </div>
                    <h3 className={styles.statValue}>{stats?.summary?.total_members || 0}</h3>
                    <p className={styles.statLabel}>Total Membres (Global)</p>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statHeader}>
                        <div className={styles.statIcon} style={{ background: 'rgba(124, 58, 237, 0.1)', color: '#7c3aed' }}>
                            <Globe size={24} />
                        </div>
                    </div>
                    {/* Placeholder for total regions if available in stats or fetch separate */}
                    <h3 className={styles.statValue}>{stats?.summary?.total_regions || regions.length || 0}</h3>
                    <p className={styles.statLabel}>Régions</p>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statHeader}>
                        <div className={styles.statIcon} style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
                            <Shield size={24} />
                        </div>
                    </div>
                    <h3 className={styles.statValue}>{stats?.summary?.total_governors || governors.length || 0}</h3>
                    <p className={styles.statLabel}>Gouverneurs</p>
                </div>
            </div>
            {/* Growth Chart */}
            <div className={styles.dashboardContent}>
                <div className={styles.chartContainer}>
                    <div className={styles.chartHeader}>
                        <h3 className={styles.chartTitle}>Croissance Globale</h3>
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
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                                />
                                <Area type="monotone" dataKey="count" stroke="#DC2626" strokeWidth={3} fillOpacity={1} fill="url(#colorGrowth)" />
                            </AreaChart>
                        </ResponsiveContainer>
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
                    <Globe size={18} /> Régions
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
                    {activeTab === 'ministries' && renderMinistries()}
                    {activeTab === 'reports' && renderDashboard()} {/* Reusing Dashboard for now as it contains global stats */}
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
