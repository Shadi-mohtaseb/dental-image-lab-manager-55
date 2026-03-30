import { createContext, useContext, ReactNode } from "react";
import { useSubscription } from "@/hooks/useSubscription";

interface SubscriptionContextType {
  isActive: boolean | null;
  isAdmin: boolean;
  isReadOnly: boolean;
  loading: boolean;
}

const SubscriptionContext = createContext<SubscriptionContextType>({
  isActive: null,
  isAdmin: false,
  isReadOnly: false,
  loading: true,
});

export const useSubscriptionContext = () => useContext(SubscriptionContext);

export const SubscriptionProvider = ({ children }: { children: ReactNode }) => {
  const sub = useSubscription();
  return (
    <SubscriptionContext.Provider value={sub}>
      {children}
    </SubscriptionContext.Provider>
  );
};
