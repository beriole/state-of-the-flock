import React, { useState, useEffect } from 'react';
import { memberAPI } from '../utils/api';
import { useNavigate } from 'react-router-dom';
import {
    Search,
    Plus,
    Download,
    MoreVertical,
    Phone,
    Mail,
    Trash2,
    Edit2
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
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
        const doc = new jsPDF();

        // --- Header Design ---
        // Top Bar
        doc.setFillColor(153, 27, 27); // Deep Red (#991B1B)
        doc.rect(0, 0, 210, 40, 'F');

        // Logo
        try {
            doc.addImage('/church_logo.png', 'PNG', 15, 7, 25, 25);
        } catch (e) {
            console.error("Logo not found, skipping image");
        }

        // Church Name
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.text('FIRST LOVE CHURCH', 45, 20);

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text('LISTE OFFICIELLE DES MEMBRES', 45, 27);

        // Report Title (Right Aligned)
        doc.setFontSize(22);
        doc.setFont('helvetica', 'bold');
        doc.text('REGISTRE DES MEMBRES', 195, 22, { align: 'right' });

        doc.setFontSize(11);
        doc.setFont('helvetica', 'italic');
        doc.text(`Généré le ${new Date().toLocaleDateString('fr-FR')}`, 195, 30, { align: 'right' });

        // --- Table ---
        const tableColumn = ["NOM COMPLET", "EMAIL", "TÉLÉPHONE", "STATUT"];
        const tableRows = filteredMembers.map(member => [
            `${member.first_name} ${member.last_name}`.toUpperCase(),
            member.email || '-',
            member.phone_primary || member.phone || '-',
            (member.status || 'Actif').toUpperCase()
        ]);

        autoTable(doc, {
            startY: 50,
            head: [tableColumn],
            body: tableRows,
            theme: 'striped',
            headStyles: {
                fillColor: [153, 27, 27],
                textColor: [255, 255, 255],
                fontSize: 10,
                fontStyle: 'bold',
                halign: 'center'
            },
            styles: {
                fontSize: 9,
                cellPadding: 4,
                valign: 'middle'
            },
            columnStyles: {
                0: { cellWidth: 60 },
                1: { cellWidth: 55 },
                2: { cellWidth: 40, halign: 'center' },
                3: { cellWidth: 25, halign: 'center', fontStyle: 'bold' }
            },
            didParseCell: function (data) {
                if (data.section === 'body' && data.column.index === 3) {
                    if (data.cell.raw === 'ACTIF') {
                        data.cell.styles.textColor = [22, 163, 74];
                    } else if (data.cell.raw === 'INACTIF') {
                        data.cell.styles.textColor = [220, 38, 38];
                    }
                }
            }
        });

        // --- Footer ---
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setDrawColor(153, 27, 27);
            doc.setLineWidth(0.5);
            doc.line(15, 282, 195, 282);

            doc.setFontSize(8);
            doc.setTextColor(100, 116, 139);
            doc.text('First Love Church - Database Management System', 15, 288);
            doc.text(`Page ${i} / ${pageCount}`, 195, 288, { align: 'right' });
        }

        doc.save('Membres_FirstLove.pdf');
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
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>Gestion des Membres</h1>
                <div className={styles.headerActions}>
                    <button className={styles.exportButton} onClick={handleExportPDF}>
                        <Download size={18} />
                        Exporter PDF
                    </button>
                    <button className={styles.addButton} onClick={() => navigate('/members/new')}>
                        <Plus size={18} />
                        Ajouter un membre
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
                                                {member.first_name?.charAt(0)}
                                            </div>
                                            <div>
                                                <div className={styles.memberName}>
                                                    {member.first_name} {member.last_name}
                                                </div>
                                                <div className={styles.memberEmail}>
                                                    {member.email}
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
