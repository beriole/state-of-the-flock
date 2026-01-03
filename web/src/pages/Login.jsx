import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../utils/api';
import { Eye, EyeOff, ArrowLeft, Mail, Lock } from 'lucide-react';
import styles from './Login.module.css';
import logo from '../assets/logo.png';

const Login = () => {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        if (!email || !password) {
            setError('Veuillez remplir tous les champs');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await authAPI.login({ email, password });
            await login(response.data.user, response.data.token);
            navigate('/dashboard');
        } catch (err) {
            console.error(err);
            if (err.response) {
                const message = err.response.data?.error || `Erreur ${err.response.status}`;
                const details = err.response.data?.details;
                setError(details ? `${message} : ${details}` : message);
            } else if (err.request) {
                setError('Erreur de connexion au serveur');
            } else {
                setError('Une erreur est survenue');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={`${styles.container} notranslate`} translate="no">
            {/* Background Elements */}
            <div className={styles.bgCircle1}></div>
            <div className={styles.bgCircle2}></div>

            <div className={styles.glassWrapper}>
                <div className={styles.leftPanel}>
                    <div className={styles.logoHeader}>
                        <Link to="/" className={styles.backLink}>
                            <ArrowLeft size={20} /> Retour
                        </Link>
                    </div>

                    <div className={styles.formContent}>
                        <div className={styles.headerText}>
                            <img src={logo} alt="FirstLove Church Logo" className={styles.logo} />
                            <h2>FirstLove Church</h2>
                            <p>Connectez-vous pour gérer votre troupeau.</p>
                        </div>

                        {error && (
                            <div className={styles.error}>
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleLogin}>
                            <div className={styles.inputGroup}>
                                <label>Email</label>
                                <div className={styles.inputWrapper}>
                                    <Mail className={styles.inputIcon} size={18} />
                                    <input
                                        type="email"
                                        placeholder="votre@email.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        disabled={loading}
                                    />
                                </div>
                            </div>

                            <div className={styles.inputGroup}>
                                <label>Mot de passe</label>
                                <div className={styles.inputWrapper}>
                                    <Lock className={styles.inputIcon} size={18} />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        disabled={loading}
                                    />
                                    <button
                                        type="button"
                                        className={styles.eyeButton}
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            <div className={styles.forgotPassword}>
                                <a href="#">Mot de passe oublié ?</a>
                            </div>

                            <button type="submit" className={styles.loginButton} disabled={loading}>
                                {loading ? (
                                    <span className={styles.loader}></span>
                                ) : (
                                    'Se connecter'
                                )}
                            </button>
                        </form>
                    </div>
                </div>

                <div className={styles.rightPanel}>
                    <div className={styles.overlay}>
                        <h3>FirstLove Church</h3>
                        <p>"Prenez soin du troupeau de Dieu qui est sous votre garde."</p>
                        <div className={styles.testimonial}>
                            <p>1 Pierre 5:2</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
