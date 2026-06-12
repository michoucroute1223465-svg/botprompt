import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } from 'discord.js';

export function createMainMenu(guildName: string) {
  const embed = new EmbedBuilder()
    .setColor(0x2b2d31)
    .setTitle('Promt Bot')
    .setDescription(`Serveur: **${guildName}**\n\nSelectionnez un module:`);

  return {
    embeds: [embed],
    components: [
      new ActionRowBuilder<ButtonBuilder>()
        .addComponents(
          new ButtonBuilder().setCustomId('menu_aeroport').setLabel('Aeroport').setStyle(ButtonStyle.Secondary),
          new ButtonBuilder().setCustomId('menu_ticket').setLabel('Tickets').setStyle(ButtonStyle.Secondary),
          new ButtonBuilder().setCustomId('menu_moderation').setLabel('Moderation').setStyle(ButtonStyle.Secondary),
          new ButtonBuilder().setCustomId('menu_logs').setLabel('Logs').setStyle(ButtonStyle.Secondary),
          new ButtonBuilder().setCustomId('menu_concours').setLabel('Concours').setStyle(ButtonStyle.Secondary)
        ),
      new ActionRowBuilder<ButtonBuilder>()
        .addComponents(
          new ButtonBuilder().setCustomId('menu_ping').setLabel('Ping').setStyle(ButtonStyle.Primary),
          new ButtonBuilder().setCustomId('menu_infos').setLabel('Infos').setStyle(ButtonStyle.Primary),
          new ButtonBuilder().setCustomId('menu_dashboard').setLabel('Dashboard').setStyle(ButtonStyle.Primary),
          new ButtonBuilder().setCustomId('menu_fermer').setLabel('Fermer').setStyle(ButtonStyle.Danger)
        )
    ]
  };
}

