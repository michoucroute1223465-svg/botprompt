import { Events, Client, ActivityType } from 'discord.js';
import { logger } from '../utils/logger';
import { storage } from '../utils/storage';
import { checkScheduledMessages } from '../handlers/messageScheduler';

export default {
  name: Events.ClientReady,
  once: true,
  async execute(client: Client) {
    logger.success(`Connecté en tant que ${client.user?.tag}`, 'Client');

    // Statut par défaut
    client.user?.setPresence({
      status: 'online',
      activities: [{
        name: '🎫 Premium Bot',
        type: ActivityType.Playing
      }]
    });

    // Vérification des messages programmés toutes les minutes
    setInterval(() => {
      checkScheduledMessages(client);
    }, 60000);

    logger.info('Système de messages programmés activé', 'Scheduler');
    logger.info('Bot prêt à fonctionner !', 'Client');
  }
};