import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChatInputCommandInteraction, ButtonInteraction, TextChannel } from 'discord.js';
import { storage } from '../utils/storage';
import { logger } from '../utils/logger';

export async function handleAeroportCommand(interaction: ChatInputCommandInteraction) {
  if (!interaction.guild) return;
  await showAeroportPanel(interaction);
}

async function showAeroportPanel(target: ChatInputCommandInteraction | ButtonInteraction) {
  if (!target.guild) return;
  const config = storage.getAeroportConfig(target.guild.id);

  const embed = new EmbedBuilder()
    .setColor(0x2b2d31)
    .setTitle('Configuration de l\'aeroport')
    .setDescription('Bienvenue et depart automatiques')
    .addFields(
      { name: 'Salon d\'arrivee', value: config.salonArriveeId ? `<#${config.salonArriveeId}>` : 'Non configure', inline: true },
      { name: 'Salon de depart', value: config.salonDepartId ? `<#${config.salonDepartId}>` : 'Non configure', inline: true },
      { name: 'Message d\'arrivee', value: config.messageArrivee.substring(0, 50), inline: false },
      { name: 'Message de depart', value: config.messageDepart.substring(0, 50), inline: false },
      { name: 'Statut', value: config.actif ? 'Actif' : 'Inactif', inline: true }
    )
    .setFooter({ text: 'Promt Bot' });

  const row = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('aeroport_arrivee')
        .setLabel('Configurer arrivee')
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId('aeroport_depart')
        .setLabel('Configurer depart')
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId('aeroport_toggle')
        .setLabel(config.actif ? 'Desactiver' : 'Activer')
        .setStyle(config.actif ? ButtonStyle.Danger : ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId('aeroport_fermer')
        .setLabel('Fermer')
        .setStyle(ButtonStyle.Secondary)
    );

  const msg = target instanceof ButtonInteraction ? target : null;
  if (msg && msg.message) {
    await msg.update({ embeds: [embed], components: [row] });
  } else {
    await (target as ChatInputCommandInteraction).reply({ embeds: [embed], components: [row] });
  }
}

export async function handleAeroportButton(interaction: ButtonInteraction) {
  if (!interaction.guild) return;
  const customId = interaction.customId;

  if (customId === 'aeroport_arrivee') {
    await interaction.reply({
      content: 'Utilisez la commande: /aeroport-config salon:[salon] message:[message]',
      ephemeral: true
    });
  } else if (customId === 'aeroport_depart') {
    await interaction.reply({
      content: 'Utilisez la commande: /aeroport-config depart salon:[salon] message:[message]',
      ephemeral: true
    });
  } else if (customId === 'aeroport_toggle') {
    const config = storage.getAeroportConfig(interaction.guild.id);
    config.actif = !config.actif;
    storage.saveAeroportConfig(interaction.guild.id, config);
    await showAeroportPanel(interaction);
  } else if (customId === 'aeroport_fermer') {
    await interaction.message.delete().catch(() => {});
  }
}

export async function handleAeroportConfig(interaction: ChatInputCommandInteraction) {
  if (!interaction.guild) return;
  await interaction.deferReply({ ephemeral: true });

  if (interaction.options.getSubcommand() === 'arrivee') {
    const salon = interaction.options.getChannel('salon', true);
    const message = interaction.options.getString('message') || 'Bienvenue {utilisateur} sur {serveur} ! ({membres} membres)';
    
    const config = storage.getAeroportConfig(interaction.guild.id);
    config.salonArriveeId = salon.id;
    config.messageArrivee = message;
    config.actif = true;
    storage.saveAeroportConfig(interaction.guild.id, config);

    await interaction.editReply({ content: `Salon d'arrivee configure: ${salon}` });
  } else if (interaction.options.getSubcommand() === 'depart') {
    const salon = interaction.options.getChannel('salon', true);
    const message = interaction.options.getString('message') || '{utilisateur} nous a quitte.';
    
    const config = storage.getAeroportConfig(interaction.guild.id);
    config.salonDepartId = salon.id;
    config.messageDepart = message;
    config.actif = true;
    storage.saveAeroportConfig(interaction.guild.id, config);

    await interaction.editReply({ content: `Salon de depart configure: ${salon}` });
  }
}