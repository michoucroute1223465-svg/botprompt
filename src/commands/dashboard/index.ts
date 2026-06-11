import { SlashCommandBuilder, EmbedBuilder, ChatInputCommandInteraction } from 'discord.js';
import { storage } from '../../utils/storage';

export default {
  data: new SlashCommandBuilder()
    .setName('tableau-de-bord')
    .setDescription('📊 Voir le tableau de bord du serveur'),

  async execute(interaction: ChatInputCommandInteraction) {
    if (!interaction.guild) return;

    const stats = storage.getStats(interaction.guild.id);
    const tickets = storage.getTickets(interaction.guild.id);
    const sanctions = storage.getSanctions(interaction.guild.id);
    const messages = storage.getMessagesProgrammes(interaction.guild.id);
    const uptime = process.uptime();
    const jours = Math.floor(uptime / 86400);
    const heures = Math.floor((uptime % 86400) / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    const memUsed = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);

    const embed = new EmbedBuilder()
      .setColor('#5865f2')
      .setTitle(`📊 Tableau de bord - ${interaction.guild.name}`)
      .setThumbnail(interaction.guild.iconURL() || '')
      .addFields(
        { name: '⚙️ Système', value: `⏱️ Uptime: **${jours}j ${heures}h ${minutes}m**\n💾 RAM: **${memUsed} MB**`, inline: false },
        { name: '🎫 Tickets', value: `📊 Total: **${stats.totalTickets}**\n🟢 Ouverts: **${tickets.filter(t => t.statut === 'ouvert').length}**\n🔴 Fermés: **${stats.ticketsFermes}**`, inline: true },
        { name: '🛡️ Modération', value: `📋 Total sanctions: **${sanctions.length}**`, inline: true },
        { name: '🎉 Concours', value: `📋 Total: **${stats.totalConcours}**`, inline: true },
        { name: '📅 Messages programmés', value: `📋 Actifs: **${messages.filter(m => m.actif).length}**`, inline: true }
      )
      .setFooter({ text: 'Premium Bot v1.0.0' })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }
};