import { ButtonInteraction, ModalSubmitInteraction, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, EmbedBuilder, ChannelType, PermissionFlagsBits, GuildMember, ButtonStyle, ComponentType } from 'discord.js';
import { v4 as uuidv4 } from 'uuid';
import { storage } from '../../utils/storage';
import { logger } from '../../utils/logger';
import { transcriptGenerator } from '../../utils/transcript';
import { isStaff } from '../../utils/permissions';

// ==============================
// GESTION DES BOUTONS TICKETS
// ==============================

export async function handleTicketButton(interaction: ButtonInteraction): Promise<void> {
  const customId = interaction.customId;

  if (customId.startsWith('ticket_open_')) {
    await handleOpenTicket(interaction);
  } else if (customId.startsWith('ticket_close_')) {
    await handleCloseTicket(interaction);
  } else if (customId.startsWith('ticket_claim_')) {
    await handleClaimTicket(interaction);
  } else if (customId === 'ticket_confirm_close') {
    await handleConfirmClose(interaction);
  } else if (customId === 'ticket_cancel_close') {
    await handleCancelClose(interaction);
  } else if (customId.startsWith('ticket_delete_')) {
    await handleDeleteTicket(interaction);
  } else if (customId === 'ticket_confirm_delete') {
    await handleConfirmDelete(interaction);
  } else if (customId === 'ticket_cancel_delete') {
    await handleCancelDelete(interaction);
  }
}

// ==============================
// MODALS
// ==============================

export async function handleTicketModal(interaction: ModalSubmitInteraction): Promise<void> {
  if (interaction.customId.startsWith('ticket_form_')) {
    await handleFormSubmission(interaction);
  }
}

// ==============================
// OUVERTURE DE TICKET
// ==============================

