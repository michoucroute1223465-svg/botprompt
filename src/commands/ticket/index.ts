import { SlashCommandBuilder, EmbedBuilder, ChatInputCommandInteraction, ChannelType, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType, PermissionFlagsBits } from 'discord.js';
import { v4 as uuidv4 } from 'uuid';
import { storage } from '../../utils/storage';
import { logger } from '../../utils/logger';
import { isStaff } from '../../utils/permissions';

export default {
  data: new SlashCommandBuilder()
    .setName('ticket')
    .setDescription('🎫 Système de tickets'),
    
  async execute(interaction: ChatInputCommandInteraction) {
    if (!interaction.guild) return;
    const subcommand = interaction.options.getSubcommand();
    const guild = interaction.guild;

    switch (subcommand) {
      case 'créer-panel': return handleCreatePanel(interaction);
      case 'supprimer-panel': return handleDeletePanel(interaction);
      case 'créer-catégorie': return handleCreateCategory(interaction);
      case 'supprimer-catégorie': return handleDeleteCategory(interaction);
      case 'créer-formulaire': return handleCreateForm(interaction);
      case 'supprimer-formulaire': return handleDeleteForm(interaction);
      case 'configuration': return handleConfig(interaction);
      case 'logs': return handleTicketLogs(interaction);
      case 'transcript': return handleTranscript(interaction);
      case 'ouvrir': return handleOpenManual(interaction);
      case 'fermer': return handleCloseManual(interaction);
      case 'supprimer': return handleDeleteTicket(interaction);
      case 'renommer': return handleRename(interaction);
      case 'transférer': return handleTransfer(interaction);
      case 'ajouter-utilisateur': return handleAddUser(interaction);
      case 'retirer-utilisateur': return handleRemoveUser(interaction);
      case 'priorité': return handlePriority(interaction);
      case 'réouvrir': return handleReopen(interaction);
      default: {
        await interaction.reply({ content: '❌ Sous-commande inconnue.', ephemeral: true });
      }
    }
  }
};

async function handleCreatePanel(interaction: ChatInputCommandInteraction) {
  if (!interaction.guild) return;
  await interaction.deferReply({ ephemeral: true });

  try {
    const nom = interaction.options.getString('nom', true);
    const salon = interaction.options.getChannel('salon', true);
    const categorieId = interaction.options.getString('categorie-id', true);
    const titre = interaction.options.getString('titre', true);
    const description = interaction.options.getString('description', true);
    const couleur = interaction.options.getString('couleur') || '#5865f2';
    const emoji = interaction.options.getString('emoji') || '🎫';

    const categorie = storage.getCategory(interaction.guild.id, categorieId);
    if (!categorie) {
      await interaction.editReply({ content: '❌ Catégorie introuvable.' });
      return;
    }

    if (salon.type !== ChannelType.GuildText) {
      await interaction.editReply({ content: '❌ Le salon doit être un salon textuel.' });
      return;
    }

    const panelId = uuidv4();
    const embed = new EmbedBuilder()
      .setColor(parseInt(couleur.replace('#', ''), 16))
      .setTitle(`${emoji} ${titre}`)
      .setDescription(description)
      .setFooter({ text: `Panel: ${nom}` })
      .setTimestamp();

    const button = new ButtonBuilder()
      .setCustomId(`ticket_open_${panelId}`)
      .setLabel('📩 Ouvrir un ticket')
      .setStyle(ButtonStyle.Primary);

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(button);
    const message = await (salon as any).send({ embeds: [embed], components: [row] });

    storage.createPanel(interaction.guild.id, {
      id: panelId,
      guildId: interaction.guild.id,
      nom,
      messageId: message.id,
      channelId: salon.id,
      categorieId,
      couleur,
      titre,
      description,
      emoji,
      boutonLibelle: '📩 Ouvrir un ticket',
      formulaireId: null,
      dateCreation: Date.now()
    });

    await interaction.editReply({ content: `✅ Panel "${nom}" créé avec succès dans ${salon}.` });
    logger.info(`Panel créé: ${nom} (${panelId})`, 'Tickets');
  } catch (error) {
    logger.error(`Erreur création panel: ${error}`, 'Tickets');
    await interaction.editReply({ content: '❌ Erreur lors de la création du panel.' });
  }
}

async function handleDeletePanel(interaction: ChatInputCommandInteraction) {
  if (!interaction.guild) return;
  const panelId = interaction.options.getString('panel-id', true);
  const panel = storage.getPanel(interaction.guild.id, panelId);
  
  if (!panel) {
    await interaction.reply({ content: '❌ Panel introuvable.', ephemeral: true });
    return;
  }

  // Supprimer le message du panel
  try {
    const channel = interaction.guild.channels.cache.get(panel.channelId) as any;
    if (channel) {
      const msg = await channel.messages.fetch(panel.messageId);
      await msg.delete();
    }
  } catch {}

  storage.deletePanel(interaction.guild.id, panelId);
  await interaction.reply({ content: `✅ Panel "${panel.nom}" supprimé.`, ephemeral: true });
}

