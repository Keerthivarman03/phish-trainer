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
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        const currentUser = session?.user ?? null;
        setUser(currentUser);

        if (currentUser && requireAdmin) {
          const { data } = await supabase.rpc("has_role", {
            _user_id: currentUser.id,
            _role: "admin",
          });
          setIsAdmin(!!data);
          if (!data) navigate("/admin/login");
        } else if (!currentUser && requireAdmin) {
          navigate("/admin/login");
        }

        setLoading(false);
      }
    );

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);

      if (currentUser && requireAdmin) {
        const { data } = await supabase.rpc("has_role", {
          _user_id: currentUser.id,
          _role: "admin",
        });
        setIsAdmin(!!data);
        if (!data) navigate("/admin/login");
      } else if (!currentUser && requireAdmin) {
        navigate("/admin/login");
      }

      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [navigate, requireAdmin]);

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate("/admin/login");
  };

  return { user, isAdmin, loading, signOut };
}
