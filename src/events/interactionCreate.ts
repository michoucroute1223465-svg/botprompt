import { Events, Interaction } from 'discord.js';
import { commandHandler } from '../handlers/commandHandler';
import { routeInteraction } from '../handlers/interactionRouter';
import { logger } from '../utils/logger';

export default {
  name: Events.InteractionCreate,
  once: false,
  async execute(interaction: Interaction) {
    try {
      // Commandes slash -> commandHandler
      if (interaction.isChatInputCommand()) {
        const cmd = interaction.commandName;
        
        // Commandes speciales du menu
        if (['menu', 'ping', 'infos', 'dashboard', 'aeroport'].includes(cmd)) {
          await routeInteraction(interaction as any);
          return;
        }
        
        // Toutes les autres commandes -> commandHandler
        await commandHandler.handleCommand(interaction);
        return;
      }
      
      // Boutons -> routeur
      if (interaction.isButton()) {
        await routeInteraction(interaction as any);
        return;
      }
      
      // Modals -> routeur
      if (interaction.isModalSubmit()) {
        await routeInteraction(interaction as any);
        return;
      }
    } catch (error) {
      logger.error(`Erreur interaction: ${error}`, 'Events');
    }
  }
};