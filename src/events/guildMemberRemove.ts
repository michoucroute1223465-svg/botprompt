import { Events, GuildMember, TextChannel } from 'discord.js';
import { storage } from '../utils/storage';
import { logger } from '../utils/logger';

export default {
  name: Events.GuildMemberRemove,
  once: false,
  async execute(member: GuildMember) {
    try {
      const config = storage.getAeroportConfig(member.guild.id);
      if (!config?.actif || !config.salonDepartId) return;

      const channel = member.guild.channels.cache.get(config.salonDepartId) as TextChannel;
      if (!channel) return;

      const message = config.messageDepart.replace(/{utilisateur}/g, `${member.user.tag}`);
      await channel.send(message);
    } catch (error) {
      logger.error(`Erreur événement leave: ${error}`, 'Events');
    }
  }
};