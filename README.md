# 🎫 Premium Bot - Discord

Bot Discord professionnel, complet et modulaire, développé avec Discord.js v14 et TypeScript.

## 📋 Fonctionnalités

- **🎫 Tickets** - Système de tickets avancé avec panels, catégories, formulaires, transcripts HTML/TXT
- **🛡️ Modération** - Bannissement, expulsion, mute, avertissements avec historique complet
- **🎉 Concours** - Création, tirage au sort, relance
- **📋 Logs** - Système de logs configurable (modération, messages, vocal, tickets)
- **📅 Messages programmés** - Envoi automatique récurrent
- **📝 Embeds** - Création d'embeds personnalisés
- **🛫 Aéroport** - Messages de bienvenue/départ personnalisables
- **🔊 Vocal** - Notifications vocales, connexion
- **🤖 Informations** - Ping, infos bot, infos serveur
- **⚙️ Statut** - Changement de statut et d'activité
- **📊 Tableau de bord** - Vue d'ensemble du serveur

## 🚀 Installation

### 1. Prérequis
- Node.js 18+ 
- Un bot Discord créé sur le [Portail Développeur Discord](https://discord.com/developers/applications)

### 2. Configuration
```bash
cd discord-bot
npm install
```

Copiez le fichier `.env.example` en `.env` :
```bash
cp .env.example .env
```

Modifiez le fichier `.env` :
```
DISCORD_TOKEN=votre_token_ici
GUILD_ID=votre_serveur_id
CLIENT_ID=votre_bot_id
OWNER_ID=votre_id_discord
```

### 3. Déploiement des commandes
```bash
npm run deploy
```

### 4. Démarrage
```bash
npm run dev    # Mode développement
npm run build  # Compilation
npm start      # Mode production
```

## 📁 Structure du projet

```
src/
├── commands/       # Commandes slash
│   ├── ticket/     # Système de tickets
│   ├── moderation/ # Modération
│   ├── concours/   # Concours
│   ├── logs/       # Logs
│   ├── embed/      # Embeds
│   ├── aeroport/   # Bienvenue/départ
│   ├── vocal/      # Vocal
│   ├── information/# Infos
│   ├── statut/     # Statut/activité
│   ├── dashboard/  # Tableau de bord
│   └── messages-programmes/ # Messages programmés
├── events/         # Événements Discord
├── handlers/       # Handlers (commandes, scheduler)
├── utils/          # Utilitaires (storage, logger, transcript, permissions)
├── types/          # Types TypeScript
└── index.ts        # Point d'entrée
data/               # Données persistantes (JSON)
```

## 🎫 Commandes disponibles

### Tickets (`/ticket`)
- `/ticket créer-panel` - Créer un panel de tickets
- `/ticket supprimer-panel` - Supprimer un panel
- `/ticket créer-catégorie` - Créer une catégorie
- `/ticket supprimer-catégorie` - Supprimer une catégorie
- `/ticket configuration` - Voir la configuration
- `/ticket logs` - Voir les logs des tickets
- `/ticket transcript` - Obtenir un transcript
- `/ticket ouvrir` - Ouvrir un ticket manuellement
- `/ticket fermer` - Fermer le ticket
- `/ticket supprimer` - Supprimer le ticket
- `/ticket renommer` - Renommer le ticket
- `/ticket transférer` - Transférer le ticket
- `/ticket ajouter-utilisateur` - Ajouter un utilisateur
- `/ticket retirer-utilisateur` - Retirer un utilisateur
- `/ticket priorité` - Changer la priorité
- `/ticket réouvrir` - Réouvrir un ticket

### Modération
- `/bannir` - Bannir un utilisateur
- `/débannir` - Débannir un utilisateur
- `/expulser` - Expulser un utilisateur
- `/mute` - Mute un utilisateur
- `/unmute` - Unmute un utilisateur
- `/avertir` - Avertir un utilisateur
- `/désavertir` - Supprimer un avertissement
- `/modifier-raison` - Modifier la raison d'une sanction

### Autres
- `/logs configurer` - Configurer les logs
- `/concours créer` - Créer un concours
- `/embed` - Créer un embed
- `/aéroport arrivée/départ` - Configurer les messages
- `/notification-vocal configurer` - Configurer les notifications vocales
- `/ping` - Voir la latence
- `/infos-bot` - Infos du bot
- `/infos-serveur` - Infos du serveur
- `/statut` - Changer le statut
- `/activité` - Changer l'activité
- `/message-programmé` - Gérer les messages programmés
- `/tableau-de-bord` - Tableau de bord

## 💾 Stockage

Toutes les données sont stockées en JSON dans le dossier `data/` :
- `data/tickets/` - Tickets
- `data/sanctions/` - Sanctions
- `data/concours/` - Concours
- `data/messages/` - Messages programmés
- `data/panels/` - Panels de tickets
- `data/logs/` - Configuration des logs
- `data/vocal/` - Configuration vocale
- `data/aeroport/` - Configuration aéroport
- `data/transcripts/` - Transcripts HTML/TXT