import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthStore } from "@/store/auth";
import { activityService } from "@/services/activity.service";

export function useAuthBootstrap() {
  const { setSession, setLoading } = useAuthStore();

  useEffect(() => {
    // 1) Listener first
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      if (event === "SIGNED_IN" && session?.user) {
        // fire-and-forget activity log; defer to avoid blocking
        setTimeout(() => {
          activityService.log(session.user.id, "login", { at: new Date().toISOString() });
        }, 0);
      }
    });

    // 2) Then load existing session
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    return () => sub.subscription.unsubscribe();
  }, [setSession, setLoading]);
}

export function useAuth() {
  return useAuthStore();
}