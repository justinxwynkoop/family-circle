import * as ExpoLocation from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

const BACKGROUND_LOCATION_TASK = 'background-location-task';

// Registered at module level — must be outside any component or function
TaskManager.defineTask(BACKGROUND_LOCATION_TASK, async ({ data, error }: any) => {
  if (error || !data) return;
  const { locations } = data as { locations: ExpoLocation.LocationObject[] };
  const location = locations[0];
  if (!location) return;

  const uid = (global as any).__familyCircleUserId as string | undefined;
  const circleId = (global as any).__familyCircleId as string | undefined;
  if (!uid || !circleId) return;

  await setDoc(doc(db, 'locations', uid), {
    latitude: location.coords.latitude,
    longitude: location.coords.longitude,
    speed: location.coords.speed,
    heading: location.coords.heading,
    batteryLevel: -1,
    updatedAt: serverTimestamp(),
    circleId,
  });
});

export async function requestLocationPermissions(): Promise<boolean> {
  const { status: fg } = await ExpoLocation.requestForegroundPermissionsAsync();
  if (fg !== 'granted') return false;
  const { status: bg } = await ExpoLocation.requestBackgroundPermissionsAsync();
  return bg === 'granted';
}

export async function startBackgroundTracking(uid: string, circleId: string) {
  (global as any).__familyCircleUserId = uid;
  (global as any).__familyCircleId = circleId;

  const isRunning = await ExpoLocation.hasStartedLocationUpdatesAsync(BACKGROUND_LOCATION_TASK).catch(() => false);
  if (isRunning) return;

  await ExpoLocation.startLocationUpdatesAsync(BACKGROUND_LOCATION_TASK, {
    accuracy: ExpoLocation.Accuracy.Balanced,
    timeInterval: 30_000,     // update every 30 seconds
    distanceInterval: 50,     // or every 50 meters
    showsBackgroundLocationIndicator: true,
    foregroundService: {
      notificationTitle: 'FamilyCircle',
      notificationBody: 'Sharing your location with your circle.',
      notificationColor: '#4F46E5',
    },
  });
}

export async function stopBackgroundTracking() {
  const isRunning = await ExpoLocation.hasStartedLocationUpdatesAsync(BACKGROUND_LOCATION_TASK).catch(() => false);
  if (isRunning) {
    await ExpoLocation.stopLocationUpdatesAsync(BACKGROUND_LOCATION_TASK);
  }
}

export async function getCurrentLocation() {
  return ExpoLocation.getCurrentPositionAsync({
    accuracy: ExpoLocation.Accuracy.Balanced,
  });
}
