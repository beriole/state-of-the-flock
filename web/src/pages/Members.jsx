import React, { useState, useEffect } from 'react';
import { Download, Plus, Search, Phone, Edit2, Trash2 } from 'lucide-react';
import { memberAPI, getPhotoUrl } from '../utils/api';
import { generateProfessionalPDF } from '../utils/pdfGenerator';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ContactModal } from '../components/ContactModals';
import { callLogAPI } from '../utils/api';
import styles from './Members.module.css';

const Members = () => {
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [selectedMember, setSelectedMember] = useState(null);
    const [isContactModalOpen, setIsContactModalOpen] = useState(false);
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        fetchMembers();
    }, []);

    const fetchMembers = async () => {
        try {
            const response = await memberAPI.getMembers().catch(e => ({ data: { members: [] } }));
            const membersData = response?.data?.members || [];
            setMembers(Array.isArray(membersData) ? membersData : []);
        } catch (error) {
            console.error('Error fetching members:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleExportPDF = () => {
        const columns = ["NOM COMPLET", "EMAIL", "TÉLÉPHONE", "STATUT"];
        const rows = filteredMembers.map(member => [
            `${member.first_name} ${member.last_name}`.toUpperCase(),
            member.email || '-',
            member.phone_primary || member.phone || '-',
            (member.status || 'Actif').toUpperCase()
        ]);

        generateProfessionalPDF({
            title: "Registre des Membres",
            subtitle: `Total: ${filteredMembers.length} membres`,
            columns,
            rows,
            fileName: 'Membres_FirstLove',
            stats: [
                { label: "Total Membres", value: filteredMembers.length },
                { label: "Actifs", value: filteredMembers.filter(m => (m.status || 'actif').toLowerCase() === 'actif').length, color: [16, 185, 129] }
            ]
        });
    };

    const handleActionComplete = async (type, method, templateTitle) => {
        if (!selectedMember) return;
        try {
            await callLogAPI.createCallLog({
                member_id: selectedMember.id,
                outcome: 'Contacted',
                contact_method: method === 'whatsapp' ? 'WhatsApp' : (type === 'Call' ? 'Phone' : 'SMS'),
                notes: `${type} via ${method}${templateTitle ? ` (Modèle: ${templateTitle})` : ''}`
            });
        } catch (error) {
            console.error('Error logging action:', error);
        }
    };

    const filteredMembers = members.filter(member => {
        const matchesSearch =
            member.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            member.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            member.email?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = filterStatus === 'all' || member.status === filterStatus;

        return matchesSearch && matchesStatus;
    });

    return (
        <div className={`${styles.container} notranslate`} translate="no">
            <div className={styles.header}>
                <h1 className={styles.title}>
                    <span key="title-text">Gestion des Membres</span>
                </h1>
                <div className={styles.headerActions}>
                    <button className={styles.exportButton} onClick={handleExportPDF}>
                        <Download size={18} />
                        <span key="export-text">Exporter PDF</span>
                    </button>
                    <button className={styles.addButton} onClick={() => navigate('/members/new')}>
                        <Plus size={18} />
                        <span key="add-text">Ajouter un membre</span>
                    </button>
                </div>
            </div>

            <div className={styles.filters}>
                <div className={styles.searchWrapper}>
                    <Search className={styles.searchIcon} size={20} />
                    <input
                        type="text"
                        placeholder="Rechercher un membre..."
                        className={styles.searchInput}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <select
                    className={styles.filterSelect}
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                >
                    <option value="all">Tous les statuts</option>
                    <option value="active">Actif</option>
                    <option value="inactive">Inactif</option>
                    <option value="visitor">Visiteur</option>
                </select>
            </div>

            <div className={styles.tableContainer}>
                {loading ? (
                    <div className={styles.loading}>Chargement des membres...</div>
                ) : filteredMembers.length === 0 ? (
                    <div className={styles.empty}>Aucun membre trouvé.</div>
                ) : (
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Membre</th>
                                <th>Téléphone</th>
                                <th>Statut</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredMembers.map((member) => (
                                <tr key={member.id}>
                                    <td>
                                        <div
                                            className={styles.memberInfo}
                                            onClick={() => navigate(`/members/${member.id}`)}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            <div className={styles.avatar}>
                                                {member.photo_url ? (
                                                    <img src={getPhotoUrl(member.photo_url)} alt="M" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                                                ) : (
                                                    member.first_name?.charAt(0)
                                                )}
                                            </div>
                                            <div>
                                                <div className={styles.memberName}>
                                                    <span key={`name-${member.id}`}>{member.first_name} {member.last_name}</span>
                                                </div>
                                                <div className={styles.memberEmail}>
                                                    <span key={`email-${member.id}`}>{member.email}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>{member.phone_primary || member.phone || '-'}</td>
                                    <td>
                                        <span className={`${styles.statusBadge} ${member.status === 'inactive' ? styles.statusInactive : styles.statusActive
                                            }`}>
                                            {member.status || 'Actif'}
                                        </span>
                                    </td>
                                    <td>
                                        <div className={styles.actions}>
                                            <button
                                                className={`${styles.actionBtn} ${styles.callBtn}`}
                                                title="Appeler / WhatsApp"
                                                onClick={() => {
                                                    setSelectedMember(member);
                                                    setIsContactModalOpen(true);
                                                }}
                                            >
                                                <Phone size={18} />
                                            </button>
                                            <button
                                                className={styles.actionBtn}
                                                title="Modifier"
                                                onClick={() => navigate(`/members/${member.id}/edit`)}
                                            >
                                                <Edit2 size={18} />
                                            </button>
                                            <button className={`${styles.actionBtn} ${styles.deleteBtn}`} title="Supprimer">
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            <ContactModal
                isOpen={isContactModalOpen}
                onClose={() => setIsContactModalOpen(false)}
                member={selectedMember}
                authUser={user}
                onActionComplete={handleActionComplete}
            />
        </div>
    );
};

export default Members;
