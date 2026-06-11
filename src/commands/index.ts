import { EmbedBuilder, ChatInputCommandInteraction, ActionRowBuilder, ButtonBuilder, ButtonStyle, ActivityType, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } from 'discord.js';
import { commandHandler } from '../handlers/commandHandler';
import { storage } from '../utils/storage';
import { logger } from '../utils/logger';
import { v4 as uuidv4 } from 'uuid';
import { createMainMenu } from '../router';

function formatUptime(s: number): string {
  return `${Math.floor(s / 86400)}j ${Math.floor((s % 86400) / 3600)}h ${Math.floor((s % 3600) / 60)}m`;
}

function replaceVars(text: string, data: Record<string, string>): string {
  let r = text;
  for (const [k, v] of Object.entries(data)) r = r.replaceAll(`{${k}}`, v);
  return r;
}

// ====== MENU ======
commandHandler.register({
  data: { name: 'menu' },
  async execute(i) {
    if (!i.guild) return;
    await i.reply(createMainMenu(i.guild.name));
  }
});

// ====== PING ======
commandHandler.register({
  data: { name: 'ping' },
  async execute(i) {
    const sent = await i.reply({ content: 'Calcul...', fetchReply: true });
    await i.editReply({ content: null, embeds: [new EmbedBuilder().setColor(0x2b2d31).setTitle('Pong').addFields({ name: 'Latence', value: `${sent.createdTimestamp - i.createdTimestamp}ms`, inline: true }, { name: 'API', value: `${Math.round(i.client.ws.ping)}ms`, inline: true })] });
  }
});

// ====== AIDE (remplace command_list) ======
commandHandler.register({
  data: { name: 'aide' },
  async execute(i) {
    const embed = new EmbedBuilder().setColor(0x2b2d31).setTitle('Commandes disponibles')
      .addFields(
        { name: 'menu', value: 'Affiche le menu interactif', inline: false },
        { name: 'ping', value: 'Latence du bot', inline: false },
        { name: 'aide', value: 'Cette liste', inline: false },
        { name: 'infos', value: 'Infos bot', inline: false },
        { name: 'dashboard', value: 'Stats du serveur', inline: false },
        { name: 'aeroport', value: 'Config arrivee/depart automatiques', inline: false },
        { name: 'bannir', value: 'Bannir un utilisateur', inline: false },
        { name: 'debannir', value: 'Debannir un utilisateur', inline: false },
        { name: 'expulser', value: 'Expulser un utilisateur', inline: false },
        { name: 'mute', value: 'Mute un utilisateur', inline: false },
        { name: 'unmute', value: 'Unmute un utilisateur', inline: false },
        { name: 'avertir', value: 'Avertir un utilisateur', inline: false },
        { name: 'desavertir', value: 'Retirer un avertissement', inline: false },
        { name: 'statut', value: 'Changer le statut bot', inline: false },
        { name: 'activite', value: 'Changer l\'activite bot', inline: false },
        { name: 'embed', value: 'Creer un embed', inline: false },
        { name: 'message-planifier', value: 'Envoyer un message recurrent', inline: false },
        { name: 'concours', value: 'Creer/terminer un concours', inline: false },
        { name: 'logs', value: 'Configurer les logs', inline: false },
        { name: 'sondage', value: 'Creer un sondage', inline: false },
        { name: 'rappeler', value: 'Rappeler un utilisateur par DM', inline: false },
        { name: 'filtre', value: 'Filtre anti-liens/mots/slowmode', inline: false },
        { name: 'role-message', value: 'Auto-role via menu', inline: false },
        { name: 'suggestion', value: 'Faire une suggestion', inline: false },
        { name: 'sauvegarde', value: 'Sauvegarder le serveur', inline: false }
      );
    await i.reply({ embeds: [embed] });
  }
});

// ====== INFOS ======
commandHandler.register({
  data: { name: 'infos' },
  async execute(i) {
    await i.reply({ embeds: [new EmbedBuilder().setColor(0x2b2d31).setTitle('Informations').addFields({ name: 'Bot', value: 'Promt Bot v2.0', inline: true }, { name: 'Uptime', value: formatUptime(process.uptime()), inline: true }, { name: 'Node', value: process.version, inline: true })] });
  }
});

