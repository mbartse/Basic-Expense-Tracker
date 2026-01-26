import { useState, useEffect, useCallback } from 'react';
import type { Bank } from '../types/expense';
import { subscribeToBanks, addBank as addBankService } from '../services/bankService';

/**
 * Hook for banks management
 */
export function useBanks() {
  const [banks, setBanks] = useState<Bank[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeToBanks((data) => {
      setBanks(data);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const addBank = useCallback(async (name: string) => {
    return await addBankService(name);
  }, []);

  return { banks, loading, addBank };
}