async function handleOpenTicket(interaction: ButtonInteraction): Promise<void> {
  await interaction.deferReply({ ephemeral: true });

  try {
    if (!interaction.guild) return;

    const panelId = interaction.customId.replace('ticket_open_', '');
    const panel = storage.getPanel(interaction.guild.id, panelId);

    if (!panel) {
      await interaction.editReply({ content: '❌ Ce panel n\'existe plus. Il a probablement été supprimé.' });
      return;
    }

    // Vérifier si l'utilisateur a déjà un ticket ouvert
    const ticketsExistants = storage.getTickets(interaction.guild.id);
    const ticketExistant = ticketsExistants.find(t => 
      t.createurId === interaction.user.id && 
      t.categorieId === panel.categorieId &&
      t.statut === 'ouvert'
    );

    if (ticketExistant) {
      await interaction.editReply({ 
        content: `❌ Vous avez déjà un ticket ouvert dans cette catégorie: <#${ticketExistant.channelId}>` 
      });
      return;
    }

    const categorie = storage.getCategory(interaction.guild.id, panel.categorieId);
    if (!categorie) {
      await interaction.editReply({ content: '❌ La catégorie associée à ce panel n\'existe plus.' });
      return;
    }

    // Création du salon de ticket
    const categoryChannel = interaction.guild.channels.cache.get(categorie.categorieDiscordId);
    if (!categoryChannel || categoryChannel.type !== ChannelType.GuildCategory) {
      await interaction.editReply({ content: '❌ La catégorie Discord associée n\'existe pas.' });
      return;
    }

    const staffRole = interaction.guild.roles.cache.get(categorie.roleStaffId);
    const ticketId = uuidv4();
    const ticketSujet = `ticket-${interaction.user.username.toLowerCase().replace(/[^a-z0-9]/g, '')}`;

    const channel = await interaction.guild.channels.create({
      name: `🎫・${ticketSujet}`,
      type: ChannelType.GuildText,
      parent: categoryChannel.id,
      permissionOverwrites: [
        {
          id: interaction.guild.id,
          deny: [PermissionFlagsBits.ViewChannel]
        },
        {
          id: interaction.user.id,
          allow: [
            PermissionFlagsBits.ViewChannel,
            PermissionFlagsBits.SendMessages,
            PermissionFlagsBits.ReadMessageHistory,
            PermissionFlagsBits.AttachFiles,
            PermissionFlagsBits.EmbedLinks
          ]
        },
        {
          id: categorie.roleStaffId,
          allow: [
            PermissionFlagsBits.ViewChannel,
            PermissionFlagsBits.SendMessages,
            PermissionFlagsBits.ReadMessageHistory,
            PermissionFlagsBits.AttachFiles,
            PermissionFlagsBits.EmbedLinks,
            PermissionFlagsBits.ManageChannels
          ]
        }
      ]
    });

    // Message d'ouverture
    const embed = new EmbedBuilder()
      .setColor('#5865f2')
      .setTitle(`🎫 Ticket - ${panel.titre || 'Support'}`)
      .setDescription(categorie.messageOuverture || 'Bienvenue dans votre ticket. Le staff vous répondra dès que possible.')
      .addFields(
        { name: '📝 Sujet', value: panel.titre || 'Support', inline: true },
        { name: '👤 Créateur', value: `<@${interaction.user.id}>`, inline: true },
        { name: '📅 Date', value: new Date().toLocaleString('fr-FR'), inline: true }
      )
      .setFooter({ text: `ID: ${ticketId}` })
      .setTimestamp();

    const closeButton = {
      type: ComponentType.Button as number,
      style: ButtonStyle.Danger as number,
      label: '🔒 Fermer le ticket',
      customId: `ticket_close_${ticketId}`,
    } as any;

    const claimButton = {
      type: ComponentType.Button as number,
      style: ButtonStyle.Primary as number,
      label: '📋 Prendre le ticket',
      customId: `ticket_claim_${ticketId}`,
    } as any;

    await channel.send({ 
      content: `${staffRole ? `<@&${staffRole.id}>` : ''} ${interaction.user}`,
      embeds: [embed],
      components: [{
        type: ComponentType.ActionRow,
        components: [closeButton, claimButton]
      } as any]
    });

    // Sauvegarde dans le stockage
    const nouveauTicket = {
      id: ticketId,
      guildId: interaction.guild.id,
      channelId: channel.id,
      categorieId: panel.categorieId,
      panelId: panel.id,
      createurId: interaction.user.id,
      membreIds: [interaction.user.id],
      statut: 'ouvert' as const,
      priorite: 'normale' as const,
      sujet: panel.titre || 'Support',
      formulaireId: null,
      reponsesFormulaire: [],
      dateCreation: Date.now(),
      dateFermeture: null,
      fermePar: null,
      transcriptId: null,
      categoryName: categorie.nom
    };

    storage.createTicket(interaction.guild.id, nouveauTicket);
    storage.incrementStats(interaction.guild.id, 'totalTickets');
    storage.incrementStats(interaction.guild.id, 'ticketsOuverts');

    await interaction.editReply({ 
      content: `✅ Votre ticket a été créé: ${channel}` 
    });

    logger.info(`Ticket créé: ${ticketId} par ${interaction.user.tag}`, 'Tickets');

    // Log
    const { logToChannel } = await import('../../utils/logger');
    await logToChannel(interaction.guild, 'tickets', {
      title: '🎫 Ticket créé',
      description: `Un nouveau ticket a été créé`,
      color: 0x57f287,
      fields: [
        { name: 'Utilisateur', value: `${interaction.user.tag}`, inline: true },
        { name: 'Salon', value: `${channel}`, inline: true },
        { name: 'Catégorie', value: categorie.nom, inline: true },
        { name: 'Panel', value: panel.nom, inline: true }
      ]
    });

  } catch (error) {
    logger.error(`Erreur création ticket: ${error}`, 'Tickets');
    await interaction.editReply({ content: '❌ Une erreur est survenue lors de la création du ticket.' });
  }
}

// ==============================
// FERMETURE DE TICKET
// ==============================

