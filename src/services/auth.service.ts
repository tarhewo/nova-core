import { supabase } from "@/integrations/supabase/client";

export const authService = {
  signUp: (email: string, password: string, fullName?: string) =>
    supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
        data: { full_name: fullName ?? email.split("@")[0] },
      },
    }),

  signIn: (email: string, password: string) =>
    supabase.auth.signInWithPassword({ email, password }),

  signInWithGoogle: () =>
    supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/dashboard` },
    }),

  signOut: () => supabase.auth.signOut(),

  getSession: () => supabase.auth.getSession(),
};