import { SlashCommandBuilder, EmbedBuilder, ChatInputCommandInteraction, PermissionFlagsBits } from 'discord.js';
import { v4 as uuidv4 } from 'uuid';
import { storage } from '../../utils/storage';
import { logger } from '../../utils/logger';
import { logToChannel } from '../../utils/logger';

export default {
  data: new SlashCommandBuilder()
    .setName('modération')
    .setDescription('🛡️ Commandes de modération')
    .addSubcommand(sub => sub
      .setName('historique')
      .setDescription('Voir l\'historique des sanctions')
      .addUserOption(o => o.setName('utilisateur').setDescription('Utilisateur').setRequired(true))),

  async execute(interaction: ChatInputCommandInteraction) {
    if (!interaction.guild) return;
    const subcommand = interaction.options.getSubcommand();

    if (subcommand === 'historique') {
      const user = interaction.options.getUser('utilisateur', true);
      const sanctions = storage.getSanctionsByUser(interaction.guild.id, user.id);

      if (sanctions.length === 0) {
        await interaction.reply({ content: `✅ ${user.tag} n'a aucune sanction.`, ephemeral: true });
        return;
      }

      const embed = new EmbedBuilder()
        .setColor('#ed4245')
        .setTitle(`🛡️ Sanctions de ${user.tag}`)
        .setDescription(sanctions.map(s => {
          const typeMap: Record<string, string> = { ban: '🔨 Bannissement', kick: '👢 Expulsion', mute: '🔇 Mute', warn: '⚠️ Avertissement', unmute: '🔊 Unmute', unban: '🔓 Débannissement' };
          const date = new Date(s.date).toLocaleString('fr-FR');
          return `**${typeMap[s.type] || s.type}** - ${date}\nRaison: ${s.raison}\nModérateur: <@${s.moderateurId}>`;
        }).join('\n\n'))
        .setTimestamp();

      await interaction.reply({ embeds: [embed], ephemeral: true });
    }
  }
};