import { GuildMember, TextChannel, CategoryChannel, Role, User, Message, VoiceChannel } from 'discord.js';

// ==============================
// TYPES DE BASE
// ==============================

export interface BotConfig {
  token: string;
  guildId: string;
  ownerId: string;
  prefix: string;
  statut: StatutConfig;
  activite: ActiviteConfig;
}

export interface StatutConfig {
  type: 'online' | 'idle' | 'dnd' | 'invisible';
  activité: 'Joue' | 'Regarde' | 'Écoute' | 'Stream';
  texte: string;
}

export interface ActiviteConfig {
  type: 'Playing' | 'Watching' | 'Listening' | 'Streaming';
  nom: string;
}

// ==============================
// TYPES DE TICKETS
// ==============================

export interface TicketPanel {
  id: string;
  guildId: string;
  nom: string;
  messageId: string;
  channelId: string;
  categorieId: string;
  couleur: string;
  titre: string;
  description: string;
  emoji: string;
  boutonLibelle: string;
  formulaireId: string | null;
  dateCreation: number;
}

export interface TicketCategorie {
  id: string;
  guildId: string;
  nom: string;
  categorieDiscordId: string;
  roleStaffId: string;
  salonLogsId: string | null;
  messageOuverture: string;
  formulaireId: string | null;
  transcriptActif: boolean;
  dateCreation: number;
}

export interface TicketFormulaire {
  id: string;
  guildId: string;
  nom: string;
  questions: TicketQuestion[];
  dateCreation: number;
}

export interface TicketQuestion {
  id: string;
  label: string;
  obligatoire: boolean;
  type: 'text' | 'paragraph' | 'number';
}

export interface Ticket {
  id: string;
  guildId: string;
  channelId: string;
  categorieId: string;
  panelId: string | null;
  createurId: string;
  membreIds: string[];
  statut: 'ouvert' | 'ferme' | 'supprime';
  priorite: 'basse' | 'normale' | 'haute' | 'urgente';
  sujet: string;
  formulaireId: string | null;
  reponsesFormulaire: { question: string; reponse: string }[];
  dateCreation: number;
  dateFermeture: number | null;
  fermePar: string | null;
  transcriptId: string | null;
  categoryName: string;
}

// ==============================
// TYPES DE SANCTIONS
// ==============================

export interface Sanction {
  id: string;
  guildId: string;
  type: 'ban' | 'unban' | 'kick' | 'mute' | 'unmute' | 'warn' | 'unwarn';
  userId: string;
  moderateurId: string;
  raison: string;
  date: number;
  duree: number | null;
  actif: boolean;
}

// ==============================
// TYPES DE CONCOURS
// ==============================

export interface Concours {
  id: string;
  guildId: string;
  channelId: string;
  messageId: string;
  titre: string;
  lot: string;
  duree: number;
  nbGagnants: number;
  participants: string[];
  dateDebut: number;
  dateFin: number;
  actif: boolean;
  termine: boolean;
  gagnants: string[];
}

// ==============================
// TYPES DE LOGS
// ==============================

export interface LogConfig {
  guildId: string;
  salonId: string | null;
  types: LogType[];
}

export type LogType = 'moderation' | 'messages' | 'vocal' | 'tickets' | 'systeme';

// ==============================
// TYPES DE MESSAGES PROGRAMMÉS
// ==============================

export interface MessageProgramme {
  id: string;
  guildId: string;
  channelId: string;
  contenu: string;
  frequence: 'minutes' | 'heures' | 'jours';
  intervalle: number;
  prochainEnvoi: number;
  actif: boolean;
  dernierEnvoi: number | null;
}

// ==============================
// TYPES DE VOCAL
// ==============================

export interface NotificationVocalConfig {
  guildId: string;
  salonId: string | null;
  messageArrivee: string;
  messageDepart: string;
  actif: boolean;
}

// ==============================
// TYPES D'AÉROPORT
// ==============================

export interface AeroportConfig {
  guildId: string;
  salonArriveeId: string | null;
  salonDepartId: string | null;
  messageArrivee: string;
  messageDepart: string;
  actif: boolean;
}

// ==============================
// TYPES D'EMBED
// ==============================

export interface EmbedConfig {
  titre: string;
  description: string;
  couleur: string;
  image: string | null;
  miniature: string | null;
  footer: string | null;
  auteur: string | null;
  boutonLibelle: string | null;
  boutonUrl: string | null;
}

// ==============================
// TYPES DE PERMISSIONS
// ==============================

export interface PermissionCheck {
  membre: GuildMember | null;
  rolesIds: string[];
  staffRolesIds: string[];
  ownerId: string;
}

// ==============================
// TYPES DE STATISTIQUES
// ==============================

export interface StatsServeur {
  guildId: string;
  totalTickets: number;
  ticketsOuverts: number;
  ticketsFermes: number;
  totalSanctions: number;
  totalConcours: number;
  totalMessagesProgrammes: number;
  derniereMiseAJour: number;
}

// ==============================
// UTILITAIRES
// ==============================

export interface EmbedField {
  name: string;
  value: string;
  inline?: boolean;
}