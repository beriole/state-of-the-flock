import React, { useState } from 'react';
import { X, User, Mail, Phone, Lock, LogOut, Camera, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import styles from './ProfileModal.module.css';
import api from '../utils/api';

const ProfileModal = ({ isOpen, onClose }) => {
    const { user, logout, updateUser } = useAuth();
    const [activeTab, setActiveTab] = useState('info'); // 'info' or 'password'
    const [passwords, setPasswords] = useState({
        current: '',
        new: '',
        confirm: ''
    });
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const fileInputRef = React.useRef(null);

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

    const handlePhotoUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validation
        if (!file.type.startsWith('image/')) {
            setError('Veuillez sélectionner une image');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setError('L\'image est trop volumineuse (max 5Mo)');
            return;
        }

        const formData = new FormData();
        formData.append('photo', file);

        setUploading(true);
        setError(null);
        try {
            const response = await api.post('/users/profile-picture', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            // Mettre à jour l'utilisateur localement
            updateUser({ ...user, photo_url: response.data.photo_url });
            setSuccess('Photo de profil mise à jour');
        } catch (err) {
            setError(err.response?.data?.error || 'Erreur lors de l\'upload de la photo');
        } finally {
            setUploading(false);
        }
    };

    const getPhotoUrl = (url) => {
        if (!url) return null;
        if (url.startsWith('http')) return url;
        return `/${url}`;
    };

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={e => e.stopPropagation()}>
                {uploading && (
                    <div className={styles.loadingOverlay}>
                        <div className={styles.spinner}></div>
                        <span style={{ color: 'white', fontWeight: 600 }}>Upload en cours...</span>
                    </div>
                )}

                <div className={styles.header}>
                    <h2>Profil Utilisateur</h2>
                    <button className={styles.closeBtn} onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                <div className={styles.content}>
                    {error && (
                        <div className={styles.error}>
                            <AlertCircle size={18} />
                            <span>{error}</span>
                        </div>
                    )}
                    {success && <div className={styles.success}>{success}</div>}

                    <div className={styles.userInfo}>
                        <div
                            className={styles.avatarWrapper}
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <div className={styles.avatar}>
                                {user.photo_url ? (
                                    <img src={getPhotoUrl(user.photo_url)} alt="Profile" />
                                ) : (
                                    user.first_name?.charAt(0) || 'U'
                                )}
                            </div>
                            <div className={styles.editAvatarHint}>
                                <Camera size={18} />
                            </div>
                        </div>
                        <input
                            type="file"
                            ref={fileInputRef}
                            style={{ display: 'none' }}
                            onChange={handlePhotoUpload}
                            accept="image/*"
                        />
                        <h3 className={styles.userName}>{user.first_name} {user.last_name}</h3>
                        <span className={styles.userRole}>{user.role?.replace('_', ' ')}</span>
                    </div>

                    {activeTab === 'info' ? (
                        <>
                            <div className={styles.infoGrid}>
                                <div className={styles.infoItem}>
                                    <span className={styles.label}><Mail size={14} /> Messagerie électronique</span>
                                    <span className={styles.value}>{user.email}</span>
                                </div>
                                <div className={styles.infoItem}>
                                    <span className={styles.label}><Phone size={14} /> Téléphone</span>
                                    <span className={styles.value}>{user.phone || 'Non renseigné'}</span>
                                </div>
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
                            <div className={styles.formGroup}>
                                <label>Mot de passe actuel</label>
                                <input
                                    type="password"
                                    className={styles.input}
                                    placeholder="••••••••"
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
                                    placeholder="Min. 6 caractères"
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
                                    placeholder="Confirmez votre nouveau MDP"
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
                                    {loading ? (
                                        <>
                                            <Loader2 className={styles.spin} size={18} />
                                            <span>Modification...</span>
                                        </>
                                    ) : 'Enregistrer le mot de passe'}
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