// ====== DASHBOARD ======
commandHandler.register({
  data: { name: 'dashboard' },
  async execute(i) {
    if (!i.guild) return;
    const stats = storage.getStats(i.guild.id); const tickets = storage.getTickets(i.guild.id); const sanctions = storage.getSanctions(i.guild.id);
    await i.reply({ embeds: [new EmbedBuilder().setColor(0x2b2d31).setTitle('Tableau de bord').addFields({ name: 'Systeme', value: `Uptime: ${formatUptime(process.uptime())}\nRAM: ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB`, inline: false }, { name: 'Tickets', value: `Total: ${stats.totalTickets}\nOuverts: ${tickets.filter(t => t.statut === 'ouvert').length}`, inline: true }, { name: 'Sanctions', value: `${sanctions.length}`, inline: true })] });
  }
});

// ====== AEROPORT ======
commandHandler.register({
  data: { name: 'aeroport' },
  async execute(i) {
    if (!i.guild) return;
    if (i.options.getSubcommand() === 'arrivee') {
      const salon = i.options.getChannel('salon', true);
      const modal = new ModalBuilder().setCustomId(`aeroport_arrivee_${salon.id}`).setTitle('Message d\'arrivee');
      modal.addComponents(new ActionRowBuilder<TextInputBuilder>().addComponents(new TextInputBuilder().setCustomId('message').setLabel('Message d\'arrivee').setPlaceholder('{utilisateur} {serveur} {membres} {date} {heure} {boosts} {roles} {username} {tag} {id}').setStyle(TextInputStyle.Paragraph).setRequired(true)));
      await i.showModal(modal);
    } else if (i.options.getSubcommand() === 'depart') {
      const salon = i.options.getChannel('salon', true);
      const modal = new ModalBuilder().setCustomId(`aeroport_depart_${salon.id}`).setTitle('Message de depart');
      modal.addComponents(new ActionRowBuilder<TextInputBuilder>().addComponents(new TextInputBuilder().setCustomId('message').setLabel('Message de depart').setPlaceholder('{utilisateur} {serveur} {date} {heure} {boosts} {username} {tag} {id}').setStyle(TextInputStyle.Paragraph).setRequired(true)));
      await i.showModal(modal);
    } else {
      const config = storage.getAeroportConfig(i.guild.id);
      const embed = new EmbedBuilder().setColor(0x2b2d31).setTitle('Aeroport').addFields(
        { name: 'Arrivee', value: config.salonArriveeId ? `<#${config.salonArriveeId}>` : 'Non configure', inline: true },
        { name: 'Depart', value: config.salonDepartId ? `<#${config.salonDepartId}>` : 'Non configure', inline: true },
        { name: 'Actif', value: config.actif ? 'Oui' : 'Non', inline: true });
      await i.reply({ embeds: [embed], components: [new ActionRowBuilder<ButtonBuilder>().addComponents(new ButtonBuilder().setCustomId('aeroport_toggle').setLabel(config.actif ? 'Desactiver' : 'Activer').setStyle(config.actif ? ButtonStyle.Danger : ButtonStyle.Success))] });
    }
  }
});

// ====== MODERATION ======
function saveSanction(guildId: string, type: string, userId: string, modId: string, raison: string, duree: number | null = null) {
  storage.createSanction(guildId, { id: uuidv4(), guildId, type: type as any, userId, moderateurId: modId, raison, date: Date.now(), duree, actif: type === 'mute' || type === 'ban' || type === 'warn' });
  storage.incrementStats(guildId, 'totalSanctions');
}

