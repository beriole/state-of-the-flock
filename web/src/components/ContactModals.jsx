import React, { useState } from 'react';
import { X, MessageCircle, Phone, Send, Smartphone } from 'lucide-react';
import styles from './ContactModals.module.css';

export const SMS_TEMPLATES = [
    {
        id: 1,
        title: 'Message de bienvenue / suivi',
        message: (memberName, leaderName) => `Bonjour ${memberName},
C'est ${leaderName}. Je voulais prendre un moment pour vous saluer et vous rappeler que vous êtes une partie précieuse de notre Bacenta. 🙏
Si vous avez besoin de prières ou d'assistance, n'hésitez pas à me contacter.
Que Dieu vous bénisse !`
    },
    {
        id: 2,
        title: 'Invitation à un événement',
        message: (memberName, leaderName) => `Bonjour ${memberName},
Ici ${leaderName}. Nous organisons [Nom de l'événement] ce [Jour] à [Heure]. Votre présence sera une grande joie pour nous !
Merci de confirmer votre participation. 🙌`
    },
    {
        id: 3,
        title: 'Message de motivation / encouragement spirituel',
        message: (memberName, leaderName) => `Salut ${memberName},
${leaderName} ici. Je prie pour vous aujourd'hui et vous encourage à rester fort dans la foi.
Que Dieu vous guide et vous protège dans toutes vos démarches. ✨`
    },
    {
        id: 4,
        title: 'Message pour prise de nouvelles',
        message: (memberName, leaderName) => `Bonjour ${memberName},
C'est ${leaderName}. Juste un petit message pour prendre de vos nouvelles et savoir comment vous allez spirituellement et personnellement.
N'hésitez pas à me répondre ou à demander de la prière. 🙏`
    },
    {
        id: 5,
        title: 'Rappel de réunion / rencontre Bacenta',
        message: (memberName, leaderName) => `Bonjour ${memberName},
Ici ${leaderName}. Nous avons notre prochaine réunion Bacenta le [Jour] à [Heure].
Votre présence est très importante, merci de ne pas oublier ! ✨`
    },
    {
        id: 6,
        title: 'Message de félicitations / encouragement personnel',
        message: (memberName, leaderName) => `Bonjour ${memberName},
${leaderName} ici. Je tenais à vous féliciter pour [Événement / Réussite du membre]. Que le Seigneur continue de bénir vos efforts et votre chemin ! 🎉`
    }
];

export const ContactModal = ({ isOpen, onClose, member, authUser, onActionComplete }) => {
    const [showTemplates, setShowTemplates] = useState(false);
    const [messageMethod, setMessageMethod] = useState(null); // 'sms' or 'whatsapp'

    if (!isOpen || !member) return null;

    const phoneNumber = member.phone_primary || member.phone;
    const memberName = `${member.first_name} ${member.last_name}`;
    const leaderName = authUser ? `${authUser.first_name} ${authUser.last_name}` : 'Votre leader';

    const handleCall = (method) => {
        let url = '';
        if (method === 'phone') {
            url = `tel:${phoneNumber}`;
        } else if (method === 'whatsapp') {
            url = `https://wa.me/${phoneNumber.replace(/\s/g, '')}`;
        }
        window.open(url, '_blank');
        onActionComplete('Call', method);
        onClose();
    };

    const handleMessage = (template = null) => {
        const method = messageMethod;
        const message = template
            ? template.message(memberName, leaderName)
            : "";

        let url = '';
        if (method === 'sms') {
            url = `sms:${phoneNumber}?body=${encodeURIComponent(message)}`;
        } else if (method === 'whatsapp') {
            url = `https://wa.me/${phoneNumber.replace(/\s/g, '')}?text=${encodeURIComponent(message)}`;
        }
        window.open(url, '_blank');
        onActionComplete('Message', method, template?.title);
        onClose();
        setShowTemplates(false);
        setMessageMethod(null);
    };

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={e => e.stopPropagation()}>
                <div className={styles.header}>
                    <h3>Contacter {member.first_name}</h3>
                    <button className={styles.closeBtn} onClick={onClose}><X size={20} /></button>
                </div>

                {!showTemplates ? (
                    <div className={styles.options}>
                        <div className={styles.section}>
                            <h4>Appeler via</h4>
                            <div className={styles.btnGroup}>
                                <button className={styles.actionBtn} onClick={() => handleCall('phone')}>
                                    <Phone size={20} /> Téléphonie
                                </button>
                                <button className={`${styles.actionBtn} ${styles.whatsapp}`} onClick={() => handleCall('whatsapp')}>
                                    <MessageCircle size={20} /> WhatsApp
                                </button>
                            </div>
                        </div>

                        <div className={styles.section}>
                            <h4>Envoyer un message via</h4>
                            <div className={styles.btnGroup}>
                                <button className={styles.actionBtn} onClick={() => {
                                    setMessageMethod('sms');
                                    setShowTemplates(true);
                                }}>
                                    <Smartphone size={20} /> SMS (Modèles)
                                </button>
                                <button className={`${styles.actionBtn} ${styles.whatsapp}`} onClick={() => {
                                    setMessageMethod('whatsapp');
                                    setShowTemplates(true);
                                }}>
                                    <MessageCircle size={20} /> WhatsApp (Modèles)
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className={styles.templates}>
                        <button className={styles.backBtn} onClick={() => {
                            setShowTemplates(false);
                            setMessageMethod(null);
                        }}>← Retour</button>
                        <h4>Choisir un modèle {messageMethod === 'whatsapp' ? 'WhatsApp' : 'SMS'}</h4>
                        <div className={styles.templateList}>
                            {SMS_TEMPLATES.map(t => (
                                <button
                                    key={t.id}
                                    className={styles.templateItem}
                                    onClick={() => handleMessage(t)}
                                >
                                    <strong>{t.title}</strong>
                                    <p>{t.message(member.first_name, authUser?.first_name || 'Leader')}</p>
                                </button>
                            ))}
                            <button className={styles.templateItem} onClick={() => handleMessage()}>
                                <strong>Message vide</strong>
                                <p>Ouvrir sans message prédéfini</p>
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
