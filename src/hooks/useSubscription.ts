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

      // Check admin - use rpc to avoid type issues with new tables
      const { data: isAdminResult } = await supabase.rpc("has_role", {
        _user_id: user.id,
        _role: "admin",
      });

      if (isAdminResult) {
        setIsAdmin(true);
        setIsActive(true);
        setLoading(false);
        return;
      }

      // Check subscription via rpc
      const { data: subActive } = await supabase.rpc("is_subscription_active", {
        _user_id: user.id,
      });

      setIsActive(!!subActive);
      setLoading(false);
    };

    check();
  }, []);

  const isReadOnly = !isAdmin && isActive === false;

  return { isActive, isAdmin, isReadOnly, loading };
}
