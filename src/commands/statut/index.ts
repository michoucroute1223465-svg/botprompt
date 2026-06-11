import { SlashCommandBuilder, ChatInputCommandInteraction, ActivityType } from 'discord.js';
import { logger } from '../../utils/logger';

export default {
  data: new SlashCommandBuilder()
    .setName('statut')
    .setDescription('⚙️ Définir le statut du bot'),

  async execute(interaction: ChatInputCommandInteraction) {
    const type = interaction.options.getString('type', true) as 'online' | 'idle' | 'dnd' | 'invisible';
    interaction.client.user?.setStatus(type);
    await interaction.reply({ content: `✅ Statut changé en **${type}**.`, ephemeral: true });
    logger.info(`Statut changé: ${type}`, 'Statut');
  }
};