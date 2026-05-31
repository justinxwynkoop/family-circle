import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  FlatList, StyleSheet, Alert, Share,
} from 'react-native';
import * as SMS from 'expo-sms';
import { useAuth } from '../../hooks/useAuth';
import { useCircle } from '../../hooks/useCircle';
import { createCircle, joinCircleByCode, refreshInviteCode, getCircleMembers } from '../../services/circle';
import { CircleMember } from '../../types';
import MemberCard from '../../components/MemberCard';

export default function CircleScreen() {
  const { user } = useAuth();
  const circleId = user?.circleIds?.[0] ?? null;
  const { circle, loading } = useCircle(circleId);
  const [members, setMembers] = useState<CircleMember[]>([]);
  const [circleName, setCircleName] = useState('');
  const [inviteCode, setInviteCode] = useState('');

  useEffect(() => {
    if (circleId) {
      getCircleMembers(circleId).then(setMembers);
    }
  }, [circleId]);

  async function handleCreate() {
    if (!circleName.trim() || !user) return;
    try {
      await createCircle(user.uid, circleName.trim());
      Alert.alert('Circle created!', `"${circleName}" is ready. Invite your family from here.`);
    } catch (err: any) {
      Alert.alert('Error', err.message);
    }
  }

  async function handleJoin() {
    if (!inviteCode.trim() || !user) return;
    try {
      await joinCircleByCode(user.uid, user.displayName, inviteCode.trim());
      Alert.alert('Joined!', 'You are now part of the circle.');
    } catch (err: any) {
      Alert.alert('Error', err.message);
    }
  }

  async function handleSendInvite() {
    if (!circle) return;
    const available = await SMS.isAvailableAsync();
    const message = `Join my FamilyCircle! Enter code: ${circle.inviteCode} in the app. Valid for 24 hours.`;
    if (available) {
      await SMS.sendSMSAsync([], message);
    } else {
      await Share.share({ message });
    }
  }

  async function handleRefreshCode() {
    if (!circle) return;
    const code = await refreshInviteCode(circle.id);
    Alert.alert('New code generated', `New invite code: ${code}`);
  }

  if (loading) return null;

  if (!circleId || !circle) {
    return (
      <View style={styles.container}>
        <Text style={styles.sectionTitle}>Create a Circle</Text>
        <TextInput
          style={styles.input} placeholder="Circle name (e.g. The Wynkoop Family)"
          value={circleName} onChangeText={setCircleName}
        />
        <TouchableOpacity style={styles.button} onPress={handleCreate}>
          <Text style={styles.buttonText}>Create Circle</Text>
        </TouchableOpacity>

        <Text style={styles.orText}>— or —</Text>

        <Text style={styles.sectionTitle}>Join a Circle</Text>
        <TextInput
          style={styles.input} placeholder="Enter 6-digit invite code"
          value={inviteCode} onChangeText={setInviteCode}
          keyboardType="number-pad" maxLength={6}
        />
        <TouchableOpacity style={[styles.button, styles.secondaryButton]} onPress={handleJoin}>
          <Text style={[styles.buttonText, styles.secondaryButtonText]}>Join Circle</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.codeCard}>
        <Text style={styles.codeLabel}>Invite Code</Text>
        <Text style={styles.code}>{circle.inviteCode}</Text>
        <Text style={styles.codeExpiry}>
          Expires {new Date(circle.inviteExpiry).toLocaleDateString()}
        </Text>
        <View style={styles.codeActions}>
          <TouchableOpacity style={styles.smallButton} onPress={handleSendInvite}>
            <Text style={styles.smallButtonText}>Send via SMS</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.smallButton, styles.outlineButton]} onPress={handleRefreshCode}>
            <Text style={[styles.smallButtonText, { color: '#4F46E5' }]}>Refresh Code</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Members ({members.length})</Text>
      <FlatList
        data={members}
        keyExtractor={(m) => m.uid}
        renderItem={({ item }) => <MemberCard member={item} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#F9FAFB' },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#111827', marginBottom: 12, marginTop: 8 },
  input: {
    backgroundColor: '#fff', borderWidth: 1, borderColor: '#E5E7EB',
    borderRadius: 10, padding: 14, fontSize: 16, marginBottom: 12,
  },
  button: {
    backgroundColor: '#4F46E5', borderRadius: 10,
    padding: 14, alignItems: 'center', marginBottom: 8,
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  secondaryButton: { backgroundColor: '#EEF2FF' },
  secondaryButtonText: { color: '#4F46E5' },
  orText: { textAlign: 'center', color: '#9CA3AF', marginVertical: 16, fontSize: 14 },
  codeCard: {
    backgroundColor: '#4F46E5', borderRadius: 16, padding: 20, marginBottom: 24, alignItems: 'center',
  },
  codeLabel: { color: '#C7D2FE', fontSize: 12, fontWeight: '600', letterSpacing: 1 },
  code: { color: '#fff', fontSize: 40, fontWeight: '700', letterSpacing: 8, marginVertical: 8 },
  codeExpiry: { color: '#A5B4FC', fontSize: 12, marginBottom: 16 },
  codeActions: { flexDirection: 'row', gap: 8 },
  smallButton: {
    backgroundColor: '#fff', borderRadius: 8, paddingVertical: 8, paddingHorizontal: 14,
  },
  smallButtonText: { color: '#4F46E5', fontWeight: '600', fontSize: 13 },
  outlineButton: { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#fff' },
});
