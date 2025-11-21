# State of the Flock - Gestion des Membres d'Église

Une application mobile React Native complète pour la gestion des membres d'église, avec backend Node.js/Express et base de données PostgreSQL.

## 🚀 Fonctionnalités

### 📱 Application Mobile
- **Gestion des Réunions Bacenta** : Création, modification, suivi des réunions
- **Suivi des Présences** : Marquage automatique des présences par membre
- **Gestion des Offrandes** : Suivi des contributions financières
- **Appels de Suivi** : Système complet de suivi des membres avec historique
- **Authentification** : Connexion sécurisée avec JWT
- **Internationalisation** : Support Français/Anglais
- **Interface Modern** : Design Material Design avec thème rouge ecclésiastique

### 🖥️ Backend API
- **Architecture REST** : API RESTful complète
- **Authentification JWT** : Sécurité avancée
- **Gestion des Rôles** : Permissions hiérarchiques (Bishop, Overseer, Leader)
- **Base de Données** : Modèles Sequelize avec relations complexes
- **Upload de Fichiers** : Gestion des photos de réunion
- **Logs d'Audit** : Traçabilité complète des actions

## 🛠️ Technologies Utilisées

### Frontend
- **React Native** 0.72+
- **React Navigation** 6.x
- **Redux Toolkit** (optionnel pour état global)
- **React i18next** (internationalisation)
- **Axios** (requêtes HTTP)
- **React Native Vector Icons**
- **React Native Image Picker**
- **React Native Toast Message**

### Backend
- **Node.js** 18+
- **Express.js** 4.x
- **Sequelize** 6.x (ORM)
- **PostgreSQL** 13+
- **JWT** (authentification)
- **Bcrypt** (hashage mots de passe)
- **Multer** (upload fichiers)
- **CORS** (cross-origin)

### DevOps
- **ESLint** + **Prettier** (qualité code)
- **Jest** + **React Native Testing Library** (tests)
- **Git** (versionning)

## 📋 Prérequis

- **Node.js** 18+ et **npm** ou **yarn**
- **React Native CLI** ou **Expo CLI**
- **PostgreSQL** 13+
- **Android Studio** (pour Android) ou **Xcode** (pour iOS)

## 🚀 Installation & Configuration

### 1. Clonage du Repository
```bash
git clone https://github.com/votre-username/state-of-the-flock.git
cd state-of-the-flock
```

### 2. Installation des Dépendances

#### Backend
```bash
cd backend
npm install
```

#### Frontend
```bash
cd .. # retour à la racine
npm install
```

### 3. Configuration de la Base de Données

#### Créer la base de données PostgreSQL
```sql
CREATE DATABASE state_of_the_flock;
CREATE USER flock_user WITH PASSWORD 'votre_mot_de_passe';
GRANT ALL PRIVILEGES ON DATABASE state_of_the_flock TO flock_user;
```

#### Variables d'environnement Backend
Créer le fichier `backend/.env` :
```env
NODE_ENV=development
PORT=5000
DATABASE_URL=postgresql://flock_user:votre_mot_de_passe@localhost:5432/state_of_the_flock
JWT_SECRET=votre_jwt_secret_très_long_et_sécurisé
JWT_EXPIRE=7d
BCRYPT_ROUNDS=12
```

### 4. Initialisation de la Base de Données
```bash
cd backend
npm run init-db
```

### 5. Démarrage des Services

#### Terminal 1 - Backend
```bash
cd backend
npm run dev
```

#### Terminal 2 - Frontend
```bash
# Pour Android
npm run android

# Pour iOS
npm run ios

# Pour Expo
npm start
```

## 📱 Utilisation

### Rôles Utilisateur
- **Bishop** : Accès complet à toutes les fonctionnalités
- **Assisting Overseer** : Gestion de zones
- **Area Pastor** : Gestion d'une zone
- **Bacenta Leader** : Gestion de son bacenta uniquement

### Fonctionnalités Principales

#### Gestion des Réunions
1. Créer une nouvelle réunion avec date, heure, lieu
2. Inviter des participants
3. Marquer les présences
4. Enregistrer les offrandes
5. Télécharger des photos

#### Suivi des Membres
1. Consulter la liste des membres
2. Voir l'historique des interactions
3. Effectuer des appels de suivi
4. Envoyer des rappels WhatsApp

## 🧪 Tests

### Tests Backend
```bash
cd backend
npm test
```

### Tests Frontend
```bash
npm test
```

### Linting
```bash
npm run lint
```

## 📁 Structure du Projet

```
state-of-the-flock/
├── android/                 # Configuration Android
├── ios/                     # Configuration iOS
├── backend/                 # API Backend
│   ├── controllers/         # Contrôleurs API
│   ├── models/             # Modèles de données
│   ├── routes/             # Routes API
│   ├── middleware/         # Middleware personnalisé
│   ├── config/             # Configuration
│   └── scripts/            # Scripts utilitaires
├── screens/                # Écrans React Native
│   └── inscription/        # Écrans d'inscription/connexion
├── components/             # Composants réutilisables
├── contexts/               # Contextes React
├── utils/                  # Utilitaires
├── assets/                 # Images et ressources
├── locales/                # Fichiers de traduction
├── __tests__/              # Tests
├── App.js                  # Point d'entrée React Native
├── index.js                # Point d'entrée Metro
├── package.json            # Dépendances frontend
└── README.md              # Documentation
```

## 🔒 Sécurité

- **Authentification JWT** avec expiration
- **Hashage des mots de passe** avec bcrypt
- **Validation des entrées** côté serveur
- **Protection CSRF** et **CORS**
- **Logs d'audit** pour traçabilité
- **Permissions granulaire** par rôle

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit vos changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📝 Licence

Ce projet est sous licence MIT - voir le fichier [LICENSE](LICENSE) pour plus de détails.

## 🙏 Remerciements

- Équipe de développement React Native
- Communauté Open Source
- Église pour l'inspiration fonctionnelle

## 📞 Support

Pour support, email: support@stateoftheflock.com

---

**"State of the Flock" - Gestion moderne et efficace des membres d'église** 🕊️
