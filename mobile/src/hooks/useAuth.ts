import { useState, useEffect } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '../services/supabase';
import { User } from '../types';

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      if (data.session) fetchProfile(data.session.user.id);
      else setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      if (newSession) fetchProfile(newSession.user.id);
      else { setUser(null); setLoading(false); }
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  async function fetchProfile(uid: string) {
    const { data } = await supabase.from('users').select().eq('id', uid).single();
    setUser(data ? {
      uid: data.id,
      displayName: data.display_name,
      email: data.email,
      photoURL: data.photo_url ?? undefined,
      circleIds: data.circle_ids ?? [],
    } : null);
    setLoading(false);
  }

  return { session, user, loading };
}
