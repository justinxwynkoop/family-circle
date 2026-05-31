import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useAuth } from '../../hooks/useAuth';
import { logout } from '../../services/auth';
import { stopBackgroundTracking } from '../../services/location';

export default function SettingsScreen() {
  const { user } = useAuth();

  async function handleLogout() {
    Alert.alert('Sign out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign out',
        style: 'destructive',
        onPress: async () => {
          await stopBackgroundTracking();
          await logout();
        },
      },
    ]);
  }

  return (
    <View style={styles.container}>
      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user?.displayName?.charAt(0).toUpperCase() ?? '?'}
          </Text>
        </View>
        <Text style={styles.name}>{user?.displayName}</Text>
        <Text style={styles.email}>{user?.email}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        <TouchableOpacity style={styles.row} onPress={handleLogout}>
          <Text style={styles.rowTextDanger}>Sign out</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.version}>FamilyCircle v1.0.0</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB', padding: 16 },
  profileCard: { alignItems: 'center', padding: 24, backgroundColor: '#fff', borderRadius: 16, marginBottom: 24 },
  avatar: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: '#4F46E5', justifyContent: 'center', alignItems: 'center', marginBottom: 12,
  },
  avatarText: { color: '#fff', fontSize: 28, fontWeight: '700' },
  name: { fontSize: 20, fontWeight: '700', color: '#111827' },
  email: { fontSize: 14, color: '#6B7280', marginTop: 4 },
  section: { backgroundColor: '#fff', borderRadius: 12, marginBottom: 16, overflow: 'hidden' },
  sectionTitle: { fontSize: 12, fontWeight: '600', color: '#6B7280', paddingHorizontal: 16, paddingTop: 12, letterSpacing: 0.5 },
  row: { padding: 16, borderTopWidth: 1, borderTopColor: '#F3F4F6' },
  rowTextDanger: { fontSize: 16, color: '#EF4444' },
  version: { textAlign: 'center', color: '#9CA3AF', fontSize: 12, marginTop: 'auto', paddingBottom: 24 },
});