export async function routeButton(interaction: any) {
  const id = interaction.customId;

  if (id === 'menu_fermer') {
    await interaction.message.delete().catch(() => {});
    return;
  }

  if (id === 'menu_aeroport') {
    const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = await import('discord.js');
    const { storage } = await import('./utils/storage');
    const config = storage.getAeroportConfig(interaction.guild.id);
    const embed = new EmbedBuilder()
      .setColor(0x2b2d31).setTitle('Configuration de l\'aeroport')
      .addFields(
        { name: 'Arrivee', value: config.salonArriveeId ? `<#${config.salonArriveeId}>` : 'Non configure', inline: true },
        { name: 'Depart', value: config.salonDepartId ? `<#${config.salonDepartId}>` : 'Non configure', inline: true },
        { name: 'Actif', value: config.actif ? 'Oui' : 'Non', inline: true }
      );
    const row = new ActionRowBuilder<ButtonBuilder>()
      .addComponents(
        new ButtonBuilder().setCustomId('aeroport_arrivee').setLabel('Configurer arrivee').setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId('aeroport_depart').setLabel('Configurer depart').setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId('aeroport_toggle').setLabel(config.actif ? 'Desactiver' : 'Activer').setStyle(config.actif ? ButtonStyle.Danger : ButtonStyle.Success)
      );
    await interaction.update({ embeds: [embed], components: [row] });
    return;
  }

  if (id === 'aeroport_toggle') {
    const { storage } = await import('./utils/storage');
    const config = storage.getAeroportConfig(interaction.guild.id);
    config.actif = !config.actif;
    storage.saveAeroportConfig(interaction.guild.id, config);
    // Rediriger vers le menu aeroport
    const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = await import('discord.js');
    const embed = new EmbedBuilder()
      .setColor(0x2b2d31).setTitle('Configuration de l\'aeroport')
      .addFields(
        { name: 'Arrivee', value: config.salonArriveeId ? `<#${config.salonArriveeId}>` : 'Non configure', inline: true },
        { name: 'Depart', value: config.salonDepartId ? `<#${config.salonDepartId}>` : 'Non configure', inline: true },
        { name: 'Actif', value: config.actif ? 'Oui' : 'Non', inline: true }
      );
    const row = new ActionRowBuilder<ButtonBuilder>()
      .addComponents(
        new ButtonBuilder().setCustomId('aeroport_arrivee').setLabel('Configurer arrivee').setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId('aeroport_depart').setLabel('Configurer depart').setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId('aeroport_toggle').setLabel(config.actif ? 'Desactiver' : 'Activer').setStyle(config.actif ? ButtonStyle.Danger : ButtonStyle.Success)
      );
    await interaction.update({ embeds: [embed], components: [row] });
    return;
  }

  if (id === 'menu_ticket') {
    const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = await import('discord.js');
    const embed = new EmbedBuilder()
      .setColor(0x2b2d31).setTitle('Gestion des tickets')
      .setDescription('Utilisez `/ticket` pour les commandes de gestion des tickets.');
    const row = new ActionRowBuilder<ButtonBuilder>()
      .addComponents(new ButtonBuilder().setCustomId('menu_retour').setLabel('Retour').setStyle(ButtonStyle.Secondary));
    await interaction.update({ embeds: [embed], components: [row] });
    return;
  }

  if (id === 'menu_moderation') {
    const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = await import('discord.js');
    const embed = new EmbedBuilder()
      .setColor(0x2b2d31).setTitle('Moderation')
      .setDescription('Commandes disponibles:\n`/bannir` `/debannir` `/expulser` `/mute` `/unmute` `/avertir` `/desavertir`');
    const row = new ActionRowBuilder<ButtonBuilder>()
      .addComponents(new ButtonBuilder().setCustomId('menu_retour').setLabel('Retour').setStyle(ButtonStyle.Secondary));
    await interaction.update({ embeds: [embed], components: [row] });
    return;
  }

  if (id === 'menu_logs') {
    const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = await import('discord.js');
    const embed = new EmbedBuilder()
      .setColor(0x2b2d31).setTitle('Logs')
      .setDescription('Utilisez `/logs configurer` pour configurer les logs.');
    const row = new ActionRowBuilder<ButtonBuilder>()
      .addComponents(new ButtonBuilder().setCustomId('menu_retour').setLabel('Retour').setStyle(ButtonStyle.Secondary));
    await interaction.update({ embeds: [embed], components: [row] });
    return;
  }

  if (id === 'menu_concours') {
    const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = await import('discord.js');
    const embed = new EmbedBuilder()
      .setColor(0x2b2d31).setTitle('Concours')
      .setDescription('Utilisez `/concours creer` pour creer un concours.');
    const row = new ActionRowBuilder<ButtonBuilder>()
      .addComponents(new ButtonBuilder().setCustomId('menu_retour').setLabel('Retour').setStyle(ButtonStyle.Secondary));
    await interaction.update({ embeds: [embed], components: [row] });
    return;
  }

  if (id === 'menu_ping') {
    const sent = await interaction.reply({ content: 'Calcul...', fetchReply: true });
    const { EmbedBuilder } = await import('discord.js');
    const embed = new EmbedBuilder()
      .setColor(0x2b2d31).setTitle('Pong')
      .addFields(
        { name: 'Latence', value: `${sent.createdTimestamp - interaction.createdTimestamp}ms`, inline: true },
        { name: 'API', value: `${Math.round(interaction.client.ws.ping)}ms`, inline: true }
      );
    await interaction.update({ embeds: [embed], components: [] });
    return;
  }

  if (id === 'menu_infos') {
    const { EmbedBuilder } = await import('discord.js');
    const embed = new EmbedBuilder()
      .setColor(0x2b2d31).setTitle('Informations')
      .addFields(
        { name: 'Bot', value: 'Promt Bot v1.0', inline: true },
        { name: 'Uptime', value: `${Math.floor(process.uptime() / 86400)}j ${Math.floor((process.uptime() % 86400) / 3600)}h ${Math.floor((process.uptime() % 3600) / 60)}m`, inline: true }
      );
    await interaction.update({ embeds: [embed], components: [] });
    return;
  }

  if (id === 'menu_dashboard') {
    const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = await import('discord.js');
    const { storage } = await import('./utils/storage');
    const stats = storage.getStats(interaction.guild.id);
    const tickets = storage.getTickets(interaction.guild.id);
    const sanctions = storage.getSanctions(interaction.guild.id);
    const embed = new EmbedBuilder()
      .setColor(0x2b2d31).setTitle(`Tableau de bord - ${interaction.guild.name}`)
      .addFields(
        { name: 'Tickets', value: `Total: ${stats.totalTickets}\nOuverts: ${tickets.filter((t: any) => t.statut === 'ouvert').length}`, inline: true },
        { name: 'Sanctions', value: `${sanctions.length}`, inline: true }
      );
    const row = new ActionRowBuilder<ButtonBuilder>()
      .addComponents(new ButtonBuilder().setCustomId('menu_retour').setLabel('Retour').setStyle(ButtonStyle.Secondary));
    await interaction.update({ embeds: [embed], components: [row] });
    return;
  }

  if (id === 'menu_retour') {
    const { createMainMenu } = await import('./router');
    await interaction.update(createMainMenu(interaction.guild.name));
    return;
  }

  // Concours participation
  if (id.startsWith('concours_')) {
    const concoursId = id.replace('concours_', '');
    const { storage } = await import('./utils/storage');
    const c = storage.getConcoursById(interaction.guild.id, concoursId);
    if (!c || !c.actif) { await interaction.reply({ content: 'Concours termine ou inexistant.', ephemeral: true }); return; }
    if (c.participants.includes(interaction.user.id)) { await interaction.reply({ content: 'Vous participez deja.', ephemeral: true }); return; }
    c.participants.push(interaction.user.id);
    storage.updateConcours(interaction.guild.id, concoursId, { participants: c.participants });
    await interaction.reply({ content: 'Participation enregistree.', ephemeral: true });
    return;
  }

  // ====== TICKET CONFIG BUTTONS ======
  if (id === 'ticket_cfg_titre') {
    const modal = new ModalBuilder().setCustomId('ticket_modal_titre').setTitle('Titre du panel');
    modal.addComponents(new ActionRowBuilder<TextInputBuilder>().addComponents(new TextInputBuilder().setCustomId('titre').setLabel('Titre du panel').setStyle(TextInputStyle.Short).setRequired(true)) as any);
    await interaction.showModal(modal);
    return;
  }

  if (id === 'ticket_cfg_logo') {
    const modal = new ModalBuilder().setCustomId('ticket_modal_logo').setTitle('Logo du panel');
    modal.addComponents(new ActionRowBuilder<TextInputBuilder>().addComponents(new TextInputBuilder().setCustomId('logo').setLabel('URL de l\'image').setStyle(TextInputStyle.Short).setRequired(true)) as any);
    await interaction.showModal(modal);
    return;
  }

  if (id === 'ticket_cfg_description') {
    const modal = new ModalBuilder().setCustomId('ticket_modal_description').setTitle('Description du panel');
    modal.addComponents(new ActionRowBuilder<TextInputBuilder>().addComponents(new TextInputBuilder().setCustomId('description').setLabel('Description').setPlaceholder('{tickets_ouverts} {tickets_fermes} {motifs}').setStyle(TextInputStyle.Paragraph).setRequired(true)) as any);
    await interaction.showModal(modal);
    return;
  }

  if (id === 'ticket_cfg_ajouter_motif') {
    const modal = new ModalBuilder().setCustomId('ticket_modal_motif').setTitle('Ajouter un motif');
    modal.addComponents(new ActionRowBuilder<TextInputBuilder>().addComponents(new TextInputBuilder().setCustomId('nom').setLabel('Nom du motif').setStyle(TextInputStyle.Short).setRequired(true)) as any);
    modal.addComponents(new ActionRowBuilder<TextInputBuilder>().addComponents(new TextInputBuilder().setCustomId('emoji').setLabel('Emoji').setStyle(TextInputStyle.Short).setRequired(true)) as any);
    modal.addComponents(new ActionRowBuilder<TextInputBuilder>().addComponents(new TextInputBuilder().setCustomId('message').setLabel('Message d\'ouverture').setPlaceholder('{utilisateur} {motif} {nombre}').setStyle(TextInputStyle.Paragraph).setRequired(true)) as any);
    modal.addComponents(new ActionRowBuilder<TextInputBuilder>().addComponents(new TextInputBuilder().setCustomId('ping').setLabel('Role a ping (ID)').setStyle(TextInputStyle.Short).setRequired(false)) as any);
    modal.addComponents(new ActionRowBuilder<TextInputBuilder>().addComponents(new TextInputBuilder().setCustomId('categorie').setLabel('Categorie Discord (ID)').setStyle(TextInputStyle.Short).setRequired(true)) as any);
    await interaction.showModal(modal);
    return;
  }

  if (id === 'ticket_cfg_envoyer') {
    const channels = interaction.guild.channels.cache.filter((c: any) => c.type === 0).map((c: any) => new StringSelectMenuOptionBuilder().setLabel(c.name).setValue(c.id)).slice(0, 25);
    if (channels.length === 0) { await interaction.reply({ content: 'Aucun salon textuel.', ephemeral: true }); return; }
    const select = new StringSelectMenuBuilder().setCustomId('ticket_select_salon').setPlaceholder('Choisir le salon du panel').addOptions(channels);
    await interaction.reply({ components: [new ActionRowBuilder().addComponents(select)], ephemeral: true });
    return;
  }

  if (id === 'ticket_select_salon') {
    await interaction.deferReply({ ephemeral: true });
    const { storage } = await import('./utils/storage');
    const salonId = interaction.values[0];
    const salon = interaction.guild.channels.cache.get(salonId) as any;
    if (!salon?.send) { await interaction.editReply({ content: 'Salon invalide.' }); return; }
    const panels = storage.getPanels(interaction.guild.id);
    const panel = panels[0];
    if (!panel) { await interaction.editReply({ content: 'Aucun panel.' }); return; }
    const tickets = storage.getTickets(interaction.guild.id);
    const ouverts = tickets.filter((t: any) => t.statut === 'ouvert').length;
    const fermes = tickets.filter((t: any) => t.statut === 'ferme').length;
    const motifListe = panel.motifs.length > 0 ? panel.motifs.map((m: any) => `• ${m.emoji} ${m.nom}`).join('\n') : '*Aucun motif*';
    let desc = panel.description.replace(/{tickets_ouverts}/g, String(ouverts)).replace(/{tickets_fermes}/g, String(fermes)).replace(/{motifs}/g, motifListe);
    const embed = new EmbedBuilder()
      .setColor(parseInt(panel.couleur.replace('#', ''), 16) || 0x5865f2)
      .setTitle(`${panel.emoji} ${panel.titre}`)
      .setDescription(desc)
      .addFields(
        { name: 'Motifs disponibles', value: `${panel.motifs.length}`, inline: true },
        { name: 'Tickets ouverts', value: `${ouverts}`, inline: true },
        { name: 'Tickets fermes', value: `${fermes}`, inline: true },
        { name: 'Motifs', value: motifListe, inline: false }
      )
      .setTimestamp();
    if (panel.logoUrl) embed.setThumbnail(panel.logoUrl);
    if (panel.motifs.length > 0) {
      const select = new StringSelectMenuBuilder().setCustomId(`ticket_open_${panel.id}`).setPlaceholder('Selectionnez un motif').addOptions(panel.motifs.map((m: any) => new StringSelectMenuOptionBuilder().setLabel(m.nom).setValue(m.id).setEmoji(m.emoji)));
      const msg = await salon.send({ embeds: [embed], components: [new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(select)] });
      storage.updatePanel(interaction.guild.id, panel.id, { messageId: msg.id, channelId: salonId });
    } else {
      const msg = await salon.send({ embeds: [embed] });
      storage.updatePanel(interaction.guild.id, panel.id, { messageId: msg.id, channelId: salonId });
    }
    await interaction.editReply({ content: `Panel envoye dans ${salon}.` });
    return;
  }

  // ====== TICKET OPEN (menu deroulant) ======
  if (id.startsWith('ticket_open_')) {
    await interaction.deferReply({ ephemeral: true });
    const { storage } = await import('./utils/storage');
    const { v4: uuidv4 } = await import('uuid');
    const panelId = id.replace('ticket_open_', '');
    const panel = storage.getPanel(interaction.guild.id, panelId);
    if (!panel) { await interaction.editReply({ content: 'Panel introuvable.' }); return; }
    const motifId = interaction.values[0];
    const motif = panel.motifs.find((m: any) => m.id === motifId);
    if (!motif) { await interaction.editReply({ content: 'Motif introuvable.' }); return; }
    const tickets = storage.getTickets(interaction.guild.id);
    const nombre = tickets.length + 1;
    const nomSalon = motif.formatNomSalon.replace(/{nombre}/g, String(nombre).padStart(3, '0')).replace(/{utilisateur}/g, interaction.user.username).replace(/{motif}/g, motif.nom);
    const categorie = interaction.guild.channels.cache.get(motif.categorieId) as any;
    if (!categorie) { await interaction.editReply({ content: 'Categorie introuvable.' }); return; }
    const salon = await interaction.guild.channels.create({ name: nomSalon, type: 0, parent: motif.categorieId, permissionOverwrites: [{ id: interaction.guild.id, deny: ['ViewChannel'] }, { id: interaction.user.id, allow: ['ViewChannel', 'SendMessages', 'ReadMessageHistory'] }] });
    const ticketId = uuidv4();
    storage.createTicket(interaction.guild.id, { id: ticketId, guildId: interaction.guild.id, channelId: salon.id, categorieId: motif.categorieId, panelId: panel.id, createurId: interaction.user.id, membreIds: [interaction.user.id], statut: 'ouvert', priorite: 'normale', sujet: motif.nom, formulaireId: null, reponsesFormulaire: [], dateCreation: Date.now(), dateFermeture: null, fermePar: null, transcriptId: null, categoryName: motif.nom });
    storage.incrementStats(interaction.guild.id, 'totalTickets');
    const msg = motif.messageOuverture.replace(/{utilisateur}/g, `<@${interaction.user.id}>`).replace(/{motif}/g, motif.nom).replace(/{nombre}/g, String(nombre).padStart(3, '0'));
    const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = await import('discord.js');
    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(new ButtonBuilder().setCustomId(`ticket_close_${salon.id}`).setLabel('Fermer le ticket').setStyle(ButtonStyle.Danger));
    await salon.send({ content: msg + (motif.pingRoleId ? ` <@&${motif.pingRoleId}>` : ''), components: [row] });
    await interaction.editReply({ content: `Ticket ouvert: ${salon}` });
    return;
  }

  // ====== TICKET CLOSE ======
  if (id.startsWith('ticket_close_')) {
    const { storage } = await import('./utils/storage');
    const channelId = id.replace('ticket_close_', '');
    const ticket = storage.getTicket(interaction.guild.id, channelId);
    if (!ticket) { await interaction.reply({ content: 'Ce salon n\'est pas un ticket.', ephemeral: true }); return; }
    storage.updateTicket(interaction.guild.id, channelId, { statut: 'ferme', dateFermeture: Date.now() });
    const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = await import('discord.js');
    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(new ButtonBuilder().setCustomId(`ticket_delete_${channelId}`).setLabel('Supprimer').setStyle(ButtonStyle.Danger), new ButtonBuilder().setCustomId(`ticket_reopen_${channelId}`).setLabel('Reouvrir').setStyle(ButtonStyle.Success));
    await interaction.reply({ content: 'Ticket ferme.', components: [row] });
    return;
  }

  // ====== TICKET DELETE ======
  if (id.startsWith('ticket_delete_')) {
    const { storage } = await import('./utils/storage');
    const channelId = id.replace('ticket_delete_', '');
    storage.deleteTicket(interaction.guild.id, channelId);
    await interaction.reply({ content: 'Ticket supprime.' });
    setTimeout(async () => { try { await (interaction.channel as any)?.delete(); } catch {} }, 2000);
    return;
  }

  // ====== TICKET REOPEN ======
  if (id.startsWith('ticket_reopen_')) {
    const { storage } = await import('./utils/storage');
    const channelId = id.replace('ticket_reopen_', '');
    const ticket = storage.getTicket(interaction.guild.id, channelId);
    if (!ticket) { await interaction.reply({ content: 'Ticket introuvable.', ephemeral: true }); return; }
    storage.updateTicket(interaction.guild.id, channelId, { statut: 'ouvert', dateFermeture: null });
    await interaction.reply({ content: 'Ticket reouvert.' });
    return;
  }
}
