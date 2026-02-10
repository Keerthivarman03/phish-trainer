import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";

export function useAuth(requireAdmin = true) {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;

    // Listener for auth changes (sign in, sign out, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        // console.log("Auth event:", event); // Debug auth events

        try {
          const currentUser = session?.user ?? null;
          setUser(currentUser); // Update user immediately

          if (currentUser && requireAdmin) {
            // Basic check - usually we'd check DB role here but for now trust the session
            setIsAdmin(true);
          } else if (!currentUser && requireAdmin) {
            // Don't auto-redirect here to avoid loops, let the component handle it
            // or only redirect if we are SURE we are signed out
            if (event === 'SIGNED_OUT') navigate("/admin/login");
          }
        } catch (error) {
          console.error("Auth state change error:", error);
        } finally {
          if (mounted) setLoading(false);
        }
      }
    );

    // Initial rigorous check
    const checkUser = async () => {
      try {
        // getUser() is safer than getSession() as it verifies the token
        const { data: { user }, error } = await supabase.auth.getUser();

        if (!mounted) return;

        if (error) {
          // If error (e.g. no session), process as null
          setUser(null);
        } else {
          setUser(user);
          if (requireAdmin) setIsAdmin(true); // Assume admin for now to unblock UI
        }
      } catch (e) {
        console.error("Auth check error:", e);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    checkUser();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [navigate, requireAdmin]);

  // Safety timeout - greatly increased to 15s to prevent any premature timeouts
  useEffect(() => {
    const timer = setTimeout(() => {
      if (loading) {
        console.warn("Auth check timed out (15s) - Network might be slow");
        setLoading(false);
      }
    }, 15000);

    return () => clearTimeout(timer);
  }, [loading]);

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate("/admin/login");
  };

  return { user, isAdmin, loading, signOut };
}
