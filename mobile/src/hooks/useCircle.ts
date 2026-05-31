import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { Circle, LocationData } from '../types';

export function useCircle(circleId: string | null) {
  const [circle, setCircle] = useState<Circle | null>(null);
  const [memberLocations, setMemberLocations] = useState<LocationData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!circleId) { setLoading(false); return; }

    // Initial fetch
    supabase.from('circles').select().eq('id', circleId).single().then(({ data }) => {
      if (data) setCircle({ id: data.id, name: data.name, ownerId: data.owner_id, createdAt: new Date(data.created_at).getTime(), inviteCode: data.invite_code, inviteExpiry: new Date(data.invite_expiry).getTime(), memberIds: data.member_ids ?? [] });
      setLoading(false);
    });

    supabase.from('locations').select().eq('circle_id', circleId).then(({ data }) => {
      if (data) setMemberLocations(data.map(mapLocation));
    });

    // Real-time subscription for location updates
    const channel = supabase
      .channel(`circle-locations-${circleId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'locations', filter: `circle_id=eq.${circleId}` },
        (payload) => {
          const loc = mapLocation(payload.new);
          setMemberLocations((prev) => {
            const others = prev.filter((l) => l.uid !== loc.uid);
            return payload.eventType === 'DELETE' ? others : [...others, loc];
          });
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [circleId]);

  return { circle, memberLocations, loading };
}

function mapLocation(row: any): LocationData {
  return {
    uid: row.user_id,
    displayName: row.display_name ?? '',
    photoURL: row.photo_url ?? undefined,
    latitude: row.latitude,
    longitude: row.longitude,
    speed: row.speed,
    heading: row.heading,
    batteryLevel: row.battery_level ?? -1,
    updatedAt: new Date(row.updated_at).getTime(),
    circleId: row.circle_id,
  };
}
