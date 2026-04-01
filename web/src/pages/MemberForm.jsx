import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { memberAPI, ministryAPI, regionAPI, areaAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import styles from './MemberForm.module.css';

const MemberForm = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const { user } = useAuth();
    const isEditMode = !!id;

    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(isEditMode);
    const [error, setError] = useState('');
    const [ministries, setMinistries] = useState([]);
    const [regions, setRegions] = useState([]);
    const [areas, setAreas] = useState([]);
    const [leaders, setLeaders] = useState([]);

    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        gender: '',
        phone_primary: '',
        phone_secondary: '',
        // Champs par défaut ou cachés
        state: 'Sheep',
        is_active: true,
        ministry_id: '',
        area_id: user?.area_id || '',
        leader_id: user?.role === 'Bacenta_Leader' ? user?.id : '',
        region_id: user?.area?.region_id || user?.governed_region?.id || '',
        profession: '',
        notes: ''
    });

    const fetchInitialData = useCallback(async () => {
        try {
            const [minRes, regRes] = await Promise.all([
                ministryAPI.getAllMinistries(),
                regionAPI.getRegions()
            ]);
            setMinistries(minRes.data || []);
            setRegions(regRes.data || []);

            if (isEditMode) {
                const response = await memberAPI.getMemberById(id);
                const memberData = response.data;
                setFormData({
                    ...memberData,
                    region_id: memberData.area?.region_id || ''
                });

                if (memberData.area?.region_id) {
                    const areasRes = await areaAPI.getAreas({ region_id: memberData.area.region_id });
                    setAreas(areasRes.data?.areas || []);
                }
                if (memberData.area_id) {
                    const leadersRes = await areaAPI.getAreaLeaders(memberData.area_id);
                    setLeaders(leadersRes.data || []);
                }
            } else {
                // Pre-fetch for non-edit mode based on pre-initialized IDs (Governor/Bishop)
                const effectiveRegionId = user?.area?.region_id || user?.governed_region?.id;
                if (effectiveRegionId) {
                    const areasRes = await areaAPI.getAreas({ region_id: effectiveRegionId });
                    setAreas(areasRes.data?.areas || []);
                    if (user.area_id) {
                        const leadersRes = await areaAPI.getAreaLeaders(user.area_id);
                        setLeaders(leadersRes.data || []);
                    }
                }
            }
        } catch (err) {
            console.error('Error fetching initial data:', err);
            setError('Impossible de charger les données initiales.');
        } finally {
            setInitialLoading(false);
        }
    }, [id, isEditMode, user]);

    useEffect(() => {
        fetchInitialData();
    }, [fetchInitialData]);

    const handleChange = async (e) => {
        const { name, value } = e.target;

        if (name === 'ministry_id') {
            const selectedMinistry = ministries.find(m => m.id === value);
            setFormData(prev => ({
                ...prev,
                ministry_id: value,
                ministry: selectedMinistry ? selectedMinistry.name : null
            }));
        } else if (name === 'region_id') {
            setFormData(prev => ({ ...prev, region_id: value, area_id: '', leader_id: '' }));
            setLeaders([]);
            if (value) {
                try {
                    const areasRes = await areaAPI.getAreas({ region_id: value });
                    setAreas(areasRes.data?.areas || []);
                } catch (err) {
                    console.error("Error fetching areas:", err);
                }
            } else {
                setAreas([]);
            }
        } else if (name === 'area_id') {
            setFormData(prev => ({ ...prev, area_id: value, leader_id: '' }));
            if (value) {
                try {
                    const leadersRes = await areaAPI.getAreaLeaders(value);
                    setLeaders(leadersRes.data || []);
                } catch (err) {
                    console.error("Error fetching leaders:", err);
                }
            } else {
                setLeaders([]);
            }
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // Basic validation
            if (!formData.first_name || !formData.last_name) {
                setError('Le nom et le prénom sont obligatoires.');
                setLoading(false);
                return;
            }

            // Phone validation (simple check if provided)
            const phoneRegex = /^[0-9+\s-]{8,20}$/;
            if (formData.phone_primary && !phoneRegex.test(formData.phone_primary)) {
                setError('Le format du numéro de téléphone principal est invalide.');
                setLoading(false);
                return;
            }

            const dataToSend = {
                ...formData,
                // Sanitize ministry_id: empty string to null to allow database to clear the field
                ministry_id: formData.ministry_id === '' ? null : formData.ministry_id,
                // Valeurs par défaut pour la création si non définies
                state: formData.state || 'Sheep',
                is_active: formData.is_active !== undefined ? formData.is_active : true,
                is_registered: isEditMode ? formData.is_registered : false
            };

            if (isEditMode) {
                await memberAPI.updateMember(id, dataToSend);
            } else {
                // Déterminer la zone et le leader finaux
                const finalLeaderId = formData.leader_id || user?.id;
                const finalAreaId = formData.area_id || user?.area_id;

                if (!finalAreaId || !finalLeaderId) {
                    setError('La zone (area) et le leader sont obligatoires pour créer un membre.');
                    setLoading(false);
                    return;
                }

                const finalData = {
                    ...dataToSend,
                    leader_id: finalLeaderId,
                    area_id: finalAreaId
                };
                await memberAPI.createMember(finalData);
            }
            navigate(user.role === 'Bishop' ? '/bishop?tab=members' : '/members');
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
                <button 
                    className={styles.backButton} 
                    onClick={() => navigate(user?.role === 'Bishop' ? '/bishop?tab=members' : '/members')}
                >
                    <span key="back-icon"><ArrowLeft size={24} /></span>
                </button>
                <h1 className={styles.title}>
                    <span key={isEditMode ? 'edit-title' : 'new-title'}>
                        {isEditMode ? 'Modifier le membre' : 'Ajouter un membre'}
                    </span>
                </h1>
            </div>

            <div className={styles.formCard}>
                {error && (
                    <div className={styles.error} style={{ marginBottom: '1rem' }}>
                        <span key="error-msg">{error}</span>
                    </div>
                )}

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
                            <label className={styles.label}>Genre</label>
                            <select
                                name="gender"
                                value={formData.gender}
                                onChange={handleChange}
                                className={styles.select}
                            >
                                <option value="">Sélectionner...</option>
                                <option value="M">Homme</option>
                                <option value="F">Femme</option>
                                <option value="Unknown">Non précisé</option>
                            </select>
                        </div>

                        <h3 className={styles.sectionTitle}>Coordonnées</h3>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>Téléphone Principal</label>
                            <input
                                type="tel"
                                name="phone_primary"
                                value={formData.phone_primary}
                                onChange={handleChange}
                                className={styles.input}
                                placeholder="Optionnel"
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

                        {(user?.role === 'Bishop' || user?.role === 'Governor') && (
                            <>
                                <h3 className={styles.sectionTitle}>Affectation (Superviseur)</h3>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Région *</label>
                                    <select
                                        name="region_id"
                                        value={formData.region_id || ''}
                                        onChange={handleChange}
                                        className={styles.select}
                                        required={user?.role === 'Bishop' || user?.role === 'Governor'}
                                        disabled={user?.role === 'Governor'}
                                    >
                                        <option value="">Sélectionner une région</option>
                                        {(Array.isArray(regions) ? regions : []).map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                                    </select>
                                </div>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Zone (Area) *</label>
                                    <select
                                        name="area_id"
                                        value={formData.area_id || ''}
                                        onChange={handleChange}
                                        className={styles.select}
                                        required={user?.role === 'Bishop' || user?.role === 'Governor'}
                                        disabled={!formData.region_id}
                                    >
                                        <option value="">Sélectionner une zone</option>
                                        {(Array.isArray(areas) ? areas : []).map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                                    </select>
                                </div>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Bacenta Leader *</label>
                                    <select
                                        name="leader_id"
                                        value={formData.leader_id || ''}
                                        onChange={handleChange}
                                        className={styles.select}
                                        required={user?.role === 'Bishop' || user?.role === 'Governor'}
                                        disabled={!formData.area_id}
                                    >
                                        <option value="">Sélectionner un leader</option>
                                        {(Array.isArray(leaders) ? leaders : []).map(l => (
                                            <option key={l.id} value={l.id}>{l.first_name} {l.last_name}</option>
                                        ))}
                                    </select>
                                </div>
                            </>
                        )}

                        <h3 className={styles.sectionTitle}>Engagement</h3>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>Ministère</label>
                            <select
                                name="ministry_id"
                                value={formData.ministry_id || ''}
                                onChange={handleChange}
                                className={styles.select}
                            >
                                <option value="">Aucun ministère</option>
                                {(Array.isArray(ministries) ? ministries : []).map(ministry => (
                                    <option key={ministry.id} value={ministry.id}>{ministry.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>Profession</label>
                            <input
                                type="text"
                                name="profession"
                                value={formData.profession || ''}
                                onChange={handleChange}
                                className={styles.input}
                                placeholder="Indicateur d'activité"
                            />
                        </div>

                        <div className={styles.formGroup} style={{ gridColumn: '1 / -1' }}>
                            <label className={styles.label}>Notes / Observations</label>
                            <textarea
                                name="notes"
                                value={formData.notes || ''}
                                onChange={handleChange}
                                className={styles.textarea}
                                placeholder="Informations complémentaires, situation spirituelle, etc."
                                rows={3}
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
                            <span className={styles.iconWrapper} key={loading ? 'loader' : 'save'}>
                                {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                            </span>
                            <span key={isEditMode ? 'text-update' : 'text-save'}>
                                {isEditMode ? 'Mettre à jour' : 'Enregistrer'}
                            </span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default MemberForm;