const modCmds = [
  { name: 'bannir', fn: async (i: ChatInputCommandInteraction) => {
    if (!i.guild) return; await i.deferReply({ ephemeral: true }); const user = i.options.getUser('utilisateur', true); const raison = i.options.getString('raison', true);
    const m = await i.guild.members.fetch(user.id).catch(() => null); if (m && !m.bannable) { await i.editReply({ content: 'Impossible.' }); return; }
    await i.guild.members.ban(user.id, { reason: raison, deleteMessageSeconds: (i.options.getInteger('messages') || 0) * 86400 });
    saveSanction(i.guild.id, 'ban', user.id, i.user.id, raison); await i.editReply({ content: `${user.tag} banni. Raison: ${raison}` });
    try { await user.send({ content: `Banni de **${i.guild.name}**\nRaison: ${raison}\nPar: ${i.user.tag}` }); } catch {}
  }},
  { name: 'debannir', fn: async (i: ChatInputCommandInteraction) => {
    if (!i.guild) return; await i.deferReply({ ephemeral: true }); await i.guild.members.unban(i.options.getString('utilisateur-id', true), i.options.getString('raison', true));
    await i.editReply({ content: 'Utilisateur debanni.' });
  }},
  { name: 'expulser', fn: async (i: ChatInputCommandInteraction) => {
    if (!i.guild) return; await i.deferReply({ ephemeral: true }); const user = i.options.getUser('utilisateur', true); const m = await i.guild.members.fetch(user.id).catch(() => null);
    if (!m?.kickable) { await i.editReply({ content: 'Impossible.' }); return; } await m.kick(i.options.getString('raison', true)); saveSanction(i.guild.id, 'kick', user.id, i.user.id, i.options.getString('raison', true));
    await i.editReply({ content: `${user.tag} expulse.` });
  }},
  { name: 'mute', fn: async (i: ChatInputCommandInteraction) => {
    if (!i.guild) return; await i.deferReply({ ephemeral: true }); const user = i.options.getUser('utilisateur', true); const duree = i.options.getInteger('duree', true);
    const m = await i.guild.members.fetch(user.id).catch(() => null); if (!m?.moderatable) { await i.editReply({ content: 'Impossible.' }); return; }
    await m.timeout(duree * 60000, i.options.getString('raison', true)); saveSanction(i.guild.id, 'mute', user.id, i.user.id, i.options.getString('raison', true), duree * 60000);
    await i.editReply({ content: `${user.tag} mute ${duree}min.` });
  }},
  { name: 'unmute', fn: async (i: ChatInputCommandInteraction) => {
    if (!i.guild) return; await i.deferReply({ ephemeral: true }); const user = i.options.getUser('utilisateur', true);
    const m = await i.guild.members.fetch(user.id).catch(() => null); if (!m) { await i.editReply({ content: 'Introuvable.' }); return; }
    await m.timeout(null, i.options.getString('raison', true)); await i.editReply({ content: `${user.tag} unmute.` });
  }},
  { name: 'avertir', fn: async (i: ChatInputCommandInteraction) => {
    if (!i.guild) return; await i.deferReply({ ephemeral: true }); const user = i.options.getUser('utilisateur', true); saveSanction(i.guild.id, 'warn', user.id, i.user.id, i.options.getString('raison', true));
    await i.editReply({ content: `${user.tag} averti.` });
  }},
  { name: 'desavertir', fn: async (i: ChatInputCommandInteraction) => {
    if (!i.guild) return; const id = i.options.getString('sanction-id', true); const s = storage.getSanctionById(i.guild.id, id);
    if (!s) { await i.reply({ content: 'Introuvable.', ephemeral: true }); return; } storage.updateSanction(i.guild.id, id, { actif: false }); await i.reply({ content: 'Retire.', ephemeral: true });
  }}
];

// ====== STATUT / ACTIVITE ======
commandHandler.register({ data: { name: 'statut' }, async execute(i) { i.client.user?.setStatus(i.options.getString('type', true) as any); await i.reply({ content: `Statut: ${i.options.getString('type', true)}`, ephemeral: true }); }});
commandHandler.register({ data: { name: 'activite' }, async execute(i) { const map: Record<string, ActivityType> = { 'Playing': ActivityType.Playing, 'Watching': ActivityType.Watching, 'Listening': ActivityType.Listening, 'Streaming': ActivityType.Streaming }; i.client.user?.setActivity(i.options.getString('nom', true), { type: map[i.options.getString('type', true)] }); await i.reply({ content: `Activite changee.`, ephemeral: true }); }});

