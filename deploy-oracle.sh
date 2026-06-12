#!/bin/bash
# Script de déploiement automatisé pour Oracle Cloud
# À exécuter sur la VM Oracle après le SSH

echo "========================================"
echo " Deploiement Promt Bot sur Oracle Cloud"
echo "========================================"

# 1. Mise à jour du système
echo "[1/6] Mise a jour du systeme..."
sudo apt update -y && sudo apt upgrade -y

# 2. Installation de Node.js
echo "[2/6] Installation de Node.js..."
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs git
node -v
npm -v

# 3. Cloner le projet
echo "[3/6] Clonage du projet..."
cd /home/ubuntu
git clone https://github.com/michoucroute1223465-svg/botprompt.git
cd botprompt
npm install

# 4. Créer le fichier .env
echo "[4/6] Configuration du .env..."
echo -n "Entrez votre DISCORD_TOKEN : "
read token
echo -n "Entrez votre GUILD_ID : "
read guild
echo -n "Entrez votre CLIENT_ID : "
read client

cat > .env << EOF
DISCORD_TOKEN=$token
GUILD_ID=$guild
CLIENT_ID=$client
PORT=3000
EOF

echo "Fichier .env cree."

# 5. Déployer les commandes Discord
echo "[5/6] Deploiement des commandes Discord..."
npx tsx src/deploy-commands.ts

# 6. Créer le service systemd (démarrage automatique)
echo "[6/6] Creation du service systemd..."
sudo tee /etc/systemd/system/promt-bot.service > /dev/null << EOF
[Unit]
Description=Promt Bot Discord
After=network.target

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/home/ubuntu/botprompt
ExecStart=/usr/bin/npm start
Restart=always
RestartSec=5
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable promt-bot
sudo systemctl start promt-bot

echo ""
echo "========================================"
echo "✅ Deploiement termine !"
echo "========================================"
echo ""
echo "Commandes utiles :"
echo "  sudo systemctl status promt-bot   # Voir l'etat"
echo "  sudo journalctl -u promt-bot -f    # Voir les logs"
echo "  sudo systemctl stop promt-bot      # Arreter"
echo "  sudo systemctl start promt-bot     # Demarrer"
echo "  sudo systemctl restart promt-bot   # Redemarrer"
echo ""
echo "Le bot demarre automatiquement au boot."
echo "Pour les mises a jour :"
echo "  cd /home/ubuntu/botprompt"
echo "  git pull"
echo "  npm install"
echo "  npx tsx src/deploy-commands.ts"
echo "  sudo systemctl restart promt-bot"