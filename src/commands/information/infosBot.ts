import { SlashCommandBuilder, EmbedBuilder, ChatInputCommandInteraction, version } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('infos-bot')
    .setDescription('🤖 Voir les informations du bot'),

  async execute(interaction: ChatInputCommandInteraction) {
    const client = interaction.client;
    const uptime = process.uptime();
    const jours = Math.floor(uptime / 86400);
    const heures = Math.floor((uptime % 86400) / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);

    const embed = new EmbedBuilder()
      .setColor('#5865f2')
      .setTitle('🤖 Informations du bot')
      .setThumbnail(client.user?.displayAvatarURL() || '')
      .addFields(
        { name: '📝 Nom', value: client.user?.tag || 'Inconnu', inline: true },
        { name: '🆔 ID', value: client.user?.id || 'Inconnu', inline: true },
        { name: '📊 Serveurs', value: `${client.guilds.cache.size}`, inline: true },
        { name: '👥 Utilisateurs', value: `${client.users.cache.size}`, inline: true },
        { name: '⏱️ Uptime', value: `${jours}j ${heures}h ${minutes}m`, inline: true },
        { name: '📦 Discord.js', value: `v${version}`, inline: true },
        { name: '🔧 Node.js', value: process.version, inline: true }
      )
      .setFooter({ text: 'Premium Bot v1.0.0' })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }
};