// ====== EMBED ======
commandHandler.register({
  data: { name: 'embed' },
  async execute(i) {
    if (!i.guild) return; await i.deferReply({ ephemeral: true });
    const e = new EmbedBuilder().setColor(parseInt((i.options.getString('couleur') || '#2b2d31').replace('#', ''), 16) || 0x2b2d31).setTitle(i.options.getString('titre', true)).setDescription(i.options.getString('description', true));
    if (i.options.getString('image')) e.setImage(i.options.getString('image')!);
    if (i.options.getString('miniature')) e.setThumbnail(i.options.getString('miniature')!);
    if (i.options.getString('footer')) e.setFooter({ text: i.options.getString('footer')! });
    const ch = i.channel as any; if (ch?.send) await ch.send({ embeds: [e] }); await i.editReply({ content: 'Envoye.' });
  }
});

// ====== MESSAGE PLANIFIE ======
commandHandler.register({
  data: { name: 'message-planifier' },
  async execute(i) {
    if (!i.guild) return; await i.deferReply({ ephemeral: true });
    const salon = i.options.getChannel('salon', true); const contenu = i.options.getString('contenu', true);
    const freq = i.options.getString('frequence', true) as any; const intervalle = i.options.getInteger('intervalle', true);
    let ms = intervalle * 60000; if (freq === 'heures') ms = intervalle * 3600000; if (freq === 'jours') ms = intervalle * 86400000;
    storage.createMessageProgramme(i.guild.id, { id: uuidv4(), guildId: i.guild.id, channelId: salon.id, contenu, frequence: freq, intervalle, prochainEnvoi: Date.now() + ms, actif: true, dernierEnvoi: null });
    await i.editReply({ content: `Planifie. Variables: {boosts} {membres} {serveur} {date} {utilisateur}` });
  }
});

// ====== CONCOURS ======
commandHandler.register({
  data: { name: 'concours' },
  async execute(i) {
    if (!i.guild) return; const sub = i.options.getSubcommand();
    if (sub === 'creer') {
      await i.deferReply({ ephemeral: true }); const titre = i.options.getString('titre', true); const lot = i.options.getString('lot', true);
      const duree = i.options.getInteger('duree', true); const nb = i.options.getInteger('gagnants', true); const id = uuidv4();
      const btn = new ActionRowBuilder<ButtonBuilder>().addComponents(new ButtonBuilder().setCustomId(`concours_${id}`).setStyle(ButtonStyle.Success).setLabel('Participer'));
      const e = new EmbedBuilder().setColor(0x2b2d31).setTitle(titre).setDescription(`Lot: ${lot}\nGagnants: ${nb}\nDuree: ${duree} min`).setFooter({ text: `ID: ${id}` }).setTimestamp(Date.now() + duree * 60000);
      const ch = i.channel as any; if (!ch?.send) return; const msg = await ch.send({ embeds: [e], components: [btn] });
      storage.createConcours(i.guild.id, { id, guildId: i.guild.id, channelId: i.channelId!, messageId: msg.id, titre, lot, duree: duree * 60000, nbGagnants: nb, participants: [], dateDebut: Date.now(), dateFin: Date.now() + duree * 60000, actif: true, termine: false, gagnants: [] });
      storage.incrementStats(i.guild.id, 'totalConcours'); await i.editReply({ content: `Concours: ${titre}` });
    } else if (sub === 'terminer') {
      await i.deferReply({ ephemeral: true }); const c = storage.getConcoursById(i.guild.id, i.options.getString('concours-id', true));
      if (!c) { await i.editReply({ content: 'Introuvable.' }); return; }
      if (c.participants.length < c.nbGagnants) { storage.updateConcours(i.guild.id, c.id, { dateFin: Date.now() + 3600000 }); await i.editReply({ content: `Pas assez de participants. Prolonge d'1h.` }); return; }
      const g: string[] = []; const s = [...c.participants].sort(() => Math.random() - 0.5); for (let j = 0; j < Math.min(c.nbGagnants, s.length); j++) g.push(s[j]);
      storage.updateConcours(i.guild.id, c.id, { actif: false, termine: true, gagnants: g });
      const e = new EmbedBuilder().setColor(0x2b2d31).setTitle(`Termine: ${c.titre}`).setDescription(`Gagnants: ${g.map(x => `<@${x}>`).join(', ')}\nLot: ${c.lot}`);
      try { const ch = i.guild.channels.cache.get(c.channelId) as any; if (ch) { const m = await ch.messages.fetch(c.messageId); await m.edit({ embeds: [e], components: [] }); } } catch {}
      await i.editReply({ content: `Gagnants: ${g.map(x => `<@${x}>`).join(', ')}` });
    }
  }
});

