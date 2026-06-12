import { SlashCommandBuilder, ChatInputCommandInteraction, ChannelType } from 'discord.js';
import { logger } from '../../utils/logger';

export default {
  data: new SlashCommandBuilder()
    .setName('rejoindre-vocal')
    .setDescription('🔊 Rejoindre un salon vocal')
    .addChannelOption(o => o.setName('salon').setDescription('Salon vocal').setRequired(true)),

  async execute(interaction: ChatInputCommandInteraction) {
    if (!interaction.guild) return;

    const channel = interaction.options.getChannel('salon', true);
    if (channel.type !== ChannelType.GuildVoice) {
      await interaction.reply({ content: '❌ Le salon doit être un salon vocal.', flags: 64 });
      return;
    }

    await interaction.reply({ content: `✅ Connecté au salon vocal ${channel}.`, flags: 64 });
    logger.info(`Rejoint le vocal: ${channel.name}`, 'Vocal');
  }
};