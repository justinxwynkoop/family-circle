import React, { useRef } from 'react';
import { StyleSheet, View, Text, ActivityIndicator } from 'react-native';
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps';
import { useAuth } from '../../hooks/useAuth';
import { useCircle } from '../../hooks/useCircle';
import { useLocation } from '../../hooks/useLocation';
import MemberMarker from '../../components/MemberMarker';

export default function MapScreen() {
  const { user } = useAuth();
  const circleId = user?.circleIds?.[0] ?? null;
  const { memberLocations, loading } = useCircle(circleId);
  const mapRef = useRef<MapView>(null);

  useLocation(user?.uid ?? null, circleId);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );
  }

  if (!circleId) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyText}>You're not in a circle yet.</Text>
        <Text style={styles.emptySubtext}>Go to the Circle tab to create or join one.</Text>
      </View>
    );
  }

  const initialRegion = memberLocations[0]
    ? {
        latitude: memberLocations[0].latitude,
        longitude: memberLocations[0].longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      }
    : {
        latitude: 37.7749,
        longitude: -122.4194,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      };

  return (
    <MapView
      ref={mapRef}
      style={styles.map}
      provider={PROVIDER_GOOGLE}
      initialRegion={initialRegion}
      showsUserLocation={false}
    >
      {memberLocations.map((loc) => (
        <MemberMarker key={loc.uid} location={loc} isCurrentUser={loc.uid === user?.uid} />
      ))}
    </MapView>
  );
}

const styles = StyleSheet.create({
  map: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  emptyText: { fontSize: 18, fontWeight: '600', color: '#111827', marginBottom: 8 },
  emptySubtext: { fontSize: 14, color: '#6B7280', textAlign: 'center' },
});
