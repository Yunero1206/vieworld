import type { AppState, Membership } from '../domain/types';
export const MEMBERSHIP_MILESTONES = [0, 1, 3, 6, 12] as const;
/** Current membership period only; legacy records with no start date do not invent tenure. */
export function membershipTenure(member: Membership | undefined, now: string): number | null {
  if (!member || member.status !== 'active' || (member.expiresAt && Date.parse(member.expiresAt) <= Date.parse(now))) return null;
  const start = member.startedAt && new Date(member.startedAt);
  const end = new Date(now);
  if (!start || !Number.isFinite(start.getTime()) || !Number.isFinite(end.getTime()) || start > end) return -1;
  return Math.max(0, (end.getUTCFullYear() - start.getUTCFullYear()) * 12 + end.getUTCMonth() - start.getUTCMonth() - Number(end.getUTCDate() < start.getUTCDate()));
}
export function memberForChat(state: AppState, artistId: string, fanId: string) {
  return Object.values(state.memberships).find(member => member.tenantId === state.activeTenantId && member.worldId === artistId && member.fanId === fanId);
}