// ====== LOGS ======
commandHandler.register({
  data: { name: 'logs' },
  async execute(i) {
    if (!i.guild) return; if (i.options.getSubcommand() !== 'configurer') return;
    await i.deferReply({ ephemeral: true });
    storage.saveLogConfig(i.guild.id, { guildId: i.guild.id, salonId: i.options.getChannel('salon', true).id, types: i.options.getString('types', true).split(',').map((t: string) => t.trim()) as any });
    await i.editReply({ content: `Logs configures.` });
  }
});

// ====== SONDAGE ======
commandHandler.register({
  data: { name: 'sondage' },
  async execute(i) {
    if (!i.guild) return; await i.deferReply({ ephemeral: true });
    const q = i.options.getString('question', true); const opts: string[] = [];
    for (let j = 1; j <= 4; j++) { const o = i.options.getString(`option${j}`); if (o) opts.push(o); }
    if (opts.length < 2) { await i.editReply({ content: 'Min 2 options.' }); return; }
    const id = uuidv4();
    const e = new EmbedBuilder().setColor(0x2b2d31).setTitle('Sondage').setDescription(`**${q}**\n\n${opts.map((o, j) => `${j + 1}. ${o}`).join('\n')}`).setFooter({ text: `ID: ${id}` });
    const row = new ActionRowBuilder<ButtonBuilder>(); opts.forEach((_, j) => { row.addComponents(new ButtonBuilder().setCustomId(`sondage_${id}_${j}`).setLabel(`${j + 1}`).setStyle(ButtonStyle.Primary)); });
    row.addComponents(new ButtonBuilder().setCustomId(`sondage_stop_${id}`).setLabel('Stop').setStyle(ButtonStyle.Danger));
    const ch = i.channel as any; if (!ch?.send) return; await ch.send({ embeds: [e], components: [row] });
    const sondages = storage.readJSON<any[]>(`${__dirname}/../../data/sondages.json`, []);
    sondages.push({ id, guildId: i.guild.id, question: q, options: opts, votes: {}, actif: true });
    storage.writeJSON(`${__dirname}/../../data/sondages.json`, sondages); await i.editReply({ content: 'Sondage cree.' });
  }
});

// ====== RAPPELER ======
commandHandler.register({
  data: { name: 'rappeler' },
  async execute(i) {
    if (!i.guild) return; await i.deferReply({ ephemeral: true });
    const user = i.options.getUser('utilisateur', true); const msg = i.options.getString('message', true); const temps = i.options.getInteger('temps', true); const unite = i.options.getString('unite', true) as any;
    let ms = temps * 60000; if (unite === 'heures') ms = temps * 3600000; if (unite === 'jours') ms = temps * 86400000;
    const rappels = storage.readJSON<any[]>(`${__dirname}/../../data/rappels.json`, []);
    rappels.push({ id: uuidv4(), userId: user.id, guildId: i.guild.id, message: msg, dateEnvoi: Date.now() + ms, fait: false });
    storage.writeJSON(`${__dirname}/../../data/rappels.json`, rappels); await i.editReply({ content: `Rappel dans ${temps} ${unite} pour ${user.tag}.` });
  }
});

