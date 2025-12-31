import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { memberAPI, callLogAPI } from '../utils/api';
import {
    ArrowLeft,
    Phone,
    MessageCircle,
    Edit2,
    Calendar,
    User,
    MapPin,
    Clock,
    CheckCircle,
    XCircle,
    PhoneMissed,
    RotateCcw,
    Camera,
    Loader2,
    Briefcase,
    BookOpen,
    Users,
    AlertCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ContactModal } from '../components/ContactModals';
import styles from './MemberDetail.module.css';

const MemberDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [member, setMember] = useState(null);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState(null);
    const [callLogs, setCallLogs] = useState([]);
    const [isContactModalOpen, setIsContactModalOpen] = useState(false);
    const { user } = useAuth();
    const fileInputRef = React.useRef(null);
    const [stats, setStats] = useState({
        totalCalls: 0,
        contacted: 0,
        noAnswer: 0
    });

    useEffect(() => {
        fetchMemberDetails();
        fetchCallLogs();
    }, [id]);

    const fetchMemberDetails = async () => {
        try {
            const response = await memberAPI.getMemberById(id);
            setMember(response.data);
        } catch (err) {
            console.error('Error fetching member:', err);
            setError('Impossible de charger les détails du membre.');
        } finally {
            setLoading(false);
        }
    };

    const fetchCallLogs = async () => {
        try {
            const response = await callLogAPI.getCallLogs({ member_id: id });
            const logs = response.data.callLogs || [];
            setCallLogs(logs);

            // Calculate stats
            setStats({
                totalCalls: logs.length,
                contacted: logs.filter(l => l.outcome === 'Contacted').length,
                noAnswer: logs.filter(l => l.outcome === 'No_Answer').length
            });
        } catch (err) {
            console.error('Error fetching call logs:', err);
        }
    };

    const handleActionComplete = async (type, method, templateTitle) => {
        try {
            await callLogAPI.createCallLog({
                member_id: id,
                outcome: 'Contacted',
                contact_method: method === 'whatsapp' ? 'WhatsApp' : (type === 'Call' ? 'Phone' : 'SMS'),
                notes: `${type} via ${method}${templateTitle ? ` (Modèle: ${templateTitle})` : ''}`
            });
            fetchCallLogs(); // Refresh history
        } catch (error) {
            console.error('Error logging action:', error);
        }
    };

    const handleCall = () => {
        if (member?.phone_primary) {
            setIsContactModalOpen(true);
        }
    };

    const handleSMS = () => {
        if (member?.phone_primary) {
            setIsContactModalOpen(true);
        }
    };

    const handlePhotoUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            alert('Veuillez sélectionner une image');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            alert('L\'image est trop volumineuse (max 5Mo)');
            return;
        }

        const formData = new FormData();
        formData.append('photo', file);

        setUploading(true);
        try {
            const response = await memberAPI.uploadPhoto(id, formData);
            setMember({ ...member, photo_url: response.data.photo_url });
        } catch (err) {
            console.error('Error uploading photo:', err);
            const errorMsg = err.response?.data?.error || 'Erreur lors de l\'upload de la photo';
            alert(errorMsg);
        } finally {
            setUploading(false);
        }
    };

    const getPhotoUrl = (url) => {
        if (!url) return null;
        if (url.startsWith('http')) return url;
        return `/${url}`;
    };

    if (loading) return (
        <div className={styles.loading}>
            <Loader2 className={styles.spinner} size={40} style={{ margin: '0 auto 1rem' }} />
            <div>Chargement des détails...</div>
        </div>
    );

    if (error) return (
        <div className={styles.error}>
            <AlertCircle size={40} style={{ margin: '0 auto 1rem' }} />
            <div>{error}</div>
        </div>
    );

    if (!member) return <div className={styles.error}>Membre introuvable</div>;

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <button className={styles.backBtn} onClick={() => navigate('/members')}>
                    <ArrowLeft size={18} />
                </button>
                <h1 className={styles.title}>Fiche Membre</h1>
            </header>

            <div className={styles.mainGrid}>
                {/* Profile Sidebar */}
                <aside className={`${styles.card} styles.profileSidebar`}>
                    <div className={styles.profileSidebar}>
                        <div
                            className={styles.avatarWrapper}
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <div className={styles.avatar}>
                                {member.photo_url ? (
                                    <img src={getPhotoUrl(member.photo_url)} alt="Member" className={styles.avatar} />
                                ) : (
                                    member.first_name?.charAt(0)
                                )}
                            </div>
                            <div className={styles.uploadOverlay}>
                                {uploading ? <Loader2 className={styles.spin} size={14} /> : <Camera size={14} />}
                            </div>
                        </div>
                        <input
                            type="file"
                            ref={fileInputRef}
                            style={{ display: 'none' }}
                            onChange={handlePhotoUpload}
                            accept="image/*"
                        />

                        <h2 className={styles.memberName}>{member.first_name} {member.last_name}</h2>
                        <div className={styles.badge}>{member.state || 'Membre'}</div>

                        <div className={styles.actions}>
                            <button className={styles.primaryAction} onClick={handleCall}>
                                <Phone size={16} /> Appeler
                            </button>
                            <button className={styles.secondaryAction} onClick={handleSMS}>
                                <MessageCircle size={16} /> SMS
                            </button>
                            <button
                                className={styles.secondaryAction}
                                onClick={() => navigate(`/members/${member.id}/edit`)}
                            >
                                <Edit2 size={16} /> Modifier
                            </button>
                        </div>
                    </div>
                </aside>

                {/* Content Area */}
                <main className={styles.contentArea}>
                    {/* Stats */}
                    <div className={styles.statsRow}>
                        <div className={`${styles.card} ${styles.statItem}`}>
                            <div className={styles.statIcon} style={{ color: '#60a5fa' }}><Phone size={18} /></div>
                            <div>
                                <span className={styles.statValue}>{stats.totalCalls}</span>
                                <span className={styles.statLabel}>Appels</span>
                            </div>
                        </div>
                        <div className={`${styles.card} ${styles.statItem}`}>
                            <div className={styles.statIcon} style={{ color: '#34d399' }}><CheckCircle size={18} /></div>
                            <div>
                                <span className={styles.statValue}>{stats.contacted}</span>
                                <span className={styles.statLabel}>Joignables</span>
                            </div>
                        </div>
                        <div className={`${styles.card} ${styles.statItem}`}>
                            <div className={styles.statIcon} style={{ color: '#f87171' }}><PhoneMissed size={18} /></div>
                            <div>
                                <span className={styles.statValue}>{stats.noAnswer}</span>
                                <span className={styles.statLabel}>Échecs</span>
                            </div>
                        </div>
                    </div>

                    {/* Personal Info */}
                    <div className={`${styles.card} ${styles.section}`}>
                        <h3 className={styles.sectionTitle}><User size={16} /> Informations</h3>
                        <div className={styles.infoGrid}>
                            <div className={styles.infoItem}>
                                <span className={styles.infoLabel}>Téléphone</span>
                                <span className={styles.infoValue}>{member.phone_primary || '-'}</span>
                            </div>
                            <div className={styles.infoItem}>
                                <span className={styles.infoLabel}>Genre</span>
                                <span className={styles.infoValue}>{member.gender === 'M' ? 'Homme' : 'Femme'}</span>
                            </div>
                            <div className={styles.infoItem}>
                                <span className={styles.infoLabel}>Profession</span>
                                <span className={styles.infoValue}>{member.profession || 'N/A'}</span>
                            </div>
                            <div className={styles.infoItem}>
                                <span className={styles.infoLabel}>Ministère</span>
                                <span className={styles.infoValue}>{member.ministry || 'N/A'}</span>
                            </div>
                            <div className={styles.infoItem}>
                                <span className={styles.infoLabel}>Bacenta</span>
                                <span className={styles.infoValue}>{member.area?.name || 'N/A'}</span>
                            </div>
                            <div className={styles.infoItem}>
                                <span className={styles.infoLabel}>Berger</span>
                                <span className={styles.infoValue}>{member.leader ? `${member.leader.first_name} ${member.leader.last_name}` : 'N/A'}</span>
                            </div>
                        </div>
                    </div>

                    {/* History */}
                    <div className={`${styles.card} ${styles.section}`}>
                        <h3 className={styles.sectionTitle}><Clock size={16} /> Activité Récente</h3>
                        <div className={styles.historyList}>
                            {callLogs.length > 0 ? (
                                callLogs.slice(0, 5).map((log) => (
                                    <div key={log.id} className={styles.historyItem}>
                                        <div className={styles.historyIcon} style={{
                                            color: log.outcome === 'Contacted' ? '#34d399' : '#f87171'
                                        }}>
                                            {log.outcome === 'Contacted' ? <CheckCircle size={18} /> : <PhoneMissed size={18} />}
                                        </div>
                                        <div className={styles.historyContent}>
                                            <div>
                                                <span className={styles.historyDate}>{new Date(log.call_date).toLocaleDateString()}</span>
                                                <span className={styles.historyStatus}>{log.outcome}</span>
                                            </div>
                                            <p className={styles.historyNotes}>{log.notes || 'Aucun commentaire'}</p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p style={{ textAlign: 'center', opacity: 0.5, padding: '1rem' }}>Aucune historique disponible</p>
                            )}
                        </div>
                    </div>
                </main>
            </div>

            <ContactModal
                isOpen={isContactModalOpen}
                onClose={() => setIsContactModalOpen(false)}
                member={member}
                authUser={user}
                onActionComplete={handleActionComplete}
            />
        </div>
    );
};

export default MemberDetail;
