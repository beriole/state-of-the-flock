import React, { useState, useEffect } from 'react';
import { callLogAPI, memberAPI } from '../utils/api';
import {
    Phone,
    MessageSquare,
    Clock,
    CheckCircle,
    User,
    Calendar,
    Search,
    Filter,
    Plus,
    X,
    Loader2
} from 'lucide-react';
import styles from './CallCenter.module.css';

const CallCenter = () => {
    const [members, setMembers] = useState([]);
    const [callLogs, setCallLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showLogModal, setShowLogModal] = useState(false);
    const [selectedMember, setSelectedMember] = useState(null);

    // Form State
    const [logData, setLogData] = useState({
        contact_method: 'Phone',
        notes: '',
        call_duration: '5',
        outcome: 'Contacted'
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [membersRes, logsRes] = await Promise.all([
                memberAPI.getMembers().catch(e => ({ data: { members: [] } })),
                callLogAPI.getCallLogs().catch(e => ({ data: { callLogs: [] } }))
            ]);

            const membersData = membersRes?.data?.members || [];
            const logsData = logsRes?.data?.callLogs || [];

            setMembers(Array.isArray(membersData) ? membersData : []);
            setCallLogs(Array.isArray(logsData) ? logsData : []);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const openLogModal = (member) => {
        setSelectedMember(member);
        setLogData({
            contact_method: 'Phone',
            notes: '',
            call_duration: '5',
            outcome: 'Contacted'
        });
        setShowLogModal(true);
    };

    const handleSaveLog = async (e) => {
        e.preventDefault();
        try {
            await callLogAPI.createCallLog({
                member_id: selectedMember.id,
                ...logData
            });
            setShowLogModal(false);
            fetchData(); // Refresh logs
        } catch (error) {
            console.error('Error saving log:', error);
        }
    };

    const getStats = () => {
        const today = new Date().toISOString().split('T')[0];
        const logs = Array.isArray(callLogs) ? callLogs : [];
        const todayLogs = logs.filter(log => log && log.call_date && log.call_date.startsWith(today));

        return {
            totalCalls: logs.filter(l => l && l.contact_method === 'Phone').length,
            todayCalls: todayLogs.filter(l => l && l.contact_method === 'Phone').length,
            reached: logs.filter(l => l && l.outcome === 'Contacted').length
        };
    };

    const stats = getStats();

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>Centre d'Appels</h1>
                <div className={styles.actions}>
                    {/* Add filters here if needed */}
                </div>
            </div>

            {/* Stats */}
            <div className={styles.statsRow}>
                <div className={styles.statCard}>
                    <div className={styles.statIcon} style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#60a5fa' }}>
                        <Phone size={24} />
                    </div>
                    <div className={styles.statInfo}>
                        <span className={styles.statValue} key={`today-${stats.todayCalls}`}>{stats.todayCalls}</span>
                        <span className={styles.statLabel} key="lbl-today">Appels aujourd'hui</span>
                    </div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statIcon} style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#34d399' }}>
                        <CheckCircle size={24} />
                    </div>
                    <div className={styles.statInfo}>
                        <span className={styles.statValue} key={`reached-${stats.reached}`}>{stats.reached}</span>
                        <span className={styles.statLabel} key="lbl-reached">Joignables</span>
                    </div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statIcon} style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#fbbf24' }}>
                        <Clock size={24} />
                    </div>
                    <div className={styles.statInfo}>
                        <span className={styles.statValue} key={`total-${stats.totalCalls}`}>{stats.totalCalls}</span>
                        <span className={styles.statLabel} key="lbl-total">Total Appels</span>
                    </div>
                </div>
            </div>

            <div className={styles.contentGrid}>
                {/* Members List to Call */}
                <div className={styles.mainSection}>
                    <h2 className={styles.sectionTitle}>
                        <User size={20} /> Membres à contacter
                    </h2>
                    {loading ? (
                        <div className={styles.loading}>
                            <Loader2 className="animate-spin" size={24} />
                            <span key="loading-text" style={{ marginLeft: '10px' }}>Chargement...</span>
                        </div>
                    ) : (
                        <div className={styles.callList}>
                            {(Array.isArray(members) ? members : []).slice(0, 10).map(member => (
                                <div key={member.id} className={styles.callCard}>
                                    <div className={styles.memberInfo}>
                                        <div className={styles.avatar}>
                                            {member.first_name?.charAt(0)}
                                        </div>
                                        <div className={styles.info}>
                                            <span className={styles.name} key={`name-${member.id}`}>{member.first_name} {member.last_name}</span>
                                            <span className={styles.details} key={`details-${member.id}`}>
                                                <Phone size={14} /> {member.phone_primary || member.phone}
                                            </span>
                                        </div>
                                    </div>
                                    <div className={styles.actions}>
                                        <button
                                            className={`${styles.actionBtn} ${styles.callBtn}`}
                                            onClick={() => openLogModal(member)}
                                            title="Enregistrer un appel"
                                        >
                                            <Phone size={18} />
                                        </button>
                                        <button
                                            className={`${styles.actionBtn} ${styles.messageBtn}`}
                                            title="Envoyer un message"
                                        >
                                            <MessageSquare size={18} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Recent History */}
                <div className={styles.historySection}>
                    <h2 className={styles.sectionTitle}>
                        <Clock size={20} /> Historique Récent
                    </h2>
                    <div className={styles.historyList}>
                        {(Array.isArray(callLogs) ? callLogs : []).slice(0, 10).map(log => (
                            <div key={log.id} className={`${styles.historyItem} ${styles[log.contact_method?.toLowerCase()]}`}>
                                <div className={styles.historyHeader}>
                                    <span style={{ fontWeight: 600, color: 'white' }} key={`log-name-${log.id}`}>
                                        {log.member?.first_name || 'Membre'}
                                    </span>
                                    <span key={`log-date-${log.id}`}>{new Date(log.call_date).toLocaleDateString()}</span>
                                </div>
                                <div className={styles.historyContent}>
                                    {log.notes}
                                </div>
                                <div className={styles.historyFooter}>
                                    <span>{log.contact_method}</span>
                                    <span>•</span>
                                    <span>{log.outcome}</span>
                                </div>
                            </div>
                        ))}
                        {callLogs.length === 0 && (
                            <div className={styles.empty}>Aucun historique</div>
                        )}
                    </div>
                </div>
            </div>

            {/* Log Modal */}
            {showLogModal && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContent}>
                        <div className={styles.modalHeader}>
                            <h2 className={styles.modalTitle}>Enregistrer un contact</h2>
                            <button className={styles.closeBtn} onClick={() => setShowLogModal(false)}>
                                <X size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleSaveLog}>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Membre</label>
                                <input
                                    className={styles.input}
                                    value={`${selectedMember?.first_name} ${selectedMember?.last_name}`}
                                    disabled
                                    style={{ opacity: 0.7 }}
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label className={styles.label}>Type de contact</label>
                                <select
                                    className={styles.select}
                                    value={logData.contact_method}
                                    onChange={e => setLogData({ ...logData, contact_method: e.target.value })}
                                >
                                    <option value="Phone">Appel Téléphonique</option>
                                    <option value="WhatsApp">WhatsApp</option>
                                    <option value="SMS">SMS</option>
                                    <option value="Visit">Visite</option>
                                </select>
                            </div>

                            <div className={styles.formGroup}>
                                <label className={styles.label}>Résultat</label>
                                <select
                                    className={styles.select}
                                    value={logData.outcome}
                                    onChange={e => setLogData({ ...logData, outcome: e.target.value })}
                                >
                                    <option value="Contacted">Joint / Rencontré</option>
                                    <option value="No_Answer">Pas de réponse</option>
                                    <option value="Callback_Requested">Rappel demandé</option>
                                    <option value="Wrong_Number">Mauvais numéro</option>
                                    <option value="Other">Autre</option>
                                </select>
                            </div>

                            <div className={styles.formGroup}>
                                <label className={styles.label}>Durée (minutes)</label>
                                <input
                                    type="number"
                                    className={styles.input}
                                    value={logData.call_duration}
                                    onChange={e => setLogData({ ...logData, call_duration: e.target.value })}
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label className={styles.label}>Résumé / Notes</label>
                                <textarea
                                    className={styles.textarea}
                                    value={logData.notes}
                                    onChange={e => setLogData({ ...logData, notes: e.target.value })}
                                    placeholder="De quoi avez-vous parlé ?"
                                    required
                                />
                            </div>

                            <div className={styles.modalActions}>
                                <button type="button" className={styles.cancelBtn} onClick={() => setShowLogModal(false)}>
                                    Annuler
                                </button>
                                <button type="submit" className={styles.submitBtn}>
                                    Enregistrer
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CallCenter;