// ====== FILTRE ======
commandHandler.register({
  data: { name: 'filtre' },
  async execute(i) {
    if (!i.guild) return; await i.deferReply({ ephemeral: true }); const sub = i.options.getSubcommand();
    const filtres = storage.readJSON<Record<string, any>>(`${__dirname}/../../data/filtres.json`, {});
    if (!filtres[i.guild.id]) filtres[i.guild.id] = { mots: [], liens: true, salonsWhitelist: [], slowmode: 0 };
    const f = filtres[i.guild.id];
    if (sub === 'mot-ajouter') { f.mots.push(i.options.getString('mot', true).toLowerCase()); }
    else if (sub === 'mot-supprimer') { f.mots = f.mots.filter((m: string) => m !== i.options.getString('mot', true).toLowerCase()); }
    else if (sub === 'liens') { f.liens = i.options.getBoolean('actif', true); }
    else if (sub === 'slowmode') { f.slowmode = i.options.getInteger('secondes', true); }
    else if (sub === 'salon-whitelist') { const sid = i.options.getChannel('salon', true).id; const actif = i.options.getBoolean('actif', true); if (actif) f.salonsWhitelist.push(sid); else f.salonsWhitelist = f.salonsWhitelist.filter((s: string) => s !== sid); }
    else if (sub === 'voir') { const e = new EmbedBuilder().setColor(0x2b2d31).setTitle('Filtre').addFields({ name: 'Liens', value: f.liens ? 'Actif' : 'Off', inline: true }, { name: 'Slowmode', value: `${f.slowmode}s`, inline: true }, { name: 'Mots', value: f.mots.length > 0 ? f.mots.join(', ') : 'Aucun' }); await i.editReply({ embeds: [e] }); storage.writeJSON(`${__dirname}/../../data/filtres.json`, filtres); return; }
    storage.writeJSON(`${__dirname}/../../data/filtres.json`, filtres); await i.editReply({ content: 'Filtre mis a jour.' });
  }
});

// ====== ROLE-MESSAGE ======
commandHandler.register({
  data: { name: 'role-message' },
  async execute(i) {
    if (!i.guild) return; await i.deferReply({ ephemeral: true });
    const titre = i.options.getString('titre', true); const roles = i.options.getString('roles', true).split(',').map(r => { const [id, label] = r.split(':'); return { id: id.trim(), label: label.trim() }; });
    const select = new StringSelectMenuBuilder().setCustomId('autorole_select').setPlaceholder('Choisissez vos roles').setMinValues(0).setMaxValues(roles.length).addOptions(roles.map(r => new StringSelectMenuOptionBuilder().setLabel(r.label).setValue(r.id)));
    const e = new EmbedBuilder().setColor(0x2b2d31).setTitle(titre).setDescription('Selectionnez vos roles ci-dessous.');
    const ch = i.channel as any; if (ch?.send) await ch.send({ embeds: [e], components: [new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(select)] });
    await i.editReply({ content: 'Envoye.' });
  }
});

// ====== SAUVEGARDE ======
commandHandler.register({
  data: { name: 'sauvegarde' },
  async execute(i) {
    if (!i.guild) return; await i.deferReply({ ephemeral: true });
    const fs = await import('fs'); const p = await import('path');
    const sauvegarde = { nom: i.guild.name, id: i.guild.id, date: new Date().toISOString(), roles: i.guild.roles.cache.map(r => ({ id: r.id, nom: r.name, couleur: r.hexColor, pos: r.position })), salons: i.guild.channels.cache.map(c => ({ id: c.id, nom: c.name, type: c.type, parent: c.parentId })) };
    const dir = p.join(__dirname, '../../data/backups'); if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    const fp = p.join(dir, `${i.guild.id}_${Date.now()}.json`); fs.writeFileSync(fp, JSON.stringify(sauvegarde, null, 2));
    await i.editReply({ content: `Sauvegarde creee.` });
  }
});

// ====== VOCAL ======
commandHandler.register({
  data: { name: 'rejoindre' },
  async execute(i) {
    if (!i.guild) return;
    const salon = i.options.getChannel('salon', true);
    const voiceChannel = i.guild.channels.cache.get(salon.id);
    if (!voiceChannel || voiceChannel.type !== 2) { await i.reply({ content: 'Ce n\'est pas un salon vocal.', ephemeral: true }); return; }
      const { joinVoiceChannel, VoiceConnectionStatus, entersState } = await import('@discordjs/voice');
    try {
      const connection = joinVoiceChannel({ channelId: salon.id, guildId: i.guild.id, adapterCreator: i.guild.voiceAdapterCreator as any, selfDeaf: true, selfMute: true });
      await entersState(connection, VoiceConnectionStatus.Ready, 30000);
      await i.reply({ content: `Connecte dans ${salon}.`, ephemeral: true });
    } catch (e) {
      await i.reply({ content: `Erreur: ${e}`, ephemeral: true });
    }
  }
});

