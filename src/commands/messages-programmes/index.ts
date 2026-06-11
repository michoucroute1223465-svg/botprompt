import { SlashCommandBuilder, EmbedBuilder, ChatInputCommandInteraction } from 'discord.js';
import { v4 as uuidv4 } from 'uuid';
import { storage } from '../../utils/storage';
import { logger } from '../../utils/logger';

export default {
  data: new SlashCommandBuilder()
    .setName('message-programmé')
    .setDescription('📅 Gérer les messages programmés'),

  async execute(interaction: ChatInputCommandInteraction) {
    if (!interaction.guild) return;
    const sub = interaction.options.getSubcommand();

    switch (sub) {
      case 'ajouter': return handleAdd(interaction);
      case 'supprimer': return handleDelete(interaction);
      case 'liste': return handleList(interaction);
    }
  }
};

async function handleAdd(interaction: ChatInputCommandInteraction) {
  if (!interaction.guild) return;
  await interaction.deferReply({ ephemeral: true });

  const salon = interaction.options.getChannel('salon', true);
  const contenu = interaction.options.getString('contenu', true);
  const frequence = interaction.options.getString('fréquence', true) as 'minutes' | 'heures' | 'jours';
  const intervalle = interaction.options.getInteger('intervalle', true);

  const id = uuidv4();
  let intervalMs = intervalle * 60 * 1000;
  if (frequence === 'heures') intervalMs = intervalle * 60 * 60 * 1000;
  if (frequence === 'jours') intervalMs = intervalle * 24 * 60 * 60 * 1000;

  storage.createMessageProgramme(interaction.guild.id, {
    id,
    guildId: interaction.guild.id,
    channelId: salon.id,
    contenu,
    frequence,
    intervalle,
    prochainEnvoi: Date.now() + intervalMs,
    actif: true,
    dernierEnvoi: null
  });

  await interaction.editReply({ content: `✅ Message programmé créé ! Envoi toutes les **${intervalle} ${frequence}** dans ${salon}.` });
  logger.info(`Message programmé créé: ${id}`, 'Messages');
}

async function handleDelete(interaction: ChatInputCommandInteraction) {
  if (!interaction.guild) return;
  const messageId = interaction.options.getString('message-id', true);

  if (!storage.getMessageProgramme(interaction.guild.id, messageId)) {
    await interaction.reply({ content: '❌ Message introuvable.', ephemeral: true });
    return;
  }

  storage.deleteMessageProgramme(interaction.guild.id, messageId);
  await interaction.reply({ content: '✅ Message programmé supprimé.', ephemeral: true });
}

async function handleList(interaction: ChatInputCommandInteraction) {
  if (!interaction.guild) return;
  const messages = storage.getMessagesProgrammes(interaction.guild.id);

  if (messages.length === 0) {
    await interaction.reply({ content: '📭 Aucun message programmé.', ephemeral: true });
    return;
  }

  const embed = new EmbedBuilder()
    .setColor('#5865f2')
    .setTitle('📅 Messages programmés')
    .setDescription(messages.map((m, i) => 
      `**${i + 1}.** ${m.contenu.substring(0, 50)}...\n└ 📍 <#${m.channelId}> • ⏱️ Toutes les ${m.intervalle} ${m.frequence} • ${m.actif ? '🟢 Actif' : '🔴 Inactif'}`
    ).join('\n\n'))
    .setTimestamp();

  await interaction.reply({ embeds: [embed], ephemeral: true });
}