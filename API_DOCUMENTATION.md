# Documentation API — Intimia

Base URL : `http://localhost:5000/api`

Toutes les routes protégées nécessitent l'en-tête `Authorization` :

```
Authorization: Bearer <token>
```

---

## Table des matières

- [Authentification (Auth)](#authentification-auth)
- [Journal](#journal)
- [Humeurs (Moods)](#humeurs-moods)
- [Planning](#planning)
- [Routine](#routine)
- [Galerie (Gallery)](#galerie-gallery)
- [Paramètres (Settings)](#paramètres-settings)
- [Avatars](#avatars)
- [Tableau de bord (Dashboard)](#tableau-de-bord-dashboard)
- [Administration (Admin)](#administration-admin)
- [Santé (Health)](#santé-health)

---

## Authentification (Auth)

### POST /api/auth/register

Créer un nouveau compte utilisateur.

**Headers :** Aucun requis (route publique)

**Request Body :**

| Champ | Type | Requis | Description |
|-------|------|--------|-------------|
| `name` | string | Oui | Nom complet de l'utilisateur |
| `email` | string | Oui | Adresse email (unique) |
| `password` | string | Oui | Mot de passe (minimum 6 caractères) |

**Exemple de requête :**

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jean Dupont",
    "email": "jean@example.com",
    "password": "motdepasse123"
  }'
```

**Réponse 201 :**

```json
{
  "success": true,
  "message": "Compte créé avec succès",
  "data": {
    "user": {
      "id": "usr_a1b2c3d4",
      "name": "Jean Dupont",
      "email": "jean@example.com",
      "avatar": "/avatars/av1.svg",
      "createdAt": "2026-09-13T10:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Erreurs :**

| Code | Description |
|------|-------------|
| 400 | Données manquantes ou invalides |
| 409 | Un compte avec cet email existe déjà |
| 500 | Erreur serveur interne |

---

### POST /api/auth/login

Connecter un utilisateur existant.

**Headers :** Aucun requis (route publique)

**Request Body :**

| Champ | Type | Requis | Description |
|-------|------|--------|-------------|
| `email` | string | Oui | Adresse email |
| `password` | string | Oui | Mot de passe |

**Exemple de requête :**

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "jean@example.com",
    "password": "motdepasse123"
  }'
```

**Réponse 200 :**

```json
{
  "success": true,
  "message": "Connexion réussie",
  "data": {
    "user": {
      "id": "usr_a1b2c3d4",
      "name": "Jean Dupont",
      "email": "jean@example.com",
      "avatar": "/avatars/av1.svg",
      "createdAt": "2026-09-13T10:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Erreurs :**

| Code | Description |
|------|-------------|
| 400 | Email ou mot de passe manquants |
| 401 | Email ou mot de passe incorrect |
| 500 | Erreur serveur interne |

---

### GET /api/auth/me

Récupérer les informations de l'utilisateur connecté.

**Headers :**

| En-tête | Valeur |
|---------|--------|
| `Authorization` | `Bearer <token>` |

**Exemple de requête :**

```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."
```

**Réponse 200 :**

```json
{
  "success": true,
  "data": {
    "id": "usr_a1b2c3d4",
    "name": "Jean Dupont",
    "email": "jean@example.com",
    "avatar": "/avatars/av1.svg",
    "createdAt": "2026-09-13T10:00:00.000Z"
  }
}
```

**Erreurs :**

| Code | Description |
|------|-------------|
| 401 | Token manquant ou invalide |
| 404 | Utilisateur introuvable |
| 500 | Erreur serveur interne |

---

### POST /api/auth/logout

Déconnecter l'utilisateur (le token reste valide jusqu'à son expiration).

**Headers :**

| En-tête | Valeur |
|---------|--------|
| `Authorization` | `Bearer <token>` |

**Réponse 200 :**

```json
{
  "success": true,
  "message": "Déconnexion réussie",
  "data": null
}
```

**Erreurs :** `401` si le token est manquant ou invalide.

---

### POST /api/auth/forgot-password

Demander un lien de réinitialisation de mot de passe.

**Request Body :**

| Champ | Type | Requis | Description |
|-------|------|--------|-------------|
| `email` | string | Oui | Adresse du compte |

La réponse est **toujours `200`** (même si l'email n'existe pas) pour éviter toute fuite d'information. En environnement de développement, le lien de réinitialisation est affiché dans la console du serveur.

```json
{
  "success": true,
  "message": "Si un compte existe avec cette adresse, un lien de réinitialisation a été envoyé",
  "data": null
}
```

---

### POST /api/auth/reset-password

Réinitialiser le mot de passe avec le token reçu par email.

**Request Body :**

| Champ | Type | Requis | Description |
|-------|------|--------|-------------|
| `token` | string | Oui | Token de réinitialisation (valide 1 h) |
| `email` | string | Non | Email du compte (doit correspondre) |
| `password` | string | Oui | Nouveau mot de passe (minimum 6 caractères) |

**Réponse 200 :**

```json
{
  "success": true,
  "message": "Mot de passe réinitialisé avec succès",
  "data": null
}
```

**Erreurs :**

| Code | Description |
|------|-------------|
| 422 | Token invalide/expiré, mot de passe trop court ou email incorrect |

---

## Journal

### GET /api/journal

Récupérer toutes les entrées de journal de l'utilisateur connecté.

**Headers :**

| En-tête | Valeur |
|---------|--------|
| `Authorization` | `Bearer <token>` |

**Paramètres de requête (optionnels) :**

| Paramètre | Type | Description |
|-----------|------|-------------|
| `date` | string | Filtrer par date (format YYYY-MM-DD) |
| `page` | number | Numéro de page (défaut : 1) |
| `limit` | number | Nombre d'entrées par page (défaut : 20) |

**Exemple de requête :**

```bash
curl -X GET "http://localhost:5000/api/journal?date=2026-09-13" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."
```

**Réponse 200 :**

```json
{
  "success": true,
  "data": {
    "entries": [
      {
        "id": "jnl_x1y2z3",
        "userId": "usr_a1b2c3d4",
        "title": "Une belle journée",
        "content": "Aujourd'hui j'ai visité le parc municipal...",
        "date": "2026-09-13",
        "createdAt": "2026-09-13T14:30:00.000Z",
        "updatedAt": "2026-09-13T14:30:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 1,
      "totalPages": 1
    }
  }
}
```

**Erreurs :**

| Code | Description |
|------|-------------|
| 401 | Non autorisé |
| 500 | Erreur serveur |

---

### POST /api/journal

Créer une nouvelle entrée de journal.

**Headers :**

| En-tête | Valeur |
|---------|--------|
| `Authorization` | `Bearer <token>` |
| `Content-Type` | `application/json` |

**Request Body :**

| Champ | Type | Requis | Description |
|-------|------|--------|-------------|
| `title` | string | Oui | Titre de l'entrée |
| `content` | string | Oui | Contenu de l'entrée |
| `date` | string | Non | Date de l'entrée (format YYYY-MM-DD, défaut : aujourd'hui) |

**Exemple de requête :**

```bash
curl -X POST http://localhost:5000/api/journal \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..." \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Réflexion du soir",
    "content": "J\'ai pris le temps de méditer aujourd\'hui...",
    "date": "2026-09-13"
  }'
```

**Réponse 201 :**

```json
{
  "success": true,
  "message": "Entrée créée avec succès",
  "data": {
    "id": "jnl_a4b5c6",
    "userId": "usr_a1b2c3d4",
    "title": "Réflexion du soir",
    "content": "J'ai pris le temps de méditer aujourd'hui...",
    "date": "2026-09-13",
    "createdAt": "2026-09-13T20:00:00.000Z",
    "updatedAt": "2026-09-13T20:00:00.000Z"
  }
}
```

**Erreurs :**

| Code | Description |
|------|-------------|
| 400 | Titre ou contenu manquant |
| 401 | Non autorisé |
| 500 | Erreur serveur |

---

### PUT /api/journal/:id

Modifier une entrée de journal existante.

**Headers :**

| En-tête | Valeur |
|---------|--------|
| `Authorization` | `Bearer <token>` |
| `Content-Type` | `application/json` |

**Paramètres URL :**

| Paramètre | Type | Description |
|-----------|------|-------------|
| `id` | string | ID de l'entrée à modifier |

**Request Body :**

| Champ | Type | Requis | Description |
|-------|------|--------|-------------|
| `title` | string | Non | Nouveau titre |
| `content` | string | Non | Nouveau contenu |
| `date` | string | Non | Nouvelle date (format YYYY-MM-DD) |

**Exemple de requête :**

```bash
curl -X PUT http://localhost:5000/api/journal/jnl_a4b5c6 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..." \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Réflexion du soir (mise à jour)",
    "content": "Contenu mis à jour..."
  }'
```

**Réponse 200 :**

```json
{
  "success": true,
  "message": "Entrée mise à jour avec succès",
  "data": {
    "id": "jnl_a4b5c6",
    "userId": "usr_a1b2c3d4",
    "title": "Réflexion du soir (mise à jour)",
    "content": "Contenu mis à jour...",
    "date": "2026-09-13",
    "createdAt": "2026-09-13T20:00:00.000Z",
    "updatedAt": "2026-09-13T21:15:00.000Z"
  }
}
```

**Erreurs :**

| Code | Description |
|------|-------------|
| 400 | Données invalides |
| 401 | Non autorisé |
| 403 | Accès interdit (entrée appartenant à un autre utilisateur) |
| 404 | Entrée introuvable |
| 500 | Erreur serveur |

---

### DELETE /api/journal/:id

Supprimer une entrée de journal.

**Headers :**

| En-tête | Valeur |
|---------|--------|
| `Authorization` | `Bearer <token>` |

**Paramètres URL :**

| Paramètre | Type | Description |
|-----------|------|-------------|
| `id` | string | ID de l'entrée à supprimer |

**Exemple de requête :**

```bash
curl -X DELETE http://localhost:5000/api/journal/jnl_a4b5c6 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."
```

**Réponse 200 :**

```json
{
  "success": true,
  "message": "Entrée supprimée avec succès"
}
```

**Erreurs :**

| Code | Description |
|------|-------------|
| 401 | Non autorisé |
| 403 | Accès interdit |
| 404 | Entrée introuvable |
| 500 | Erreur serveur |

---

## Humeurs (Moods)

### GET /api/moods

Récupérer l'historique des humeurs de l'utilisateur connecté.

**Headers :**

| En-tête | Valeur |
|---------|--------|
| `Authorization` | `Bearer <token>` |

**Réponse 200 :**

```json
{
  "success": true,
  "data": {
    "moods": [
      {
        "id": "mood_d7e8f9",
        "userId": "usr_a1b2c3d4",
        "mood": "Heureuse",
        "score": 4,
        "note": "Bonne journée",
        "date": "2026-09-13",
        "createdAt": "2026-09-13T22:00:00.000Z"
      }
    ],
    "total": 1
  }
}
```

**Erreurs :** `401` non autorisé, `500` erreur serveur.

---

### POST /api/moods

Enregistrer une humeur pour la journée. Si une humeur existe déjà pour la date, elle est **mise à jour** (réponse `200` au lieu de `201`).

**Headers :**

| En-tête | Valeur |
|---------|--------|
| `Authorization` | `Bearer <token>` |
| `Content-Type` | `application/json` |

**Request Body :**

| Champ | Type | Requis | Description |
|-------|------|--------|-------------|
| `mood` | string | Oui* | Libellé d'humeur (`Heureuse`, `Motivée`, …) |
| `score` | number | Oui* | Score d'humeur (1-5 : 1=très mauvais, 5=excellent) |
| `note` | string | Non | Note ou commentaire sur l'humeur |
| `date` | string | Non | Date (format YYYY-MM-DD, défaut : aujourd'hui) |

\* Au moins `mood` ou `score` est requis.

**Exemple de requête :**

```bash
curl -X POST http://localhost:5000/api/moods \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..." \
  -H "Content-Type: application/json" \
  -d '{
    "score": 4,
    "note": "Bonne journée globalement, un peu fatigué en fin d'\''après-midi",
    "date": "2026-09-13"
  }'
```

**Réponse 201 :**

```json
{
  "success": true,
  "message": "Humeur enregistrée avec succès",
  "data": {
    "id": "mood_d7e8f9",
    "userId": "usr_a1b2c3d4",
    "score": 4,
    "note": "Bonne journée globalement, un peu fatigué en fin d'après-midi",
    "date": "2026-09-13",
    "createdAt": "2026-09-13T22:00:00.000Z"
  }
}
```

**Erreurs :**

| Code | Description |
|------|-------------|
| 400 | `mood` et `score` manquants, ou score invalide (doit être entre 1 et 5) |
| 401 | Non autorisé |
| 500 | Erreur serveur |

---

## Planning

### GET /api/planning

Récupérer le planning de l'utilisateur.

**Headers :**

| En-tête | Valeur |
|---------|--------|
| `Authorization` | `Bearer <token>` |

**Paramètres de requête (optionnels) :**

| Paramètre | Type | Description |
|-----------|------|-------------|
| `date` | string | Filtrer par date (format YYYY-MM-DD) |
| `start_date` | string | Début de période (format YYYY-MM-DD) |
| `end_date` | string | Fin de période (format YYYY-MM-DD, inclusif) |
| `week` | string | Filtrer par semaine (format YYYY-WXX) |

Chaque élément contient aussi un champ `content` : texte libre associé à la journée (utilisé par la vue hebdomadaire).

**Exemple de requête :**

```bash
curl -X GET "http://localhost:5000/api/planning?date=2026-09-13" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."
```

**Réponse 200 :**

```json
{
  "success": true,
  "data": [
    {
      "id": "plan_g1h2i3",
      "userId": "usr_a1b2c3d4",
      "title": "Réunion d'équipe",
      "description": "Point hebdomadaire avec l'équipe",
      "date": "2026-09-13",
      "time": "09:00",
      "duration": 60,
      "completed": false,
      "createdAt": "2026-09-12T18:00:00.000Z",
      "updatedAt": "2026-09-12T18:00:00.000Z"
    },
    {
      "id": "plan_j4k5l6",
      "userId": "usr_a1b2c3d4",
      "title": "Séance de sport",
      "description": "Cardio 45 minutes",
      "date": "2026-09-13",
      "time": "18:00",
      "duration": 45,
      "completed": false,
      "createdAt": "2026-09-12T18:00:00.000Z",
      "updatedAt": "2026-09-12T18:00:00.000Z"
    }
  ]
}
```

**Erreurs :**

| Code | Description |
|------|-------------|
| 401 | Non autorisé |
| 500 | Erreur serveur |

---

### PUT /api/planning

Mettre à jour ou créer des éléments de planning.

**Headers :**

| En-tête | Valeur |
|---------|--------|
| `Authorization` | `Bearer <token>` |
| `Content-Type` | `application/json` |

**Request Body :**

| Champ | Type | Requis | Description |
|-------|------|--------|-------------|
| `items` | array | Oui | Tableau d'éléments de planning |
| `items[].id` | string | Non | ID existant (pour modification) |
| `items[].title` | string | Oui | Titre de l'événement |
| `items[].description` | string | Non | Description |
| `items[].date` | string | Oui | Date (format YYYY-MM-DD) |
| `items[].time` | string | Non | Heure (format HH:mm) |
| `items[].duration` | number | Non | Durée en minutes |
| `items[].completed` | boolean | Non | État d'achèvement |

**Exemple de requête :**

```bash
curl -X PUT http://localhost:5000/api/planning \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..." \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      {
        "title": "Déjeuner avec Marie",
        "date": "2026-09-13",
        "time": "12:30",
        "duration": 60
      },
      {
        "id": "plan_j4k5l6",
        "completed": true
      }
    ]
  }'
```

**Réponse 200 :**

```json
{
  "success": true,
  "message": "Planning mis à jour avec succès",
  "data": [
    {
      "id": "plan_m7n8o9",
      "userId": "usr_a1b2c3d4",
      "title": "Déjeuner avec Marie",
      "description": "",
      "date": "2026-09-13",
      "time": "12:30",
      "duration": 60,
      "completed": false,
      "createdAt": "2026-09-13T10:00:00.000Z",
      "updatedAt": "2026-09-13T10:00:00.000Z"
    },
    {
      "id": "plan_j4k5l6",
      "userId": "usr_a1b2c3d4",
      "title": "Séance de sport",
      "description": "Cardio 45 minutes",
      "date": "2026-09-13",
      "time": "18:00",
      "duration": 45,
      "completed": true,
      "createdAt": "2026-09-12T18:00:00.000Z",
      "updatedAt": "2026-09-13T10:00:00.000Z"
    }
  ]
}
```

**Erreurs :**

| Code | Description |
|------|-------------|
| 400 | Données invalides |
| 401 | Non autorisé |
| 500 | Erreur serveur |

**Variante « notes de la semaine » :**

Le body peut aussi contenir un tableau `plans` (un texte par jour) à la place de `items` :

```bash
curl -X PUT http://localhost:5000/api/planning \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..." \
  -H "Content-Type: application/json" \
  -d '{
    "start_date": "2026-09-07",
    "plans": [
      { "date": "2026-09-07", "content": "Sport le soir" },
      { "date": "2026-09-08", "content": "" }
    ]
  }'
```

Chaque plan est créé ou mis à jour (upsert sur `user_id` + `date`). Réponse `200` avec la liste des éléments traités.

---

### DELETE /api/planning/:id

Supprimer un élément de planning.

**Exemple de requête :**

```bash
curl -X DELETE http://localhost:5000/api/planning/plan_g1h2i3 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."
```

**Réponse 200 :**

```json
{
  "success": true,
  "message": "Élément supprimé avec succès"
}
```

**Erreurs :** `401` non autorisé, `403` accès interdit, `404` introuvable, `500` erreur serveur.

---

## Routine

### GET /api/routine

Récupérer les routines de l'utilisateur.

**Headers :**

| En-tête | Valeur |
|---------|--------|
| `Authorization` | `Bearer <token>` |

**Paramètres de requête (optionnels) :**

| Paramètre | Type | Description |
|-----------|------|-------------|
| `date` | string | Filtrer par date (format YYYY-MM-DD). Sans paramètre : routines du jour. `date=all` : toutes les routines |
| `completed` | boolean | Filtrer par état d'achèvement |

Chaque routine expose `name` (et son alias `title`), `period` (`matin` | `soir`, alias `type`) et `completed` (alias `is_completed`).

**Exemple de requête :**

```bash
curl -X GET "http://localhost:5000/api/routine?date=2026-09-13" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."
```

**Réponse 200 :**

```json
{
  "success": true,
  "data": [
    {
      "id": "rut_p1q2r3",
      "userId": "usr_a1b2c3d4",
      "title": "Boire un verre d'eau au réveil",
      "description": "Buve 500ml d'eau dès le matin",
      "completed": true,
      "date": "2026-09-13",
      "createdAt": "2026-09-13T07:00:00.000Z",
      "updatedAt": "2026-09-13T07:15:00.000Z"
    },
    {
      "id": "rut_s4t5u6",
      "userId": "usr_a1b2c3d4",
      "title": "Méditation 10 minutes",
      "description": "Session de méditation guidée",
      "completed": false,
      "date": "2026-09-13",
      "createdAt": "2026-09-13T07:00:00.000Z",
      "updatedAt": "2026-09-13T07:00:00.000Z"
    }
  ]
}
```

**Erreurs :**

| Code | Description |
|------|-------------|
| 401 | Non autorisé |
| 500 | Erreur serveur |

---

### POST /api/routine

Créer une nouvelle routine.

**Headers :**

| En-tête | Valeur |
|---------|--------|
| `Authorization` | `Bearer <token>` |
| `Content-Type` | `application/json` |

**Request Body :**

| Champ | Type | Requis | Description |
|-------|------|--------|-------------|
| `title` | string | Oui* | Titre de la routine |
| `name` | string | Oui* | Alias de `title` |
| `description` | string | Non | Description détaillée |
| `period` | string | Non | `matin` ou `soir` (défaut : `matin`) |
| `date` | string | Non | Date (format YYYY-MM-DD, défaut : aujourd'hui) |

\* `title` ou `name` est requis.

**Exemple de requête :**

```bash
curl -X POST http://localhost:5000/api/routine \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..." \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Lire 20 pages",
    "description": "Lire un chapitre de mon livre",
    "period": "soir",
    "date": "2026-09-13"
  }'
```

**Réponse 201 :**

```json
{
  "success": true,
  "message": "Routine créée avec succès",
  "data": {
    "id": "rut_v7w8x9",
    "userId": "usr_a1b2c3d4",
    "title": "Lire 20 pages",
    "description": "Lire un chapitre de mon livre",
    "completed": false,
    "date": "2026-09-13",
    "createdAt": "2026-09-13T20:00:00.000Z",
    "updatedAt": "2026-09-13T20:00:00.000Z"
  }
}
```

**Erreurs :**

| Code | Description |
|------|-------------|
| 400 | Titre manquant |
| 401 | Non autorisé |
| 500 | Erreur serveur |

---

### PATCH /api/routine/:id/toggle

Basculer l'état d'achèvement d'une routine.

**Headers :**

| En-tête | Valeur |
|---------|--------|
| `Authorization` | `Bearer <token>` |

**Paramètres URL :**

| Paramètre | Type | Description |
|-----------|------|-------------|
| `id` | string | ID de la routine |

**Exemple de requête :**

```bash
curl -X PATCH http://localhost:5000/api/routine/rut_s4t5u6/toggle \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."
```

**Réponse 200 :**

```json
{
  "success": true,
  "message": "État de la routine mis à jour",
  "data": {
    "id": "rut_s4t5u6",
    "userId": "usr_a1b2c3d4",
    "title": "Méditation 10 minutes",
    "description": "Session de méditation guidée",
    "completed": true,
    "date": "2026-09-13",
    "createdAt": "2026-09-13T07:00:00.000Z",
    "updatedAt": "2026-09-13T20:30:00.000Z"
  }
}
```

**Erreurs :**

| Code | Description |
|------|-------------|
| 401 | Non autorisé |
| 403 | Accès interdit |
| 404 | Routine introuvable |
| 500 | Erreur serveur |

---

### DELETE /api/routine/:id

Supprimer une routine.

**Headers :**

| En-tête | Valeur |
|---------|--------|
| `Authorization` | `Bearer <token>` |

**Paramètres URL :**

| Paramètre | Type | Description |
|-----------|------|-------------|
| `id` | string | ID de la routine |

**Exemple de requête :**

```bash
curl -X DELETE http://localhost:5000/api/routine/rut_s4t5u6 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."
```

**Réponse 200 :**

```json
{
  "success": true,
  "message": "Routine supprimée avec succès"
}
```

**Erreurs :**

| Code | Description |
|------|-------------|
| 401 | Non autorisé |
| 403 | Accès interdit |
| 404 | Routine introuvable |
| 500 | Erreur serveur |

---

## Galerie (Gallery)

### GET /api/gallery

Récupérer les images de la galerie de l'utilisateur.

**Headers :**

| En-tête | Valeur |
|---------|--------|
| `Authorization` | `Bearer <token>` |

**Paramètres de requête (optionnels) :**

| Paramètre | Type | Description |
|-----------|------|-------------|
| `category` | string | Filtrer par catégorie |
| `page` | number | Numéro de page (défaut : 1) |
| `limit` | number | Nombre d'images par page (défaut : 20) |

Les images sont renvoyées dans les deux clés `images` (documentation) et `photos` (client), avec la pagination.

**Exemple de requête :**

```bash
curl -X GET "http://localhost:5000/api/gallery?category=paysage" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."
```

**Réponse 200 :**

```json
{
  "success": true,
  "data": {
    "images": [
      {
        "id": "gal_y1z2a3",
        "userId": "usr_a1b2c3d4",
        "url": "/uploads/gallery/gal_y1z2a3.jpg",
        "caption": "Coucher de soleil à la montagne",
        "category": "paysage",
        "date": "2026-09-13",
        "createdAt": "2026-09-13T15:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 1,
      "totalPages": 1
    }
  }
}
```

**Erreurs :**

| Code | Description |
|------|-------------|
| 401 | Non autorisé |
| 500 | Erreur serveur |

---

### POST /api/gallery

Ajouter une image à la galerie.

**Headers :**

| En-tête | Valeur |
|---------|--------|
| `Authorization` | `Bearer <token>` |
| `Content-Type` | `multipart/form-data` |

**FormData :**

| Champ | Type | Requis | Description |
|-------|------|--------|-------------|
| `photo` | file | Oui* | Fichier image (JPEG, PNG, GIF, WebP — max 5 MB) |
| `image` | file | Oui* | Alias de `photo` |
| `caption` | string | Non | Légende de l'image |
| `category` | string | Non | Catégorie (paysage, portrait, food, etc.) |

\* `photo` ou `image` est requis.

**Exemple de requête :**

```bash
curl -X POST http://localhost:5000/api/gallery \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..." \
  -F "photo=@/chemin/vers/photo.jpg" \
  -F "caption=Mon paysage préféré" \
  -F "category=paysage"
```

**Réponse 201 :**

```json
{
  "success": true,
  "message": "Image ajoutée avec succès",
  "data": {
    "id": "gal_b4c5d6",
    "userId": "usr_a1b2c3d4",
    "url": "/uploads/gallery/gal_b4c5d6.jpg",
    "caption": "Mon paysage préféré",
    "category": "paysage",
    "date": "2026-09-13",
    "createdAt": "2026-09-13T16:00:00.000Z"
  }
}
```

**Erreurs :**

| Code | Description |
|------|-------------|
| 400 | Aucun fichier image envoyé ou type non supporté |
| 401 | Non autorisé |
| 413 | Fichier trop volumineux (> 5 MB) |
| 500 | Erreur serveur |

---

### PUT /api/gallery/:id

Modifier les métadonnées d'une image.

**Headers :**

| En-tête | Valeur |
|---------|--------|
| `Authorization` | `Bearer <token>` |
| `Content-Type` | `application/json` |

**Paramètres URL :**

| Paramètre | Type | Description |
|-----------|------|-------------|
| `id` | string | ID de l'image |

**Request Body :**

| Champ | Type | Requis | Description |
|-------|------|--------|-------------|
| `caption` | string | Non | Nouvelle légende |
| `category` | string | Non | Nouvelle catégorie |

**Exemple de requête :**

```bash
curl -X PUT http://localhost:5000/api/gallery/gal_b4c5d6 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..." \
  -H "Content-Type: application/json" \
  -d '{
    "caption": "Légende mise à jour",
    "category": "nature"
  }'
```

**Réponse 200 :**

```json
{
  "success": true,
  "message": "Image mise à jour avec succès",
  "data": {
    "id": "gal_b4c5d6",
    "userId": "usr_a1b2c3d4",
    "url": "/uploads/gallery/gal_b4c5d6.jpg",
    "caption": "Légende mise à jour",
    "category": "nature",
    "date": "2026-09-13",
    "createdAt": "2026-09-13T16:00:00.000Z",
    "updatedAt": "2026-09-13T17:00:00.000Z"
  }
}
```

**Erreurs :**

| Code | Description |
|------|-------------|
| 401 | Non autorisé |
| 403 | Accès interdit |
| 404 | Image introuvable |
| 500 | Erreur serveur |

---

### DELETE /api/gallery/:id

Supprimer une image de la galerie.

**Headers :**

| En-tête | Valeur |
|---------|--------|
| `Authorization` | `Bearer <token>` |

**Paramètres URL :**

| Paramètre | Type | Description |
|-----------|------|-------------|
| `id` | string | ID de l'image |

**Exemple de requête :**

```bash
curl -X DELETE http://localhost:5000/api/gallery/gal_b4c5d6 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."
```

**Réponse 200 :**

```json
{
  "success": true,
  "message": "Image supprimée avec succès"
}
```

**Erreurs :**

| Code | Description |
|------|-------------|
| 401 | Non autorisé |
| 403 | Accès interdit |
| 404 | Image introuvable |
| 500 | Erreur serveur |

---

## Paramètres (Settings)

### GET /api/settings

Récupérer les paramètres de l'utilisateur.

**Headers :**

| En-tête | Valeur |
|---------|--------|
| `Authorization` | `Bearer <token>` |

**Exemple de requête :**

```bash
curl -X GET http://localhost:5000/api/settings \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."
```

**Réponse 200 :**

```json
{
  "success": true,
  "data": {
    "userId": "usr_a1b2c3d4",
    "name": "Jean Dupont",
    "email": "jean@example.com",
    "theme": "light",
    "language": "fr",
    "notifications": {
      "email": true,
      "push": false,
      "dailyReminder": true,
      "reminderTime": "20:00",
      "email_notifications": "true",
      "journal_reminders": "false"
    },
    "journalPrivacy": "private",
    "dateFormat": "DD/MM/YYYY",
    "createdAt": "2026-09-13T10:00:00.000Z",
    "updatedAt": "2026-09-13T10:00:00.000Z"
  }
}
```

**Erreurs :**

| Code | Description |
|------|-------------|
| 401 | Non autorisé |
| 404 | Paramètres introuvables |
| 500 | Erreur serveur |

---

### PUT /api/settings/profile

Mettre à jour le profil utilisateur.

**Headers :**

| En-tête | Valeur |
|---------|--------|
| `Authorization` | `Bearer <token>` |
| `Content-Type` | `application/json` |

**Request Body :**

| Champ | Type | Requis | Description |
|-------|------|--------|-------------|
| `name` | string | Non | Nouveau nom |
| `email` | string | Non | Nouvel email |
| `theme` | string | Non | Thème (`light`, `dark`, `system`) |
| `language` | string | Non | Langue (`fr`, `en`) |
| `dateFormat` | string | Non | Format de date (`DD/MM/YYYY`, `MM/DD/YYYY`, `YYYY-MM-DD`) |
| `journalPrivacy` | string | Non | Visibilité du journal (`private`, `friends`, `public`) |

**Exemple de requête :**

```bash
curl -X PUT http://localhost:5000/api/settings/profile \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..." \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jean-Marc Dupont",
    "theme": "dark",
    "language": "fr"
  }'
```

**Réponse 200 :**

```json
{
  "success": true,
  "message": "Profil mis à jour avec succès",
  "data": {
    "userId": "usr_a1b2c3d4",
    "name": "Jean-Marc Dupont",
    "email": "jean@example.com",
    "theme": "dark",
    "language": "fr",
    "dateFormat": "DD/MM/YYYY",
    "journalPrivacy": "private",
    "updatedAt": "2026-09-13T18:00:00.000Z"
  }
}
```

**Erreurs :**

| Code | Description |
|------|-------------|
| 400 | Données invalides |
| 401 | Non autorisé |
| 409 | Email déjà utilisé par un autre compte |
| 500 | Erreur serveur |

---

### PUT /api/settings/password

Changer le mot de passe.

**Headers :**

| En-tête | Valeur |
|---------|--------|
| `Authorization` | `Bearer <token>` |
| `Content-Type` | `application/json` |

**Request Body :**

| Champ | Type | Requis | Description |
|-------|------|--------|-------------|
| `currentPassword` | string | Oui | Mot de passe actuel |
| `newPassword` | string | Oui | Nouveau mot de passe (minimum 6 caractères) |

**Exemple de requête :**

```bash
curl -X PUT http://localhost:5000/api/settings/password \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..." \
  -H "Content-Type: application/json" \
  -d '{
    "currentPassword": "ancien-mot-de-passe",
    "newPassword": "nouveau-mot-de-passe"
  }'
```

**Réponse 200 :**

```json
{
  "success": true,
  "message": "Mot de passe mis à jour avec succès"
}
```

**Erreurs :**

| Code | Description |
|------|-------------|
| 400 | Mot de passe actuel ou nouveau mot de passe manquant |
| 401 | Mot de passe actuel incorrect |
| 401 | Non autorisé |
| 500 | Erreur serveur |

---

### PUT /api/settings/notifications

Mettre à jour les préférences de notification.

**Headers :**

| En-tête | Valeur |
|---------|--------|
| `Authorization` | `Bearer <token>` |
| `Content-Type` | `application/json` |

**Request Body :**

| Champ | Type | Requis | Description |
|-------|------|--------|-------------|
| `email` | boolean | Non | Notifications par email |
| `push` | boolean | Non | Notifications push |
| `dailyReminder` | boolean | Non | Rappel quotidien |
| `reminderTime` | string | Non | Heure du rappel (format HH:mm) |
| `email_notifications` | boolean/string | Non | Alias de `email` ( `"true"` / `"false"` ) |
| `journal_reminders` | boolean/string | Non | Rappels de journal ( `"true"` / `"false"` ) |

Les deux familles de clés sont acceptées et renvoyées ensemble, et restent synchronisées.

**Exemple de requête :**

```bash
curl -X PUT http://localhost:5000/api/settings/notifications \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..." \
  -H "Content-Type: application/json" \
  -d '{
    "email": true,
    "push": true,
    "dailyReminder": true,
    "reminderTime": "21:00"
  }'
```

**Réponse 200 :**

```json
{
  "success": true,
  "message": "Préférences de notification mises à jour",
  "data": {
    "notifications": {
      "email": true,
      "push": true,
      "dailyReminder": true,
      "reminderTime": "21:00"
    }
  }
}
```

**Erreurs :**

| Code | Description |
|------|-------------|
| 400 | Données invalides |
| 401 | Non autorisé |
| 500 | Erreur serveur |

---

### DELETE /api/settings

Supprimer le compte utilisateur et toutes ses données.

**Headers :**

| En-tête | Valeur |
|---------|--------|
| `Authorization` | `Bearer <token>` |
| `Content-Type` | `application/json` |

**Request Body :**

| Champ | Type | Requis | Description |
|-------|------|--------|-------------|
| `password` | string | Oui | Confirmation du mot de passe |

**Exemple de requête :**

```bash
curl -X DELETE http://localhost:5000/api/settings \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..." \
  -H "Content-Type: application/json" \
  -d '{
    "password": "motdepasse123"
  }'
```

**Réponse 200 :**

```json
{
  "success": true,
  "message": "Compte supprimé avec succès"
}
```

**Erreurs :**

| Code | Description |
|------|-------------|
| 400 | Mot de passe manquant |
| 401 | Mot de passe incorrect |
| 401 | Non autorisé |
| 500 | Erreur serveur |

---

## Avatars

### GET /api/avatars

Récupérer la liste des avatars disponibles.

**Headers :**

| En-tête | Valeur |
|---------|--------|
| `Authorization` | `Bearer <token>` |

**Exemple de requête :**

```bash
curl -X GET http://localhost:5000/api/avatars \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."
```

**Réponse 200 :**

```json
{
  "success": true,
  "data": {
    "avatars": [
      {
        "id": "avt_1",
        "url": "/avatars/av1.svg",
        "name": "Avatar 1",
        "isDefault": true
      },
      {
        "id": "avt_2",
        "url": "/avatars/av2.svg",
        "name": "Avatar 2",
        "isDefault": true
      },
      {
        "id": "usr_a1b2c3d4",
        "url": "/uploads/avatars/abc123.png",
        "name": "Avatar personnalisé",
        "isDefault": false
      }
    ],
    "current": "/avatars/av1.svg",
    "currentAvatar": "avt_1"
  }
}
```

> 10 avatars par défaut (`avt_1` … `avt_10`, fichiers `frontend/public/avatars/av1.svg` … `av10.svg`), suivis des avatars uploadés par l'utilisateur. `current` est l'URL de l'avatar actif, `currentAvatar` son identifiant.

**Erreurs :**

| Code | Description |
|------|-------------|
| 401 | Non autorisé |
| 500 | Erreur serveur |

---

### PUT /api/avatars/select

Choisir un avatar parmi les avatars prédéfinis.

**Headers :**

| En-tête | Valeur |
|---------|--------|
| `Authorization` | `Bearer <token>` |
| `Content-Type` | `application/json` |

**Request Body :**

| Champ | Type | Requis | Description |
|-------|------|--------|-------------|
| `avatarId` | string | Oui* | ID de l'avatar (`avt_3`, ou l'ID d'un avatar uploadé) |
| `avatar` | string | Oui* | URL de l'avatar (`/avatars/av3.svg` ou `/uploads/avatars/…`) |

\* `avatarId` ou `avatar` est requis.

**Exemple de requête :**

```bash
curl -X PUT http://localhost:5000/api/avatars/select \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..." \
  -H "Content-Type: application/json" \
  -d '{
    "avatarId": "avt_3"
  }'
```

**Réponse 200 :**

```json
{
  "success": true,
  "message": "Avatar mis à jour avec succès",
  "data": {
    "avatarId": "avt_3",
    "avatarUrl": "/avatars/av3.svg"
  }
}
```

**Erreurs :**

| Code | Description |
|------|-------------|
| 400 | Avatar ID manquant |
| 401 | Non autorisé |
| 404 | Avatar introuvable |
| 500 | Erreur serveur |

---

### POST /api/avatars/upload

Télécharger un avatar personnalisé.

**Headers :**

| En-tête | Valeur |
|---------|--------|
| `Authorization` | `Bearer <token>` |
| `Content-Type` | `multipart/form-data` |

**FormData :**

| Champ | Type | Requis | Description |
|-------|------|--------|-------------|
| `avatar` | file | Oui | Fichier image (JPEG, PNG, GIF, WebP — max 2 MB) |

**Exemple de requête :**

```bash
curl -X POST http://localhost:5000/api/avatars/upload \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..." \
  -F "avatar=@/chemin/vers/mon-avatar.jpg"
```

**Réponse 200 :**

```json
{
  "success": true,
  "message": "Avatar uploadé avec succès",
  "data": {
    "avatarId": "usr_a1b2c3d4",
    "avatarUrl": "/uploads/avatars/usr_a1b2c3d4.jpg"
  }
}
```

**Erreurs :**

| Code | Description |
|------|-------------|
| 400 | Aucun fichier envoyé ou type non supporté |
| 401 | Non autorisé |
| 413 | Fichier trop volumineux (> 2 MB) |
| 500 | Erreur serveur |

---

## Tableau de bord (Dashboard)

### GET /api/dashboard/stats

Récupérer les statistiques agrégées pour le tableau de bord.

**Headers :**

| En-tête | Valeur |
|---------|--------|
| `Authorization` | `Bearer <token>` |

**Exemple de requête :**

```bash
curl -X GET http://localhost:5000/api/dashboard/stats \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."
```

**Réponse 200 :**

```json
{
  "success": true,
  "data": {
    "journal": {
      "totalEntries": 45,
      "thisWeek": 5,
      "thisMonth": 22,
      "lastEntry": {
        "id": "jnl_x1y2z3",
        "title": "Une belle journée",
        "date": "2026-09-13"
      }
    },
    "moods": {
      "averageScore": 3.8,
      "thisWeek": [
        { "date": "2026-09-07", "score": 4 },
        { "date": "2026-09-08", "score": 3 },
        { "date": "2026-09-09", "score": 5 },
        { "date": "2026-09-10", "score": 4 },
        { "date": "2026-09-11", "score": 3 },
        { "date": "2026-09-12", "score": 4 },
        { "date": "2026-09-13", "score": 4 }
      ],
      "totalEntries": 38
    },
    "planning": {
      "todayTotal": 4,
      "todayCompleted": 2,
      "todayPending": 2,
      "thisWeekTotal": 18,
      "thisWeekCompleted": 12
    },
    "routine": {
      "todayTotal": 5,
      "todayCompleted": 3,
      "streak": 7,
      "completionRate": 0.72
    },
    "gallery": {
      "totalImages": 23,
      "thisMonth": 8,
      "categories": [
        { "name": "paysage", "count": 10 },
        { "name": "portrait", "count": 8 },
        { "name": "food", "count": 5 }
      ]
    },
    "streaks": {
      "journal": 7,
      "moods": 12,
      "routine": 5
    }
  }
}
```

**Erreurs :**

| Code | Description |
|------|-------------|
| 401 | Non autorisé |
| 500 | Erreur serveur |

> En plus des blocs `journal`, `moods`, `planning`, `routine`, `gallery` et `streaks`, la réponse contient les champs utilisés par l'interface :
> `stats` (`entries_count`, `photos_count`, `routine_progress`), `today_mood` (humeur du jour ou `null`) et `recent_entries` (5 dernières entrées).

---

## Administration (Admin)

Routes réservées au compte **super-admin** créé par `npm run init` (rôle `admin`). Toutes les autres routes renvoient `403`.

### GET /api/admin/stats

Statistiques globales de l'instance.

**Réponse 200 :**

```json
{
  "success": true,
  "data": {
    "users": 3,
    "admins": 1,
    "journal_entries": 45,
    "moods": 38,
    "plannings": 18,
    "routines": 12,
    "gallery": 23
  }
}
```

---

### GET /api/admin/users

Lister tous les comptes avec leurs compteurs de données.

**Réponse 200 :**

```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": "usr_a1b2c3d4",
        "name": "Jean Dupont",
        "email": "jean@example.com",
        "avatar": "/avatars/av1.svg",
        "role": "user",
        "entries": 12,
        "moods": 9,
        "images": 4,
        "createdAt": "2026-09-13T10:00:00.000Z"
      }
    ],
    "total": 1
  }
}
```

---

### DELETE /api/admin/users/:id

Supprimer un compte et **toutes** ses données (paramètres, journal, humeurs, planning, routines, galerie, fichiers uploadés).

**Réponse 200 :**

```json
{
  "success": true,
  "message": "Compte de jean@example.com supprimé"
}
```

**Erreurs :** `400` suppression de son propre compte, `403` non-admin, `404` utilisateur introuvable.

---

## Santé (Health)

### GET /api/health

Vérifier l'état de santé du serveur et de la base de données.

**Headers :** Aucun requis (route publique)

**Exemple de requête :**

```bash
curl -X GET http://localhost:5000/api/health
```

**Réponse 200 :**

```json
{
  "success": true,
  "status": "healthy",
  "timestamp": "2026-09-13T20:00:00.000Z",
  "uptime": 3600.5,
  "database": {
    "status": "connected",
    "type": "excel",
    "files": {
      "users": true,
      "journal": true,
      "moods": true,
      "planning": true,
      "routine": true,
      "gallery": true,
      "settings": true,
      "avatars": true
    }
  },
  "memory": {
    "used": "45MB",
    "total": "128MB"
  }
}
```

**Erreurs :**

| Code | Description |
|------|-------------|
| 503 | Serveur indisponible |

---

## Codes d'erreur globaux

| Code HTTP | Description |
|-----------|-------------|
| 200 | Succès |
| 201 | Ressource créée avec succès |
| 400 | Requête invalide (données manquantes ou format incorrect) |
| 401 | Non autorisé (token manquant, invalide ou expiré) |
| 403 | Accès interdit (la ressource appartient à un autre utilisateur) |
| 404 | Ressource introuvable |
| 409 | Conflit (ex : email déjà utilisé) |
| 413 | Fichier trop volumineux |
| 500 | Erreur interne du serveur |
| 503 | Service indisponible |

---

## Format de réponse

Toutes les réponses suivent le format :

```json
{
  "success": true | false,
  "message": "Description du résultat",
  "data": { ... }
}
```

En cas d'erreur :

```json
{
  "success": false,
  "error": "Description de l'erreur",
  "code": "ERROR_CODE"
}
```
