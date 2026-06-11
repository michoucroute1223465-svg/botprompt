import { GuildMember, PermissionFlagsBits } from 'discord.js';
import { storage } from './storage';

export function isStaff(member: GuildMember, staffRoleIds: string[]): boolean {
  if (member.id === member.guild.ownerId) return true;
  if (member.permissions.has(PermissionFlagsBits.Administrator)) return true;
  return member.roles.cache.some(role => staffRoleIds.includes(role.id));
}

export function isOwner(member: GuildMember, ownerId: string): boolean {
  return member.id === ownerId || member.id === member.guild.ownerId;
}

export function hasPermission(member: GuildMember, permission: bigint): boolean {
  return member.permissions.has(permission);
}