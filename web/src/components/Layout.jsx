import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    LayoutDashboard,
    Users,
    ClipboardCheck,
    Phone,
    Home as HomeIcon,
    LogOut,
    Bell,
    Menu,
    X,
    Crown,
    Map,
    FileBarChart
} from 'lucide-react';
import styles from './Layout.module.css';
import logo from '../assets/logo.png';
import ProfileModal from './ProfileModal';
import { getPhotoUrl } from '../utils/api';

const Layout = () => {
    const { user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

    const [isProfileOpen, setIsProfileOpen] = React.useState(false);

    const handleLogout = (e) => {
        e.stopPropagation(); // Éviter d'ouvrir le profil
        logout();
        navigate('/login');
    };

    const isGovernor = user?.role === 'Governor' || user?.role === 'Bishop';

    const navSections = isGovernor ? [
        {
            title: 'GOUVERNEUR',
            items: [
                { path: '/governor?tab=dashboard', label: 'Tableau de bord', icon: <LayoutDashboard size={20} /> },
                { path: '/governor?tab=leaders', label: 'Leaders', icon: <Crown size={20} /> },
                { path: '/governor?tab=zones', label: 'Zones', icon: <Map size={20} /> },
                { path: '/governor?tab=members', label: 'Membres', icon: <Users size={20} /> },
                { path: '/governor?tab=reports', label: 'Rapports', icon: <FileBarChart size={20} /> },
            ]
        }
    ] : [
        {
            title: 'MENU',
            items: [
                { path: '/dashboard', label: 'Tableau de bord', icon: <LayoutDashboard size={20} /> },
                { path: '/members', label: 'Membres', icon: <Users size={20} /> },
                { path: '/bacenta', label: 'Bacenta', icon: <HomeIcon size={20} /> },
            ]
        },
        {
            title: 'ACTIONS',
            items: [
                { path: '/attendance', label: 'Présences', icon: <ClipboardCheck size={20} /> },
                { path: '/calls', label: 'Appels', icon: <Phone size={20} /> },
            ]
        }
    ];

    const isActive = (path) => {
        if (path.includes('?')) {
            return location.pathname + location.search === path;
        }
        return location.pathname === path;
    };

    return (
        <div className={styles.container}>
            {/* Sidebar */}
            <aside className={`${styles.sidebar} ${isMobileMenuOpen ? styles.open : ''}`}>
                <div className={styles.logoSection}>
                    <div className={styles.logoWrapper}>
                        <img src={logo} alt="FirstLove Logo" className={styles.logo} />
                    </div>
                    <span className={styles.brandName}>FirstLove</span>
                    <button
                        className={styles.closeMenuBtn}
                        onClick={() => setIsMobileMenuOpen(false)}
                    >
                        <X size={24} />
                    </button>
                </div>

                <div className={styles.navContainer}>
                    {navSections.map((section, idx) => (
                        <div key={idx} className={styles.navSection}>
                            <h3 className={styles.sectionTitle}>{section.title}</h3>
                            <nav className={styles.nav}>
                                {section.items.map((item) => (
                                    <Link
                                        key={item.path}
                                        to={item.path}
                                        className={`${styles.navItem} ${isActive(item.path) ? styles.active : ''}`}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        <div className={styles.navIcon}>{item.icon}</div>
                                        <span>{item.label}</span>
                                    </Link>
                                ))}
                            </nav>
                        </div>
                    ))}
                </div>

                <div className={styles.userSection} onClick={() => setIsProfileOpen(true)} style={{ cursor: 'pointer' }} title="Voir mon profil">
                    <div className={styles.userInfo}>
                        <div className={styles.avatar}>
                            {user?.photo_url ? (
                                <img src={getPhotoUrl(user.photo_url)} alt="U" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                            ) : (
                                user?.first_name?.charAt(0) || 'U'
                            )}
                        </div>
                        <div className={styles.userDetails}>
                            <p className={styles.userName}>{user?.first_name} {user?.last_name}</p>
                            <p className={styles.userRole}>{user?.role?.replace('_', ' ')}</p>
                        </div>
                    </div>
                    <button onClick={handleLogout} className={styles.logoutBtn} title="Déconnexion">
                        <LogOut size={20} />
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className={styles.main}>
                <header className={styles.header}>
                    <button
                        className={styles.menuBtn}
                        onClick={() => setIsMobileMenuOpen(true)}
                    >
                        <Menu size={24} />
                    </button>

                    <h1 className={styles.pageTitle}>
                        {navSections.flatMap(s => s.items).find(i => isActive(i.path))?.label || 'Dashboard'}
                    </h1>

                    <div className={styles.headerActions}>
                        <button className={styles.iconBtn}>
                            <Bell size={20} />
                            <span className={styles.badge}>2</span>
                        </button>
                    </div>
                </header>

                <div className={styles.content}>
                    <Outlet />
                </div>
            </main>

            {/* Overlay for mobile menu */}
            {isMobileMenuOpen && (
                <div
                    className={styles.overlay}
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            <ProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
        </div>
    );
};

export default Layout;
