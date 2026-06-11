import chalk from 'chalk';
import { TextChannel, Guild } from 'discord.js';
import { storage } from './storage';

export enum LogLevel {
  INFO = 'INFO',
  SUCCESS = 'SUCCESS',
  WARN = 'WARN',
  ERROR = 'ERROR',
  DEBUG = 'DEBUG'
}

const colors: Record<LogLevel, any> = {
  [LogLevel.INFO]: chalk.blue,
  [LogLevel.SUCCESS]: chalk.green,
  [LogLevel.WARN]: chalk.yellow,
  [LogLevel.ERROR]: chalk.red,
  [LogLevel.DEBUG]: chalk.gray
};

const icons: Record<LogLevel, string> = {
  [LogLevel.INFO]: 'ℹ',
  [LogLevel.SUCCESS]: '✓',
  [LogLevel.WARN]: '⚠',
  [LogLevel.ERROR]: '✗',
  [LogLevel.DEBUG]: '🔍'
};

export function log(level: LogLevel, message: string, context?: string): void {
  const timestamp = new Date().toLocaleString('fr-FR', { timeZone: 'Europe/Paris' });
  const prefix = context ? `[${context}]` : '';
  const color = colors[level];
  const icon = icons[level];
  console.log(`${chalk.gray(timestamp)} ${color(`${icon} [${level}]`)} ${chalk.white(prefix)} ${message}`);
}

export async function logToChannel(
  guild: Guild,
  type: 'moderation' | 'messages' | 'vocal' | 'tickets' | 'systeme',
  embed: { title: string; description: string; color?: number; fields?: { name: string; value: string; inline?: boolean }[] }
): Promise<void> {
  try {
    const config = storage.getLogConfig(guild.id);
    if (!config || !config.salonId || !config.types.includes(type)) return;

    const channel = guild.channels.cache.get(config.salonId) as TextChannel;
    if (!channel) return;

    const { EmbedBuilder } = require('discord.js');
    const logEmbed = new EmbedBuilder()
      .setTitle(embed.title)
      .setDescription(embed.description)
      .setColor(embed.color || 0x2b2d31)
      .setTimestamp();

    if (embed.fields) {
      logEmbed.addFields(embed.fields);
    }

    logEmbed.setFooter({ text: `Type: ${type}` });

    await channel.send({ embeds: [logEmbed] });
  } catch (error) {
    log(LogLevel.ERROR, `Erreur lors de l'envoi du log: ${error}`, 'Logger');
  }
}

export const logger = {
  info: (message: string, context?: string) => log(LogLevel.INFO, message, context),
  success: (message: string, context?: string) => log(LogLevel.SUCCESS, message, context),
  warn: (message: string, context?: string) => log(LogLevel.WARN, message, context),
  error: (message: string, context?: string) => log(LogLevel.ERROR, message, context),
  debug: (message: string, context?: string) => log(LogLevel.DEBUG, message, context),
  channel: logToChannel
};