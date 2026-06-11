import { Client, TextChannel } from 'discord.js';
import { storage } from '../utils/storage';
import { logger } from '../utils/logger';

export function checkScheduledMessages(client: Client): void {
  try {
    const allMessages = storage.getAllMessagesProgrammes();
    const now = Date.now();

    for (const msg of allMessages) {
      if (!msg.actif) continue;

      if (now >= msg.prochainEnvoi) {
        sendScheduledMessage(client, msg.id, msg.guildId, msg.channelId, msg.contenu);
        
        // Calcul du prochain envoi
        let intervalMs = msg.intervalle * 60 * 1000; // minutes par défaut
        if (msg.frequence === 'heures') intervalMs = msg.intervalle * 60 * 60 * 1000;
        if (msg.frequence === 'jours') intervalMs = msg.intervalle * 24 * 60 * 60 * 1000;

        const prochainEnvoi = now + intervalMs;
        
        storage.updateMessageProgramme(msg.guildId, msg.id, {
          prochainEnvoi,
          dernierEnvoi: now
        });
      }
    }
  } catch (error) {
    logger.error(`Erreur scheduler messages: ${error}`, 'Scheduler');
  }
}

async function sendScheduledMessage(client: Client, messageId: string, guildId: string, channelId: string, content: string): Promise<void> {
  try {
    const guild = client.guilds.cache.get(guildId);
    if (!guild) return;

    const channel = guild.channels.cache.get(channelId) as TextChannel;
    if (!channel) return;

    await channel.send(content);
    logger.info(`Message programmé envoyé: ${messageId}`, 'Scheduler');
  } catch (error) {
    logger.error(`Erreur envoi message programmé ${messageId}: ${error}`, 'Scheduler');
    
    // Désactiver le message si erreur de salon
    storage.updateMessageProgramme(guildId, messageId, { actif: false });
  }
}