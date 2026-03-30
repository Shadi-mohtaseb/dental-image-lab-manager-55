import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useSubscription() {
  const [isActive, setIsActive] = useState<boolean | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const check = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      // Check admin
      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle();

      if (roleData) {
        setIsAdmin(true);
        setIsActive(true);
        setLoading(false);
        return;
      }

      // Check subscription
      const { data: sub } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!sub) {
        setIsActive(false);
      } else if (sub.is_permanent && sub.status === "active") {
        setIsActive(true);
      } else if (sub.status === "active" && sub.end_date) {
        setIsActive(new Date(sub.end_date) >= new Date(new Date().toISOString().split("T")[0]));
      } else {
        setIsActive(false);
      }

      setLoading(false);
    };

    check();
  }, []);

  // Read-only = not admin AND subscription inactive
  const isReadOnly = !isAdmin && isActive === false;

  return { isActive, isAdmin, isReadOnly, loading };
}
