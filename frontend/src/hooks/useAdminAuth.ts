import { useState, useEffect, useCallback } from 'react';

const ADMIN_SESSION_KEY = 'gojri_admin_session';
const ADMIN_PASSWORD = 'GojriAdab2024!';

export function useAdminAuth() {
  const [isAdminMode, setIsAdminMode] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem(ADMIN_SESSION_KEY) === 'true';
    } catch {
      return false;
    }
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    try {
      if (isAdminMode) {
        sessionStorage.setItem(ADMIN_SESSION_KEY, 'true');
      } else {
        sessionStorage.removeItem(ADMIN_SESSION_KEY);
      }
    } catch {
      // ignore
    }
  }, [isAdminMode]);

  const login = useCallback(async (password: string): Promise<boolean> => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 300));
    const isValid = password === ADMIN_PASSWORD;
    if (isValid) {
      setIsAdminMode(true);
    }
    setIsLoading(false);
    return isValid;
  }, []);

  const logout = useCallback(() => {
    setIsAdminMode(false);
    try {
      sessionStorage.removeItem(ADMIN_SESSION_KEY);
    } catch {
      // ignore
    }
  }, []);

  return { isAdminMode, login, logout, isLoading };
}
