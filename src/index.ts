import { Client, GatewayIntentBits, Partials, ActivityType } from 'discord.js';
import * as dotenv from 'dotenv';
dotenv.config();
import { logger } from './utils/logger';
import { commandHandler } from './handlers/commandHandler';
import { routeButton } from './router';
import './commands';

function replaceVars(text: string, data: Record<string, string>): string {
  let r = text;
  for (const [k, v] of Object.entries(data)) r = r.replaceAll(`{${k}}`, v);
  return r;
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildModeration,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.GuildMessageReactions
  ],
  partials: [Partials.Channel, Partials.Message, Partials.User, Partials.GuildMember, Partials.Reaction]
});

async function initialize() {
  logger.info('Demarrage de Promt Bot...', 'Promt Bot');

  try {
    client.on('ready', () => {
      logger.success('Promt Bot operationnel !', 'Promt Bot');
      client.user?.setPresence({ status: 'online', activities: [{ name: 'Promt Bot', type: ActivityType.Playing }] });
      setInterval(() => { checkScheduledMessages(client); }, 60000);
    });

    // SNIPE
    client.on('messageDelete', async (message) => {
      try {
        if (!message.guild || !message.author || message.author.bot) return;
        const { storage: store } = await import('./utils/storage');
        const snipes = store.readJSON<Record<string, any[]>>(`${__dirname}/data/snipes.json`, {});
        if (!snipes[message.guild.id]) snipes[message.guild.id] = [];
        snipes[message.guild.id].push({ authorId: message.author.id, content: message.content || '', channelId: message.channelId, date: Date.now() });
        if (snipes[message.guild.id].length > 50) snipes[message.guild.id] = snipes[message.guild.id].slice(-50);
        store.writeJSON(`${__dirname}/data/snipes.json`, snipes);
      } catch {}
    });


    client.on('interactionCreate', async (interaction) => {
      try {
        if (interaction.isChatInputCommand()) {
          await commandHandler.handleCommand(interaction);
        } else if (interaction.isButton() || interaction.isStringSelectMenu()) {
          await routeButton(interaction);
        } else if (interaction.isModalSubmit()) {
          // Aeroport modals
          if (interaction.customId.startsWith('aeroport_arrivee_')) {
            const salonId = interaction.customId.replace('aeroport_arrivee_', '');
            const msg = interaction.fields.getTextInputValue('message');
            const { storage } = await import('./utils/storage');
            const config = storage.getAeroportConfig(interaction.guildId!);
            config.salonArriveeId = salonId; config.messageArrivee = msg; config.actif = true;
            storage.saveAeroportConfig(interaction.guildId!, config);
            await interaction.reply({ content: `Arrivee configuree dans <#${salonId}>.`, ephemeral: true });
          } else if (interaction.customId.startsWith('aeroport_depart_')) {
            const salonId = interaction.customId.replace('aeroport_depart_', '');
            const msg = interaction.fields.getTextInputValue('message');
            const { storage } = await import('./utils/storage');
            const config = storage.getAeroportConfig(interaction.guildId!);
            config.salonDepartId = salonId; config.messageDepart = msg; config.actif = true;
            storage.saveAeroportConfig(interaction.guildId!, config);
            await interaction.reply({ content: `Depart configure dans <#${salonId}>.`, ephemeral: true });
          } else if (interaction.customId === 'ticket_modal_titre') {
            const titre = interaction.fields.getTextInputValue('titre');
            const { storage } = await import('./utils/storage');
            const { v4: uuidv4 } = await import('uuid');
            const panels = storage.getPanels(interaction.guildId!);
            let panel = panels[0];
            if (!panel) { panel = { id: uuidv4(), guildId: interaction.guildId!, nom: 'Panel', messageId: null, channelId: null, titre, description: '', emoji: '🎫', logoUrl: null, couleur: '#5865f2', motifs: [], dateCreation: Date.now() }; storage.createPanel(interaction.guildId!, panel); }
            else { storage.updatePanel(interaction.guildId!, panel.id, { titre }); }
            await interaction.reply({ content: `Titre change en "${titre}".`, ephemeral: true });
          } else if (interaction.customId === 'ticket_modal_logo') {
            const logo = interaction.fields.getTextInputValue('logo');
            const { storage } = await import('./utils/storage');
            const panels = storage.getPanels(interaction.guildId!);
            if (panels[0]) { storage.updatePanel(interaction.guildId!, panels[0].id, { logoUrl: logo }); }
            await interaction.reply({ content: `Logo mis a jour.`, ephemeral: true });
          } else if (interaction.customId === 'ticket_modal_description') {
            const desc = interaction.fields.getTextInputValue('description');
            const { storage } = await import('./utils/storage');
            const panels = storage.getPanels(interaction.guildId!);
            if (panels[0]) { storage.updatePanel(interaction.guildId!, panels[0].id, { description: desc }); }
            await interaction.reply({ content: `Description mise a jour.`, ephemeral: true });
          } else if (interaction.customId === 'ticket_modal_motif') {
            const { storage } = await import('./utils/storage');
            const { v4: uuidv4 } = await import('uuid');
            const panels = storage.getPanels(interaction.guildId!);
            let panel = panels[0];
            if (!panel) { panel = { id: uuidv4(), guildId: interaction.guildId!, nom: 'Panel', messageId: null, channelId: null, titre: 'Ticket Panel', description: '', emoji: '🎫', logoUrl: null, couleur: '#5865f2', motifs: [], dateCreation: Date.now() }; storage.createPanel(interaction.guildId!, panel); }
            const motif = { id: uuidv4(), nom: interaction.fields.getTextInputValue('nom'), emoji: interaction.fields.getTextInputValue('emoji'), messageOuverture: interaction.fields.getTextInputValue('message'), pingRoleId: interaction.fields.getTextInputValue('ping') || null, categorieId: interaction.fields.getTextInputValue('categorie'), formatNomSalon: 'ticket-{nombre}' };
            panel.motifs.push(motif);
            storage.updatePanel(interaction.guildId!, panel.id, { motifs: panel.motifs });
            await interaction.reply({ content: `Motif "${motif.nom}" ajoute.`, ephemeral: true });
          }
        }
      } catch (e) {
        logger.error(`Erreur interaction: ${e}`, 'Events');
      }
    });

    client.on('guildMemberAdd', async (member) => {
      try {
        const { storage } = await import('./utils/storage');
        const config = storage.getAeroportConfig(member.guild.id);
        if (!config?.actif || !config.salonArriveeId) return;
        const channel = member.guild.channels.cache.get(config.salonArriveeId) as any;
        if (!channel?.send) return;
        const date = new Date().toLocaleString('fr-FR');
        const heure = new Date().toLocaleTimeString('fr-FR');
        const boosts = member.guild.premiumSubscriptionCount || 0;
        const roles = member.roles.cache.filter((r: any) => r.name !== '@everyone').map((r: any) => r.name).join(', ') || 'Aucun';
        const msg = replaceVars(config.messageArrivee, {
          utilisateur: `${member}`, mention: `${member}`, username: member.user.username, tag: member.user.tag, id: member.id,
          serveur: member.guild.name, membres: String(member.guild.memberCount), date, heure,
          boosts: String(boosts), roles, channel: `<#${config.salonArriveeId}>`,
          'date-arrivee': date, 'heure-arrivee': heure
        });
        await channel.send(msg);
      } catch {}
    });

    client.on('guildMemberRemove', async (member) => {
      try {
        const { storage } = await import('./utils/storage');
        const config = storage.getAeroportConfig(member.guild.id);
        if (!config?.actif || !config.salonDepartId) return;
        const channel = member.guild.channels.cache.get(config.salonDepartId) as any;
        if (!channel?.send) return;
        const date = new Date().toLocaleString('fr-FR');
        const heure = new Date().toLocaleTimeString('fr-FR');
        const boosts = member.guild.premiumSubscriptionCount || 0;
        const msg = replaceVars(config.messageDepart, {
          utilisateur: `<@${member.id}>`, mention: `<@${member.id}>`, username: member.user.username, tag: member.user.tag, id: member.id,
          serveur: member.guild.name, date, heure, boosts: String(boosts), membres: String(member.guild.memberCount)
        });
        await channel.send(msg);
      } catch {}
    });

    const token = process.env.DISCORD_TOKEN;
    if (!token) { logger.error('Token manquant', 'Promt Bot'); process.exit(1); }
    await client.login(token);
  } catch (error) {
    logger.error(`Erreur: ${error}`, 'Promt Bot');
    process.exit(1);
  }
}

