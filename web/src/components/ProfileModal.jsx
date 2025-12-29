import React, { useState } from 'react';
import { X, User, Mail, Phone, Lock, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import styles from './ProfileModal.module.css';
import api from '../utils/api';

const ProfileModal = ({ isOpen, onClose }) => {
    const { user, logout } = useAuth();
    const [activeTab, setActiveTab] = useState('info'); // 'info' or 'password'
    const [passwords, setPasswords] = useState({
        current: '',
        new: '',
        confirm: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    if (!isOpen || !user) return null;

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        if (passwords.new !== passwords.confirm) {
            setError('Les mots de passe ne correspondent pas');
            return;
        }

        if (passwords.new.length < 6) {
            setError('Le mot de passe doit contenir au moins 6 caractères');
            return;
        }

        setLoading(true);
        try {
            await api.post('/auth/change-password', {
                currentPassword: passwords.current,
                newPassword: passwords.new
            });
            setSuccess('Mot de passe modifié avec succès');
            setPasswords({ current: '', new: '', confirm: '' });
            setTimeout(() => {
                onClose();
            }, 2000);
        } catch (err) {
            setError(err.response?.data?.error || 'Erreur lors du changement de mot de passe');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={e => e.stopPropagation()}>
                <div className={styles.header}>
                    <h2>Profil Utilisateur</h2>
                    <button className={styles.closeBtn} onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                <div className={styles.content}>
                    <div className={styles.userInfo}>
                        <div className={styles.avatar}>
                            {user.first_name?.charAt(0) || 'U'}
                        </div>
                        <h3 className={styles.userName}>{user.first_name} {user.last_name}</h3>
                        <span className={styles.userRole}>{user.role?.replace('_', ' ')}</span>
                    </div>

                    {activeTab === 'info' ? (
                        <>
                            <div className={styles.infoGrid}>
                                <div className={styles.infoItem}>
                                    <span className={styles.label}><Mail size={14} /> Email</span>
                                    <span className={styles.value}>{user.email}</span>
                                </div>
                                {user.phone && (
                                    <div className={styles.infoItem}>
                                        <span className={styles.label}><Phone size={14} /> Téléphone</span>
                                        <span className={styles.value}>{user.phone}</span>
                                    </div>
                                )}
                            </div>

                            <div className={styles.actions}>
                                <button
                                    className={`${styles.btn} ${styles.btnPrimary}`}
                                    onClick={() => setActiveTab('password')}
                                >
                                    <Lock size={18} /> Changer mot de passe
                                </button>
                                <button
                                    className={`${styles.btn} ${styles.btnDanger}`}
                                    onClick={logout}
                                >
                                    <LogOut size={18} /> Déconnexion
                                </button>
                            </div>
                        </>
                    ) : (
                        <form onSubmit={handlePasswordChange}>
                            {error && <div className={styles.error}>{error}</div>}
                            {success && <div className={styles.success}>{success}</div>}

                            <div className={styles.formGroup}>
                                <label>Mot de passe actuel</label>
                                <input
                                    type="password"
                                    className={styles.input}
                                    value={passwords.current}
                                    onChange={e => setPasswords({ ...passwords, current: e.target.value })}
                                    required
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Nouveau mot de passe</label>
                                <input
                                    type="password"
                                    className={styles.input}
                                    value={passwords.new}
                                    onChange={e => setPasswords({ ...passwords, new: e.target.value })}
                                    required
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Confirmer le mot de passe</label>
                                <input
                                    type="password"
                                    className={styles.input}
                                    value={passwords.confirm}
                                    onChange={e => setPasswords({ ...passwords, confirm: e.target.value })}
                                    required
                                />
                            </div>

                            <div className={styles.actions}>
                                <button
                                    type="button"
                                    className={styles.btn}
                                    onClick={() => setActiveTab('info')}
                                    disabled={loading}
                                >
                                    Annuler
                                </button>
                                <button
                                    type="submit"
                                    className={`${styles.btn} ${styles.btnPrimary}`}
                                    disabled={loading}
                                >
                                    {loading ? 'Modification...' : 'Enregistrer'}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProfileModal;
