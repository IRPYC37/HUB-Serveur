# 🚀 NEXUS HUB - System Monitor

Un hub de monitoring système professionnel avec interface React et backend Node.js temps réel.

## ✨ Fonctionnalités

### 🔐 Authentification
- Système JWT avec rôles (admin/viewer)
- Protection des routes sensibles
- Gestion des sessions

### 📊 Monitoring
- **Overview**: Vue d'ensemble CPU/RAM/température
- **System**: Informations système détaillées
- **Advanced**: Monitoring avancé avec graphs temps réel
  - CPU load détaillé (user/system)
  - Température CPU
  - Disk I/O (read/write)
  - Graphs en temps réel (Recharts)
- **Processes**: Liste des processus actifs
- **Network**: Connexions réseau et ports ouverts
- **Docker**: Gestion des containers Docker

### 🎨 Design System
- Thème spatial sobre (dark + glassmorphism)
- Composants réutilisables
- Animations fluides
- Tailwind CSS

### ⚡ Temps Réel
- WebSocket pour les métriques live
- Refresh automatique
- Graphs animés

## 🚀 Installation

### Prérequis
- Node.js 18+ 
- npm ou yarn

### Backend

```bash
cd backend
npm install
npm start
```

Le backend démarre sur `http://localhost:3001`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Le frontend démarre sur `http://localhost:5173`

## 🔑 Identifiants par défaut

**Admin:**
- Username: `admin`
- Password: `admin123`

**Viewer:**
- Username: `viewer`
- Password: `viewer123`

## 📁 Structure du projet

```
nexus-hub/
├── backend/
│   ├── auth/
│   │   ├── auth.js          # JWT middleware
│   │   └── users.js         # Base utilisateurs
│   ├── index.js             # Serveur principal
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── auth/            # Contexte auth
    │   ├── components/
    │   │   ├── ui/          # Design system
    │   │   └── graphs/      # Graphiques
    │   ├── hooks/           # Custom hooks
    │   ├── layout/          # Layout HUB
    │   ├── pages/           # Pages
    │   ├── design/          # Styles Tailwind
    │   ├── App.jsx
    │   └── main.jsx
    └── package.json

## 🛠️ Technologies

### Backend
- Express.js
- systeminformation (stats système)
- ws (WebSocket)
- jsonwebtoken (auth)

### Frontend
- React 18
- React Router
- Recharts (graphs)
- Tailwind CSS
- Vite

## 🔧 Configuration

### Backend
Éditez `backend/index.js` pour modifier:
- Port (défaut: 3001)
- Secret JWT
- Intervalle WebSocket

### Frontend
Éditez `frontend/vite.config.js` pour modifier:
- Port (défaut: 5173)

## 📊 API Endpoints

- `POST /api/login` - Authentification
- `GET /api/system` - Stats système
- `GET /api/advanced` - Monitoring avancé
- `GET /api/processes` - Processus actifs
- `GET /api/network` - Connexions réseau
- `GET /api/docker` - Containers Docker
- `WebSocket ws://localhost:3001` - Stream temps réel

## ⚠️ Notes importantes

### Température CPU
La température CPU peut ne pas être disponible sur tous les systèmes:
- ✅ Linux serveur: généralement OK
- ⚠️ Windows/Mac: peut retourner null

### Docker
Le module Docker nécessite Docker installé et en cours d'exécution.

### Production
Pour un déploiement en production:
1. Changez le secret JWT dans `backend/auth/auth.js`
2. Utilisez bcrypt pour hasher les mots de passe
3. Configurez HTTPS
4. Utilisez une vraie base de données
5. Ajoutez des variables d'environnement

## 🔮 Évolutions possibles

- [ ] Alertes sur seuils
- [ ] Contrôle Docker (start/stop)
- [ ] Historique des métriques
- [ ] Multi-serveurs
- [ ] 2FA
- [ ] Dark/Light theme toggle

## 📝 License

MIT

---

**Développé avec ❤️ pour un monitoring système professionnel**
