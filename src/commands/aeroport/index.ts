import { SlashCommandBuilder, EmbedBuilder, ChatInputCommandInteraction } from 'discord.js';
import { storage } from '../../utils/storage';
import { logger } from '../../utils/logger';

export default {
  data: new SlashCommandBuilder()
    .setName('aéroport')
    .setDescription('🛫 Système de bienvenue/départ'),

  async execute(interaction: ChatInputCommandInteraction) {
    if (!interaction.guild) return;
    const sub = interaction.options.getSubcommand();

    if (sub === 'arrivée') {
      await interaction.deferReply({ flags: 64 });
      const salon = interaction.options.getChannel('salon', true);
      const message = interaction.options.getString('message') || 'Bienvenue {utilisateur} sur {serveur} ! ({membres} membres)';
      
      const config = storage.getAeroportConfig(interaction.guild.id);
      config.salonArriveeId = salon.id;
      config.messageArrivee = message;
      config.actif = true;
      storage.saveAeroportConfig(interaction.guild.id, config);
      
      await interaction.editReply({ content: `✅ Salon d'arrivée configuré: ${salon}` });
    } 
    else if (sub === 'départ') {
      await interaction.deferReply({ flags: 64 });
      const salon = interaction.options.getChannel('salon', true);
      const message = interaction.options.getString('message') || '{utilisateur} nous a quitté.';
      
      const config = storage.getAeroportConfig(interaction.guild.id);
      config.salonDepartId = salon.id;
      config.messageDepart = message;
      config.actif = true;
      storage.saveAeroportConfig(interaction.guild.id, config);
      
      await interaction.editReply({ content: `✅ Salon de départ configuré: ${salon}` });
    } 
    else if (sub === 'voir') {
      const config = storage.getAeroportConfig(interaction.guild.id);
      const embed = new EmbedBuilder()
        .setColor('#5865f2')
        .setTitle('🛫 Configuration Aéroport')
        .addFields(
          { name: '🟢 Arrivée', value: config.salonArriveeId ? `<#${config.salonArriveeId}>` : '❌ Non configuré', inline: true },
          { name: '🔴 Départ', value: config.salonDepartId ? `<#${config.salonDepartId}>` : '❌ Non configuré', inline: true },
          { name: '📝 Message arrivée', value: config.messageArrivee, inline: false },
          { name: '📝 Message départ', value: config.messageDepart, inline: false },
          { name: '⚡ Actif', value: config.actif ? '✅ Oui' : '❌ Non', inline: true }
        )
        .setTimestamp();
      await interaction.reply({ embeds: [embed], flags: 64 });
    }
  }
};