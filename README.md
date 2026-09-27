# Intimia — Application de journal personnel et planner quotidien

Une application web complète de journal personnel, planner quotidien et gestion de routine, construite avec un stack moderne React/Node.js.

---

## Stack technique

| Couche | Technologie |
|--------|-------------|
| Frontend | React 18, React Router v6 |
| Style | Tailwind CSS |
| Build | Vite |
| Backend | Node.js, Express.js |
| Base de données | Feuilles Excel (SheetJS/XLSX) |
| Authentification | JWT (JSON Web Tokens) |
| Langage | JavaScript (ES6+) |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT (Browser)                      │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │                  React Application                       │ │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌───────────┐  │ │
│  │  │  Auth     │ │ Journal  │ │ Planning │ │  Galerie  │  │ │
│  │  └──────────┘ └──────────┘ └──────────┘ └───────────┘  │ │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌───────────┐  │ │
│  │  │  Humeurs │ │ Routine  │ │ Settings │ │  Avatar   │  │ │
│  │  └──────────┘ └──────────┘ └──────────┘ └───────────┘  │ │
│  │                                                          │ │
│  │  Port : 5173 (Vite Dev Server)                           │ │
│  └─────────────────────┬───────────────────────────────────┘ │
└────────────────────────┼─────────────────────────────────────┘
                         │ HTTP/REST (JSON)
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                     SERVEUR (Node.js)                         │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │                   Express.js API                         │ │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌───────────┐  │ │
│  │  │ Auth     │ │ Journal  │ │ Planning │ │  Gallery  │  │ │
│  │  │ Routes   │ │ Routes   │ │ Routes   │ │  Routes   │  │ │
│  │  └────┬─────┘ └────┬─────┘ └────┬─────┘ └─────┬─────┘  │ │
│  │       │             │            │              │         │ │
│  │  ┌────┴─────────────┴────────────┴──────────────┴─────┐  │ │
│  │  │              Middleware (JWT Auth)                  │  │ │
│  │  └────────────────────┬──────────────────────────────┘  │ │
│  │                       │                                  │ │
│  │  ┌────────────────────┴──────────────────────────────┐  │ │
│  │  │           Controllers & Services                   │  │ │
│  │  └────────────────────┬──────────────────────────────┘  │ │
│  │                       │                                  │ │
│  │  Port : 5000                                               │ │
│  └─────────────────────┬───────────────────────────────────┘ │
└────────────────────────┼─────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              STOCKAGE (Fichiers Excel)                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │ users.xlsx   │  │ journal.xlsx │  │ plannings.xlsx│       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │ routines.xlsx│  │ gallery.xlsx │  │ settings.xlsx│       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
└─────────────────────────────────────────────────────────────┘
```

---

## Installation

### Prérequis

- **Node.js** >= 18.x
- **npm** >= 9.x
- Un navigateur web moderne (Chrome, Firefox, Safari, Edge)

### Cloner le projet

```bash
git clone <url-du-depot>
cd laravel-app
```

### Backend

```bash
cd backend
npm install
```

### Frontend

```bash
cd frontend
npm install
```

### Initialiser la base de données

```bash
cd backend
node scripts/initDatabase.js
```

Cette commande crée les fichiers Excel dans `backend/data/` avec les structures de tables par défaut, ajoute les 10 avatars prédéfinis et crée le compte **super-admin**.

### Compte super-admin

| Champ | Valeur par défaut |
|-------|-------------------|
| Email | `admin@intimia.app` |
| Mot de passe | `Admin123!` |
| Rôle | `admin` |

Ces valeurs sont personnalisables via `ADMIN_EMAIL`, `ADMIN_PASSWORD` et `ADMIN_NAME` dans `backend/.env` (voir `.env.example`). L'admin dispose des routes `/api/admin/*` (liste et suppression de comptes, statistiques globales) et n'est pas supprimable depuis l'interface utilisateur.

---

## Configuration

### Backend (`backend/.env`)

Créez un fichier `backend/.env` :

```env
PORT=5000
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_EXPIRES_IN=7d
NODE_ENV=development
ADMIN_EMAIL=admin@intimia.app
ADMIN_PASSWORD=Admin123!
ADMIN_NAME=Super Admin
```

| Variable | Description | Valeur par défaut |
|----------|-------------|-------------------|
| `PORT` | Port du serveur backend | `5000` |
| `JWT_SECRET` | Clé secrète pour les tokens JWT | *(à définir)* |
| `JWT_EXPIRES_IN` | Durée de validité des tokens | `7d` |
| `NODE_ENV` | Environnement d'exécution | `development` |
| `ADMIN_EMAIL` | Email du super-admin créé par `npm run init` | `admin@intimia.app` |
| `ADMIN_PASSWORD` | Mot de passe du super-admin | `Admin123!` |
| `ADMIN_NAME` | Nom du super-admin | `Super Admin` |

### Frontend (`frontend/.env`)

Créez un fichier `frontend/.env` :

```env
VITE_API_URL=http://localhost:5000/api
```

| Variable | Description | Valeur par défaut |
|----------|-------------|-------------------|
| `VITE_API_URL` | URL de l'API backend | `http://localhost:5000/api` |

---

## Lancement

### Backend

```bash
cd backend
npm run dev
```

Le serveur démarre sur **http://localhost:5000**

### Frontend

```bash
cd frontend
npm run dev
```

L'application frontend démarre sur **http://localhost:5173**

---

## Fonctionnalités

| Module | Description |
|--------|-------------|
| **Authentification** | Inscription, connexion, gestion de session avec JWT |
| **Journal** | Créer, modifier, supprimer des entrées de journal avec date, titre et contenu |
| **Humeurs** | Enregistrer son humeur quotidienne avec un score et des notes |
| **Planning** | Gérer un planning quotidien/hebdomadaire avec des tâches horodatées |
| **Routine** | Suivre des routines personnalisées avec suivi d'état (terminé/non terminé) |
| **Galerie** | Stocker et gérer des images avec légendes et catégories |
| **Paramètres** | Modifier le profil, le mot de passe, les notifications |
| **Avatar** | Choisir parmi des avatars prédéfinis ou en télécharger un personnalisé |
| **Dashboard** | Vue d'ensemble avec statistiques agrégées |

---

## Structure du projet

```
laravel-app/
├── README.md                          # Documentation principale
├── API_DOCUMENTATION.md               # Documentation de l'API
│
├── backend/                           # Serveur Node.js/Express
│   ├── package.json
│   ├── server.js                      # Point d'entrée du serveur
│   ├── .env                           # Variables d'environnement
│   │
│   ├── config/
│   │   └── database.js                # Schémas des tables Excel
│   │
│   ├── data/                          # Fichiers Excel (base de données)
│   │   ├── users.xlsx
│   │   ├── settings.xlsx
│   │   ├── journal_entries.xlsx
│   │   ├── moods.xlsx
│   │   ├── plannings.xlsx
│   │   ├── routines.xlsx
│   │   ├── gallery.xlsx
│   │   └── avatars.xlsx
│   │
│   ├── middleware/
│   │   ├── auth.js                    # Middleware d'authentification JWT (+ admin)
│   │   └── upload.js                  # Multer (uploads images)
│   │
│   ├── routes/
│   │   ├── auth.js                    # Routes d'authentification
│   │   ├── journal.js                 # Routes du journal
│   │   ├── moods.js                   # Routes des humeurs
│   │   ├── planning.js                # Routes du planning
│   │   ├── routine.js                 # Routes des routines
│   │   ├── gallery.js                 # Routes de la galerie
│   │   ├── settings.js                # Routes des paramètres
│   │   ├── avatars.js                 # Routes des avatars
│   │   ├── dashboard.js               # Routes du tableau de bord
│   │   ├── admin.js                   # Routes d'administration (admin)
│   │   └── health.js                  # Route de santé
│   │
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── journalController.js
│   │   ├── moodsController.js
│   │   ├── planningController.js
│   │   ├── routineController.js
│   │   ├── galleryController.js
│   │   ├── settingsController.js
│   │   ├── avatarsController.js
│   │   ├── dashboardController.js
│   │   ├── adminController.js
│   │   └── healthController.js
│   │
│   ├── services/
│   │   └── excelService.js            # Lecture/écriture des fichiers Excel
│   │
│   ├── utils/
│   │   ├── http.js                    # Réponses JSON + gestion d'erreurs
│   │   └── id.js                      # Génération d'identifiants/dates
│   │
│   ├── scripts/
│   │   └── initDatabase.js            # Initialisation + seed du super-admin
│   │
│   └── uploads/                       # Images uploadées
│       ├── avatars/
│       └── gallery/
│
├── frontend/                          # Application React
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── index.html
│   ├── .env                           # Variables d'environnement frontend
│   │
│   ├── public/
│   │   └── favicon.ico
│   │
│   └── src/
│       ├── main.jsx                   # Point d'entrée React
│       ├── App.jsx                    # Routeur principal
│       ├── index.css                  # Styles globaux + Tailwind
│       │
│       ├── components/
│       │   ├── Layout.jsx             # Mise en page principale
│       │   ├── Navbar.jsx             # Barre de navigation
│       │   ├── ProtectedRoute.jsx     # Route protégée par auth
│       │   └── ...
│       │
│       ├── pages/
│       │   ├── Login.jsx
│       │   ├── Register.jsx
│       │   ├── Dashboard.jsx
│       │   ├── Journal.jsx
│       │   ├── Moods.jsx
│       │   ├── Planning.jsx
│       │   ├── Routine.jsx
│       │   ├── Gallery.jsx
│       │   ├── Settings.jsx
│       │   └── Avatars.jsx
│       │
│       ├── context/
│       │   └── AuthContext.jsx        # Contexte d'authentification
│       │
│       ├── services/
│       │   └── api.js                 # Service HTTP (axios/fetch)
│       │
│       └── utils/
│           └── helpers.js             # Fonctions utilitaires
│
└── .gitignore
```

---

## API

L'API REST fonctionne sur le port **5000**. Toutes les routes sont préfixées par `/api`.

| Endpoint | Méthode | Description |
|----------|---------|-------------|
| `/api/auth/register` | POST | Créer un compte |
| `/api/auth/login` | POST | Se connecter |
| `/api/auth/logout` | POST | Se déconnecter |
| `/api/auth/me` | GET | Profil utilisateur connecté |
| `/api/auth/forgot-password` | POST | Demander un lien de réinitialisation |
| `/api/auth/reset-password` | POST | Réinitialiser le mot de passe |
| `/api/journal` | GET/POST | Lister/créer des entrées de journal |
| `/api/journal/:id` | PUT/DELETE | Modifier/supprimer une entrée |
| `/api/moods` | GET/POST | Lister/enregistrer les humeurs |
| `/api/planning` | GET/PUT | Lister/modifier le planning |
| `/api/planning/:id` | DELETE | Supprimer un élément de planning |
| `/api/routine` | GET/POST | Lister/créer des routines |
| `/api/routine/:id/toggle` | PATCH | Basculer l'état d'une routine |
| `/api/routine/:id` | DELETE | Supprimer une routine |
| `/api/gallery` | GET/POST | Lister/ajouter des images |
| `/api/gallery/:id` | PUT/DELETE | Modifier/supprimer une image |
| `/api/settings` | GET/DELETE | Récupérer les paramètres / supprimer le compte |
| `/api/settings/profile` | PUT | Modifier le profil |
| `/api/settings/password` | PUT | Changer le mot de passe |
| `/api/settings/notifications` | PUT | Modifier les notifications |
| `/api/avatars` | GET | Lister les avatars |
| `/api/avatars/select` | PUT | Choisir un avatar |
| `/api/avatars/upload` | POST | Télécharger un avatar |
| `/api/dashboard/stats` | GET | Statistiques du tableau de bord |
| `/api/admin/stats` | GET | Statistiques globales (admin) |
| `/api/admin/users` | GET | Lister tous les comptes (admin) |
| `/api/admin/users/:id` | DELETE | Supprimer un compte (admin) |
| `/api/health` | GET | Vérification de santé |

Pour la documentation complète, consultez [API_DOCUMENTATION.md](API_DOCUMENTATION.md).

---

## Excel

Les données sont stockées dans des fichiers Excel (`.xlsx`) dans le répertoire `backend/data/`. Chaque module a son propre fichier :

| Fichier | Contenu |
|---------|---------|
| `users.xlsx` | Comptes utilisateurs (id, email, password hash, name, avatar, role) |
| `journal_entries.xlsx` | Entrées de journal (id, user_id, title, content, date, mood, mise en forme) |
| `moods.xlsx` | Enregistrements d'humeur (id, user_id, mood, score, note, date) |
| `plannings.xlsx` | Éléments de planning (id, user_id, title, content, date, time, completed) |
| `routines.xlsx` | Routines (id, user_id, name, period, description, completed, date) |
| `gallery.xlsx` | Images (id, user_id, url, caption, category, date) |
| `settings.xlsx` | Paramètres utilisateur (user_id, theme, notifications, etc.) |
| `avatars.xlsx` | Avatars disponibles (id, url, name, is_default) + avatars uploadés |

**Avantages :**
- Pas de base de données externe à installer
- Fichiers lisibles directement avec Excel/LibreOffice
- Sauvegarde simple par copie de fichiers

**Limitations :**
- Non recommandé pour la production à grande échelle
- Performance dégradée avec beaucoup de données

---

## Images

### Avatars par défaut

Les avatars prédéfinis sont stockés dans `frontend/public/avatars/`.

### Images uploadées

Les images uploadées par les utilisateurs sont stockées dans :

```
backend/uploads/
├── avatars/      # Avatars personnalisés
└── gallery/      # Images de la galerie
```

**Important :** Ajoutez `backend/uploads/` à votre `.gitignore` pour ne pas versionner les images utilisateur.

---

## Migration depuis Laravel

Si vous migrez depuis une ancienne version Laravel :

1. **Exporter les données** de la base Laravel (MySQL/SQLite) en JSON ou CSV
2. **Installer les dépendances** du nouveau stack :
   ```bash
   cd backend && npm install
   cd ../frontend && npm install
   ```
3. **Initialiser la base Excel** :
   ```bash
   cd backend && node scripts/initDatabase.js
   ```
4. **Adapter le script d'import** pour convertir vos données au format Excel
5. **Tester** chaque module individuellement
6. **Mettre à jour les variables d'environnement** (JWT_SECRET, etc.)

---

## Développement

### Ajouter une nouvelle route API

1. Créer la route dans `backend/routes/`
2. Créer le contrôleur dans `backend/controllers/`
3. Enregistrer la route dans `server.js`

### Ajouter une nouvelle page React

1. Créer le composant dans `frontend/src/pages/`
2. Ajouter la route dans `frontend/src/App.jsx`
3. Ajouter le lien dans la navbar si nécessaire

### Commandes utiles

```bash
# Backend : exécuter des scripts
cd backend && node scripts/initDatabase.js

# Backend : tests de bout en bout de l'API (serveur obligatoirement lancé)
cd backend && npm run test:api
# options : API_BASE=http://localhost:5001/api API_LOG=/tmp/intimia-api.log

# Vérifier les logs du serveur
# Le serveur affiche les requêtes en mode développement
```

### Bonnes pratiques

- Utiliser le middleware d'authentification pour les routes protégées
- Valider les entrées utilisateur côté serveur
- Gérer les erreurs avec des codes HTTP appropriés
- Documenter chaque nouvel endpoint dans `API_DOCUMENTATION.md`

---

## Production

### Build du frontend

```bash
cd frontend
npm run build
```

Le bundle optimisé est généré dans `frontend/dist/`.

### Servir le frontend en production

Optionnellement, configurez Express pour servir les fichiers statiques du frontend :

```javascript
// server.js
app.use(express.static(path.join(__dirname, '../frontend/dist')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
});
```

### Variables d'environnement

```env
NODE_ENV=production
PORT=5000
JWT_SECRET=<clé-longue-et-complexe>
JWT_EXPIRES_IN=30d
```

### Mise en production

1. Construire le frontend : `cd frontend && npm run build`
2. Configurer le serveur avec PM2 ou Docker
3. Placer les fichiers Excel sur un stockage persistant
4. Configurer un reverse proxy (Nginx) si nécessaire
5. Activer HTTPS

---

## License

Ce projet est sous licence **MIT**.

```
MIT License

Copyright (c) 2026 Intimia

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```
