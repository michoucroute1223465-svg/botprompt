import { ButtonInteraction, ChatInputCommandInteraction, ModalSubmitInteraction } from 'discord.js';
import { handleAeroportCommand, handleAeroportButton, handleAeroportConfig } from '../modules/aeroport';
import { createMainMenu } from './moduleHandler';
import { logger } from '../utils/logger';
import { storage } from '../utils/storage';
import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';

// Routeur central qui aiguille toutes les intéractions
export async function routeInteraction(interaction: ButtonInteraction | ChatInputCommandInteraction | ModalSubmitInteraction) {
  try {
    // Commandes slash
    if (interaction.isChatInputCommand()) {
      await routeCommand(interaction);
      return;
    }

    // Boutons
    if (interaction.isButton()) {
      await routeButton(interaction);
      return;
    }

    // Modals
    if (interaction.isModalSubmit()) {
      await routeModal(interaction);
      return;
    }
  } catch (error) {
    logger.error(`Erreur router: ${error}`, 'Router');
    if (interaction.isRepliable()) {
      await interaction.reply({ content: 'Une erreur est survenue.', flags: 64 }).catch(() => {});
    }
  }
}

async function routeCommand(interaction: ChatInputCommandInteraction) {
  if (!interaction.guild) return;
  const cmd = interaction.commandName;

  // Gestion via commandHandler pour toutes les commandes enregistrees
  const { commandHandler } = await import('./commandHandler');
  const command = commandHandler.getCommands().get(cmd);

  if (command) {
    await commandHandler.handleCommand(interaction);
    return;
  }

  // Commandes speciales gerees directement
  switch (cmd) {
    case 'menu':
    case 'panel':
      await interaction.reply(createMainMenu(interaction.guild.name, 'Promt Bot'));
      break;

    case 'aeroport':
      if (interaction.options.getSubcommand()) {
        await handleAeroportConfig(interaction);
      } else {
        await handleAeroportCommand(interaction);
      }
      break;

    case 'ping':
      await handlePing(interaction);
      break;

    case 'infos':
      await handleInfos(interaction);
      break;

    case 'dashboard':
    case 'tableau':
      await handleDashboard(interaction);
      break;

    default:
      await interaction.reply({ content: 'Commande inconnue. Utilisez /menu', flags: 64 });
  }
}

async function routeButton(interaction: ButtonInteraction) {
  const id = interaction.customId;

  // Menu principal
  if (id.startsWith('menu_')) {
    await handleMainMenuButton(interaction);
    return;
  }

  // Aeroport
  if (id.startsWith('aeroport_')) {
    await handleAeroportButton(interaction);
    return;
  }

  // Ticket - géré par router.ts
  // Interaction gérée via le routeur principal
  if (id.startsWith('ticket_')) {
    return;
  }
}

async function routeModal(interaction: ModalSubmitInteraction) {
  // Les modals seront gérés par module
}

// ====== HANDLERS DU MENU PRINCIPAL ======

async function handleMainMenuButton(interaction: ButtonInteraction) {
  if (!interaction.guild) return;
  const id = interaction.customId.replace('menu_', '');

  switch (id) {
    case 'aeroport':
      await handleAeroportCommand(interaction as any);
      break;
    case 'ticket':
      await showTicketPanel(interaction);
      break;
    case 'moderation':
      await showModerationPanel(interaction);
      break;
    case 'logs':
      await showLogsPanel(interaction);
      break;
    case 'concours':
      await showConcoursPanel(interaction);
      break;
    case 'vocal':
      await showVocalPanel(interaction);
      break;
    case 'embed':
      await showEmbedPanel(interaction);
      break;
    case 'message':
      await showMessagePanel(interaction);
      break;
    case 'statut':
      await showStatutPanel(interaction);
      break;
    case 'dashboard':
      await handleDashboard(interaction);
      break;
    case 'ping':
      await handlePing(interaction);
      break;
    case 'infos':
      await handleInfos(interaction);
      break;
    case 'fermer':
      await interaction.message.delete().catch(() => {});
      break;
    case 'retour':
      await interaction.update(createMainMenu(interaction.guild.name, 'Promt Bot'));
      break;
    default:
      await interaction.reply({ content: 'Bouton inconnu.', flags: 64 });
  }
}

// ====== PANNEAU TICKETS ======

