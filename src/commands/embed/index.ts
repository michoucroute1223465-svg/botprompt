import { SlashCommandBuilder, EmbedBuilder, ChatInputCommandInteraction, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { logger } from '../../utils/logger';

export default {
  data: new SlashCommandBuilder()
    .setName('embed')
    .setDescription('📝 Créer un embed personnalisé'),

  async execute(interaction: ChatInputCommandInteraction) {
    if (!interaction.guild) return;
    await interaction.deferReply({ ephemeral: true });

    try {
      const titre = interaction.options.getString('titre', true);
      const description = interaction.options.getString('description', true);
      const couleur = interaction.options.getString('couleur') || '#5865f2';
      const image = interaction.options.getString('image');
      const miniature = interaction.options.getString('miniature');
      const footer = interaction.options.getString('footer');
      const auteur = interaction.options.getString('auteur');

      const embed = new EmbedBuilder()
        .setColor(parseInt(couleur.replace('#', ''), 16))
        .setTitle(titre)
        .setDescription(description)
        .setTimestamp();

      if (image) embed.setImage(image);
      if (miniature) embed.setThumbnail(miniature);
      if (footer) embed.setFooter({ text: footer });
      if (auteur) embed.setAuthor({ name: auteur });

      if (!interaction.channel || !('send' in interaction.channel)) return;
      await (interaction.channel as any).send({ embeds: [embed] });
      await interaction.editReply({ content: '✅ Embed envoyé avec succès !' });
      logger.info(`Embed créé par ${interaction.user.tag}`, 'Embed');
    } catch (error) {
      await interaction.editReply({ content: '❌ Erreur lors de la création de l\'embed.' });
    }
  }
};