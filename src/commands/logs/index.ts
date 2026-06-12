import { SlashCommandBuilder, EmbedBuilder, ChatInputCommandInteraction } from 'discord.js';
import { storage } from '../../utils/storage';
import { logger } from '../../utils/logger';

export default {
  data: new SlashCommandBuilder()
    .setName('logs')
    .setDescription('📋 Système de logs'),

  async execute(interaction: ChatInputCommandInteraction) {
    if (!interaction.guild) return;
    const sub = interaction.options.getSubcommand();

    if (sub === 'configurer') {
      await interaction.deferReply({ flags: 64 });
      const salon = interaction.options.getChannel('salon', true);
      const typesStr = interaction.options.getString('types', true);
      const types = typesStr.split(',').map(t => t.trim()) as any[];

      storage.saveLogConfig(interaction.guild.id, {
        guildId: interaction.guild.id,
        salonId: salon.id,
        types
      });

      await interaction.editReply({ content: `✅ Logs configurés dans ${salon} pour: ${types.join(', ')}` });
      logger.info(`Logs configurés: ${types.join(', ')}`, 'Logs');
    } 
    else if (sub === 'voir') {
      const config = storage.getLogConfig(interaction.guild.id);
      if (!config) {
        await interaction.reply({ content: '❌ Aucune configuration de logs trouvée.', flags: 64 });
        return;
      }

      const embed = new EmbedBuilder()
        .setColor('#5865f2')
        .setTitle('📋 Configuration des logs')
        .addFields(
          { name: '📢 Salon', value: config.salonId ? `<#${config.salonId}>` : '❌ Non configuré', inline: true },
          { name: '📝 Types', value: config.types.map(t => `\`${t}\``).join(', '), inline: true }
        )
        .setTimestamp();

      await interaction.reply({ embeds: [embed], flags: 64 });
    }
  }
};