async function showTicketPanel(interaction: ButtonInteraction) {
  if (!interaction.guild) return;
  const tickets = storage.getTickets(interaction.guild.id);
  const ouverts = tickets.filter(t => t.statut === 'ouvert').length;

  const embed = new EmbedBuilder()
    .setColor(0x2b2d31)
    .setTitle('Gestion des tickets')
    .setDescription('Systeme de tickets avance')
    .addFields(
      { name: 'Tickets ouverts', value: `${ouverts}`, inline: true },
      { name: 'Tickets total', value: `${tickets.length}`, inline: true }
    )
    .setFooter({ text: 'Promt Bot' });

  const row = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
      new ButtonBuilder().setCustomId('ticket_create').setLabel('Creer un ticket').setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId('ticket_config').setLabel('Configuration').setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId('menu_retour').setLabel('Retour').setStyle(ButtonStyle.Secondary)
    );

  await interaction.update({ embeds: [embed], components: [row] });
}

// ====== PANNEAU MODERATION ======

async function showModerationPanel(interaction: ButtonInteraction) {
  const embed = new EmbedBuilder()
    .setColor(0x2b2d31)
    .setTitle('Moderation')
    .setDescription('Utilisez les commandes suivantes:')
    .addFields(
      { name: 'Bannir', value: '`/bannir [utilisateur] [raison]`', inline: false },
      { name: 'Expulser', value: '`/expulser [utilisateur] [raison]`', inline: false },
      { name: 'Mute', value: '`/mute [utilisateur] [duree] [raison]`', inline: false },
      { name: 'Avertir', value: '`/avertir [utilisateur] [raison]`', inline: false }
    )
    .setFooter({ text: 'Promt Bot' });

  const row = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
      new ButtonBuilder().setCustomId('menu_retour').setLabel('Retour').setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId('menu_fermer').setLabel('Fermer').setStyle(ButtonStyle.Danger)
    );

  await interaction.update({ embeds: [embed], components: [row] });
}

// ====== PANNEAU LOGS ======

async function showLogsPanel(interaction: ButtonInteraction) {
  if (!interaction.guild) return;
  const config = storage.getLogConfig(interaction.guild.id);

  const embed = new EmbedBuilder()
    .setColor(0x2b2d31)
    .setTitle('Configuration des logs')
    .setDescription('Les logs enregistrent les actions du serveur')
    .addFields(
      { name: 'Salon', value: config?.salonId ? `<#${config.salonId}>` : 'Non configure', inline: true },
      { name: 'Types actifs', value: config?.types?.join(', ') || 'Aucun', inline: false }
    )
    .setFooter({ text: 'Promt Bot' });

  const row = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
      new ButtonBuilder().setCustomId('logs_config').setLabel('Configurer').setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId('menu_retour').setLabel('Retour').setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId('menu_fermer').setLabel('Fermer').setStyle(ButtonStyle.Danger)
    );

  await interaction.update({ embeds: [embed], components: [row] });
}

// ====== PANNEAU CONCOURS ======

async function showConcoursPanel(interaction: ButtonInteraction) {
  if (!interaction.guild) return;
  const concours = storage.getConcoursActifs(interaction.guild.id);

  const embed = new EmbedBuilder()
    .setColor(0x2b2d31)
    .setTitle('Concours')
    .setDescription(`Concours actifs: ${concours.length}`)
    .setFooter({ text: 'Promt Bot' });

  const row = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
      new ButtonBuilder().setCustomId('concours_creer').setLabel('Creer un concours').setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId('menu_retour').setLabel('Retour').setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId('menu_fermer').setLabel('Fermer').setStyle(ButtonStyle.Danger)
    );

  await interaction.update({ embeds: [embed], components: [row] });
}

// ====== PANNEAU VOCAL ======

async function showVocalPanel(interaction: ButtonInteraction) {
  if (!interaction.guild) return;
  const config = storage.getNotificationVocalConfig(interaction.guild.id);

  const embed = new EmbedBuilder()
    .setColor(0x2b2d31)
    .setTitle('Notifications vocales')
    .setDescription('Notifications quand un membre rejoint/quitte un salon vocal')
    .addFields(
      { name: 'Salon', value: config.salonId ? `<#${config.salonId}>` : 'Non configure', inline: true },
      { name: 'Statut', value: config.actif ? 'Actif' : 'Inactif', inline: true }
    )
    .setFooter({ text: 'Promt Bot' });

  const row = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
      new ButtonBuilder().setCustomId('menu_retour').setLabel('Retour').setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId('menu_fermer').setLabel('Fermer').setStyle(ButtonStyle.Danger)
    );

  await interaction.update({ embeds: [embed], components: [row] });
}

// ====== PANNEAU EMBED ======

async function showEmbedPanel(interaction: ButtonInteraction) {
  const embed = new EmbedBuilder()
    .setColor(0x2b2d31)
    .setTitle('Creation d\'embed')
    .setDescription('Utilisez: `/embed [titre] [description] [couleur] [image]`')
    .setFooter({ text: 'Promt Bot' });

  const row = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
      new ButtonBuilder().setCustomId('menu_retour').setLabel('Retour').setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId('menu_fermer').setLabel('Fermer').setStyle(ButtonStyle.Danger)
    );

  await interaction.update({ embeds: [embed], components: [row] });
}