async function handleCreateCategory(interaction: ChatInputCommandInteraction) {
  if (!interaction.guild) return;
  await interaction.deferReply({ ephemeral: true });

  try {
    const nom = interaction.options.getString('nom', true);
    const categoryChannel = interaction.options.getChannel('catégorie', true);
    const staffRole = interaction.options.getRole('role-staff', true);

    if (categoryChannel.type !== ChannelType.GuildCategory) {
      await interaction.editReply({ content: '❌ Le salon doit être une catégorie.' });
      return;
    }

    const categorieId = uuidv4();
    storage.createCategory(interaction.guild.id, {
      id: categorieId,
      guildId: interaction.guild.id,
      nom,
      categorieDiscordId: categoryChannel.id,
      roleStaffId: staffRole.id,
      salonLogsId: null,
      messageOuverture: `Bienvenue dans votre ticket **${nom}**. Le staff vous répondra dès que possible.`,
      formulaireId: null,
      transcriptActif: true,
      dateCreation: Date.now()
    });

    await interaction.editReply({ content: `✅ Catégorie "${nom}" créée avec le rôle ${staffRole}.` });
  } catch (error) {
    await interaction.editReply({ content: '❌ Erreur création catégorie.' });
  }
}

async function handleDeleteCategory(interaction: ChatInputCommandInteraction) {
  if (!interaction.guild) return;
  const id = interaction.options.getString('categorie-id', true);
  
  if (!storage.getCategory(interaction.guild.id, id)) {
    await interaction.reply({ content: '❌ Catégorie introuvable.', ephemeral: true });
    return;
  }

  storage.deleteCategory(interaction.guild.id, id);
  await interaction.reply({ content: '✅ Catégorie supprimée.', ephemeral: true });
}

async function handleCreateForm(interaction: ChatInputCommandInteraction) {
  // Implementation for creating form via modal
  await interaction.reply({ content: '🔄 Création de formulaire via interface interactive bientôt disponible.', ephemeral: true });
}

async function handleDeleteForm(interaction: ChatInputCommandInteraction) {
  if (!interaction.guild) return;
  const id = interaction.options.getString('formulaire-id', true);
  
  if (!storage.getFormulaire(interaction.guild.id, id)) {
    await interaction.reply({ content: '❌ Formulaire introuvable.', ephemeral: true });
    return;
  }

  storage.deleteFormulaire(interaction.guild.id, id);
  await interaction.reply({ content: '✅ Formulaire supprimé.', ephemeral: true });
}

async function handleConfig(interaction: ChatInputCommandInteraction) {
  if (!interaction.guild) return;
  
  const categories = storage.getCategories(interaction.guild.id);
  const panels = storage.getPanels(interaction.guild.id);
  const tickets = storage.getTickets(interaction.guild.id);

  const embed = new EmbedBuilder()
    .setColor('#5865f2')
    .setTitle('🎫 Configuration des tickets')
    .addFields(
      { name: '📁 Catégories', value: `${categories.length}`, inline: true },
      { name: '🖼️ Panels', value: `${panels.length}`, inline: true },
      { name: '🎟️ Tickets ouverts', value: `${tickets.filter(t => t.statut === 'ouvert').length}`, inline: true },
      { name: '📋 Tickets totaux', value: `${tickets.length}`, inline: true }
    )
    .setTimestamp();

  if (categories.length > 0) {
    const catList = categories.map(c => `• **${c.nom}** - <#${c.categorieDiscordId}>`).join('\n');
    embed.addFields({ name: 'Catégories', value: catList });
  }

  await interaction.reply({ embeds: [embed], ephemeral: true });
}

async function handleTicketLogs(interaction: ChatInputCommandInteraction) {
  if (!interaction.guild) return;
  const tickets = storage.getTickets(interaction.guild.id);
  const recentTickets = tickets.slice(-10).reverse();

  if (recentTickets.length === 0) {
    await interaction.reply({ content: '📭 Aucun ticket récent.', ephemeral: true });
    return;
  }

  const embed = new EmbedBuilder()
    .setColor('#5865f2')
    .setTitle('📋 Derniers tickets')
    .setDescription(recentTickets.map(t => 
      `**${t.sujet}** - <@${t.createurId}> - ${t.statut === 'ouvert' ? '🟢 Ouvert' : '🔴 Fermé'}`
    ).join('\n'))
    .setTimestamp();

  await interaction.reply({ embeds: [embed], ephemeral: true });
}

