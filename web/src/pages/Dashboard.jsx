import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { dashboardAPI, memberAPI, getPhotoUrl } from '../utils/api';
import {
    Users,
    CheckCircle,
    Phone,
    Home as HomeIcon,
    ArrowRight,
    Plus,
    Calendar,
    TrendingUp,
    Bell,
    Loader2
} from 'lucide-react';
import styles from './Dashboard.module.css';

const Dashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [recentMembers, setRecentMembers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user?.role === 'Governor' || user?.role === 'Bishop') {
            navigate('/governor');
            return;
        }

        const fetchData = async () => {
            try {
                setLoading(true);
                const [statsRes, membersRes] = await Promise.all([
                    dashboardAPI.getGlobalStats().catch(e => ({ data: {} })),
                    memberAPI.getMembers({ limit: 5 }).catch(e => ({ data: { members: [] } }))
                ]);
                setStats(statsRes?.data || {});
                const membersData = membersRes?.data?.members || [];
                setRecentMembers(Array.isArray(membersData) ? membersData : []);
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const statCards = [
        {
            label: 'Membres Totaux',
            value: stats?.summary?.total_members || 0,
            icon: <Users size={24} />,
            color: '#3b82f6',
            trend: '+5%'
        },
        {
            label: 'Présence Dimanche',
            value: `${stats?.summary?.last_attendance_percentage || 0}%`,
            icon: <CheckCircle size={24} />,
            color: '#10b981',
            trend: '+2%'
        },
        {
            label: 'Appels à faire',
            value: stats?.summary?.pending_follow_ups || 0,
            icon: <Phone size={24} />,
            color: '#f59e0b',
            trend: '-12%'
        },
        {
            label: 'Réunions Bacenta',
            value: stats?.summary?.recent_bacenta_meetings || 0,
            icon: <HomeIcon size={24} />,
            color: '#8b5cf6',
            trend: '+1'
        },
    ];

    if (loading) {
        return (
            <div className={styles.loading}>
                <Loader2 className="animate-spin" size={40} style={{ marginBottom: '1rem', color: '#DC2626' }} />
                <p key="loading-msg">Chargement de votre ministère...</p>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            {/* Hero Section */}
            <div className={styles.hero}>
                <div className={styles.heroContent}>
                    <h2 className={styles.welcomeTitle}>
                        <span key="welcome">Bonjour, {user?.first_name} 👋</span>
                    </h2>
                    <p className={styles.welcomeSubtitle}>
                        <span key="subtitle">Gérez votre ministère avec excellence. Voici le point sur votre Bacenta.</span>
                    </p>
                </div>
                <div className={styles.heroChart}>
                    <svg width="200" height="60" viewBox="0 0 200 60">
                        <path
                            d="M0 50 Q 25 45, 50 35 T 100 30 T 150 15 T 200 5"
                            fill="none"
                            stroke="rgba(220, 38, 38, 0.5)"
                            strokeWidth="3"
                            strokeLinecap="round"
                        />
                        <path
                            d="M0 50 Q 25 45, 50 35 T 100 30 T 150 15 T 200 5 V 60 H 0 Z"
                            fill="url(#gradient)"
                            opacity="0.2"
                        />
                        <defs>
                            <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" stopColor="#DC2626" />
                                <stop offset="100%" stopColor="transparent" />
                            </linearGradient>
                        </defs>
                    </svg>
                    <div className={styles.chartLabel}>Croissance +12%</div>
                </div>
                <div className={styles.heroActions}>
                    <button className={styles.primaryBtn} onClick={() => navigate('/members/new')}>
                        <Plus size={20} />
                        Nouveau Membre
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className={styles.statsGrid}>
                {statCards.map((stat, index) => (
                    <div key={index} className={styles.statCard}>
                        <div className={styles.statHeader}>
                            <div className={styles.statIconWrapper} style={{ color: stat.color }}>
                                {stat.icon}
                            </div>
                            <span className={`${styles.trend} ${stat.trend.startsWith('+') ? styles.up : ''}`}>
                                {stat.trend}
                            </span>
                        </div>
                        <div className={styles.statInfo}>
                            <div className={styles.statValue} key={`stat-val-${index}`}>
                                <span key={`val-${index}`}>{stat.value}</span>
                            </div>
                            <div className={styles.statLabel} key={`stat-lbl-${index}`}>
                                <span key={`lbl-${index}`}>{stat.label}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Main Content */}
            <div className={styles.mainContent}>
                {/* Recent Members */}
                <div className={styles.card}>
                    <div className={styles.cardHeader}>
                        <h3>Membres Récents</h3>
                        <button className={styles.viewAllBtn} onClick={() => navigate('/members')}>
                            Voir tout
                        </button>
                    </div>
                    <div className={styles.memberList}>
                        {recentMembers.length === 0 ? (
                            <div className={styles.empty}>Aucun membre récent.</div>
                        ) : (
                            recentMembers.map((member) => (
                                <div key={member.id} className={styles.memberItem}>
                                    <div className={styles.avatar}>
                                        {member.photo_url ? (
                                            <img src={getPhotoUrl(member.photo_url)} alt="M" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                                        ) : (
                                            member.first_name?.charAt(0)
                                        )}
                                    </div>
                                    <div className={styles.memberInfo}>
                                        <span className={styles.memberName} key={`name-${member.id}`}>
                                            {member.first_name} {member.last_name}
                                        </span>
                                        <span className={styles.memberMeta} key={`meta-${member.id}`}>
                                            {member.phone_primary || 'Pas de numéro'} • {new Date(member.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <button
                                        className={styles.actionBtn}
                                        onClick={() => navigate(`/members/${member.id}`)}
                                    >
                                        <ArrowRight size={18} />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Quick Actions */}
                <div className={styles.card}>
                    <div className={styles.cardHeader}>
                        <h3>Actions Rapides</h3>
                    </div>
                    <div className={styles.quickActionsGrid}>
                        <div className={styles.quickActionCard} onClick={() => navigate('/members/new')}>
                            <div className={styles.actionIconWrapper}>
                                <Users size={24} />
                            </div>
                            <span className={styles.actionLabel}>Ajouter Membre</span>
                        </div>
                        <div className={styles.quickActionCard} onClick={() => navigate('/attendance')}>
                            <div className={styles.actionIconWrapper}>
                                <CheckCircle size={24} />
                            </div>
                            <span className={styles.actionLabel}>Faire l'appel</span>
                        </div>
                        <div className={styles.quickActionCard} onClick={() => navigate('/calls')}>
                            <div className={styles.actionIconWrapper}>
                                <Phone size={24} />
                            </div>
                            <span className={styles.actionLabel}>Journal d'appel</span>
                        </div>
                        <div className={styles.quickActionCard} onClick={() => navigate('/bacenta')}>
                            <div className={styles.actionIconWrapper}>
                                <HomeIcon size={24} />
                            </div>
                            <span className={styles.actionLabel}>Rapport Bacenta</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
