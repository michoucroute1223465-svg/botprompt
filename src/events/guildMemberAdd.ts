import { Events, GuildMember, EmbedBuilder, TextChannel } from 'discord.js';
import { storage } from '../utils/storage';
import { logger } from '../utils/logger';

export default {
  name: Events.GuildMemberAdd,
  once: false,
  async execute(member: GuildMember) {
    try {
      const config = storage.getAeroportConfig(member.guild.id);
      if (!config?.actif || !config.salonArriveeId) return;

      const channel = member.guild.channels.cache.get(config.salonArriveeId) as TextChannel;
      if (!channel) return;

      const message = config.messageArrivee
        .replace(/{utilisateur}/g, `${member}`)
        .replace(/{serveur}/g, member.guild.name)
        .replace(/{membres}/g, `${member.guild.memberCount}`);

      await channel.send(message);
    } catch (error) {
      logger.error(`Erreur événement join: ${error}`, 'Events');
    }
  }
};