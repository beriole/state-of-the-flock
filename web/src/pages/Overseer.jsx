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
    UserCheck,
    TrendingUp
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
                    // Fetch governors and bacenta leaders, but ONLY filter those in the overseer's assigned areas
                    if (areaIds.length > 0) {
                        Promise.all([
                            governorAPI.getUsers({ role: 'Governor' }),
                            governorAPI.getUsers({ role: 'Bacenta_Leader' })
                        ]).then(([govRes, bacentasRes]) => {
                            const allStaff = [...(govRes.data.users || []), ...(bacentasRes.data.users || [])];
                            // Critical FIX: ensure only staff associated with the currently managed areas are listed
                            const localStaff = allStaff.filter(user => areaIds.includes(user.area_id));
                            setStaffList(localStaff);
                        }).catch(err => console.error("Error fetching staff:", err));
                    }
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
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2.5rem' }}>
            <div>
                <h1 style={{ fontSize: '2.5rem', fontWeight: 800, margin: 0, background: 'linear-gradient(to right, #fff, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    Espace Overseer Prémium
                </h1>
                <p style={{ color: '#94a3b8', marginTop: '0.5rem', fontWeight: 500, fontSize: '1.1rem' }}>
                    {overseeData ? `Responsable du Groupe : ${overseeData.name}` : 'Supervision Principale'}
                </p>
            </div>
            <div>
                <button className={styles.primaryBtn} onClick={() => setShowMemberModal(true)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', borderRadius: '0.75rem', background: 'linear-gradient(135deg, #DC2626 0%, #991B1B 100%)', color: 'white', border: 'none', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 14px rgba(220, 38, 38, 0.4)' }}>
                    <UserPlus size={18} /> Intégrer un Fidèle
                </button>
            </div>
        </header>
    );

    const renderDashboard = () => (
        <div style={{ animation: 'slideUp 0.5s ease' }}>
            {/* Professional Grid for Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
                <div style={{ background: 'linear-gradient(145deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)', backdropFilter: 'blur(10px)', borderRadius: '1.5rem', padding: '2rem', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '1.25rem', borderRadius: '1rem' }}>
                        <Users size={32} />
                    </div>
                    <div>
                        <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'white', lineHeight: '1' }}>{stats?.summary?.total_members || 0}</div>
                        <div style={{ color: '#94a3b8', fontSize: '1rem', marginTop: '0.5rem', fontWeight: 500 }}>Membres Actifs Supervisés</div>
                    </div>
                </div>

                <div style={{ background: 'linear-gradient(145deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)', backdropFilter: 'blur(10px)', borderRadius: '1.5rem', padding: '2rem', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    <div style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', padding: '1.25rem', borderRadius: '1rem' }}>
                        <Globe size={32} />
                    </div>
                    <div>
                        <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'white', lineHeight: '1' }}>{areas.length || 0}</div>
                        <div style={{ color: '#94a3b8', fontSize: '1rem', marginTop: '0.5rem', fontWeight: 500 }}>Zones Officielles (Areas)</div>
                    </div>
                </div>

                <div style={{ background: 'linear-gradient(145deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)', backdropFilter: 'blur(10px)', borderRadius: '1.5rem', padding: '2rem', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    <div style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', padding: '1.25rem', borderRadius: '1rem' }}>
                        <TrendingUp size={32} />
                    </div>
                    <div>
                        <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'white', lineHeight: '1' }}>{stats?.summary?.last_attendance_percentage || 0}%</div>
                        <div style={{ color: '#94a3b8', fontSize: '1rem', marginTop: '0.5rem', fontWeight: 500 }}>Présence Globale Actuelle</div>
                    </div>
                </div>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '1.5rem', border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden' }}>
                <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>Aperçu Rapide de vos Secteurs</h2>
                    <button style={{ background: 'transparent', border: 'none', color: '#60a5fa', cursor: 'pointer', fontWeight: 600 }} onClick={() => setActiveTab('areas')}>Tout lister &rarr;</button>
                </div>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr>
                                <th style={{ padding: '1rem 2rem', fontSize: '0.8rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 700, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>Zone & Identifiant</th>
                                <th style={{ padding: '1rem 2rem', fontSize: '0.8rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 700, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>Responsable</th>
                                <th style={{ padding: '1rem 2rem', fontSize: '0.8rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 700, borderBottom: '1px solid rgba(255,255,255,0.05)', textAlign: 'right' }}>Administration</th>
                            </tr>
                        </thead>
                        <tbody>
                            {areas.slice(0, 5).map(area => (
                                <tr key={area.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                                    <td style={{ padding: '1rem 2rem' }}>
                                        <div style={{ fontWeight: 600, color: 'white' }}>{area.name}</div>
                                        <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Secteur N° {area.number}</div>
                                    </td>
                                    <td style={{ padding: '1rem 2rem' }}>
                                        {area.leader_user ? (
                                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', padding: '0.25rem 0.75rem', borderRadius: '1rem', fontSize: '0.85rem', fontWeight: 600 }}>
                                                <Shield size={14} />
                                                {area.leader_user.first_name} {area.leader_user.last_name}
                                            </span>
                                        ) : (
                                            <span style={{ color: '#64748b', fontSize: '0.85rem', fontStyle: 'italic' }}>Non assigné</span>
                                        )}
                                    </td>
                                    <td style={{ padding: '1rem 2rem', textAlign: 'right' }}>
                                        <button onClick={() => {
                                            setSelectedArea(area);
                                            setAreaForm({ name: area.name, number: area.number });
                                            setShowAreaModal(true);
                                        }} style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#60a5fa', border: '1px solid rgba(59, 130, 246, 0.2)', padding: '0.5rem 1rem', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <Edit2 size={16} /> Éditer
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

    const renderAreas = () => (
        <div style={{ animation: 'slideUp 0.5s ease', background: 'rgba(255,255,255,0.02)', borderRadius: '1.5rem', border: '1px solid rgba(255,255,255,0.05)', padding: '2rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: '0 0 2rem 0' }}>Gestion Administrative des Zones</h2>
            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr>
                            <th style={{ padding: '1rem', fontSize: '0.8rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 700, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>Nom Officiel</th>
                            <th style={{ padding: '1rem', fontSize: '0.8rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 700, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>Numérotation</th>
                            <th style={{ padding: '1rem', fontSize: '0.8rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 700, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>Statut Leadership</th>
                            <th style={{ padding: '1rem', fontSize: '0.8rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 700, borderBottom: '1px solid rgba(255,255,255,0.05)', textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {areas.map(area => (
                            <tr key={area.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                                <td style={{ padding: '1rem', fontWeight: 600, color: 'white' }}>{area.name}</td>
                                <td style={{ padding: '1rem' }}>
                                    <span style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', border: '1px solid rgba(59, 130, 246, 0.3)', padding: '0.25rem 0.75rem', borderRadius: '1rem', fontSize: '0.8rem', fontWeight: 700 }}>N° {area.number}</span>
                                </td>
                                <td style={{ padding: '1rem' }}>
                                    <span style={{ 
                                        color: area.leader_user ? '#10b981' : '#f59e0b',
                                        background: area.leader_user ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                                        padding: '0.25rem 0.75rem', borderRadius: '1rem', fontSize: '0.8rem', fontWeight: 700 
                                    }}>
                                        {area.leader_user ? 'Leader Assisgné' : 'En Attente'}
                                    </span>
                                </td>
                                <td style={{ padding: '1rem', textAlign: 'right' }}>
                                    <button style={{ background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid rgba(255,255,255,0.1)', padding: '0.5rem 1rem', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }} onClick={() => {
                                        setSelectedArea(area);
                                        setAreaForm({ name: area.name, number: area.number });
                                        setShowAreaModal(true);
                                    }}>
                                        <Edit2 size={16} /> Éditer
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
        <div style={{ animation: 'slideUp 0.5s ease', background: 'rgba(255,255,255,0.02)', borderRadius: '1.5rem', border: '1px solid rgba(255,255,255,0.05)', padding: '2rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: '0 0 2rem 0' }}>Répertoire des Membres ({filteredMembers.length})</h2>
            
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', margin: '0 0 2rem 0', background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'rgba(0, 0, 0, 0.3)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '0.75rem', padding: '0.5rem 1rem', flex: '1', minWidth: '250px' }}>
                    <Search size={18} color="#64748b" />
                    <input 
                        type="text" 
                        placeholder="Recherche par nom..." 
                        style={{ background: 'transparent', border: 'none', color: 'white', width: '100%', outline: 'none' }}
                        value={memberFilters.search}
                        onChange={(e) => setMemberFilters({...memberFilters, search: e.target.value})}
                    />
                </div>
                <select style={{ background: 'rgba(0, 0, 0, 0.3)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '0.75rem', padding: '0.75rem 1rem', color: 'white', minWidth: '200px', outline: 'none' }} value={memberFilters.area} onChange={(e) => setMemberFilters({...memberFilters, area: e.target.value})}>
                    <option value="all" style={{ color: 'black' }}>Toutes les Zones</option>
                    {areas.map(a => <option style={{ color: 'black' }} key={a.id} value={a.id}>{a.name}</option>)}
                </select>
                <select style={{ background: 'rgba(0, 0, 0, 0.3)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '0.75rem', padding: '0.75rem 1rem', color: 'white', minWidth: '150px', outline: 'none' }} value={memberFilters.status} onChange={(e) => setMemberFilters({...memberFilters, status: e.target.value})}>
                    <option value="all" style={{ color: 'black' }}>Tous les status</option>
                    <option value="active" style={{ color: 'black' }}>Seulement Actifs</option>
                    <option value="inactive" style={{ color: 'black' }}>Inactifs / Départs</option>
                </select>
            </div>

            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr>
                            <th style={{ padding: '1rem', fontSize: '0.8rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 700, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>Identité Complète</th>
                            <th style={{ padding: '1rem', fontSize: '0.8rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 700, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>Zone Attribuée</th>
                            <th style={{ padding: '1rem', fontSize: '0.8rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 700, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>Statut</th>
                            <th style={{ padding: '1rem', fontSize: '0.8rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 700, borderBottom: '1px solid rgba(255,255,255,0.05)', textAlign: 'right' }}>Supervision</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredMembers.length > 0 ? filteredMembers.map(member => (
                            <tr key={member.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                                <td style={{ padding: '1rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        <div style={{ width: 40, height: 40, borderRadius: '0.5rem', background: 'linear-gradient(135deg, #DC2626 0%, #991B1B 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, overflow: 'hidden' }}>
                                            {member.photo_url ? (
                                                <img src={getPhotoUrl(member.photo_url)} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            ) : (
                                                <>{member.first_name[0]}{member.last_name[0]}</>
                                            )}
                                        </div>
                                        <div>
                                            <span style={{ fontWeight: 600, display: 'block' }}>{member.first_name} {member.last_name}</span>
                                            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{member.phone_primary || 'Pas de numéro'}</span>
                                        </div>
                                    </div>
                                </td>
                                <td style={{ padding: '1rem' }}>
                                    <span style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#60a5fa', border: '1px solid rgba(59, 130, 246, 0.2)', padding: '0.25rem 0.75rem', borderRadius: '1rem', fontSize: '0.8rem', fontWeight: 700 }}>
                                        {member.area?.name || 'Aucune'}
                                    </span>
                                </td>
                                <td style={{ padding: '1rem' }}>
                                    <span style={{ 
                                        color: member.is_active ? '#10b981' : '#ef4444',
                                        background: member.is_active ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                        border: member.is_active ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid rgba(239, 68, 68, 0.2)',
                                        padding: '0.25rem 0.75rem', borderRadius: '1rem', fontSize: '0.8rem', fontWeight: 700 
                                    }}>
                                        {member.is_active ? 'Fidèle' : 'Inactif'}
                                    </span>
                                </td>
                                <td style={{ padding: '1rem', textAlign: 'right' }}>
                                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', alignItems: 'center' }}>
                                        <button onClick={() => {
                                            setSelectedMember(member);
                                            setTransferForm({ new_area_id: member.area_id || '' });
                                            setShowTransferModal(true);
                                        }} title="Transférer" style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#60a5fa', border: '1px solid rgba(59, 130, 246, 0.2)', padding: '0.5rem 0.75rem', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <Repeat size={16} /> Transférer
                                        </button>
                                        <button onClick={() => navigate(`/members/${member.id}`)} style={{ background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid rgba(255,255,255,0.1)', padding: '0.5rem 0.75rem', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 600, display: 'inline-flex', alignItems: 'center' }}>
                                            Détail <ChevronRight size={16} style={{ marginLeft: 4 }}/>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="4" style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                                    Pas de membres correspondant à vos critères actuels.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );

    const renderStaff = () => (
        <div style={{ animation: 'slideUp 0.5s ease', background: 'rgba(255,255,255,0.02)', borderRadius: '1.5rem', border: '1px solid rgba(255,255,255,0.05)', padding: '2rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: '0 0 2rem 0' }}>Hiérarchie du Regroupement</h2>
            <p style={{ color: '#94a3b8', marginBottom: '2rem' }}>Cette liste affiche exclusivement les Governors et Bacenta Leaders associés à vos zones.</p>
            
            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr>
                            <th style={{ padding: '1rem', fontSize: '0.8rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 700, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>Identité Staff</th>
                            <th style={{ padding: '1rem', fontSize: '0.8rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 700, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>Fonction (Rôle)</th>
                            <th style={{ padding: '1rem', fontSize: '0.8rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 700, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>Statut Actif</th>
                        </tr>
                    </thead>
                    <tbody>
                        {staffList.length > 0 ? staffList.map(item => (
                            <tr key={item.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                                <td style={{ padding: '1rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        <div style={{ width: 40, height: 40, borderRadius: '0.5rem', background: item.role === 'Governor' ? 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)' : 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 700, overflow: 'hidden' }}>
                                            {item.photo_url ? (
                                                <img src={getPhotoUrl(item.photo_url)} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            ) : (
                                                <>{item.first_name[0]}{item.last_name[0]}</>
                                            )}
                                        </div>
                                        <div>
                                            <span style={{ fontWeight: 600, display: 'block' }}>{item.first_name} {item.last_name}</span>
                                            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{item.email}</span>
                                        </div>
                                    </div>
                                </td>
                                <td style={{ padding: '1rem' }}>
                                    <span style={{ 
                                        background: item.role === 'Governor' ? 'rgba(139, 92, 246, 0.1)' : 'rgba(59, 130, 246, 0.1)', 
                                        color: item.role === 'Governor' ? '#a78bfa' : '#60a5fa', 
                                        border: item.role === 'Governor' ? '1px solid rgba(139, 92, 246, 0.2)' : '1px solid rgba(59, 130, 246, 0.2)',
                                        padding: '0.25rem 0.75rem', borderRadius: '1rem', fontSize: '0.8rem', fontWeight: 700 
                                    }}>
                                        {item.role.replace('_', ' ')}
                                    </span>
                                </td>
                                <td style={{ padding: '1rem' }}>
                                    <span style={{ 
                                        color: item.is_active ? '#10b981' : '#ef4444',
                                        background: item.is_active ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                        padding: '0.25rem 0.75rem', borderRadius: '1rem', fontSize: '0.8rem', fontWeight: 700 
                                    }}>
                                        {item.is_active ? 'Actif' : 'Inactif'}
                                    </span>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="3" style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                                    Aucun membre du staff trouvé (Gouverneur ou Leader) pour vos zones.
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
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '5rem' }}>
                    <Loader2 style={{ width: 48, height: 48, color: '#DC2626', animation: 'spin 1s linear infinite' }} />
                    <p style={{ marginTop: '1.5rem', color: '#94a3b8', fontWeight: 600 }}>Compilation des rapports en cours...</p>
                </div>
            );
        }

        const attendance = reports.attendance;
        const meetings = reports.meetings;

        return (
            <div style={{ animation: 'slideUp 0.5s ease' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
                    <div style={{ background: 'linear-gradient(145deg, rgba(16, 185, 129, 0.05) 0%, rgba(16, 185, 129, 0.02) 100%)', borderRadius: '1.5rem', padding: '2rem', border: '1px solid rgba(16, 185, 129, 0.1)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                            <div style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', padding: '0.75rem', borderRadius: '1rem' }}>
                                <FileBarChart size={24} />
                            </div>
                            <h3 style={{ color: '#94a3b8', margin: 0, fontWeight: 600, fontSize: '1.1rem' }}>Indice de Présence</h3>
                        </div>
                        <div style={{ fontSize: '3.5rem', fontWeight: 800, color: 'white', lineHeight: '1' }}>
                            {attendance?.summary?.overall_percentage || 0}%
                        </div>
                    </div>
                    
                    <div style={{ background: 'linear-gradient(145deg, rgba(59, 130, 246, 0.05) 0%, rgba(59, 130, 246, 0.02) 100%)', borderRadius: '1.5rem', padding: '2rem', border: '1px solid rgba(59, 130, 246, 0.1)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                            <div style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', padding: '0.75rem', borderRadius: '1rem' }}>
                                <Calendar size={24} />
                            </div>
                            <h3 style={{ color: '#94a3b8', margin: 0, fontWeight: 600, fontSize: '1.1rem' }}>Réunions Validées</h3>
                        </div>
                        <div style={{ fontSize: '3.5rem', fontWeight: 800, color: 'white', lineHeight: '1' }}>
                            {meetings.length || 0}
                        </div>
                    </div>
                </div>
                
                <div style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '1.5rem', border: '1px solid rgba(255,255,255,0.05)', padding: '2rem' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 1.5rem 0' }}>Répartition Consolidée par Zone</h3>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                                <tr>
                                    <th style={{ padding: '1rem', fontSize: '0.8rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 700, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>Nom de Zone</th>
                                    <th style={{ padding: '1rem', fontSize: '0.8rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 700, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>Performance Constatée</th>
                                </tr>
                            </thead>
                            <tbody>
                                {attendance?.by_area?.length > 0 ? attendance.by_area.map((item, idx) => (
                                    <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                                        <td style={{ padding: '1rem', fontWeight: 600 }}>{item.name}</td>
                                        <td style={{ padding: '1rem' }}>
                                            <span style={{ 
                                                display: 'inline-flex', padding: '0.25rem 0.75rem', borderRadius: '1rem', fontSize: '0.85rem', fontWeight: 700,
                                                color: item.percentage >= 70 ? '#10b981' : (item.percentage >= 40 ? '#f59e0b' : '#ef4444'),
                                                background: item.percentage >= 70 ? 'rgba(16, 185, 129, 0.1)' : (item.percentage >= 40 ? 'rgba(245, 158, 11, 0.1)' : 'rgba(239, 68, 68, 0.1)'),
                                            }}>
                                                {item.percentage}% d'assiduité
                                            </span>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr><td colSpan="2" style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>Acucun rapport consolidé pour le moment.</td></tr>
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
                <p style={{ opacity: 0.6, marginTop: '0.5rem' }}>Synchronisation des accès administratifs</p>
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
        <div style={{ padding: '2rem', color: 'white', maxWidth: '1600px', margin: '0 auto', minHeight: '100vh', boxSizing: 'border-box' }}>
            {renderHeader()}

            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '3rem', background: 'rgba(255,255,255,0.03)', padding: '0.5rem', borderRadius: '1rem', width: 'fit-content', border: '1px solid rgba(255,255,255,0.05)', flexWrap: 'wrap' }}>
                <button style={{ padding: '0.75rem 1.5rem', background: activeTab === 'dashboard' ? 'rgba(255,255,255,0.1)' : 'transparent', border: 'none', color: activeTab === 'dashboard' ? 'white' : '#94a3b8', fontWeight: 600, borderRadius: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'all 0.2s' }} onClick={() => setActiveTab('dashboard')}>
                    <LayoutDashboard size={18} /> Tableau de bord
                </button>
                <button style={{ padding: '0.75rem 1.5rem', background: activeTab === 'areas' ? 'rgba(255,255,255,0.1)' : 'transparent', border: 'none', color: activeTab === 'areas' ? 'white' : '#94a3b8', fontWeight: 600, borderRadius: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'all 0.2s' }} onClick={() => setActiveTab('areas')}>
                    <Globe size={18} /> Administration Zones
                </button>
                <button style={{ padding: '0.75rem 1.5rem', background: activeTab === 'members' ? 'rgba(255,255,255,0.1)' : 'transparent', border: 'none', color: activeTab === 'members' ? 'white' : '#94a3b8', fontWeight: 600, borderRadius: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'all 0.2s' }} onClick={() => setActiveTab('members')}>
                    <Users size={18} /> Registre Membres
                </button>
                <button style={{ padding: '0.75rem 1.5rem', background: activeTab === 'staff' ? 'rgba(255,255,255,0.1)' : 'transparent', border: 'none', color: activeTab === 'staff' ? 'white' : '#94a3b8', fontWeight: 600, borderRadius: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'all 0.2s' }} onClick={() => setActiveTab('staff')}>
                    <UserCheck size={18} /> Staff & Hiérarchie
                </button>
                <button style={{ padding: '0.75rem 1.5rem', background: activeTab === 'reports' ? 'rgba(255,255,255,0.1)' : 'transparent', border: 'none', color: activeTab === 'reports' ? 'white' : '#94a3b8', fontWeight: 600, borderRadius: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'all 0.2s' }} onClick={() => setActiveTab('reports')}>
                    <FileBarChart size={18} /> Rapports
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
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div style={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '2rem', width: '100%', maxWidth: '500px', overflow: 'hidden' }}>
                        <div style={{ padding: '2.5rem 2rem', background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(0, 0, 0, 0.2))', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Repeat size={24} color="#60a5fa" /> Transférer {selectedMember.first_name}
                            </h2>
                            <button style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: '#94a3b8', padding: '0.5rem', borderRadius: '50%', cursor: 'pointer' }} onClick={() => setShowTransferModal(false)}>
                                <X size={20} />
                            </button>
                        </div>
                        <div style={{ padding: '2rem' }}>
                            <p style={{ color: '#94a3b8', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                                Vous pouvez affecter ce membre à une autre zone qui dépend de votre juridiction.
                            </p>
                            <form onSubmit={handleTransferMember}>
                                <div style={{ marginBottom: '1.5rem' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', color: '#94a3b8', fontSize: '0.85rem', fontWeight: 600 }}>Nouvelle Zone Affectée</label>
                                    <select required style={{ width: '100%', padding: '0.75rem 1rem', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0.75rem', color: 'white', outline: 'none' }} value={transferForm.new_area_id} onChange={e => setTransferForm({...transferForm, new_area_id: e.target.value})}>
                                        <option value="" style={{color: 'black'}}>Sélectionner une zone d'arrivée</option>
                                        {areas.map(a => <option style={{color: 'black'}} key={a.id} value={a.id}>{a.name} (N° {a.number})</option>)}
                                    </select>
                                </div>
                                <button type="submit" disabled={actionLoading} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.75rem', background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', color: 'white', border: 'none', borderRadius: '0.75rem', fontWeight: 700, cursor: 'pointer', marginTop: '1rem', boxShadow: '0 4px 14px rgba(59, 130, 246, 0.4)' }}>
                                    {actionLoading ? <Loader2 className={styles.spinnerSmall} /> : 'Valider le Transfert'}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal: Add Member */}
            {showMemberModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div style={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '2rem', width: '100%', maxWidth: '500px', overflow: 'hidden' }}>
                        <div style={{ padding: '2.5rem 2rem', background: 'linear-gradient(135deg, rgba(220, 38, 38, 0.1), rgba(0, 0, 0, 0.2))', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <UserPlus size={24} color="#ef4444" /> Enregistrer un Membre
                            </h2>
                            <button style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: '#94a3b8', padding: '0.5rem', borderRadius: '50%', cursor: 'pointer' }} onClick={() => setShowMemberModal(false)}>
                                <X size={20} />
                            </button>
                        </div>
                        <div style={{ padding: '2rem' }}>
                            <form onSubmit={handleCreateMember}>
                                <div style={{ marginBottom: '1.5rem' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', color: '#94a3b8', fontSize: '0.85rem', fontWeight: 600 }}>Prénom</label>
                                    <input required style={{ width: '100%', padding: '0.75rem 1rem', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0.75rem', color: 'white', outline: 'none' }} value={memberForm.first_name} onChange={e => setMemberForm({...memberForm, first_name: e.target.value})} placeholder="Prénom" />
                                </div>
                                <div style={{ marginBottom: '1.5rem' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', color: '#94a3b8', fontSize: '0.85rem', fontWeight: 600 }}>Nom de famille</label>
                                    <input required style={{ width: '100%', padding: '0.75rem 1rem', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0.75rem', color: 'white', outline: 'none' }} value={memberForm.last_name} onChange={e => setMemberForm({...memberForm, last_name: e.target.value})} placeholder="Nom" />
                                </div>
                                <div style={{ marginBottom: '1.5rem' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', color: '#94a3b8', fontSize: '0.85rem', fontWeight: 600 }}>Téléphone</label>
                                    <input style={{ width: '100%', padding: '0.75rem 1rem', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0.75rem', color: 'white', outline: 'none' }} value={memberForm.phone_primary} onChange={e => setMemberForm({...memberForm, phone_primary: e.target.value})} placeholder="+225..." />
                                </div>
                                <div style={{ marginBottom: '1.5rem' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', color: '#94a3b8', fontSize: '0.85rem', fontWeight: 600 }}>Affecter à une Zone</label>
                                    <select required style={{ width: '100%', padding: '0.75rem 1rem', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0.75rem', color: 'white', outline: 'none' }} value={memberForm.area_id} onChange={e => setMemberForm({...memberForm, area_id: e.target.value})}>
                                        <option value="" style={{color: 'black'}}>Sélectionner une zone</option>
                                        {areas.map(a => <option style={{color: 'black'}} key={a.id} value={a.id}>{a.name} (N° {a.number})</option>)}
                                    </select>
                                </div>
                                <button type="submit" disabled={actionLoading} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.75rem', background: 'linear-gradient(135deg, #DC2626 0%, #991B1B 100%)', color: 'white', border: 'none', borderRadius: '0.75rem', fontWeight: 700, cursor: 'pointer', marginTop: '1rem', boxShadow: '0 4px 14px rgba(220, 38, 38, 0.4)' }}>
                                    {actionLoading ? <Loader2 className={styles.spinnerSmall} /> : 'Valider la création'}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal: Edit Area */}
            {showAreaModal && selectedArea && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div style={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '2rem', width: '100%', maxWidth: '500px', overflow: 'hidden' }}>
                        <div style={{ padding: '2.5rem 2rem', background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(0, 0, 0, 0.2))', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Edit2 size={24} color="#f59e0b" /> Sécuriser la Zone
                            </h2>
                            <button style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: '#94a3b8', padding: '0.5rem', borderRadius: '50%', cursor: 'pointer' }} onClick={() => setShowAreaModal(false)}>
                                <X size={20} />
                            </button>
                        </div>
                        <div style={{ padding: '2rem' }}>
                            <form onSubmit={handleUpdateArea}>
                                <div style={{ marginBottom: '1.5rem' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', color: '#94a3b8', fontSize: '0.85rem', fontWeight: 600 }}>Nom Officiel de la Zone</label>
                                    <input required style={{ width: '100%', padding: '0.75rem 1rem', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0.75rem', color: 'white', outline: 'none' }} value={areaForm.name} onChange={e => setAreaForm({...areaForm, name: e.target.value})} />
                                </div>
                                <div style={{ marginBottom: '1.5rem' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', color: '#94a3b8', fontSize: '0.85rem', fontWeight: 600 }}>Numérotation Structurale</label>
                                    <input required type="number" style={{ width: '100%', padding: '0.75rem 1rem', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0.75rem', color: 'white', outline: 'none' }} value={areaForm.number} onChange={e => setAreaForm({...areaForm, number: e.target.value})} />
                                </div>
                                <button type="submit" disabled={actionLoading} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.75rem', background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', color: 'white', border: 'none', borderRadius: '0.75rem', fontWeight: 700, cursor: 'pointer', marginTop: '1rem', boxShadow: '0 4px 14px rgba(245, 158, 11, 0.4)' }}>
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