commandHandler.register({
  data: { name: 'quitter' },
  async execute(i) {
    if (!i.guild) return;
    const voice = i.guild.members.me?.voice?.channel;
    if (!voice) { await i.reply({ content: 'Je ne suis pas dans un salon vocal.', ephemeral: true }); return; }
    const { getVoiceConnection } = await import('@discordjs/voice');
    const conn = getVoiceConnection(i.guild.id);
    if (conn) { conn.destroy(); await i.reply({ content: 'Deconnecte.', ephemeral: true }); }
    else { await i.reply({ content: 'Aucune connexion.', ephemeral: true }); }
  }
});

commandHandler.register({
  data: { name: 'notification-vocal' },
  async execute(i) {
    if (!i.guild) return;
    const sub = i.options.getSubcommand();
    if (sub === 'configurer') {
      await i.deferReply({ ephemeral: true });
      const salon = i.options.getChannel('salon', true);
      const msgArrivee = i.options.getString('message-arrivee') || '{utilisateur} a rejoint le vocal.';
      const msgDepart = i.options.getString('message-depart') || '{utilisateur} a quitte le vocal.';
      storage.saveNotificationVocalConfig(i.guild.id, { guildId: i.guild.id, salonId: salon.id, messageArrivee: msgArrivee, messageDepart: msgDepart, actif: true });
      await i.editReply({ content: `Notification vocale configuree dans ${salon}.` });
    } else if (sub === 'activer') {
      await i.deferReply({ ephemeral: true });
      const config = storage.getNotificationVocalConfig(i.guild.id);
      config.actif = true;
      storage.saveNotificationVocalConfig(i.guild.id, config);
      await i.editReply({ content: 'Notification vocale activee.' });
    } else if (sub === 'desactiver') {
      await i.deferReply({ ephemeral: true });
      const config = storage.getNotificationVocalConfig(i.guild.id);
      config.actif = false;
      storage.saveNotificationVocalConfig(i.guild.id, config);
      await i.editReply({ content: 'Notification vocale desactivee.' });
    }
  }
});

// ====== WARN-LIST ======
commandHandler.register({
  data: { name: 'warn-list' },
  async execute(i) {
    if (!i.guild) return;
    const user = i.options.getUser('utilisateur', true);
    const sanctions = storage.getSanctionsByUser(i.guild.id, user.id);
    const warns = sanctions.filter(s => s.type === 'warn');
    if (warns.length === 0) { await i.reply({ content: `${user.tag} n'a aucun avertissement.`, ephemeral: true }); return; }
    const embed = new EmbedBuilder().setColor(0x2b2d31).setTitle(`Avertissements de ${user.tag}`).setDescription(warns.map((w, j) => `**${j + 1}.** ${w.raison} — <@${w.moderateurId}> — ${new Date(w.date).toLocaleString('fr-FR')}`).join('\n'));
    await i.reply({ embeds: [embed] });
  }
});

// ====== PROFIL ======
commandHandler.register({
  data: { name: 'profil' },
  async execute(i) {
    if (!i.guild) return;
    const user = i.options.getUser('utilisateur', true);
    const member = await i.guild.members.fetch(user.id).catch(() => null);
    const embed = new EmbedBuilder().setColor(0x2b2d31).setTitle(`Profil de ${user.tag}`).setThumbnail(user.displayAvatarURL({ size: 256 }));
    embed.addFields(
      { name: 'ID', value: user.id, inline: true },
      { name: 'Creation', value: `<t:${Math.floor(user.createdTimestamp / 1000)}:R>`, inline: true },
      { name: 'Arrivee', value: member ? `<t:${Math.floor((member.joinedAt?.getTime() || 0) / 1000)}:R>` : 'Inconnu', inline: true },
      { name: 'Nitro', value: user.banner ? 'Oui' : 'Non', inline: true },
      { name: 'Roles', value: member ? member.roles.cache.filter(r => r.name !== '@everyone').map(r => r.name).join(', ') || 'Aucun' : 'Inconnu', inline: false }
    );
    if (user.banner) embed.setImage(user.bannerURL({ size: 512 })!);
    await i.reply({ embeds: [embed] });
  }
});

