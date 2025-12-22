import React, { useState } from 'react';
import { X, MessageCircle, Phone, Send, Smartphone } from 'lucide-react';
import styles from './ContactModals.module.css';

export const SMS_TEMPLATES = [
    {
        id: 1,
        title: 'Bienvenue / Suivi',
        message: (memberName, leaderName) => `Bonjour ${memberName}, c'est ${leaderName}. Je voulais vous saluer et vous rappeler que vous êtes précieux pour notre Bacenta. 🙏 Si vous avez besoin de prières, n'hésitez pas. Que Dieu vous bénisse !`
    },
    {
        id: 2,
        title: 'Invitation Événement',
        message: (memberName, leaderName) => `Bonjour ${memberName}, ici ${leaderName}. Nous organisons un événement spécial ce dimanche à 9h. Votre présence sera une joie ! Merci de confirmer. 🙌`
    },
    {
        id: 3,
        title: 'Encouragement',
        message: (memberName, leaderName) => `Salut ${memberName}, ${leaderName} ici. Je prie pour vous aujourd'hui. Restez fort dans la foi. Que Dieu vous guide ! ✨`
    },
    {
        id: 4,
        title: 'Prise de nouvelles',
        message: (memberName, leaderName) => `Bonjour ${memberName}, c'est ${leaderName}. Juste un petit message pour savoir comment vous allez ? N'hésitez pas si vous avez besoin de quoi que ce soit. 🙏`
    },
    {
        id: 5,
        title: 'Rappel Réunion',
        message: (memberName, leaderName) => `Bonjour ${memberName}, ici ${leaderName}. Rappel : notre réunion Bacenta a lieu demain à 18h. Votre présence est importante ! ✨`
    }
];

export const ContactModal = ({ isOpen, onClose, member, authUser, onActionComplete }) => {
    const [showTemplates, setShowTemplates] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState(null);

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

    const handleMessage = (method, template = null) => {
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
                                <button className={styles.actionBtn} onClick={() => setShowTemplates(true)}>
                                    <Smartphone size={20} /> SMS (Modèles)
                                </button>
                                <button className={`${styles.actionBtn} ${styles.whatsapp}`} onClick={() => {
                                    setSelectedTemplate(null);
                                    setShowTemplates(true);
                                }}>
                                    <MessageCircle size={20} /> WhatsApp (Modèles)
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className={styles.templates}>
                        <button className={styles.backBtn} onClick={() => setShowTemplates(false)}>← Retour</button>
                        <h4>Choisir un modèle</h4>
                        <div className={styles.templateList}>
                            {SMS_TEMPLATES.map(t => (
                                <button
                                    key={t.id}
                                    className={styles.templateItem}
                                    onClick={() => handleMessage(selectedTemplate === null ? 'whatsapp' : 'sms', t)}
                                >
                                    <strong>{t.title}</strong>
                                    <p>{t.message(member.first_name, authUser?.first_name || 'Leader')}</p>
                                </button>
                            ))}
                            <button className={styles.templateItem} onClick={() => handleMessage(selectedTemplate === null ? 'whatsapp' : 'sms')}>
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
