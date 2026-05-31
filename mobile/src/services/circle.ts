import { supabase } from './supabase';
import { Circle, CircleMember } from '../types';

function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function createCircle(ownerId: string, name: string): Promise<Circle> {
  const inviteCode = generateCode();
  const inviteExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

  const { data: circle, error } = await supabase
    .from('circles')
    .insert({ name, owner_id: ownerId, invite_code: inviteCode, invite_expiry: inviteExpiry, member_ids: [ownerId] })
    .select()
    .single();
  if (error) throw error;

  const { error: memberError } = await supabase
    .from('circle_members')
    .insert({ circle_id: circle.id, user_id: ownerId, display_name: '', joined_at: new Date().toISOString() });
  if (memberError) throw memberError;

  await supabase.rpc('append_circle_id', { user_id: ownerId, circle_id: circle.id });

  return mapCircle(circle);
}

export async function refreshInviteCode(circleId: string): Promise<string> {
  const code = generateCode();
  const { error } = await supabase
    .from('circles')
    .update({ invite_code: code, invite_expiry: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() })
    .eq('id', circleId);
  if (error) throw error;
  return code;
}

export async function joinCircleByCode(userId: string, displayName: string, code: string): Promise<Circle> {
  const { data: circles, error } = await supabase
    .from('circles')
    .select()
    .eq('invite_code', code)
    .single();
  if (error || !circles) throw new Error('Invalid invite code.');

  const circle = mapCircle(circles);
  if (new Date(circles.invite_expiry).getTime() < Date.now()) throw new Error('Invite code has expired.');
  if (circle.memberIds.includes(userId)) throw new Error('You are already in this circle.');

  const { error: updateError } = await supabase.rpc('append_member_id', { circle_id: circle.id, member_id: userId });
  if (updateError) throw updateError;

  const { error: memberError } = await supabase
    .from('circle_members')
    .insert({ circle_id: circle.id, user_id: userId, display_name: displayName, joined_at: new Date().toISOString() });
  if (memberError) throw memberError;

  await supabase.rpc('append_circle_id', { user_id: userId, circle_id: circle.id });

  return circle;
}

export async function getCircle(circleId: string): Promise<Circle | null> {
  const { data, error } = await supabase.from('circles').select().eq('id', circleId).single();
  if (error || !data) return null;
  return mapCircle(data);
}

export async function getCircleMembers(circleId: string): Promise<CircleMember[]> {
  const { data, error } = await supabase.from('circle_members').select().eq('circle_id', circleId);
  if (error || !data) return [];
  return data.map((m: any) => ({
    uid: m.user_id,
    displayName: m.display_name,
    photoURL: m.photo_url ?? undefined,
    joinedAt: new Date(m.joined_at).getTime(),
  }));
}

function mapCircle(row: any): Circle {
  return {
    id: row.id,
    name: row.name,
    ownerId: row.owner_id,
    createdAt: new Date(row.created_at).getTime(),
    inviteCode: row.invite_code,
    inviteExpiry: new Date(row.invite_expiry).getTime(),
    memberIds: row.member_ids ?? [],
  };
}
