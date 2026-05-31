import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Marker, Callout } from 'react-native-maps';
import { LocationData } from '../types';

type Props = {
  location: LocationData;
  isCurrentUser: boolean;
};

function formatAge(updatedAt: number): string {
  const mins = Math.floor((Date.now() - updatedAt) / 60_000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  return `${Math.floor(mins / 60)}h ago`;
}

export default function MemberMarker({ location, isCurrentUser }: Props) {
  return (
    <Marker coordinate={{ latitude: location.latitude, longitude: location.longitude }}>
      <View style={[styles.pin, isCurrentUser && styles.pinSelf]}>
        <Text style={styles.initial}>
          {location.displayName?.charAt(0).toUpperCase() ?? '?'}
        </Text>
      </View>
      <Callout>
        <View style={styles.callout}>
          <Text style={styles.calloutName}>{location.displayName}</Text>
          <Text style={styles.calloutTime}>Updated {formatAge(location.updatedAt)}</Text>
          {location.speed != null && location.speed > 1 && (
            <Text style={styles.calloutSpeed}>{Math.round(location.speed * 2.237)} mph</Text>
          )}
        </View>
      </Callout>
    </Marker>
  );
}

const styles = StyleSheet.create({
  pin: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#6366F1', justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: '#fff',
    shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 4, elevation: 4,
  },
  pinSelf: { backgroundColor: '#4F46E5' },
  initial: { color: '#fff', fontSize: 16, fontWeight: '700' },
  callout: { padding: 8, minWidth: 120 },
  calloutName: { fontWeight: '700', fontSize: 14, marginBottom: 2 },
  calloutTime: { fontSize: 12, color: '#6B7280' },
  calloutSpeed: { fontSize: 12, color: '#4F46E5', marginTop: 2 },
});
