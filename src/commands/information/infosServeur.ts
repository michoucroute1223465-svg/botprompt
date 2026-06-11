import { SlashCommandBuilder, EmbedBuilder, ChatInputCommandInteraction } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('infos-serveur')
    .setDescription('📊 Voir les informations du serveur'),

  async execute(interaction: ChatInputCommandInteraction) {
    if (!interaction.guild) return;

    const guild = interaction.guild;
    const owner = await guild.fetchOwner();
    const members = guild.members.cache;
    const channels = guild.channels.cache;
    const roles = guild.roles.cache;
    const boosts = guild.premiumSubscriptionCount || 0;

    const embed = new EmbedBuilder()
      .setColor('#5865f2')
      .setTitle(`📊 ${guild.name}`)
      .setThumbnail(guild.iconURL() || '')
      .addFields(
        { name: '🆔 ID', value: guild.id, inline: true },
        { name: '👑 Propriétaire', value: `${owner.user.tag}`, inline: true },
        { name: '👥 Membres', value: `${members.filter(m => !m.user.bot).size}`, inline: true },
        { name: '🤖 Bots', value: `${members.filter(m => m.user.bot).size}`, inline: true },
        { name: '📁 Salons', value: `${channels.size}`, inline: true },
        { name: '📜 Rôles', value: `${roles.size}`, inline: true },
        { name: '🚀 Boosts', value: `${boosts}`, inline: true },
        { name: '📅 Création', value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:D>`, inline: true }
      )
      .setFooter({ text: `Premium Bot • ${guild.memberCount} membres` })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }
};