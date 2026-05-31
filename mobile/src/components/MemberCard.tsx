import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { CircleMember } from '../types';

type Props = {
  member: CircleMember;
};

export default function MemberCard({ member }: Props) {
  return (
    <View style={styles.card}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>
          {member.displayName?.charAt(0).toUpperCase() ?? '?'}
        </Text>
      </View>
      <View>
        <Text style={styles.name}>{member.displayName}</Text>
        <Text style={styles.joined}>
          Joined {new Date(member.joinedAt).toLocaleDateString()}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 8,
  },
  avatar: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: '#EEF2FF', justifyContent: 'center', alignItems: 'center',
  },
  avatarText: { color: '#4F46E5', fontSize: 18, fontWeight: '700' },
  name: { fontSize: 16, fontWeight: '600', color: '#111827' },
  joined: { fontSize: 12, color: '#9CA3AF', marginTop: 2 },
});
