import { useEffect, useRef } from 'react';
import { AppState } from 'react-native';
import {
  requestLocationPermissions,
  startBackgroundTracking,
  stopBackgroundTracking,
} from '../services/location';

export function useLocation(uid: string | null, circleId: string | null) {
  const permissionGranted = useRef(false);

  useEffect(() => {
    if (!uid || !circleId) return;

    let active = true;

    (async () => {
      permissionGranted.current = await requestLocationPermissions();
      if (active && permissionGranted.current) {
        await startBackgroundTracking(uid, circleId);
      }
    })();

    const sub = AppState.addEventListener('change', async (state) => {
      if (!permissionGranted.current) return;
      if (state === 'background') await startBackgroundTracking(uid, circleId);
    });

    return () => {
      active = false;
      sub.remove();
      stopBackgroundTracking();
    };
  }, [uid, circleId]);
}