async function handleCloseTicket(interaction: ButtonInteraction): Promise<void> {
  try {
    if (!interaction.guild) return;

    const ticket = storage.getTicket(interaction.guild.id, interaction.channelId);
    if (!ticket) {
      await interaction.reply({ content: '❌ Ce ticket n\'existe pas dans la base de données.', ephemeral: true });
      return;
    }

    const categories = storage.getCategories(interaction.guild.id);
    const staffRoleIds = categories.map(c => c.roleStaffId);
    const member = await interaction.guild.members.fetch(interaction.user.id);

    if (!isStaff(member, staffRoleIds) && interaction.user.id !== ticket.createurId) {
      await interaction.reply({ content: '❌ Vous n\'avez pas la permission de fermer ce ticket.', ephemeral: true });
      return;
    }

    // Modal de confirmation avec raison
    const confirmEmbed = new EmbedBuilder()
      .setColor('#ed4245')
      .setTitle('🔒 Confirmation de fermeture')
      .setDescription('Êtes-vous sûr de vouloir fermer ce ticket ?')
      .addFields(
        { name: 'Fermé par', value: `${interaction.user}`, inline: true },
        { name: 'Ticket', value: ticket.sujet, inline: true }
      )
      .setFooter({ text: 'Un transcript sera généré automatiquement' })
      .setTimestamp();

    const confirmButton = {
      type: ComponentType.Button as number,
      style: ButtonStyle.Danger as number,
      label: '✅ Confirmer la fermeture',
      customId: 'ticket_confirm_close',
    } as any;

    const cancelButton = {
      type: ComponentType.Button as number,
      style: ButtonStyle.Secondary as number,
      label: '❌ Annuler',
      customId: 'ticket_cancel_close',
    } as any;

    await interaction.reply({
      embeds: [confirmEmbed],
      components: [{
        type: ComponentType.ActionRow,
        components: [confirmButton, cancelButton]
      } as any],
      ephemeral: false
    });

  } catch (error) {
    logger.error(`Erreur fermeture ticket: ${error}`, 'Tickets');
  }
}

async function handleConfirmClose(interaction: ButtonInteraction): Promise<void> {
  try {
    if (!interaction.guild) return;

    const channel = interaction.channel;
    if (!channel) return;

    const ticket = storage.getTicket(interaction.guild.id, interaction.channelId);
    if (!ticket) {
      await interaction.reply({ content: '❌ Ticket introuvable.', ephemeral: true });
      return;
    }

    await interaction.reply({ content: '🔒 Fermeture du ticket en cours...' });

    // Génération du transcript
    const transcriptId = await transcriptGenerator.generate(
      interaction.guild,
      channel as any,
      interaction.user
    );

    // Envoi du transcript au créateur
    if (transcriptId) {
      const createur = await interaction.client.users.fetch(ticket.createurId);
      const sent = await transcriptGenerator.sendTranscript(transcriptId, createur);
      if (!sent) {
        logger.warn(`Impossible d'envoyer le transcript à ${createur.tag} (DM fermés)`, 'Tickets');
      }

      // Envoi dans les logs si configuré
      const categories = storage.getCategories(interaction.guild.id);
      const categorie = categories.find(c => c.id === ticket.categorieId);
      if (categorie?.salonLogsId) {
        const logsChannel = interaction.guild.channels.cache.get(categorie.salonLogsId);
        if (logsChannel && logsChannel.type === ChannelType.GuildText) {
          const transcriptPaths = transcriptGenerator.getTranscriptPath(transcriptId);
          if (transcriptPaths) {
            await (logsChannel as any).send({
              embeds: [
                new EmbedBuilder()
                  .setColor('#ed4245')
                  .setTitle('📋 Transcript - Ticket fermé')
                  .setDescription(`Ticket **${ticket.sujet}** fermé par ${interaction.user}`)
                  .addFields(
                    { name: 'Créateur', value: `<@${ticket.createurId}>`, inline: true },
                    { name: 'Fermé par', value: `${interaction.user.tag}`, inline: true },
                    { name: 'Transcript ID', value: transcriptId, inline: true }
                  )
                  .setTimestamp()
              ],
              files: [
                { attachment: transcriptPaths.html },
                { attachment: transcriptPaths.text }
              ]
            });
          }
        }
      }
    }

    // Mise à jour du statut
    storage.updateTicket(interaction.guild.id, interaction.channelId, {
      statut: 'ferme',
      dateFermeture: Date.now(),
      fermePar: interaction.user.id,
      transcriptId: transcriptId || undefined
    });

    // Mise à jour des stats
    const stats = storage.getStats(interaction.guild.id);
    stats.ticketsFermes++;
    stats.ticketsOuverts = Math.max(0, stats.ticketsOuverts - 1);
    storage.saveStats(interaction.guild.id, stats);

    // Changement des permissions (lecture seule)
    if (!channel || !('permissionOverwrites' in channel)) return;
    await (channel as any).permissionOverwrites.edit(ticket.createurId, {
      SendMessages: false
    });

    // Message de fermeture
    await (channel as any).send({
      embeds: [
        new EmbedBuilder()
          .setColor('#ed4245')
          .setTitle('🔒 Ticket fermé')
          .setDescription(`Ce ticket a été fermé par ${interaction.user}`)
          .addFields(
            { name: 'Transcript', value: transcriptId ? '✅ Généré' : '❌ Non généré', inline: true }
          )
          .setTimestamp()
      ]
    });

    await interaction.editReply({ content: '✅ Ticket fermé avec succès.' });

    // Suppression automatique après 5 secondes
    setTimeout(async () => {
      try {
        await channel.delete();
        storage.deleteTicket(interaction.guild!.id, channel.id);
      } catch {}
    }, 5000);

    logger.info(`Ticket fermé: ${ticket.id} par ${interaction.user.tag}`, 'Tickets');

  } catch (error) {
    logger.error(`Erreur confirmation fermeture: ${error}`, 'Tickets');
  }
}