// ====== CLEAR ======
commandHandler.register({
  data: { name: 'clear' },
  async execute(i) {
    if (!i.guild) return;
    await i.deferReply({ ephemeral: true });
    const count = i.options.getInteger('nombre', true);
    if (count < 1 || count > 100) { await i.editReply({ content: 'Entre 1 et 100.' }); return; }
    const ch = i.channel as any;
    const deleted = await ch.bulkDelete(count, true);
    await i.editReply({ content: `${deleted.size} messages supprimes.` });
  }
});

// ====== NUKE ======
commandHandler.register({
  data: { name: 'nuke' },
  async execute(i) {
    if (!i.guild) return;
    await i.deferReply({ ephemeral: true });
    const ch = i.channel as any;
    const pos = ch.position;
    const newCh = await ch.clone();
    await ch.delete();
    await newCh.setPosition(pos);
    await i.editReply({ content: 'Salon recree.' });
  }
});

// ====== TIMER ======
commandHandler.register({
  data: { name: 'timer' },
  async execute(i) {
    if (!i.guild) return;
    const duree = i.options.getInteger('duree', true);
    const texte = i.options.getString('texte') || 'Timer termine !';
    const ms = duree * 60000;
    const embed = new EmbedBuilder().setColor(0x2b2d31).setTitle('Timer').setDescription(`Fin dans ${duree} minutes.\n${texte}`).setTimestamp(Date.now() + ms);
    await i.reply({ embeds: [embed] });
    setTimeout(async () => {
      try { await i.followUp({ content: `${i.user} — ${texte}` }); } catch {}
    }, ms);
  }
});

// ====== SNIPE ======
commandHandler.register({
  data: { name: 'snipe' },
  async execute(i) {
    if (!i.guild) return;
    const user = i.options.getUser('utilisateur');
    const snipes = storage.readJSON<Record<string, any[]>>(`${__dirname}/../../data/snipes.json`, {});
    const guildSnipes = snipes[i.guild.id] || [];
    let filtered = guildSnipes;
    if (user) filtered = guildSnipes.filter(s => s.authorId === user.id);
    if (filtered.length === 0) { await i.reply({ content: 'Aucun message supprime.', ephemeral: true }); return; }
    const last = filtered[filtered.length - 1];
    const embed = new EmbedBuilder().setColor(0x2b2d31).setTitle('Message supprime').setDescription(last.content || '(vide)').addFields({ name: 'Auteur', value: `<@${last.authorId}>`, inline: true }, { name: 'Salon', value: `<#${last.channelId}>`, inline: true });
    await i.reply({ embeds: [embed] });
  }
});

// ====== ROLE-INFO ======
commandHandler.register({
  data: { name: 'role-info' },
  async execute(i) {
    if (!i.guild) return;
    const role = i.options.getRole('role', true) as any;
    const embed = new EmbedBuilder().setColor(role.color || 0x2b2d31).setTitle(`Role: ${role.name}`).addFields(
      { name: 'ID', value: role.id, inline: true },
      { name: 'Couleur', value: role.hexColor, inline: true },
      { name: 'Position', value: `${role.position}`, inline: true },
      { name: 'Membres', value: `${role.members?.size || 0}`, inline: true },
      { name: 'Mentionnable', value: role.mentionable ? 'Oui' : 'Non', inline: true },
      { name: 'Afficher separement', value: role.hoist ? 'Oui' : 'Non', inline: true }
    );
    await i.reply({ embeds: [embed] });
  }
});

// ====== SERVER-BANNER ======
commandHandler.register({
  data: { name: 'server-banner' },
  async execute(i) {
    if (!i.guild) return;
    await i.deferReply({ ephemeral: true });
    const url = i.options.getString('url', true);
    try {
      await i.guild.setBanner(url);
      await i.editReply({ content: 'Banniere changee.' });
    } catch (e) {
      await i.editReply({ content: `Erreur: ${e}` });
    }
  }
});

// ENREGISTREMENT DES COMMANDES MODERATION
for (const cmd of modCmds) {
  commandHandler.register({ data: { name: cmd.name }, execute: cmd.fn });
}

logger.info('Commandes enregistrees', 'Commands');
