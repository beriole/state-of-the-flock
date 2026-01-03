import React, { useState, useEffect } from 'react';
import { bacentaAPI, getPhotoUrl } from '../utils/api';
import {
    Calendar,
    MapPin,
    User,
    Clock,
    Plus,
    CheckCircle,
    Users,
    DollarSign,
    X,
    ChevronRight,
    BookOpen,
    Info,
    Layout,
    Camera,
    Upload,
    Trash2,
    Loader2
} from 'lucide-react';
import styles from './Bacenta.module.css';

const Bacenta = () => {
    const [meetings, setMeetings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('upcoming');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showAttendanceModal, setShowAttendanceModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedMeeting, setSelectedMeeting] = useState(null);
    const [members, setMembers] = useState([]);
    const [attendance, setAttendance] = useState({});
    const [showReportModal, setShowReportModal] = useState(false);
    const [reportData, setReportData] = useState({
        offerings: [
            { type: 'Offering', amount: 0, label: 'Offrande' },
            { type: 'Tithe', amount: 0, label: 'Dîme' },
            { type: 'Other', amount: 0, label: 'Autre' }
        ],
        preacher: '',
        theme: '',
        notes: ''
    });
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [uploading, setUploading] = useState(false);

    // Form State
    const [newMeeting, setNewMeeting] = useState({
        title: '',
        date: new Date().toISOString().split('T')[0],
        time: '18:00',
        location: '',
        host: '',
        type: 'weekly',
        expectedParticipants: 10,
        agenda: ['', '', '']
    });

    useEffect(() => {
        fetchMeetings();
        fetchMembers();
    }, []);

    const fetchMeetings = async () => {
        try {
            const response = await bacentaAPI.getMeetings();
            setMeetings(response.data.meetings || []);
        } catch (error) {
            console.error('Error fetching meetings:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchMembers = async () => {
        try {
            const response = await bacentaAPI.getMembers().catch(e => ({ data: [] }));
            const membersData = response?.data || [];
            setMembers(Array.isArray(membersData) ? membersData : []);
        } catch (error) {
            console.error('Error fetching members:', error);
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleCreateMeeting = async (e) => {
        e.preventDefault();
        try {
            setUploading(true);

            // Nettoyage de l'agenda avant envoi
            const cleanedMeeting = {
                ...newMeeting,
                agenda: newMeeting.agenda.filter(item => item && item.trim() !== '')
            };

            const response = await bacentaAPI.createMeeting(cleanedMeeting);
            const meetingId = response.data.id;

            if (selectedFile) {
                const formData = new FormData();
                formData.append('photo', selectedFile);
                await bacentaAPI.uploadPhoto(meetingId, formData);
            }

            setShowCreateModal(false);
            fetchMeetings();
            // Reset form
            setNewMeeting({
                title: '',
                date: new Date().toISOString().split('T')[0],
                time: '18:00',
                location: '',
                host: '',
                type: 'weekly',
                expectedParticipants: 10,
                agenda: ['', '', '']
            });
            setSelectedFile(null);
            setPreviewUrl(null);
        } catch (error) {
            console.error('Error creating meeting:', error);
        } finally {
            setUploading(false);
        }
    };

    const openAttendanceModal = (meeting) => {
        setSelectedMeeting(meeting);
        const initialAttendance = {};

        if (meeting.attendance && Array.isArray(meeting.attendance)) {
            meeting.attendance.forEach(record => {
                initialAttendance[record.member_id] = record.status;
            });
        }

        members.forEach(member => {
            if (!initialAttendance[member.id]) {
                initialAttendance[member.id] = 'present';
            }
        });

        setAttendance(initialAttendance);
        setShowAttendanceModal(true);
    };

    const handleAttendanceChange = (memberId, status) => {
        setAttendance(prev => ({
            ...prev,
            [memberId]: status
        }));
    };

    const saveAttendance = async () => {
        try {
            const attendanceData = Object.keys(attendance).map(memberId => ({
                member_id: memberId,
                status: attendance[memberId]
            }));

            await bacentaAPI.markAttendance(selectedMeeting.id, { attendance: attendanceData });
            setShowAttendanceModal(false);
            fetchMeetings();
        } catch (error) {
            console.error('Error saving attendance:', error);
        }
    };

    const openReportModal = (meeting) => {
        setSelectedMeeting(meeting);

        let initialOfferings = [
            { type: 'Offering', amount: 0, label: 'Offrande' },
            { type: 'Tithe', amount: 0, label: 'Dîme' },
            { type: 'Other', amount: 0, label: 'Autre' }
        ];

        if (meeting.offerings_breakdown) {
            initialOfferings = initialOfferings.map(def => {
                const existing = meeting.offerings_breakdown.find(o => o.type === def.type);
                return existing ? { ...def, amount: existing.amount } : def;
            });
        }

        setReportData({
            offerings: initialOfferings,
            preacher: meeting.preacher || '',
            theme: meeting.theme || '',
            notes: meeting.notes || ''
        });
        setShowReportModal(true);
    };

    const updateOfferingAmount = (index, value) => {
        const newOfferings = [...reportData.offerings];
        newOfferings[index].amount = parseInt(value) || 0;
        setReportData({ ...reportData, offerings: newOfferings });
    };

    const saveReport = async (e) => {
        e.preventDefault();
        try {
            setUploading(true);
            const offeringsData = reportData.offerings.filter(o => o.amount > 0);

            if (offeringsData.length > 0) {
                await bacentaAPI.addOfferings(selectedMeeting.id, { offerings: offeringsData });
            }

            if (selectedFile) {
                const formData = new FormData();
                formData.append('photo', selectedFile);
                await bacentaAPI.uploadPhoto(selectedMeeting.id, formData);
            }

            await bacentaAPI.updateMeeting(selectedMeeting.id, {
                details: {
                    preacher: reportData.preacher,
                    theme: reportData.theme,
                    notes: reportData.notes
                }
            });

            setShowReportModal(false);
            setSelectedFile(null);
            setPreviewUrl(null);
            fetchMeetings();
        } catch (error) {
            console.error('Error saving report:', error);
        } finally {
            setUploading(false);
        }
    };

    const getMeetingStatus = (meeting) => {
        const today = new Date();
        const meetingDate = new Date(meeting.date);
        today.setHours(0, 0, 0, 0);
        meetingDate.setHours(0, 0, 0, 0);

        if (meetingDate.getTime() === today.getTime()) return 'today';
        if (meetingDate < today) return meeting.status === 'completed' ? 'completed' : 'late';
        return 'planned';
    };

    const filteredMeetings = meetings.filter(meeting => {
        const status = getMeetingStatus(meeting);
        if (activeTab === 'upcoming') {
            return status === 'planned' || status === 'today' || status === 'late';
        }
        return status === 'completed';
    });

    const stats = {
        total: meetings.length,
        upcoming: meetings.filter(m => getMeetingStatus(m) === 'planned' || getMeetingStatus(m) === 'today').length,
        completed: meetings.filter(m => getMeetingStatus(m) === 'completed').length
    };

    const openDetailModal = (meeting) => {
        setSelectedMeeting(meeting);
        setShowDetailModal(true);
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>
                    <span key="title">Réunions Bacenta</span>
                </h1>
                <button className={styles.addButton} onClick={() => setShowCreateModal(true)}>
                    <Plus size={20} />
                    Nouvelle Réunion
                </button>
            </div>

            {/* Stats */}
            <div className={styles.statsRow}>
                <div className={styles.statCard}>
                    <div className={styles.statIcon} style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#60a5fa' }}>
                        <Layout size={28} />
                    </div>
                    <div className={styles.statInfo}>
                        <span className={styles.statValue} key={`total-${stats.total}`}>{stats.total}</span>
                        <span className={styles.statLabel} key="lbl-total">Total Réunions</span>
                    </div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statIcon} style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#fbbf24' }}>
                        <Calendar size={28} />
                    </div>
                    <div className={styles.statInfo}>
                        <span className={styles.statValue} key={`upcoming-${stats.upcoming}`}>{stats.upcoming}</span>
                        <span className={styles.statLabel} key="lbl-upcoming">À venir</span>
                    </div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statIcon} style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#34d399' }}>
                        <CheckCircle size={28} />
                    </div>
                    <div className={styles.statInfo}>
                        <span className={styles.statValue} key={`completed-${stats.completed}`}>{stats.completed}</span>
                        <span className={styles.statLabel} key="lbl-completed">Terminées</span>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className={styles.tabs}>
                <button
                    className={`${styles.tab} ${activeTab === 'upcoming' ? styles.tabActive : ''}`}
                    onClick={() => setActiveTab('upcoming')}
                >
                    À venir
                </button>
                <button
                    className={`${styles.tab} ${activeTab === 'completed' ? styles.tabActive : ''}`}
                    onClick={() => setActiveTab('completed')}
                >
                    Terminées
                </button>
            </div>

            {/* List */}
            {loading ? (
                <div className={styles.loading}>
                    <Loader2 className="animate-spin" size={24} />
                    <span key="loading-text" style={{ marginLeft: '10px' }}>Chargement des réunions...</span>
                </div>
            ) : filteredMeetings.length === 0 ? (
                <div className={styles.empty}>Aucune réunion trouvée pour cette catégorie.</div>
            ) : (
                <div className={styles.meetingsGrid}>
                    {filteredMeetings.map(meeting => {
                        const status = getMeetingStatus(meeting);
                        return (
                            <div key={meeting.id} className={styles.meetingCard}>
                                <div className={styles.meetingHeader}>
                                    <div>
                                        <h3 className={styles.meetingTitle}>
                                            <span key={`meeting-title-${meeting.id}`}>{meeting.title}</span>
                                        </h3>
                                        <span className={styles.meetingType}>
                                            {meeting.type === 'weekly' ? 'Hebdomadaire' :
                                                meeting.type === 'midweek' ? 'Mi-semaine' : 'Spéciale'}
                                        </span>
                                    </div>
                                    <span className={`${styles.statusBadge} ${status === 'today' ? styles.statusToday :
                                        status === 'completed' ? styles.statusCompleted :
                                            status === 'late' ? styles.statusLate :
                                                styles.statusPlanned
                                        }`}>
                                        {status === 'today' ? 'Aujourd\'hui' :
                                            status === 'completed' ? 'Terminée' :
                                                status === 'late' ? 'En retard' : 'Prévue'}
                                    </span>
                                </div>

                                <div className={styles.meetingDetails}>
                                    <div className={styles.detailRow}>
                                        <Calendar size={16} />
                                        {new Date(meeting.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                                    </div>
                                    <div className={styles.detailRow}>
                                        <Clock size={16} />
                                        {meeting.time}
                                    </div>
                                    <div className={styles.detailRow}>
                                        <MapPin size={16} />
                                        {meeting.location}
                                    </div>
                                    <div className={styles.detailRow}>
                                        <User size={16} />
                                        {meeting.host}
                                    </div>
                                </div>

                                <div className={styles.meetingStats}>
                                    <div className={styles.statItem}>
                                        <Users size={18} />
                                        <span>{meeting.attendance ? (Array.isArray(meeting.attendance) ? meeting.attendance.filter(a => a.status === 'present').length : 0) : 0} Présents</span>
                                    </div>
                                    <div className={styles.statItem}>
                                        <DollarSign size={18} />
                                        <span>{(meeting.offerings?.total || 0).toLocaleString()} XAF</span>
                                    </div>
                                </div>

                                <div className={styles.actions}>
                                    {status === 'today' || status === 'late' ? (
                                        <button
                                            className={`${styles.actionBtn} ${styles.primaryBtn}`}
                                            onClick={() => openAttendanceModal(meeting)}
                                        >
                                            <CheckCircle size={18} /> Faire l'appel
                                        </button>
                                    ) : status === 'completed' ? (
                                        <button
                                            className={`${styles.actionBtn} ${styles.primaryBtn}`}
                                            onClick={() => openReportModal(meeting)}
                                            style={{ background: '#3b82f6', boxShadow: '0 4px 12px rgba(59, 130, 246, 0.2)' }}
                                        >
                                            <BookOpen size={18} /> Rapport
                                        </button>
                                    ) : null}
                                    <button className={`${styles.actionBtn} ${styles.secondaryBtn}`} onClick={() => openDetailModal(meeting)}>
                                        <Info size={18} /> Détails
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Create Modal */}
            {showCreateModal && (
                <div className={styles.modalOverlay} onClick={() => setShowCreateModal(false)}>
                    <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h2 className={styles.modalTitle}>Nouvelle Réunion</h2>
                            <button className={styles.closeBtn} onClick={() => setShowCreateModal(false)}>
                                <X size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleCreateMeeting}>
                            <div className={styles.formGrid}>
                                <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                                    <label className={styles.label}>Titre de la réunion</label>
                                    <input
                                        className={styles.input}
                                        value={newMeeting.title}
                                        onChange={e => setNewMeeting({ ...newMeeting, title: e.target.value })}
                                        placeholder="Ex: Réunion de prière hebdomadaire"
                                        required
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Date</label>
                                    <input
                                        type="date"
                                        className={styles.input}
                                        value={newMeeting.date}
                                        onChange={e => setNewMeeting({ ...newMeeting, date: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Heure</label>
                                    <input
                                        type="time"
                                        className={styles.input}
                                        value={newMeeting.time}
                                        onChange={e => setNewMeeting({ ...newMeeting, time: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Lieu</label>
                                    <input
                                        className={styles.input}
                                        value={newMeeting.location}
                                        onChange={e => setNewMeeting({ ...newMeeting, location: e.target.value })}
                                        placeholder="Ex: Chez Frère Jean"
                                        required
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Hôte</label>
                                    <input
                                        className={styles.input}
                                        value={newMeeting.host}
                                        onChange={e => setNewMeeting({ ...newMeeting, host: e.target.value })}
                                        placeholder="Nom de l'hôte"
                                        required
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Type</label>
                                    <select
                                        className={styles.input}
                                        value={newMeeting.type}
                                        onChange={e => setNewMeeting({ ...newMeeting, type: e.target.value })}
                                    >
                                        <option value="weekly">Hebdomadaire</option>
                                        <option value="midweek">Mi-semaine</option>
                                        <option value="special">Spéciale</option>
                                    </select>
                                </div>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Participants attendus</label>
                                    <input
                                        type="number"
                                        className={styles.input}
                                        value={newMeeting.expectedParticipants}
                                        onChange={e => setNewMeeting({ ...newMeeting, expectedParticipants: parseInt(e.target.value) || 0 })}
                                        required
                                    />
                                </div>
                                <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                                    <label className={styles.label}>Agenda / Points clés</label>
                                    <div className={styles.agendaList}>
                                        {newMeeting.agenda.map((item, index) => (
                                            <div key={index} className={styles.agendaItem}>
                                                <span className={styles.agendaNumber}>{index + 1}</span>
                                                <input
                                                    className={styles.input}
                                                    value={item}
                                                    onChange={e => {
                                                        const newAgenda = [...newMeeting.agenda];
                                                        newAgenda[index] = e.target.value;
                                                        setNewMeeting({ ...newMeeting, agenda: newAgenda });
                                                    }}
                                                    placeholder={`Point ${index + 1}`}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                                    <label className={styles.label}>Photo de famille / réunion</label>
                                    {previewUrl ? (
                                        <div className={styles.photoPreviewContainer}>
                                            <img src={previewUrl} alt="Preview" className={styles.photoPreview} />
                                            <button
                                                type="button"
                                                className={styles.removePhotoBtn}
                                                onClick={() => {
                                                    setSelectedFile(null);
                                                    setPreviewUrl(null);
                                                }}
                                            >
                                                <X size={20} />
                                            </button>
                                            {uploading && (
                                                <div className={styles.loadingOverlay}>
                                                    <span>Upload en cours...</span>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div
                                            className={styles.photoUploadZone}
                                            onClick={() => document.getElementById('photoInput').click()}
                                        >
                                            <Camera size={48} className={styles.photoUploadIcon} />
                                            <span className={styles.photoUploadText}>Cliquez pour ajouter une photo</span>
                                            <input
                                                id="photoInput"
                                                type="file"
                                                accept="image/*"
                                                style={{ display: 'none' }}
                                                onChange={handleFileChange}
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className={styles.modalActions}>
                                <button type="button" className={styles.cancelBtn} onClick={() => setShowCreateModal(false)}>
                                    Annuler
                                </button>
                                <button type="submit" className={styles.submitBtn}>
                                    Créer la réunion
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Attendance Modal */}
            {showAttendanceModal && (
                <div className={styles.modalOverlay} onClick={() => setShowAttendanceModal(false)}>
                    <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h2 className={styles.modalTitle}>Faire l'appel</h2>
                            <button className={styles.closeBtn} onClick={() => setShowAttendanceModal(false)}>
                                <X size={24} />
                            </button>
                        </div>

                        <div className={styles.attendanceList}>
                            {members.map(member => (
                                <div key={member.id} className={styles.attendanceItem}>
                                    <div className={styles.memberInfo}>
                                        <div className={styles.memberAvatar}>
                                            {member.first_name?.charAt(0)}
                                        </div>
                                        <span className={styles.memberName}>
                                            {member.first_name} {member.last_name}
                                        </span>
                                    </div>
                                    <div className={styles.attendanceActions}>
                                        <button
                                            className={`${styles.attendanceBtn} ${styles.presentBtn} ${attendance[member.id] === 'present' ? styles.active : ''}`}
                                            onClick={() => handleAttendanceChange(member.id, 'present')}
                                            title="Présent"
                                        >
                                            <CheckCircle size={20} />
                                        </button>
                                        <button
                                            className={`${styles.attendanceBtn} ${styles.absentBtn} ${attendance[member.id] === 'absent' ? styles.active : ''}`}
                                            onClick={() => handleAttendanceChange(member.id, 'absent')}
                                            title="Absent"
                                        >
                                            <X size={20} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className={styles.modalActions}>
                            <button className={styles.cancelBtn} onClick={() => setShowAttendanceModal(false)}>
                                Annuler
                            </button>
                            <button className={styles.submitBtn} onClick={saveAttendance}>
                                Enregistrer les présences
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Detail Modal */}
            {showDetailModal && selectedMeeting && (
                <div className={styles.modalOverlay} onClick={() => setShowDetailModal(false)}>
                    <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h2 className={styles.modalTitle}>Détails de la Réunion</h2>
                            <button className={styles.closeBtn} onClick={() => setShowDetailModal(false)}>
                                <X size={24} />
                            </button>
                        </div>

                        <div className={styles.meetingInfo}>
                            <h3 style={{ color: '#DC2626', marginBottom: '1rem' }}>{selectedMeeting.title}</h3>
                            <div className={styles.meetingDetails} style={{ gridTemplateColumns: '1fr' }}>
                                <div className={styles.detailRow}><Calendar size={18} /> {new Date(selectedMeeting.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</div>
                                <div className={styles.detailRow}><Clock size={18} /> {selectedMeeting.time}</div>
                                <div className={styles.detailRow}><MapPin size={18} /> {selectedMeeting.location}</div>
                                <div className={styles.detailRow}><User size={18} /> Hôte : {selectedMeeting.host}</div>
                            </div>

                            {selectedMeeting.agenda && selectedMeeting.agenda.some(a => a) && (
                                <div style={{ marginTop: '2rem' }}>
                                    <h4 className={styles.label}>Agenda de la réunion</h4>
                                    <div className={styles.agendaList}>
                                        {selectedMeeting.agenda.filter(a => a).map((item, index) => (
                                            <div key={index} className={styles.agendaItem}>
                                                <span className={styles.agendaNumber}>{index + 1}</span>
                                                <span style={{ color: '#e2e8f0' }}>{item}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {(selectedMeeting.photo_url || selectedMeeting.familyPhoto) && (
                                <div style={{ marginTop: '2rem' }}>
                                    <h4 className={styles.label}>Photo de la réunion</h4>
                                    <div className={styles.photoPreviewContainer}>
                                        <img
                                            src={getPhotoUrl(selectedMeeting.photo_url || selectedMeeting.familyPhoto)}
                                            alt="Réunion"
                                            className={styles.photoPreview}
                                        />
                                    </div>
                                </div>
                            )}

                            {selectedMeeting.notes && (
                                <div style={{ marginTop: '2rem' }}>
                                    <h4 className={styles.label}>Notes & Témoignages</h4>
                                    <p style={{ color: '#94a3b8', background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '1rem' }}>
                                        {selectedMeeting.notes}
                                    </p>
                                </div>
                            )}
                        </div>

                        <div className={styles.modalActions}>
                            <button className={styles.submitBtn} onClick={() => setShowDetailModal(false)}>
                                Fermer
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Report Modal */}
            {showReportModal && (
                <div className={styles.modalOverlay} onClick={() => setShowReportModal(false)}>
                    <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h2 className={styles.modalTitle}>Rapport de Culte</h2>
                            <button className={styles.closeBtn} onClick={() => setShowReportModal(false)}>
                                <X size={24} />
                            </button>
                        </div>
                        <form onSubmit={saveReport}>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Offrandes (XAF)</label>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    {reportData.offerings.map((offering, index) => (
                                        <div key={offering.type} className={styles.offeringItem}>
                                            <label className={styles.label} style={{ fontSize: '0.75rem' }}>{offering.label}</label>
                                            <div style={{ position: 'relative' }}>
                                                <DollarSign size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                                                <input
                                                    type="number"
                                                    className={styles.input}
                                                    style={{ paddingLeft: '2.5rem' }}
                                                    value={offering.amount}
                                                    onChange={e => updateOfferingAmount(index, e.target.value)}
                                                    placeholder="0"
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className={styles.formGrid}>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Prédicateur</label>
                                    <input
                                        className={styles.input}
                                        value={reportData.preacher}
                                        onChange={e => setReportData({ ...reportData, preacher: e.target.value })}
                                        placeholder="Nom du prédicateur"
                                    />
                                </div>

                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Thème du message</label>
                                    <input
                                        className={styles.input}
                                        value={reportData.theme}
                                        onChange={e => setReportData({ ...reportData, theme: e.target.value })}
                                        placeholder="Titre ou thème"
                                    />
                                </div>

                                <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                                    <label className={styles.label}>Notes & Témoignages</label>
                                    <textarea
                                        className={styles.textarea}
                                        value={reportData.notes}
                                        onChange={e => setReportData({ ...reportData, notes: e.target.value })}
                                        placeholder="Points clés, témoignages, etc."
                                    />
                                </div>

                                <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                                    <label className={styles.label}>Photo de famille / réunion</label>
                                    {previewUrl || selectedMeeting?.photo_url || selectedMeeting?.familyPhoto ? (
                                        <div className={styles.photoPreviewContainer}>
                                            <img
                                                src={previewUrl || getPhotoUrl(selectedMeeting?.photo_url || selectedMeeting?.familyPhoto)}
                                                alt="Preview"
                                                className={styles.photoPreview}
                                            />
                                            <button
                                                type="button"
                                                className={styles.removePhotoBtn}
                                                onClick={() => {
                                                    setSelectedFile(null);
                                                    setPreviewUrl(null);
                                                }}
                                            >
                                                <X size={20} />
                                            </button>
                                        </div>
                                    ) : (
                                        <div
                                            className={styles.photoUploadZone}
                                            onClick={() => document.getElementById('reportPhotoInput').click()}
                                        >
                                            <Camera size={48} className={styles.photoUploadIcon} />
                                            <span className={styles.photoUploadText}>Cliquez pour ajouter une photo</span>
                                            <input
                                                id="reportPhotoInput"
                                                type="file"
                                                accept="image/*"
                                                style={{ display: 'none' }}
                                                onChange={handleFileChange}
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className={styles.modalActions}>
                                <button type="button" className={styles.cancelBtn} onClick={() => setShowReportModal(false)}>
                                    Annuler
                                </button>
                                <button type="submit" className={styles.submitBtn}>
                                    Enregistrer le rapport
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Bacenta;