async function checkScheduledMessages(client: Client) {
  try {
    const { storage } = await import('./utils/storage');
    const all = storage.getAllMessagesProgrammes();
    const now = Date.now();
    for (const m of all) {
      if (!m.actif || now < m.prochainEnvoi) continue;
      const guild = client.guilds.cache.get(m.guildId);
      const ch = guild?.channels.cache.get(m.channelId) as any;
      if (ch?.send) {
        const boosts = guild?.premiumSubscriptionCount || 0;
        const membres = guild?.memberCount || 0;
        const date = new Date().toLocaleString('fr-FR');
        const heure = new Date().toLocaleTimeString('fr-FR');
        const content = replaceVars(m.contenu, {
          boosts: String(boosts), membres: String(membres), serveur: guild?.name || '', date, heure
        });
        await ch.send(content);
      }
      let ms = m.intervalle * 60000;
      if (m.frequence === 'heures') ms = m.intervalle * 3600000;
      if (m.frequence === 'jours') ms = m.intervalle * 86400000;
      storage.updateMessageProgramme(m.guildId, m.id, { prochainEnvoi: now + ms, dernierEnvoi: now });
    }
  } catch {}
}

// Serveur web minimal pour garder le processus actif sur les hebergeurs
import http from 'http';
const PORT = parseInt(process.env.PORT || '3000', 10);
const server = http.createServer((_req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Promt Bot est en ligne !');
});
server.listen(PORT, () => {
  logger.info(`Serveur web actif sur le port ${PORT}`, 'Web');
});

process.on('unhandledRejection', (e: Error) => logger.error(`Unhandled: ${e.message}`, 'Process'));
process.on('uncaughtException', (e: Error) => logger.error(`Uncaught: ${e.message}`, 'Process'));

initialize();
export { client };
