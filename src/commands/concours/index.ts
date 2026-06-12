import { SlashCommandBuilder, EmbedBuilder, ChatInputCommandInteraction, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } from 'discord.js';
import { v4 as uuidv4 } from 'uuid';
import { storage } from '../../utils/storage';
import { logger } from '../../utils/logger';

export default {
  data: new SlashCommandBuilder()
    .setName('concours')
    .setDescription('🎉 Gestion des concours'),

  async execute(interaction: ChatInputCommandInteraction) {
    if (!interaction.guild) return;
    const sub = interaction.options.getSubcommand();

    switch (sub) {
      case 'créer': return createConcours(interaction);
      case 'terminer': return endConcours(interaction);
      case 'relancer': return rerollConcours(interaction);
    }
  }
};

async function createConcours(interaction: ChatInputCommandInteraction) {
  if (!interaction.guild) return;
  await interaction.deferReply({ flags: 64 });

  const titre = interaction.options.getString('titre', true);
  const lot = interaction.options.getString('lot', true);
  const duree = interaction.options.getInteger('durée', true);
  const nbGagnants = interaction.options.getInteger('gagnants', true);
  const id = uuidv4();

  const embed = new EmbedBuilder()
    .setColor('#f1c40f')
    .setTitle(`🎉 ${titre}`)
    .setDescription(`**Lot:** ${lot}\n**Gagnants:** ${nbGagnants}\n**Durée:** ${duree} minutes\n\nCliquez sur le bouton 🎉 pour participer !`)
    .setFooter({ text: `ID: ${id}` })
    .setTimestamp(Date.now() + duree * 60000);

  const button = new ButtonBuilder()
    .setCustomId(`giveaway_${id}`)
    .setEmoji('🎉')
    .setStyle(ButtonStyle.Success);

  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(button);
  if (!interaction.channel || !('send' in interaction.channel)) return;
  const channel = interaction.channel as any;
  const msg = await channel.send({ embeds: [embed], components: [row] });
  if (!msg) return;

  storage.createConcours(interaction.guild.id, {
    id,
    guildId: interaction.guild.id,
    channelId: interaction.channelId!,
    messageId: msg.id,
    titre,
    lot,
    duree: duree * 60000,
    nbGagnants,
    participants: [],
    dateDebut: Date.now(),
    dateFin: Date.now() + duree * 60000,
    actif: true,
    termine: false,
    gagnants: []
  });

  await interaction.editReply({ content: `✅ Concours "${titre}" créé !` });
  logger.info(`Concours créé: ${titre} (${id})`, 'Concours');
}

async function endConcours(interaction: ChatInputCommandInteraction) {
  if (!interaction.guild) return;
  const id = interaction.options.getString('concours-id', true);
  const concours = storage.getConcoursById(interaction.guild.id, id);

  if (!concours) {
    await interaction.reply({ content: '❌ Concours introuvable.', flags: 64 });
    return;
  }

  const participants = concours.participants;
  if (participants.length === 0) {
    await interaction.reply({ content: '❌ Aucun participant.', flags: 64 });
    return;
  }

  const gagnants: string[] = [];
  const shuffled = [...participants].sort(() => Math.random() - 0.5);
  for (let i = 0; i < Math.min(concours.nbGagnants, shuffled.length); i++) {
    gagnants.push(shuffled[i]);
  }

  storage.updateConcours(interaction.guild.id, id, { actif: false, termine: true, gagnants });

  const embed = new EmbedBuilder()
    .setColor('#f1c40f')
    .setTitle(`🎉 Concours terminé !`)
    .setDescription(`**${concours.titre}**\n\n**Lot:** ${concours.lot}\n**Gagnants:** ${gagnants.map(g => `<@${g}>`).join(', ')}\n\nFélicitations ! 🎊`)
    .setTimestamp();

  try {
    const channel = interaction.guild.channels.cache.get(concours.channelId) as any;
    if (channel) {
      const msg = await channel.messages.fetch(concours.messageId);
      await msg.edit({ embeds: [embed], components: [] });
    }
  } catch {}

  await interaction.reply({ content: `✅ Concours terminé ! Gagnants: ${gagnants.map(g => `<@${g}>`).join(', ')}`, ephemeral: false });
}

async function rerollConcours(interaction: ChatInputCommandInteraction) {
  if (!interaction.guild) return;
  const id = interaction.options.getString('concours-id', true);
  const concours = storage.getConcoursById(interaction.guild.id, id);

  if (!concours || !concours.termine) {
    await interaction.reply({ content: '❌ Concours introuvable ou pas encore terminé.', flags: 64 });
    return;
  }

  const participants = concours.participants.filter(p => !concours.gagnants.includes(p));
  if (participants.length === 0) {
    await interaction.reply({ content: '❌ Aucun nouveau participant disponible.', flags: 64 });
    return;
  }

  const newWinner = participants[Math.floor(Math.random() * participants.length)];
  concours.gagnants.push(newWinner);
  storage.updateConcours(interaction.guild.id, id, { gagnants: concours.gagnants });

  await interaction.reply({ content: `🎉 Nouveau gagnant: <@${newWinner}> !`, ephemeral: false });
}