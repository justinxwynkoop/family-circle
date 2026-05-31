import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  arrayUnion,
  serverTimestamp,
  query,
  where,
  getDocs,
} from 'firebase/firestore';
import { db } from './firebase';
import { Circle, CircleMember } from '../types';

function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function createCircle(ownerId: string, name: string): Promise<Circle> {
  const ref = doc(collection(db, 'circles'));
  const inviteCode = generateCode();
  const now = Date.now();
  const circle: Omit<Circle, 'id'> = {
    name,
    ownerId,
    createdAt: now,
    inviteCode,
    inviteExpiry: now + 24 * 60 * 60 * 1000,
    memberIds: [ownerId],
  };
  await setDoc(ref, circle);
  await setDoc(doc(db, 'circles', ref.id, 'members', ownerId), {
    uid: ownerId,
    joinedAt: serverTimestamp(),
  });
  await updateDoc(doc(db, 'users', ownerId), {
    circleIds: arrayUnion(ref.id),
  });
  return { id: ref.id, ...circle };
}

export async function refreshInviteCode(circleId: string): Promise<string> {
  const code = generateCode();
  await updateDoc(doc(db, 'circles', circleId), {
    inviteCode: code,
    inviteExpiry: Date.now() + 24 * 60 * 60 * 1000,
  });
  return code;
}

export async function joinCircleByCode(userId: string, userDisplayName: string, code: string): Promise<Circle> {
  const q = query(collection(db, 'circles'), where('inviteCode', '==', code));
  const snap = await getDocs(q);

  if (snap.empty) throw new Error('Invalid invite code.');

  const circleDoc = snap.docs[0];
  const circle = { id: circleDoc.id, ...circleDoc.data() } as Circle;

  if (circle.inviteExpiry < Date.now()) throw new Error('Invite code has expired.');
  if (circle.memberIds.includes(userId)) throw new Error('You are already in this circle.');

  await updateDoc(doc(db, 'circles', circle.id), {
    memberIds: arrayUnion(userId),
  });
  await setDoc(doc(db, 'circles', circle.id, 'members', userId), {
    uid: userId,
    displayName: userDisplayName,
    joinedAt: serverTimestamp(),
  });
  await updateDoc(doc(db, 'users', userId), {
    circleIds: arrayUnion(circle.id),
  });

  return circle;
}

export async function getCircle(circleId: string): Promise<Circle | null> {
  const snap = await getDoc(doc(db, 'circles', circleId));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as Circle;
}

export async function getCircleMembers(circleId: string): Promise<CircleMember[]> {
  const snap = await getDocs(collection(db, 'circles', circleId, 'members'));
  return snap.docs.map((d) => d.data() as CircleMember);
}