// ====== PANNEAU MESSAGES PLANIFIES ======

async function showMessagePanel(interaction: ButtonInteraction) {
  const embed = new EmbedBuilder()
    .setColor(0x2b2d31)
    .setTitle('Messages planifies')
    .setDescription('Utilisez: `/message-planifier [salon] [contenu] [frequence] [intervalle]`')
    .setFooter({ text: 'Promt Bot' });

  const row = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
      new ButtonBuilder().setCustomId('menu_retour').setLabel('Retour').setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId('menu_fermer').setLabel('Fermer').setStyle(ButtonStyle.Danger)
    );

  await interaction.update({ embeds: [embed], components: [row] });
}

// ====== PANNEAU STATUT ======

async function showStatutPanel(interaction: ButtonInteraction) {
  const embed = new EmbedBuilder()
    .setColor(0x2b2d31)
    .setTitle('Statut et activite')
    .setDescription('Utilisez:\n- `/statut [online/idle/dnd/invisible]`\n- `/activite [type] [nom]`')
    .setFooter({ text: 'Promt Bot' });

  const row = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
      new ButtonBuilder().setCustomId('menu_retour').setLabel('Retour').setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId('menu_fermer').setLabel('Fermer').setStyle(ButtonStyle.Danger)
    );

  await interaction.update({ embeds: [embed], components: [row] });
}

// ====== PING ======

async function handlePing(target: ChatInputCommandInteraction | ButtonInteraction) {
  const sent = await target.reply({ content: 'Calcul...', fetchReply: true });
  const roundtrip = sent.createdTimestamp - target.createdTimestamp;
  const api = Math.round(target.client.ws.ping);

  const embed = new EmbedBuilder()
    .setColor(0x2b2d31)
    .setTitle('Pong')
    .addFields(
      { name: 'Latence', value: `${roundtrip}ms`, inline: true },
      { name: 'API', value: `${api}ms`, inline: true }
    )
    .setFooter({ text: 'Promt Bot' });

  if (target instanceof ButtonInteraction) {
    await target.update({ embeds: [embed], components: [] });
  } else {
    await (target as ChatInputCommandInteraction).editReply({ content: null, embeds: [embed] });
  }
}

// ====== INFORMATIONS ======

async function handleInfos(target: ChatInputCommandInteraction | ButtonInteraction) {
  const embed = new EmbedBuilder()
    .setColor(0x2b2d31)
    .setTitle('Informations')
    .addFields(
      { name: 'Bot', value: `Promt Bot v1.0`, inline: true },
      { name: 'Uptime', value: formatUptime(process.uptime()), inline: true },
      { name: 'Discord.js', value: 'v14', inline: true },
      { name: 'Node.js', value: process.version, inline: true }
    )
    .setFooter({ text: 'Promt Bot' });

  if (target instanceof ButtonInteraction) {
    await target.update({ embeds: [embed], components: [] });
  } else {
    await (target as ChatInputCommandInteraction).reply({ embeds: [embed] });
  }
}

// ====== TABLEAU DE BORD ======

async function handleDashboard(target: ChatInputCommandInteraction | ButtonInteraction) {
  if (!target.guild) return;
  const stats = storage.getStats(target.guild.id);
  const tickets = storage.getTickets(target.guild.id);
  const sanctions = storage.getSanctions(target.guild.id);
  const memUsed = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);

  const embed = new EmbedBuilder()
    .setColor(0x2b2d31)
    .setTitle(`Tableau de bord - ${target.guild.name}`)
    .addFields(
      { name: 'Systeme', value: `Uptime: ${formatUptime(process.uptime())}\nRAM: ${memUsed} MB`, inline: false },
      { name: 'Tickets', value: `Total: ${stats.totalTickets}\nOuverts: ${tickets.filter(t => t.statut === 'ouvert').length}`, inline: true },
      { name: 'Sanctions', value: `${sanctions.length}`, inline: true }
    )
    .setFooter({ text: 'Promt Bot' });

  if (target instanceof ButtonInteraction) {
    const row = new ActionRowBuilder<ButtonBuilder>()
      .addComponents(
        new ButtonBuilder().setCustomId('menu_retour').setLabel('Retour').setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId('menu_fermer').setLabel('Fermer').setStyle(ButtonStyle.Danger)
      );
    await target.update({ embeds: [embed], components: [row] });
  } else {
    await (target as ChatInputCommandInteraction).reply({ embeds: [embed] });
  }
}

function formatUptime(seconds: number): string {
  const j = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return `${j}j ${h}h ${m}m`;
}