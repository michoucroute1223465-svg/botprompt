import { SlashCommandBuilder, ChatInputCommandInteraction, ActivityType } from 'discord.js';
import { logger } from '../../utils/logger';

export default {
  data: new SlashCommandBuilder()
    .setName('activité')
    .setDescription('🎮 Définir l\'activité du bot'),

  async execute(interaction: ChatInputCommandInteraction) {
    const type = interaction.options.getString('type', true) as 'Playing' | 'Watching' | 'Listening' | 'Streaming';
    const nom = interaction.options.getString('nom', true);

    const activityTypeMap: Record<string, ActivityType> = {
      'Playing': ActivityType.Playing,
      'Watching': ActivityType.Watching,
      'Listening': ActivityType.Listening,
      'Streaming': ActivityType.Streaming
    };

    interaction.client.user?.setActivity(nom, { type: activityTypeMap[type] });
    await interaction.reply({ content: `✅ Activité changée: **${type} ${nom}**.`, ephemeral: true });
    logger.info(`Activité changée: ${type} ${nom}`, 'Statut');
  }
};