import * as fs from 'fs';
import * as path from 'path';
import { TextChannel, Message, Guild, User, EmbedBuilder } from 'discord.js';
import { v4 as uuidv4 } from 'uuid';
import { logger } from './logger';
import { storage } from './storage';

export class TranscriptGenerator {
  async generate(guild: Guild, channel: TextChannel, closeur: User): Promise<string | null> {
    try {
      const messages = await channel.messages.fetch({ limit: 100 });
      const msgs = messages.reverse();
      
      const transcriptId = uuidv4();
      const guildName = guild.name.replace(/[^a-zA-Z0-9]/g, '_');
      const channelName = channel.name.replace(/[^a-zA-Z0-9]/g, '_');
      const date = new Date().toISOString().replace(/[:.]/g, '-');
      
      const dir = path.join(__dirname, '../../data/transcripts');
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      
      const html = this.buildHTML(guild, channel, msgs, closeur);
      const htmlPath = path.join(dir, `${transcriptId}.html`);
      
      const text = this.buildText(guild, channel, msgs, closeur);
      const textPath = path.join(dir, `${transcriptId}.txt`);
      
      fs.writeFileSync(htmlPath, html, 'utf-8');
      fs.writeFileSync(textPath, text, 'utf-8');
      
      // Sauvegarde du transcript dans les données
      const ticket = storage.getTicket(guild.id, channel.id);
      if (ticket) {
        storage.updateTicket(guild.id, channel.id, { transcriptId });
      }
      
      return transcriptId;
    } catch (error) {
      logger.error(`Erreur génération transcript: ${error}`, 'Transcript');
      return null;
    }
  }

  private buildHTML(guild: Guild, channel: TextChannel, messages: Map<string, Message>, closeur: User): string {
    const messageHtml = Array.from(messages.values()).map(msg => {
      const date = new Date(msg.createdTimestamp).toLocaleString('fr-FR');
      const content = msg.content ? this.escapeHtml(msg.content) : '';
      const attachments = msg.attachments.map(a => `<a href="${a.url}" target="_blank">📎 ${a.name}</a>`).join('<br>');
      
      return `
        <div class="message">
          <div class="message-header">
            <span class="author" style="color: ${msg.member?.displayHexColor || '#5865f2'}">${this.escapeHtml(msg.author.tag)}</span>
            <span class="date">${date}</span>
          </div>
          <div class="message-content">
            ${content}
            ${attachments}
          </div>
        </div>
      `;
    }).join('\n');

    return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Transcript - ${this.escapeHtml(channel.name)}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #1e1e2e; color: #cdd6f4; padding: 20px; }
    .header { background: #181825; border-radius: 8px; padding: 20px; margin-bottom: 20px; border-left: 4px solid #89b4fa; }
    .header h1 { color: #89b4fa; font-size: 24px; }
    .header p { color: #a6adc8; margin-top: 5px; }
    .message { background: #181825; border-radius: 8px; padding: 15px; margin-bottom: 10px; }
    .message-header { display: flex; justify-content: space-between; margin-bottom: 8px; }
    .author { font-weight: bold; }
    .date { color: #6c7086; font-size: 12px; }
    .message-content { line-height: 1.6; }
    .footer { margin-top: 30px; padding: 15px; background: #181825; border-radius: 8px; text-align: center; color: #6c7086; font-size: 12px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>📋 Transcript - ${this.escapeHtml(channel.name)}</h1>
    <p>Serveur: ${this.escapeHtml(guild.name)} | Fermé par: ${this.escapeHtml(closeur.tag)} | ${new Date().toLocaleString('fr-FR')}</p>
    <p>Total messages: ${messages.size}</p>
  </div>
  ${messageHtml}
  <div class="footer">
    Transcript généré automatiquement • Premium Bot
  </div>
</body>
</html>`;
  }

  private buildText(guild: Guild, channel: TextChannel, messages: Map<string, Message>, closeur: User): string {
    const lines: string[] = [
      `=== TRANSCRIPT - ${channel.name} ===`,
      `Serveur: ${guild.name}`,
      `Fermé par: ${closeur.tag}`,
      `Date: ${new Date().toLocaleString('fr-FR')}`,
      `Total messages: ${messages.size}`,
      '='.repeat(50),
      ''
    ];

    for (const [, msg] of messages) {
      const date = new Date(msg.createdTimestamp).toLocaleString('fr-FR');
      lines.push(`[${date}] ${msg.author.tag}: ${msg.content}`);
      for (const att of msg.attachments.values()) {
        lines.push(`  📎 ${att.url}`);
      }
    }

    lines.push('');
    lines.push('='.repeat(50));
    lines.push('Fin du transcript • Premium Bot');

    return lines.join('\n');
  }

  getTranscriptPath(transcriptId: string): { html: string; text: string } | null {
    const dir = path.join(__dirname, '../../data/transcripts');
    const htmlPath = path.join(dir, `${transcriptId}.html`);
    const textPath = path.join(dir, `${transcriptId}.txt`);
    
    if (fs.existsSync(htmlPath) && fs.existsSync(textPath)) {
      return { html: htmlPath, text: textPath };
    }
    return null;
  }

  async sendTranscript(transcriptId: string, user: User): Promise<boolean> {
    try {
      const paths = this.getTranscriptPath(transcriptId);
      if (!paths) return false;

      await user.send({
        files: [
          { attachment: paths.html, name: `transcript-${transcriptId}.html` },
          { attachment: paths.text, name: `transcript-${transcriptId}.txt` }
        ]
      });
      return true;
    } catch {
      return false;
    }
  }

  private escapeHtml(text: string): string {
    return text
      .replace(/&/g, '&')
      .replace(/</g, '<')
      .replace(/>/g, '>')
      .replace(/"/g, '"')
      .replace(/'/g, '&#039;');
  }
}

export const transcriptGenerator = new TranscriptGenerator();