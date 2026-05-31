import { useState, useEffect } from 'react';
import { collection, doc, onSnapshot } from 'firebase/firestore';
import { db } from '../services/firebase';
import { Circle, LocationData } from '../types';

export function useCircle(circleId: string | null) {
  const [circle, setCircle] = useState<Circle | null>(null);
  const [memberLocations, setMemberLocations] = useState<LocationData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!circleId) {
      setLoading(false);
      return;
    }

    const unsubCircle = onSnapshot(doc(db, 'circles', circleId), (snap) => {
      if (snap.exists()) setCircle({ id: snap.id, ...snap.data() } as Circle);
      setLoading(false);
    });

    // Listen to all location docs for members in this circle
    const unsubLocations = onSnapshot(
      collection(db, 'locations'),
      (snap) => {
        const locs = snap.docs
          .map((d) => d.data() as LocationData)
          .filter((l) => l.circleId === circleId);
        setMemberLocations(locs);
      }
    );

    return () => {
      unsubCircle();
      unsubLocations();
    };
  }, [circleId]);

  return { circle, memberLocations, loading };
}
