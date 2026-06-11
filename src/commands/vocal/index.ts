import { SlashCommandBuilder, EmbedBuilder, ChatInputCommandInteraction, ChannelType } from 'discord.js';
import { storage } from '../../utils/storage';
import { logger } from '../../utils/logger';

export default {
  data: new SlashCommandBuilder()
    .setName('notification-vocal')
    .setDescription('🔊 Notifications vocales'),

  async execute(interaction: ChatInputCommandInteraction) {
    if (!interaction.guild) return;
    const sub = interaction.options.getSubcommand();

    if (sub === 'configurer') {
      await interaction.deferReply({ ephemeral: true });
      const salon = interaction.options.getChannel('salon', true);
      const msgArrivee = interaction.options.getString('message-arrivée') || '{utilisateur} a rejoint le vocal.';
      const msgDepart = interaction.options.getString('message-départ') || '{utilisateur} a quitté le vocal.';
      const actif = interaction.options.getBoolean('actif') ?? true;

      const config = storage.getNotificationVocalConfig(interaction.guild.id);
      config.salonId = salon.id;
      config.messageArrivee = msgArrivee;
      config.messageDepart = msgDepart;
      config.actif = actif;
      storage.saveNotificationVocalConfig(interaction.guild.id, config);

      await interaction.editReply({ content: `✅ Notifications vocales configurées dans ${salon}` });
    }
  }
};