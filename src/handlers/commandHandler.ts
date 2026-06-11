import { Collection, ChatInputCommandInteraction } from 'discord.js';
import { logger } from '../utils/logger';

export interface BotCommand {
  data: { name: string };
  execute: (interaction: ChatInputCommandInteraction) => Promise<void>;
}

class CommandHandler {
  private commands: Collection<string, BotCommand> = new Collection();

  register(command: BotCommand) {
    this.commands.set(command.data.name, command);
  }

  getCommands(): Collection<string, BotCommand> {
    return this.commands;
  }

  async handleCommand(interaction: ChatInputCommandInteraction): Promise<void> {
    const command = this.commands.get(interaction.commandName);
    if (!command) {
      await interaction.reply({ content: 'Commande inconnue.', ephemeral: true });
      return;
    }
    try {
      await command.execute(interaction);
    } catch (error) {
      logger.error(`Erreur /${interaction.commandName}: ${error}`, 'Commands');
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({ content: 'Erreur lors de l\'execution.', ephemeral: true });
      } else {
        await interaction.reply({ content: 'Erreur lors de l\'execution.', ephemeral: true });
      }
    }
  }
}

export const commandHandler = new CommandHandler();