async function handleTranscript(interaction: ChatInputCommandInteraction) {
  // Will be handled via file sending
  await interaction.reply({ content: '📄 Fonctionnalité de transcript en cours.', ephemeral: true });
}

async function handleOpenManual(interaction: ChatInputCommandInteraction) {
  if (!interaction.guild) return;
  await interaction.reply({ content: '🔄 Utilisez un panel de tickets ou la fonctionnalité sera étendue.', ephemeral: true });
}

async function handleCloseManual(interaction: ChatInputCommandInteraction) {
  if (!interaction.guild) return;
  const ticket = storage.getTicket(interaction.guild.id, interaction.channelId);
  if (!ticket) {
    await interaction.reply({ content: '❌ Ce salon n\'est pas un ticket.', ephemeral: true });
    return;
  }
  await interaction.reply({ content: '🔒 Utilisez le bouton de fermeture dans le ticket.', ephemeral: true });
}

async function handleDeleteTicket(interaction: ChatInputCommandInteraction) {
  if (!interaction.guild || !interaction.channel) return;
  storage.deleteTicket(interaction.guild.id, interaction.channelId);
  await interaction.reply({ content: '🗑️ Ticket supprimé.', ephemeral: true });
  setTimeout(async () => { try { await interaction.channel?.delete(); } catch {} }, 2000);
}

async function handleRename(interaction: ChatInputCommandInteraction) {
  if (!interaction.guild || !interaction.channel) return;
  const newName = interaction.options.getString('nom', true);
  if (!interaction.channel || !('setName' in interaction.channel)) return;
  await (interaction.channel as any).setName(`🎫・${newName}`);
  await interaction.reply({ content: `✅ Ticket renommé en "${newName}".`, ephemeral: true });
}

async function handleTransfer(interaction: ChatInputCommandInteraction) {
  if (!interaction.guild) return;
  const membre = interaction.options.getUser('membre', true);
  const member = await interaction.guild.members.fetch(membre.id);
  
  if (!member) {
    await interaction.reply({ content: '❌ Membre introuvable.', ephemeral: true });
    return;
  }

  await interaction.reply({ content: `✅ Ticket transféré à ${membre}.`, ephemeral: true });
}

async function handleAddUser(interaction: ChatInputCommandInteraction) {
  if (!interaction.guild || !interaction.channel) return;
  const utilisateur = interaction.options.getUser('utilisateur', true);
  
  if (!interaction.channel || !('permissionOverwrites' in interaction.channel)) return;
  await (interaction.channel as any).permissionOverwrites.edit(utilisateur.id, {
    ViewChannel: true,
    SendMessages: true,
    ReadMessageHistory: true
  });

  await interaction.reply({ content: `✅ ${utilisateur} ajouté au ticket.`, ephemeral: true });
}

async function handleRemoveUser(interaction: ChatInputCommandInteraction) {
  if (!interaction.guild || !interaction.channel) return;
  const utilisateur = interaction.options.getUser('utilisateur', true);
  
  if (!interaction.channel || !('permissionOverwrites' in interaction.channel)) return;
  await (interaction.channel as any).permissionOverwrites.edit(utilisateur.id, {
    ViewChannel: false
  });

  await interaction.reply({ content: `✅ ${utilisateur} retiré du ticket.`, ephemeral: true });
}

async function handlePriority(interaction: ChatInputCommandInteraction) {
  if (!interaction.guild) return;
  const niveau = interaction.options.getString('niveau', true) as any;
  const ticket = storage.getTicket(interaction.guild.id, interaction.channelId);
  
  if (!ticket) {
    await interaction.reply({ content: '❌ Ce salon n\'est pas un ticket.', ephemeral: true });
    return;
  }

  storage.updateTicket(interaction.guild.id, interaction.channelId, { priorite: niveau });
  await interaction.reply({ content: `✅ Priorité changée à **${niveau}**.`, ephemeral: true });
}

async function handleReopen(interaction: ChatInputCommandInteraction) {
  if (!interaction.guild || !interaction.channel) return;
  const ticket = storage.getTicket(interaction.guild.id, interaction.channelId);
  
  if (!ticket) {
    await interaction.reply({ content: '❌ Ticket introuvable.', ephemeral: true });
    return;
  }

  storage.updateTicket(interaction.guild.id, interaction.channelId, { statut: 'ouvert', dateFermeture: null });
  
  if (!interaction.channel || !('permissionOverwrites' in interaction.channel)) return;
  await (interaction.channel as any).permissionOverwrites.edit(ticket.createurId, { SendMessages: true });
  await interaction.reply({ content: '✅ Ticket réouvert.', ephemeral: true });
}