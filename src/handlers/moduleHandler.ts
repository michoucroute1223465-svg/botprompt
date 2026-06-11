import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ButtonInteraction, ChatInputCommandInteraction, ComponentType } from 'discord.js';

export type MenuAction = 'aeroport' | 'ticket' | 'moderation' | 'logs' | 'concours' | 'vocal' | 'embed' | 'dashboard' | 'statut' | 'message' | 'ping' | 'infos';

export function createMainMenu(guildName: string, prefix: string) {
  const embed = new EmbedBuilder()
    .setColor(0x2b2d31)
    .setTitle(`Promt Bot - Menu principal`)
    .setDescription(`Bienvenue sur Promt Bot\nServeur: **${guildName}**\n\nSelectionnez un module ci-dessous`)
    .setFooter({ text: `${prefix}` });

  const row1 = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
      new ButtonBuilder().setCustomId('menu_aeroport').setLabel('Aeroport').setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId('menu_ticket').setLabel('Tickets').setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId('menu_moderation').setLabel('Moderation').setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId('menu_logs').setLabel('Logs').setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId('menu_concours').setLabel('Concours').setStyle(ButtonStyle.Secondary)
    );

  const row2 = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
      new ButtonBuilder().setCustomId('menu_vocal').setLabel('Vocal').setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId('menu_embed').setLabel('Embed').setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId('menu_message').setLabel('Messages planifies').setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId('menu_statut').setLabel('Statut / Activite').setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId('menu_dashboard').setLabel('Tableau de bord').setStyle(ButtonStyle.Primary)
    );

  const row3 = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
      new ButtonBuilder().setCustomId('menu_ping').setLabel('Ping').setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId('menu_infos').setLabel('Informations').setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId('menu_fermer').setLabel('Fermer').setStyle(ButtonStyle.Danger)
    );

  return { embeds: [embed], components: [row1, row2, row3] };
}

export function handleMenuButton(interaction: ButtonInteraction) {
  const customId = interaction.customId;
  if (customId === 'menu_fermer') {
    interaction.message.delete().catch(() => {});
    return;
  }
  // Les handlers spécifiques sont appelés depuis le fichier events/interactionCreate.ts
}