async function handleCancelClose(interaction: ButtonInteraction): Promise<void> {
  await interaction.reply({ content: '✅ Fermeture annulée.', ephemeral: true });
}

// ==============================
// CLAIM TICKET
// ==============================

async function handleClaimTicket(interaction: ButtonInteraction): Promise<void> {
  try {
    if (!interaction.guild) return;

    const ticket = storage.getTicket(interaction.guild.id, interaction.channelId);
    if (!ticket) {
      await interaction.reply({ content: '❌ Ticket introuvable.', ephemeral: true });
      return;
    }

    await interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setColor('#57f287')
          .setTitle('📋 Ticket pris en charge')
          .setDescription(`Ce ticket est maintenant pris en charge par ${interaction.user}`)
          .setTimestamp()
      ]
    });

  } catch (error) {
    logger.error(`Erreur claim ticket: ${error}`, 'Tickets');
  }
}

// ==============================
// SUPPRESSION DE TICKET
// ==============================

async function handleDeleteTicket(interaction: ButtonInteraction): Promise<void> {
  const confirmEmbed = new EmbedBuilder()
    .setColor('#ed4245')
    .setTitle('⚠️ Confirmation de suppression')
    .setDescription('Êtes-vous sûr de vouloir supprimer ce ticket ? Cette action est irréversible.')
    .setTimestamp();

  const confirmButton = {
    type: ComponentType.Button as number,
    style: ButtonStyle.Danger as number,
    label: '✅ Confirmer la suppression',
    customId: 'ticket_confirm_delete',
  } as any;

  const cancelButton = {
    type: ComponentType.Button as number,
    style: ButtonStyle.Secondary as number,
    label: '❌ Annuler',
    customId: 'ticket_cancel_delete',
  } as any;

  await interaction.reply({
    embeds: [confirmEmbed],
    components: [{
      type: ComponentType.ActionRow,
      components: [confirmButton, cancelButton]
    } as any],
    ephemeral: true
  });
}

async function handleConfirmDelete(interaction: ButtonInteraction): Promise<void> {
  if (!interaction.guild || !interaction.channel) return;
  
  storage.deleteTicket(interaction.guild.id, interaction.channelId);
  
  await interaction.reply({ content: '🗑️ Suppression du ticket...', ephemeral: true });
  
  setTimeout(async () => {
    try {
      await interaction.channel?.delete();
    } catch {}
  }, 2000);
}

async function handleCancelDelete(interaction: ButtonInteraction): Promise<void> {
  await interaction.reply({ content: '✅ Suppression annulée.', ephemeral: true });
}

// ==============================
// SOUMISSION FORMULAIRE
// ==============================

async function handleFormSubmission(interaction: ModalSubmitInteraction): Promise<void> {
  // Cette fonction sera appelée quand un formulaire est soumis
  // Elle traite les réponses et les envoie dans le salon du ticket
}