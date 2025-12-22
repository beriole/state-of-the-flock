import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { memberAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Save, Loader } from 'lucide-react';
import styles from './MemberForm.module.css';

const MemberForm = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const { user } = useAuth();
    const isEditMode = !!id;

    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(isEditMode);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        gender: 'M',
        phone_primary: '',
        phone_secondary: '',
        // Champs par défaut ou cachés
        state: 'Sheep',
        is_active: true
    });

    useEffect(() => {
        if (isEditMode) {
            fetchMember();
        }
    }, [id]);

    const fetchMember = async () => {
        try {
            const response = await memberAPI.getMemberById(id);
            setFormData(response.data);
        } catch (err) {
            console.error('Error fetching member:', err);
            setError('Impossible de charger les informations du membre.');
        } finally {
            setInitialLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const dataToSend = {
                ...formData,
                // Valeurs par défaut pour la création si non définies
                state: formData.state || 'Sheep',
                is_active: formData.is_active !== undefined ? formData.is_active : true,
                is_registered: false
            };

            if (isEditMode) {
                await memberAPI.updateMember(id, dataToSend);
            } else {
                // Ajouter les IDs du leader et de la zone pour la création
                const finalData = {
                    ...dataToSend,
                    leader_id: user?.id,
                    area_id: user?.area_id
                };
                await memberAPI.createMember(finalData);
            }
            navigate('/members');
        } catch (err) {
            console.error('Error saving member:', err);
            setError(err.response?.data?.error || 'Une erreur est survenue lors de l\'enregistrement.');
        } finally {
            setLoading(false);
        }
    };

    if (initialLoading) {
        return <div className={styles.container}>Chargement...</div>;
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <button className={styles.backButton} onClick={() => navigate('/members')}>
                    <ArrowLeft size={24} />
                </button>
                <h1 className={styles.title}>
                    {isEditMode ? 'Modifier le membre' : 'Ajouter un membre'}
                </h1>
            </div>

            <div className={styles.formCard}>
                {error && <div className={styles.error} style={{ marginBottom: '1rem' }}>{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className={styles.formGrid}>
                        <h3 className={styles.sectionTitle}>Informations de base</h3>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>Prénom *</label>
                            <input
                                type="text"
                                name="first_name"
                                value={formData.first_name}
                                onChange={handleChange}
                                className={styles.input}
                                required
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>Nom *</label>
                            <input
                                type="text"
                                name="last_name"
                                value={formData.last_name}
                                onChange={handleChange}
                                className={styles.input}
                                required
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>Genre *</label>
                            <select
                                name="gender"
                                value={formData.gender}
                                onChange={handleChange}
                                className={styles.select}
                            >
                                <option value="M">Homme</option>
                                <option value="F">Femme</option>
                            </select>
                        </div>

                        <h3 className={styles.sectionTitle}>Coordonnées</h3>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>Téléphone Principal *</label>
                            <input
                                type="tel"
                                name="phone_primary"
                                value={formData.phone_primary}
                                onChange={handleChange}
                                className={styles.input}
                                required
                                placeholder="ex: 0123456789"
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>Téléphone Secondaire</label>
                            <input
                                type="tel"
                                name="phone_secondary"
                                value={formData.phone_secondary || ''}
                                onChange={handleChange}
                                className={styles.input}
                                placeholder="Optionnel"
                            />
                        </div>
                    </div>

                    <div className={styles.actions}>
                        <button
                            type="button"
                            className={styles.cancelButton}
                            onClick={() => navigate('/members')}
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            className={styles.submitButton}
                            disabled={loading}
                        >
                            {loading ? <Loader className="animate-spin" size={18} /> : <Save size={18} />}
                            {isEditMode ? 'Mettre à jour' : 'Enregistrer'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default MemberForm;
