import { supabase } from './supabase';

export async function register(email: string, password: string, displayName: string) {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;

  const user = data.user;
  if (!user) throw new Error('Registration failed.');

  const { error: profileError } = await supabase.from('users').insert({
    id: user.id,
    display_name: displayName,
    email,
    circle_ids: [],
  });
  if (profileError) throw profileError;

  return user;
}

export async function login(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data.user;
}

export async function logout() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}
