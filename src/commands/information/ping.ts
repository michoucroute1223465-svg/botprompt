import { SlashCommandBuilder, EmbedBuilder, ChatInputCommandInteraction } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('🏓 Voir la latence du bot'),

  async execute(interaction: ChatInputCommandInteraction) {
    const sent = await interaction.reply({ content: '🏓 Calcul de la latence...', fetchReply: true });
    const roundtrip = sent.createdTimestamp - interaction.createdTimestamp;
    
    const embed = new EmbedBuilder()
      .setColor('#57f287')
      .setTitle('🏓 Pong !')
      .addFields(
        { name: '📡 Latence', value: `${roundtrip}ms`, inline: true },
        { name: '💓 API', value: `${Math.round(interaction.client.ws.ping)}ms`, inline: true }
      )
      .setTimestamp();

    await interaction.editReply({ content: null, embeds: [embed] });
  }
};