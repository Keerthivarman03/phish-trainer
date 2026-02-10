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
    console.log("useAuth initialized");
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        try {
          const currentUser = session?.user ?? null;
          setUser(currentUser);

          if (currentUser && requireAdmin) {
            const { data, error } = await supabase.rpc("has_role", {
              _user_id: currentUser.id,
              _role: "admin",
            });
            if (error) console.error("Role check error:", error);
            setIsAdmin(!!data);
            if (!data) navigate("/admin/login");
          } else if (!currentUser && requireAdmin) {
            navigate("/admin/login");
          }
        } catch (error) {
          console.error("Auth state change error:", error);
        } finally {
          setLoading(false);
        }
      }
    );

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      try {
        const currentUser = session?.user ?? null;
        setUser(currentUser);

        if (currentUser && requireAdmin) {
          const { data, error } = await supabase.rpc("has_role", {
            _user_id: currentUser.id,
            _role: "admin",
          });

          if (error) {
            console.error("Role check error:", error);
            // If checking role fails, we probably shouldn't block access completely or should default to false
            // But for now, let's log it. 
          }

          setIsAdmin(!!data);
          if (!data) {
            console.warn("User missing admin role, redirecting");
            navigate("/admin/login");
          }
        } else if (!currentUser && requireAdmin) {
          navigate("/admin/login");
        }
      } catch (error) {
        console.error("Auth session check error:", error);
      } finally {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, requireAdmin]);

  // Safety timeout: If auth takes too long, stop loading
  useEffect(() => {
    const timer = setTimeout(() => {
      if (loading) {
        console.warn("Auth check timed out, forcing loading to false");
        setLoading(false);
      }
    }, 2000); // 2 seconds

    return () => clearTimeout(timer);
  }, [loading]);

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate("/admin/login");
  };

  return { user, isAdmin, loading, signOut };
}
