// src/hooks/useEntitlements.ts
import { useState, useEffect } from 'react';
import Purchases, { CustomerInfo } from 'react-native-purchases';

export function useEntitlements() {
  const [isPremium, setIsPremium] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    Purchases.getCustomerInfo()
      .then((info: CustomerInfo) => {
        if (isMounted) {
          setIsPremium(!!info.entitlements.active['pro_access']);
          setLoading(false);
        }
      })
      .catch(() => { if (isMounted) setLoading(false); });

    return () => { isMounted = false; };
  }, []);

  const restorePurchases = async (): Promise<boolean> => {
    try {
      const restored = await Purchases.restorePurchases();
      const hasPro = !!restored.entitlements.active['pro_access'];
      setIsPremium(hasPro);
      return hasPro;
    } catch {
      return false;
    }
  };

  return { isPremium, loading, restorePurchases };
}
