import { SlashCommandBuilder, EmbedBuilder, ChatInputCommandInteraction, PermissionFlagsBits } from 'discord.js';
import { v4 as uuidv4 } from 'uuid';
import { storage } from '../../utils/storage';
import { logger } from '../../utils/logger';
import { logToChannel } from '../../utils/logger';

export default {
  data: new SlashCommandBuilder()
    .setName('bannir')
    .setDescription('🔨 Bannir un utilisateur du serveur')
    .addUserOption(o => o.setName('utilisateur').setDescription('Utilisateur à bannir').setRequired(true))
    .addStringOption(o => o.setName('raison').setDescription('Raison du bannissement').setRequired(true))
    .addIntegerOption(o => o.setName('messages').setDescription('Supprimer les messages (jours)'))
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

  async execute(interaction: ChatInputCommandInteraction) {
    if (!interaction.guild) return;
    await interaction.deferReply({ flags: 64 });

    const user = interaction.options.getUser('utilisateur', true);
    const raison = interaction.options.getString('raison', true);
    const deleteMessages = interaction.options.getInteger('messages') || 0;
    const member = await interaction.guild.members.fetch(user.id).catch(() => null);

    if (member && !member.bannable) {
      await interaction.editReply({ content: '❌ Je ne peux pas bannir cet utilisateur.' });
      return;
    }

    try {
      await interaction.guild.members.ban(user.id, { reason: raison, deleteMessageSeconds: deleteMessages * 86400 });
    } catch {
      await interaction.editReply({ content: '❌ Erreur lors du bannissement.' });
      return;
    }

    const sanction: any = {
      id: uuidv4(),
      guildId: interaction.guild.id,
      type: 'ban',
      userId: user.id,
      moderateurId: interaction.user.id,
      raison,
      date: Date.now(),
      duree: null,
      actif: true
    };
    storage.createSanction(interaction.guild.id, sanction);
    storage.incrementStats(interaction.guild.id, 'totalSanctions');

    const embed = new EmbedBuilder()
      .setColor('#ed4245')
      .setTitle('🔨 Utilisateur banni')
      .setDescription(`${user.tag} a été banni du serveur.`)
      .addFields(
        { name: 'Utilisateur', value: `${user.tag} (\`${user.id}\`)`, inline: true },
        { name: 'Raison', value: raison, inline: true },
        { name: 'Modérateur', value: `${interaction.user.tag}`, inline: true }
      )
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });

    await logToChannel(interaction.guild, 'moderation', {
      title: '🔨 Bannissement',
      description: `${user.tag} a été banni`,
      color: 0xed4245,
      fields: [
        { name: 'Utilisateur', value: user.tag, inline: true },
        { name: 'Raison', value: raison, inline: true },
        { name: 'Modérateur', value: interaction.user.tag, inline: true }
      ]
    });

    // DM l'utilisateur
    try {
      await user.send({ embeds: [new EmbedBuilder().setColor('#ed4245').setTitle('🔨 Vous avez été banni').setDescription(`**Serveur:** ${interaction.guild.name}\n**Raison:** ${raison}`).setTimestamp()] });
    } catch {}

    logger.info(`Bannissement: ${user.tag} par ${interaction.user.tag}`, 'Modération');
  }
};