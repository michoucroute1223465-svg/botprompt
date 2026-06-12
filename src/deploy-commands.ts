import { REST, Routes, SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.join(__dirname, '../.env') });

const ADMIN = PermissionFlagsBits.Administrator;

const commands = [
  // Generales (publiques)
  new SlashCommandBuilder().setName('menu').setDescription('Menu interactif'),
  new SlashCommandBuilder().setName('ping').setDescription('Latence'),
  new SlashCommandBuilder().setName('aide').setDescription('Liste des commandes'),
  new SlashCommandBuilder().setName('infos').setDescription('Informations bot'),
  new SlashCommandBuilder().setName('dashboard').setDescription('Tableau de bord'),
  new SlashCommandBuilder().setName('profil').setDescription('Profil utilisateur').addUserOption(o => o.setName('utilisateur').setDescription('Utilisateur').setRequired(true)),
  new SlashCommandBuilder().setName('snipe').setDescription('Dernier message supprime').addUserOption(o => o.setName('utilisateur').setDescription('Filtrer par utilisateur')),
  new SlashCommandBuilder().setName('timer').setDescription('Compte a rebours').addIntegerOption(o => o.setName('duree').setDescription('Minutes').setRequired(true)).addStringOption(o => o.setName('texte').setDescription('Texte')),
  new SlashCommandBuilder().setName('role-info').setDescription('Infos role').addRoleOption(o => o.setName('role').setDescription('Role').setRequired(true)),
  new SlashCommandBuilder().setName('warn-list').setDescription('Voir avertissements').addUserOption(o => o.setName('utilisateur').setDescription('Utilisateur').setRequired(true)),

  // Aeroport (admin)
  new SlashCommandBuilder().setName('aeroport').setDescription('Config aeroport').setDefaultMemberPermissions(ADMIN)
    .addSubcommand(sub => sub.setName('arrivee').setDescription('Config arrivee').addChannelOption(o => o.setName('salon').setDescription('Salon').setRequired(true)).addStringOption(o => o.setName('message').setDescription('Message')))
    .addSubcommand(sub => sub.setName('depart').setDescription('Config depart').addChannelOption(o => o.setName('salon').setDescription('Salon').setRequired(true)).addStringOption(o => o.setName('message').setDescription('Message'))),

  // Moderation (admin)
  new SlashCommandBuilder().setName('bannir').setDescription('Bannir').setDefaultMemberPermissions(ADMIN).addUserOption(o => o.setName('utilisateur').setDescription('Utilisateur').setRequired(true)).addStringOption(o => o.setName('raison').setDescription('Raison').setRequired(true)).addIntegerOption(o => o.setName('messages').setDescription('Messages a supprimer')),
  new SlashCommandBuilder().setName('debannir').setDescription('Debannir').setDefaultMemberPermissions(ADMIN).addStringOption(o => o.setName('utilisateur-id').setDescription('ID').setRequired(true)).addStringOption(o => o.setName('raison').setDescription('Raison').setRequired(true)),
  new SlashCommandBuilder().setName('expulser').setDescription('Expulser').setDefaultMemberPermissions(ADMIN).addUserOption(o => o.setName('utilisateur').setDescription('Utilisateur').setRequired(true)).addStringOption(o => o.setName('raison').setDescription('Raison').setRequired(true)),
  new SlashCommandBuilder().setName('mute').setDescription('Mute').setDefaultMemberPermissions(ADMIN).addUserOption(o => o.setName('utilisateur').setDescription('Utilisateur').setRequired(true)).addStringOption(o => o.setName('raison').setDescription('Raison').setRequired(true)).addIntegerOption(o => o.setName('duree').setDescription('Minutes').setRequired(true)),
  new SlashCommandBuilder().setName('unmute').setDescription('Unmute').setDefaultMemberPermissions(ADMIN).addUserOption(o => o.setName('utilisateur').setDescription('Utilisateur').setRequired(true)).addStringOption(o => o.setName('raison').setDescription('Raison').setRequired(true)),
  new SlashCommandBuilder().setName('avertir').setDescription('Avertir').setDefaultMemberPermissions(ADMIN).addUserOption(o => o.setName('utilisateur').setDescription('Utilisateur').setRequired(true)).addStringOption(o => o.setName('raison').setDescription('Raison').setRequired(true)),
  new SlashCommandBuilder().setName('desavertir').setDescription('Retirer avertissement').setDefaultMemberPermissions(ADMIN).addStringOption(o => o.setName('sanction-id').setDescription('ID').setRequired(true)),
  new SlashCommandBuilder().setName('clear').setDescription('Supprimer messages').setDefaultMemberPermissions(ADMIN).addIntegerOption(o => o.setName('nombre').setDescription('Nombre').setRequired(true)),

  // Statut / Activite (admin)
  new SlashCommandBuilder().setName('statut').setDescription('Changer statut').setDefaultMemberPermissions(ADMIN).addStringOption(o => o.setName('type').setDescription('Type').setRequired(true).addChoices({ name: 'En ligne', value: 'online' }, { name: 'Absent', value: 'idle' }, { name: 'DND', value: 'dnd' }, { name: 'Invisible', value: 'invisible' })),
  new SlashCommandBuilder().setName('activite').setDescription('Changer activite').setDefaultMemberPermissions(ADMIN).addStringOption(o => o.setName('type').setDescription('Type').setRequired(true).addChoices({ name: 'Joue a', value: 'Playing' }, { name: 'Regarde', value: 'Watching' }, { name: 'Ecoute', value: 'Listening' }, { name: 'Stream', value: 'Streaming' })).addStringOption(o => o.setName('nom').setDescription('Nom').setRequired(true)),

  // Embed / Planification (admin)
  new SlashCommandBuilder().setName('embed').setDescription('Creer embed').setDefaultMemberPermissions(ADMIN).addStringOption(o => o.setName('titre').setDescription('Titre').setRequired(true)).addStringOption(o => o.setName('description').setDescription('Description').setRequired(true)).addStringOption(o => o.setName('couleur').setDescription('Couleur hex')).addStringOption(o => o.setName('image').setDescription('URL image')).addStringOption(o => o.setName('miniature').setDescription('URL miniature')).addStringOption(o => o.setName('footer').setDescription('Footer')),
  new SlashCommandBuilder().setName('message-planifier').setDescription('Message recurrent').setDefaultMemberPermissions(ADMIN).addChannelOption(o => o.setName('salon').setDescription('Salon').setRequired(true)).addStringOption(o => o.setName('contenu').setDescription('Contenu').setRequired(true)).addStringOption(o => o.setName('frequence').setDescription('Frequence').setRequired(true).addChoices({ name: 'Minutes', value: 'minutes' }, { name: 'Heures', value: 'heures' }, { name: 'Jours', value: 'jours' })).addIntegerOption(o => o.setName('intervalle').setDescription('Intervalle').setRequired(true)),

  // Concours (admin)
  new SlashCommandBuilder().setName('concours').setDescription('Concours').setDefaultMemberPermissions(ADMIN).addSubcommand(sub => sub.setName('creer').setDescription('Creer').addStringOption(o => o.setName('titre').setDescription('Titre').setRequired(true)).addStringOption(o => o.setName('lot').setDescription('Lot').setRequired(true)).addIntegerOption(o => o.setName('duree').setDescription('Minutes').setRequired(true)).addIntegerOption(o => o.setName('gagnants').setDescription('Nb').setRequired(true))).addSubcommand(sub => sub.setName('terminer').setDescription('Terminer').addStringOption(o => o.setName('concours-id').setDescription('ID').setRequired(true))),

  // Logs (admin)
  new SlashCommandBuilder().setName('logs').setDescription('Logs').setDefaultMemberPermissions(ADMIN).addSubcommand(sub => sub.setName('configurer').setDescription('Configurer').addChannelOption(o => o.setName('salon').setDescription('Salon').setRequired(true)).addStringOption(o => o.setName('types').setDescription('Types').setRequired(true))),

  // Sondage (admin)
  new SlashCommandBuilder().setName('sondage').setDescription('Sondage').setDefaultMemberPermissions(ADMIN).addStringOption(o => o.setName('question').setDescription('Question').setRequired(true)).addStringOption(o => o.setName('option1').setDescription('Option 1').setRequired(true)).addStringOption(o => o.setName('option2').setDescription('Option 2').setRequired(true)).addStringOption(o => o.setName('option3').setDescription('Option 3')).addStringOption(o => o.setName('option4').setDescription('Option 4')),

  // Rappel (admin)
  new SlashCommandBuilder().setName('rappeler').setDescription('Rappeler par DM').setDefaultMemberPermissions(ADMIN).addUserOption(o => o.setName('utilisateur').setDescription('Utilisateur').setRequired(true)).addStringOption(o => o.setName('message').setDescription('Message').setRequired(true)).addIntegerOption(o => o.setName('temps').setDescription('Temps').setRequired(true)).addStringOption(o => o.setName('unite').setDescription('Unite').setRequired(true).addChoices({ name: 'Minutes', value: 'minutes' }, { name: 'Heures', value: 'heures' }, { name: 'Jours', value: 'jours' })),

  // Filtre (admin)
  new SlashCommandBuilder().setName('filtre').setDescription('Filtre').setDefaultMemberPermissions(ADMIN).addSubcommand(sub => sub.setName('mot-ajouter').setDescription('Ajouter mot').addStringOption(o => o.setName('mot').setDescription('Mot').setRequired(true))).addSubcommand(sub => sub.setName('mot-supprimer').setDescription('Supprimer mot').addStringOption(o => o.setName('mot').setDescription('Mot').setRequired(true))).addSubcommand(sub => sub.setName('liens').setDescription('Filtre liens').addBooleanOption(o => o.setName('actif').setDescription('Actif').setRequired(true))).addSubcommand(sub => sub.setName('slowmode').setDescription('Slowmode').addIntegerOption(o => o.setName('secondes').setDescription('Secondes').setRequired(true))).addSubcommand(sub => sub.setName('salon-whitelist').setDescription('Whitelist salon').addChannelOption(o => o.setName('salon').setDescription('Salon').setRequired(true)).addBooleanOption(o => o.setName('actif').setDescription('Ajouter').setRequired(true))).addSubcommand(sub => sub.setName('voir').setDescription('Voir config')),

  // Auto-role (admin)
  new SlashCommandBuilder().setName('role-message').setDescription('Auto-role').setDefaultMemberPermissions(ADMIN).addStringOption(o => o.setName('titre').setDescription('Titre').setRequired(true)).addStringOption(o => o.setName('roles').setDescription('ID:Label,ID:Label').setRequired(true)),

  // Sauvegarde (admin)
  new SlashCommandBuilder().setName('sauvegarde').setDescription('Sauvegarder serveur').setDefaultMemberPermissions(ADMIN),
  // Nuke (admin)
  new SlashCommandBuilder().setName('nuke').setDescription('Recreer le salon').setDefaultMemberPermissions(ADMIN),
  // Server-banner (admin)
  new SlashCommandBuilder().setName('server-banner').setDescription('Changer banniere').setDefaultMemberPermissions(ADMIN).addStringOption(o => o.setName('url').setDescription('URL image').setRequired(true)),

  // Ticket (admin)
  new SlashCommandBuilder().setName('ticket').setDescription('Systeme de tickets').setDefaultMemberPermissions(ADMIN)
    .addSubcommand(sub => sub.setName('panel').setDescription('Creer panel').addChannelOption(o => o.setName('salon').setDescription('Salon').setRequired(true)).addStringOption(o => o.setName('categorie-id').setDescription('ID categorie').setRequired(true)).addStringOption(o => o.setName('titre').setDescription('Titre')).addStringOption(o => o.setName('description').setDescription('Description')).addStringOption(o => o.setName('couleur').setDescription('Couleur hex')).addStringOption(o => o.setName('emoji').setDescription('Emoji')))
    .addSubcommand(sub => sub.setName('categorie').setDescription('Creer categorie').addChannelOption(o => o.setName('categorie').setDescription('Categorie Discord').setRequired(true)).addRoleOption(o => o.setName('role-staff').setDescription('Role staff').setRequired(true)).addStringOption(o => o.setName('nom').setDescription('Nom')))
    .addSubcommand(sub => sub.setName('config').setDescription('Voir config'))
    .addSubcommand(sub => sub.setName('logs').setDescription('Voir tickets recents'))
    .addSubcommand(sub => sub.setName('fermer').setDescription('Fermer le ticket'))
    .addSubcommand(sub => sub.setName('supprimer').setDescription('Supprimer le ticket'))
    .addSubcommand(sub => sub.setName('renvoyer').setDescription('Renvoyer le panel')),

  // Vocal (admin)
  new SlashCommandBuilder().setName('rejoindre').setDescription('Rejoindre salon vocal').setDefaultMemberPermissions(ADMIN).addChannelOption(o => o.setName('salon').setDescription('Salon vocal').setRequired(true)),
  new SlashCommandBuilder().setName('quitter').setDescription('Quitter salon vocal').setDefaultMemberPermissions(ADMIN),
  new SlashCommandBuilder().setName('notification-vocal').setDescription('Notifications vocales').setDefaultMemberPermissions(ADMIN).addSubcommand(sub => sub.setName('configurer').setDescription('Configurer').addChannelOption(o => o.setName('salon').setDescription('Salon').setRequired(true)).addStringOption(o => o.setName('message-arrivee').setDescription('Message arrivee')).addStringOption(o => o.setName('message-depart').setDescription('Message depart'))).addSubcommand(sub => sub.setName('activer').setDescription('Activer')).addSubcommand(sub => sub.setName('desactiver').setDescription('Desactiver'))
];

async function deploy() {
  const token = process.env.DISCORD_TOKEN;
  const guildId = process.env.GUILD_ID;
  const clientId = process.env.CLIENT_ID;
  if (!token || !guildId || !clientId) { console.error('Variables manquantes dans .env'); process.exit(1); }
  try {
    const rest = new REST({ version: '10' }).setToken(token);
    console.log(`Deploiement de ${commands.length} commandes...`);
    await rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: commands.map(c => c.toJSON()) });
    console.log(`${commands.length} commandes deployees avec succes !`);
  } catch (e) { console.error('Erreur deploiement:', e); }
}
deploy();