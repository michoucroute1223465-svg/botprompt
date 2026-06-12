# Promt Bot — Bot Discord Premium

**Repo GitHub :** https://github.com/michoucroute1223465-svg/botprompt

Bot Discord complet avec système de tickets interactif, modération, concours, logs, aéroport, vocal, etc.

---

## 📋 Commandes

### Publiques (accessibles à tous)
| Commande | Description |
|----------|-------------|
| `/menu` | Menu interactif |
| `/ping` | Latence du bot |
| `/aide` | Liste des commandes |
| `/infos` | Informations bot |
| `/dashboard` | Stats du serveur |
| `/profil` | Profil d'un utilisateur |
| `/snipe` | Dernier message supprimé |
| `/timer` | Compte à rebours |
| `/role-info` | Informations d'un rôle |
| `/warn-list` | Voir les avertissements |

### Admin (masquées pour les membres)
| Commande | Description |
|----------|-------------|
| `/ticket config` | Configurer les tickets (interactif) |
| `/ticket fermer` | Fermer un ticket |
| `/ticket supprimer` | Supprimer un ticket |
| `/ticket logs` | Voir les tickets récents |
| `/bannir` | Bannir un membre |
| `/debannir` | Débannir |
| `/expulser` | Expulser |
| `/mute` | Mute temporaire |
| `/unmute` | Unmute |
| `/avertir` | Avertir |
| `/desavertir` | Retirer un avertissement |
| `/clear` | Supprimer des messages |
| `/nuke` | Recréer le salon |
| `/embed` | Créer un embed |
| `/message-planifier` | Message récurrent |
| `/concours creer` | Créer un concours |
| `/concours terminer` | Terminer un concours |
| `/logs configurer` | Configurer les logs |
| `/sondage` | Créer un sondage |
| `/rappeler` | Rappeler un membre par DM |
| `/filtre` | Filtrer mots/liens |
| `/role-message` | Auto-rôle |
| `/sauvegarde` | Sauvegarder le serveur |
| `/statut` | Changer le statut du bot |
| `/activite` | Changer l'activité du bot |
| `/server-banner` | Changer la bannière |
| `/rejoindre` | Rejoindre un salon vocal |
| `/quitter` | Quitter le salon vocal |
| `/notification-vocal` | Notifications vocales |
| `/aeroport arrivee` | Message d'arrivée |
| `/aeroport depart` | Message de départ |

---

## 🆓 Guide d'hébergement gratuit (sans mise en veille)

### Solution 1 : Render (recommandé, déjà configuré)
Render est gratuit, sans carte bancaire, et ne se met pas en veille.

**Étapes :**
1. Va sur **https://render.com** → Crée un compte (gratuit)
2. Dashboard → **New** → **Web Service**
3. Connecte ton compte GitHub
4. Sélectionne le repo `botprompt`
5. **Nom :** `promt-bot`
6. **Region :** `Frankfurt` (le plus proche)
7. **Build Command :** `npm install`
8. **Start Command :** `npm start`
9. **Plan :** `Free`
10. Clique **"Advanced"** → **"Add Environment Variable"** :
    ```
    DISCORD_TOKEN = ton_token_discord
    GUILD_ID = id_de_ton_serveur
    CLIENT_ID = id_de_ton_bot
    ```
11. **Create Web Service**

✅ Le bot tourne H24 ! L'instance gratuite Render ne s'endort jamais.

### Solution 2 : Fly.io (alternative sans mise en veille)
Fly.io offre $5/mois gratuit, suffisant pour un bot.

1. **Installer flyctl :** https://fly.io/docs/hands-on/install-flyctl/
2. Créer un compte : `fly auth signup`
3. Lancer : `fly launch` dans le dossier `discord-bot/`
4. Configurer les secrets :
   ```
   fly secrets set DISCORD_TOKEN=token
   fly secrets set GUILD_ID=id
   fly secrets set CLIENT_ID=id
   ```
5. Déployer : `fly deploy`

✅ Le bot tourne H24, jamais de mise en veille.

### Solution 3 : Oracle Cloud (gratuit à vie)
1. Va sur **https://www.oracle.com/cloud/free/**
2. Crée une instance VM.Standard.E2.1.Micro (1 Go RAM, gratuit)
3. SSH dans la machine :
   ```bash
   git clone https://github.com/michoucroute1223465-svg/botprompt.git
   cd botprompt
   npm install
   # crée le fichier .env avec les tokens
   npm start
   ```
4. Utilise `tmux` ou `screen` pour garder le processus actif

✅ Puissant, gratuit à vie, 100% uptime.

---

## 💻 Développement local

```bash
# Cloner
git clone https://github.com/michoucroute1223465-svg/botprompt.git
cd botprompt

# Installer
npm install

# Configurer
cp .env.example .env
# Éditer .env avec ton token, guild ID, client ID

# Déployer les commandes Discord
npm run deploy

# Lancer
npm start