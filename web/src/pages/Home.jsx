import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Users, BarChart2, Shield } from 'lucide-react';
import logo from '../assets/logo.png';
import styles from './Home.module.css';

const Home = () => {
    return (
        <div className={styles.container}>
            {/* Navbar */}
            <nav className={styles.navbar}>
                <div className={styles.logoContainer}>
                    <img src={logo} alt="FirstLove Church Logo" className={styles.logo} />
                    <span className={styles.brandName}>FirstLove Church</span>
                </div>
                <div className={styles.navLinks}>
                    <Link to="/login" className={styles.loginButton}>
                        Connexion
                    </Link>
                </div>
            </nav>

            {/* Hero Section */}
            <header className={styles.hero}>
                <div className={styles.heroContent}>
                    <h1 className={styles.heroTitle}>
                        Gérez votre église avec <span className={styles.highlight}>Excellence</span>
                    </h1>
                    <p className={styles.heroSubtitle}>
                        Une solution complète pour le suivi des membres, la gestion des Bacentas et l'analyse de la croissance.
                        Conçu pour les leaders visionnaires.
                    </p>
                    <Link to="/login" className={styles.ctaButton}>
                        Commencer maintenant <ChevronRight size={20} />
                    </Link>
                </div>

                <div className={styles.heroImageContainer}>
                    <div className={styles.glassCard}>
                        <div className={styles.statRow}>
                            <div className={styles.statItem}>
                                <Users size={24} color="#DC2626" />
                                <div>
                                    <h3>1,240</h3>
                                    <p>Membres Actifs</p>
                                </div>
                            </div>
                            <div className={styles.statItem}>
                                <BarChart2 size={24} color="#DC2626" />
                                <div>
                                    <h3>+15%</h3>
                                    <p>Croissance</p>
                                </div>
                            </div>
                        </div>
                        <div className={styles.chartPlaceholder}>
                            {/* Simulation de graphique */}
                            <div className={styles.bar} style={{ height: '40%' }}></div>
                            <div className={styles.bar} style={{ height: '60%' }}></div>
                            <div className={styles.bar} style={{ height: '50%' }}></div>
                            <div className={styles.bar} style={{ height: '80%' }}></div>
                            <div className={styles.bar} style={{ height: '70%' }}></div>
                            <div className={styles.bar} style={{ height: '90%' }}></div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Features Section */}
            <section className={styles.features}>
                <FeatureCard
                    icon={<Users size={32} />}
                    title="Suivi des Membres"
                    description="Gardez une trace précise de chaque brebis. Historique, coordonnées et statut spirituel."
                    delay={0.2}
                />
                <FeatureCard
                    icon={<Shield size={32} />}
                    title="Gestion Bacenta"
                    description="Outils puissants pour les leaders de Bacenta. Rapports automatisés et suivi des présences."
                    delay={0.4}
                />
                <FeatureCard
                    icon={<BarChart2 size={32} />}
                    title="Analyses Avancées"
                    description="Visualisez la santé de votre église avec des graphiques clairs et des indicateurs de performance."
                    delay={0.6}
                />
            </section>
        </div>
    );
};

const FeatureCard = ({ icon, title, description, delay }) => (
    <div className={styles.featureCard}>
        <div className={styles.iconWrapper}>{icon}</div>
        <h3>{title}</h3>
        <p>{description}</p>
    </div>
);

export default Home;
