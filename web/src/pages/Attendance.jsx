import React, { useState, useEffect } from 'react';
import { memberAPI, attendanceAPI } from '../utils/api';
import {
    Calendar,
    CheckCircle,
    X,
    Users,
    Download,
    ChevronLeft,
    ChevronRight,
    History,
    Search
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import styles from './Attendance.module.css';

const Attendance = () => {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [members, setMembers] = useState([]);
    const [attendance, setAttendance] = useState({});
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedGroup, setSelectedGroup] = useState('Tous');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchData();
    }, [selectedDate]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const dateKey = selectedDate.toISOString().split('T')[0];

            const [membersRes, attendanceRes, historyRes] = await Promise.all([
                memberAPI.getMembers().catch(e => ({ data: { members: [] } })),
                attendanceAPI.getAttendance({ sunday_date: dateKey }).catch(e => ({ data: { attendance: [] } })),
                attendanceAPI.getAttendanceStats({ limit: 5 }).catch(e => ({ data: [] }))
            ]);

            const membersData = membersRes?.data?.members || [];
            setMembers(Array.isArray(membersData) ? membersData : []);

            // Process attendance
            const attendanceMap = {};
            const records = attendanceRes?.data?.attendance || [];
            if (Array.isArray(records)) {
                records.forEach(r => {
                    if (r && r.member_id) {
                        attendanceMap[r.member_id] = r.present ? 'present' : 'absent';
                    }
                });
            }
            setAttendance(attendanceMap);

            // Process history
            const historyData = historyRes?.data || [];
            setHistory(Array.isArray(historyData) ? historyData : []);

        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDateChange = (days) => {
        const newDate = new Date(selectedDate);
        newDate.setDate(newDate.getDate() + days);
        setSelectedDate(newDate);
    };

    const toggleAttendance = async (memberId) => {
        try {
            const dateKey = selectedDate.toISOString().split('T')[0];
            const currentStatus = attendance[memberId];
            let newStatus;

            // Toggle logic: unknown -> present -> absent -> unknown
            if (!currentStatus) newStatus = 'present';
            else if (currentStatus === 'present') newStatus = 'absent';
            else newStatus = null;

            // Optimistic update
            setAttendance(prev => ({
                ...prev,
                [memberId]: newStatus
            }));

            await attendanceAPI.bulkAttendance({
                sunday_date: dateKey,
                attendances: [{
                    member_id: memberId,
                    present: newStatus === 'present',
                    notes: ''
                }]
            });
        } catch (error) {
            console.error('Error saving attendance:', error);
            fetchData(); // Revert on error
        }
    };

    const markAll = async (status) => {
        try {
            setSaving(true);
            const dateKey = selectedDate.toISOString().split('T')[0];
            const attendanceData = filteredMembers.map(m => ({
                member_id: m.id,
                present: status === 'present',
                notes: ''
            }));

            await attendanceAPI.bulkAttendance({
                sunday_date: dateKey,
                attendances: attendanceData
            });

            // Update local state
            const newAttendance = { ...attendance };
            filteredMembers.forEach(m => {
                newAttendance[m.id] = status;
            });
            setAttendance(newAttendance);
        } catch (error) {
            console.error('Error marking all:', error);
        } finally {
            setSaving(false);
        }
    };

    const availableGroups = ['Tous', ...new Set(members.map(m => m.area?.name).filter(Boolean))];

    const filteredMembers = members.filter(m => {
        const fullName = `${m.first_name} ${m.last_name}`.toLowerCase();
        const matchesSearch = fullName.includes(searchTerm.toLowerCase()) || (m.phone && m.phone.includes(searchTerm));
        const matchesGroup = selectedGroup === 'Tous' || m.area?.name === selectedGroup;
        return matchesSearch && matchesGroup;
    });

    const getStats = () => {
        const total = members.length;
        const present = Object.values(attendance).filter(s => s === 'present').length;
        const absent = Object.values(attendance).filter(s => s === 'absent').length;
        return { total, present, absent };
    };

    const generatePDF = () => {
        const doc = new jsPDF();
        const dateStr = selectedDate.toLocaleDateString('fr-FR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

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
        doc.text('LOYALTY HOUSE INTERNATIONAL', 45, 27);

        // Report Title (Right Aligned)
        doc.setFontSize(22);
        doc.setFont('helvetica', 'bold');
        doc.text('RAPPORT DE PRÉSENCE', 195, 22, { align: 'right' });

        doc.setFontSize(11);
        doc.setFont('helvetica', 'italic');
        doc.text(dateStr.charAt(0).toUpperCase() + dateStr.slice(1), 195, 30, { align: 'right' });

        // --- Stats Section ---
        const stats = getStats();
        const startY = 50;

        // Decorative Line
        doc.setDrawColor(180, 83, 9); // Gold (#B45309)
        doc.setLineWidth(1);
        doc.line(15, startY - 5, 195, startY - 5);

        // Stats Cards
        const cardW = 55;
        const cardH = 20;
        const gap = 10;

        // Card 1: Présents
        doc.setFillColor(240, 253, 244); // Light Green
        doc.setDrawColor(34, 197, 94); // Green
        doc.roundedRect(15, startY, cardW, cardH, 2, 2, 'FD');
        doc.setTextColor(21, 128, 61);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.text('PRÉSENTS', 15 + cardW / 2, startY + 6, { align: 'center' });
        doc.setFontSize(14);
        doc.text(stats.present.toString(), 15 + cardW / 2, startY + 15, { align: 'center' });

        // Card 2: Absents
        doc.setFillColor(254, 242, 242); // Light Red
        doc.setDrawColor(239, 68, 68); // Red
        doc.roundedRect(15 + cardW + gap, startY, cardW, cardH, 2, 2, 'FD');
        doc.setTextColor(185, 28, 28);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.text('ABSENTS', 15 + cardW + gap + cardW / 2, startY + 6, { align: 'center' });
        doc.setFontSize(14);
        doc.text(stats.absent.toString(), 15 + cardW + gap + cardW / 2, startY + 15, { align: 'center' });

        // Card 3: Taux
        const rate = stats.total > 0 ? Math.round((stats.present / stats.total) * 100) : 0;
        doc.setFillColor(255, 251, 235); // Light Gold
        doc.setDrawColor(180, 83, 9); // Gold
        doc.roundedRect(15 + (cardW + gap) * 2, startY, cardW, cardH, 2, 2, 'FD');
        doc.setTextColor(146, 64, 14);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.text('TAUX DE PRÉSENCE', 15 + (cardW + gap) * 2 + cardW / 2, startY + 6, { align: 'center' });
        doc.setFontSize(14);
        doc.text(`${rate}%`, 15 + (cardW + gap) * 2 + cardW / 2, startY + 15, { align: 'center' });

        // --- Table ---
        const tableData = members.map(m => [
            `${m.first_name} ${m.last_name}`.toUpperCase(),
            m.phone_primary || m.phone || '-',
            m.area?.name || 'BACENTA A',
            attendance[m.id] === 'present' ? 'PRÉSENT' : attendance[m.id] === 'absent' ? 'ABSENT' : 'NON MARQUÉ'
        ]);

        autoTable(doc, {
            startY: startY + 30,
            head: [['NOM DU MEMBRE', 'TÉLÉPHONE', 'BACENTA / GROUPE', 'STATUT']],
            body: tableData,
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
                1: { cellWidth: 40, halign: 'center' },
                2: { cellWidth: 45, halign: 'center' },
                3: { cellWidth: 35, halign: 'center', fontStyle: 'bold' }
            },
            didParseCell: function (data) {
                if (data.section === 'body' && data.column.index === 3) {
                    if (data.cell.raw === 'PRÉSENT') {
                        data.cell.styles.textColor = [22, 163, 74];
                    } else if (data.cell.raw === 'ABSENT') {
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
            doc.text('First Love Church - Bacenta Management System', 15, 288);
            doc.text(`Page ${i} / ${pageCount}`, 195, 288, { align: 'right' });
        }

        doc.save(`Presence_${selectedDate.toISOString().split('T')[0]}.pdf`);
    };

    const stats = getStats();

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>Suivi des Présences</h1>
                <div className={styles.controls}>
                    <div className={styles.dateControl}>
                        <button className={styles.dateBtn} onClick={() => handleDateChange(-7)}>
                            <ChevronLeft size={20} />
                        </button>
                        <input
                            type="date"
                            className={styles.dateInput}
                            value={selectedDate.toISOString().split('T')[0]}
                            onChange={(e) => setSelectedDate(new Date(e.target.value))}
                        />
                        <button className={styles.dateBtn} onClick={() => handleDateChange(7)}>
                            <ChevronRight size={20} />
                        </button>
                    </div>
                    <button className={styles.pdfBtn} onClick={generatePDF}>
                        <Download size={20} />
                        <span>PDF</span>
                    </button>
                </div>
            </div>

            <div className={styles.statsRow}>
                <div className={styles.statCard}>
                    <div className={styles.statIcon} style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#34d399' }}>
                        <CheckCircle size={24} />
                    </div>
                    <div className={styles.statInfo}>
                        <span className={styles.statValue}>{stats.present}</span>
                        <span className={styles.statLabel}>Présents</span>
                    </div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statIcon} style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#f87171' }}>
                        <X size={24} />
                    </div>
                    <div className={styles.statInfo}>
                        <span className={styles.statValue}>{stats.absent}</span>
                        <span className={styles.statLabel}>Absents</span>
                    </div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statIcon} style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#60a5fa' }}>
                        <Users size={24} />
                    </div>
                    <div className={styles.statInfo}>
                        <span className={styles.statValue}>{stats.total}</span>
                        <span className={styles.statLabel}>Total Membres</span>
                    </div>
                </div>
            </div>

            <div className={styles.filtersSection}>
                <div className={styles.searchBar}>
                    <Search size={20} />
                    <input
                        type="text"
                        placeholder="Rechercher un membre..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className={styles.groupsScroll}>
                    {availableGroups.map(group => (
                        <button
                            key={group}
                            className={`${styles.groupFilter} ${selectedGroup === group ? styles.active : ''}`}
                            onClick={() => setSelectedGroup(group)}
                        >
                            {group}
                        </button>
                    ))}
                </div>
            </div>

            <div className={styles.quickActions}>
                <button
                    className={styles.quickActionBtn}
                    onClick={() => markAll('present')}
                    disabled={saving}
                >
                    <CheckCircle size={18} /> Tout marquer présent
                </button>
                <button
                    className={styles.quickActionBtn}
                    onClick={() => markAll('absent')}
                    disabled={saving}
                >
                    <X size={18} /> Tout marquer absent
                </button>
            </div>

            <div className={styles.contentGrid}>
                <div className={styles.mainSection}>
                    <h2 className={styles.sectionTitle}>
                        <Users size={20} /> Liste des membres ({filteredMembers.length})
                    </h2>
                    {loading ? (
                        <div className={styles.loading}>Chargement...</div>
                    ) : (
                        <div className={styles.attendanceList}>
                            {filteredMembers.map(member => (
                                <div key={member.id} className={styles.attendanceItem} onClick={() => toggleAttendance(member.id)}>
                                    <div className={styles.memberInfo}>
                                        <div className={styles.avatar}>
                                            {member.first_name?.charAt(0)}
                                        </div>
                                        <div className={styles.memberDetails}>
                                            <span className={styles.name}>
                                                {member.first_name} {member.last_name}
                                            </span>
                                            <span className={styles.area}>{member.area?.name || 'Non assigné'}</span>
                                        </div>
                                    </div>
                                    <div className={styles.attendanceStatus}>
                                        <div className={`${styles.statusIndicator} ${attendance[member.id] === 'present' ? styles.present :
                                            attendance[member.id] === 'absent' ? styles.absent : ''
                                            }`}>
                                            {attendance[member.id] === 'present' ? '✓' :
                                                attendance[member.id] === 'absent' ? '✗' : '○'}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className={styles.historySection}>
                    <h2 className={styles.sectionTitle}>
                        <History size={20} /> Historique (30 jours)
                    </h2>
                    <div className={styles.historyList}>
                        {/* Mock history if API empty */}
                        {history.length === 0 && !loading && (
                            <div className={styles.empty}>Aucun historique récent</div>
                        )}
                        {history.map((item, index) => (
                            <div key={index} className={styles.historyItem}>
                                <div className={styles.historyHeader}>
                                    <span>{new Date(item.date).toLocaleDateString('fr-FR')}</span>
                                    <span>{Math.round((item.present / item.total) * 100)}%</span>
                                </div>
                                <div className={styles.progressBar}>
                                    <div
                                        className={styles.progressFill}
                                        style={{ width: `${(item.present / item.total) * 100}%` }}
                                    />
                                </div>
                                <div className={styles.historyStats}>
                                    <span>{item.present} présents</span>
                                    <span>{item.absent} absents</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Attendance;
