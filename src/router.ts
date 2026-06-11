import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';

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
}