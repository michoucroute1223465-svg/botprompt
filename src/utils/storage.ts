import * as fs from 'fs';
import * as path from 'path';
import {
  TicketPanel,
  TicketCategorie,
  TicketFormulaire,
  Ticket,
  Sanction,
  Concours,
  LogConfig,
  MessageProgramme,
  NotificationVocalConfig,
  AeroportConfig,
  StatsServeur
} from '../types';

export class Storage {
  private basePath: string;

  constructor() {
    this.basePath = path.join(__dirname, '../../data');
    this.ensureDirectories();
  }

  private ensureDirectories(): void {
    const dirs = [
      'tickets',
      'sanctions',
      'concours',
      'messages',
      'panels',
      'logs',
      'vocal',
      'aeroport'
    ];
    for (const dir of dirs) {
      const dirPath = path.join(this.basePath, dir);
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }
    }
  }

  private getFilePath(type: string, guildId: string): string {
    const dir = path.join(this.basePath, type);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    return path.join(dir, `${guildId}.json`);
  }

  public readJSON<T>(filePath: string, defaultValue: T): T {
    try {
      if (!fs.existsSync(filePath)) {
        return defaultValue;
      }
      const data = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(data) as T;
    } catch {
      return defaultValue;
    }
  }

  public writeJSON<T>(filePath: string, data: T): void {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  }

  // ==============================
  // TICKETS
  // ==============================

  getTickets(guildId: string): Ticket[] {
    return this.readJSON<Ticket[]>(this.getFilePath('tickets', guildId), []);
  }

  saveTickets(guildId: string, tickets: Ticket[]): void {
    this.writeJSON(this.getFilePath('tickets', guildId), tickets);
  }

  getTicket(guildId: string, channelId: string): Ticket | null {
    const tickets = this.getTickets(guildId);
    return tickets.find(t => t.channelId === channelId) || null;
  }

  createTicket(guildId: string, ticket: Ticket): void {
    const tickets = this.getTickets(guildId);
    tickets.push(ticket);
    this.saveTickets(guildId, tickets);
  }

  updateTicket(guildId: string, channelId: string, updates: Partial<Ticket>): Ticket | null {
    const tickets = this.getTickets(guildId);
    const index = tickets.findIndex(t => t.channelId === channelId);
    if (index === -1) return null;
    tickets[index] = { ...tickets[index], ...updates };
    this.saveTickets(guildId, tickets);
    return tickets[index];
  }

  deleteTicket(guildId: string, channelId: string): boolean {
    const tickets = this.getTickets(guildId);
    const index = tickets.findIndex(t => t.channelId === channelId);
    if (index === -1) return false;
    tickets.splice(index, 1);
    this.saveTickets(guildId, tickets);
    return true;
  }

  // ==============================
  // PANELS
  // ==============================

  getPanels(guildId: string): TicketPanel[] {
    return this.readJSON<TicketPanel[]>(this.getFilePath('panels', guildId), []);
  }

  savePanels(guildId: string, panels: TicketPanel[]): void {
    this.writeJSON(this.getFilePath('panels', guildId), panels);
  }

  getPanel(guildId: string, panelId: string): TicketPanel | null {
    const panels = this.getPanels(guildId);
    return panels.find(p => p.id === panelId) || null;
  }

  createPanel(guildId: string, panel: TicketPanel): void {
    const panels = this.getPanels(guildId);
    panels.push(panel);
    this.savePanels(guildId, panels);
  }

  updatePanel(guildId: string, panelId: string, updates: Partial<TicketPanel>): TicketPanel | null {
    const panels = this.getPanels(guildId);
    const index = panels.findIndex(p => p.id === panelId);
    if (index === -1) return null;
    panels[index] = { ...panels[index], ...updates };
    this.savePanels(guildId, panels);
    return panels[index];
  }

  deletePanel(guildId: string, panelId: string): boolean {
    const panels = this.getPanels(guildId);
    const index = panels.findIndex(p => p.id === panelId);
    if (index === -1) return false;
    panels.splice(index, 1);
    this.savePanels(guildId, panels);
    return true;
  }

  getPanelByMessage(guildId: string, messageId: string): TicketPanel | null {
    const panels = this.getPanels(guildId);
    return panels.find(p => p.messageId === messageId) || null;
  }

  // ==============================
  // CATÉGORIES DE TICKETS
  // ==============================

  getCategories(guildId: string): TicketCategorie[] {
    return this.readJSON<TicketCategorie[]>(this.getFilePath('categories', guildId), []);
  }

  saveCategories(guildId: string, categories: TicketCategorie[]): void {
    this.writeJSON(this.getFilePath('categories', guildId), categories);
  }

  getCategory(guildId: string, categorieId: string): TicketCategorie | null {
    const categories = this.getCategories(guildId);
    return categories.find(c => c.id === categorieId) || null;
  }

  createCategory(guildId: string, category: TicketCategorie): void {
    const categories = this.getCategories(guildId);
    categories.push(category);
    this.saveCategories(guildId, categories);
  }

  updateCategory(guildId: string, categorieId: string, updates: Partial<TicketCategorie>): TicketCategorie | null {
    const categories = this.getCategories(guildId);
    const index = categories.findIndex(c => c.id === categorieId);
    if (index === -1) return null;
    categories[index] = { ...categories[index], ...updates };
    this.saveCategories(guildId, categories);
    return categories[index];
  }

  deleteCategory(guildId: string, categorieId: string): boolean {
    const categories = this.getCategories(guildId);
    const index = categories.findIndex(c => c.id === categorieId);
    if (index === -1) return false;
    categories.splice(index, 1);
    this.saveCategories(guildId, categories);
    return true;
  }

  // ==============================
  // FORMULAIRES
  // ==============================

  getFormulaires(guildId: string): TicketFormulaire[] {
    return this.readJSON<TicketFormulaire[]>(this.getFilePath('formulaires', guildId), []);
  }

  saveFormulaires(guildId: string, formulaires: TicketFormulaire[]): void {
    this.writeJSON(this.getFilePath('formulaires', guildId), formulaires);
  }

  getFormulaire(guildId: string, formulaireId: string): TicketFormulaire | null {
    const formulaires = this.getFormulaires(guildId);
    return formulaires.find(f => f.id === formulaireId) || null;
  }

  createFormulaire(guildId: string, formulaire: TicketFormulaire): void {
    const formulaires = this.getFormulaires(guildId);
    formulaires.push(formulaire);
    this.saveFormulaires(guildId, formulaires);
  }

  updateFormulaire(guildId: string, formulaireId: string, updates: Partial<TicketFormulaire>): TicketFormulaire | null {
    const formulaires = this.getFormulaires(guildId);
    const index = formulaires.findIndex(f => f.id === formulaireId);
    if (index === -1) return null;
    formulaires[index] = { ...formulaires[index], ...updates };
    this.saveFormulaires(guildId, formulaires);
    return formulaires[index];
  }

  deleteFormulaire(guildId: string, formulaireId: string): boolean {
    const formulaires = this.getFormulaires(guildId);
    const index = formulaires.findIndex(f => f.id === formulaireId);
    if (index === -1) return false;
    formulaires.splice(index, 1);
    this.saveFormulaires(guildId, formulaires);
    return true;
  }

  // ==============================
  // SANCTIONS
  // ==============================

  getSanctions(guildId: string): Sanction[] {
    return this.readJSON<Sanction[]>(this.getFilePath('sanctions', guildId), []);
  }

  saveSanctions(guildId: string, sanctions: Sanction[]): void {
    this.writeJSON(this.getFilePath('sanctions', guildId), sanctions);
  }

  createSanction(guildId: string, sanction: Sanction): void {
    const sanctions = this.getSanctions(guildId);
    sanctions.push(sanction);
    this.saveSanctions(guildId, sanctions);
  }

  getSanctionsByUser(guildId: string, userId: string): Sanction[] {
    const sanctions = this.getSanctions(guildId);
    return sanctions.filter(s => s.userId === userId);
  }

  getSanctionById(guildId: string, sanctionId: string): Sanction | null {
    const sanctions = this.getSanctions(guildId);
    return sanctions.find(s => s.id === sanctionId) || null;
  }

  updateSanction(guildId: string, sanctionId: string, updates: Partial<Sanction>): Sanction | null {
    const sanctions = this.getSanctions(guildId);
    const index = sanctions.findIndex(s => s.id === sanctionId);
    if (index === -1) return null;
    sanctions[index] = { ...sanctions[index], ...updates };
    this.saveSanctions(guildId, sanctions);
    return sanctions[index];
  }

  // ==============================
  // CONCOURS
  // ==============================

  getConcours(guildId: string): Concours[] {
    return this.readJSON<Concours[]>(this.getFilePath('concours', guildId), []);
  }

  saveConcours(guildId: string, concours: Concours[]): void {
    this.writeJSON(this.getFilePath('concours', guildId), concours);
  }

  getConcoursActifs(guildId: string): Concours[] {
    return this.getConcours(guildId).filter(c => c.actif && !c.termine);
  }

  getConcoursById(guildId: string, concoursId: string): Concours | null {
    const concours = this.getConcours(guildId);
    return concours.find(c => c.id === concoursId) || null;
  }

  createConcours(guildId: string, concours: Concours): void {
    const list = this.getConcours(guildId);
    list.push(concours);
    this.saveConcours(guildId, list);
  }

  updateConcours(guildId: string, concoursId: string, updates: Partial<Concours>): Concours | null {
    const list = this.getConcours(guildId);
    const index = list.findIndex(c => c.id === concoursId);
    if (index === -1) return null;
    list[index] = { ...list[index], ...updates };
    this.saveConcours(guildId, list);
    return list[index];
  }

  // ==============================
  // LOGS
  // ==============================

  getLogConfig(guildId: string): LogConfig | null {
    const configs = this.readJSON<Record<string, LogConfig>>(
      this.getFilePath('logs', 'config'),
      {}
    );
    return configs[guildId] || null;
  }

  saveLogConfig(guildId: string, config: LogConfig): void {
    const configs = this.readJSON<Record<string, LogConfig>>(
      this.getFilePath('logs', 'config'),
      {}
    );
    configs[guildId] = config;
    this.writeJSON(this.getFilePath('logs', 'config'), configs);
  }

  // ==============================
  // MESSAGES PROGRAMMÉS
  // ==============================

  getMessagesProgrammes(guildId: string): MessageProgramme[] {
    return this.readJSON<MessageProgramme[]>(this.getFilePath('messages', guildId), []);
  }

  saveMessagesProgrammes(guildId: string, messages: MessageProgramme[]): void {
    this.writeJSON(this.getFilePath('messages', guildId), messages);
  }

  getMessageProgramme(guildId: string, messageId: string): MessageProgramme | null {
    const messages = this.getMessagesProgrammes(guildId);
    return messages.find(m => m.id === messageId) || null;
  }

  createMessageProgramme(guildId: string, message: MessageProgramme): void {
    const messages = this.getMessagesProgrammes(guildId);
    messages.push(message);
    this.saveMessagesProgrammes(guildId, messages);
  }

  updateMessageProgramme(guildId: string, messageId: string, updates: Partial<MessageProgramme>): MessageProgramme | null {
    const messages = this.getMessagesProgrammes(guildId);
    const index = messages.findIndex(m => m.id === messageId);
    if (index === -1) return null;
    messages[index] = { ...messages[index], ...updates };
    this.saveMessagesProgrammes(guildId, messages);
    return messages[index];
  }

  deleteMessageProgramme(guildId: string, messageId: string): boolean {
    const messages = this.getMessagesProgrammes(guildId);
    const index = messages.findIndex(m => m.id === messageId);
    if (index === -1) return false;
    messages.splice(index, 1);
    this.saveMessagesProgrammes(guildId, messages);
    return true;
  }

  getAllMessagesProgrammes(): MessageProgramme[] {
    const dir = path.join(this.basePath, 'messages');
    if (!fs.existsSync(dir)) return [];
    const files = fs.readdirSync(dir).filter(f => f.endsWith('.json'));
    const all: MessageProgramme[] = [];
    for (const file of files) {
      const data = this.readJSON<MessageProgramme[]>(
        path.join(dir, file),
        []
      );
      all.push(...data);
    }
    return all;
  }

  // ==============================
  // VOCAL
  // ==============================

  getNotificationVocalConfig(guildId: string): NotificationVocalConfig {
    const configs = this.readJSON<Record<string, NotificationVocalConfig>>(
      this.getFilePath('vocal', 'config'),
      {}
    );
    return configs[guildId] || {
      guildId,
      salonId: null,
      messageArrivee: '{utilisateur} a rejoint le vocal.',
      messageDepart: '{utilisateur} a quitté le vocal.',
      actif: false
    };
  }

  saveNotificationVocalConfig(guildId: string, config: NotificationVocalConfig): void {
    const configs = this.readJSON<Record<string, NotificationVocalConfig>>(
      this.getFilePath('vocal', 'config'),
      {}
    );
    configs[guildId] = config;
    this.writeJSON(this.getFilePath('vocal', 'config'), configs);
  }

  // ==============================
  // AÉROPORT
  // ==============================

  getAeroportConfig(guildId: string): AeroportConfig {
    const configs = this.readJSON<Record<string, AeroportConfig>>(
      this.getFilePath('aeroport', 'config'),
      {}
    );
    return configs[guildId] || {
      guildId,
      salonArriveeId: null,
      salonDepartId: null,
      messageArrivee: 'Bienvenue {utilisateur} sur {serveur} ! ({membres} membres)',
      messageDepart: '{utilisateur} nous a quitté.',
      actif: false
    };
  }

  saveAeroportConfig(guildId: string, config: AeroportConfig): void {
    const configs = this.readJSON<Record<string, AeroportConfig>>(
      this.getFilePath('aeroport', 'config'),
      {}
    );
    configs[guildId] = config;
    this.writeJSON(this.getFilePath('aeroport', 'config'), configs);
  }

  // ==============================
  // STATISTIQUES
  // ==============================

  getStats(guildId: string): StatsServeur {
    return this.readJSON<StatsServeur>(
      this.getFilePath('stats', guildId),
      {
        guildId,
        totalTickets: 0,
        ticketsOuverts: 0,
        ticketsFermes: 0,
        totalSanctions: 0,
        totalConcours: 0,
        totalMessagesProgrammes: 0,
        derniereMiseAJour: Date.now()
      }
    );
  }

  saveStats(guildId: string, stats: StatsServeur): void {
    stats.derniereMiseAJour = Date.now();
    this.writeJSON(this.getFilePath('stats', guildId), stats);
  }

  incrementStats(guildId: string, field: keyof StatsServeur): void {
    const stats = this.getStats(guildId);
    if (typeof stats[field] === 'number') {
      (stats as any)[field]++;
    }
    this.saveStats(guildId, stats);
  }
}

export const storage = new Storage();