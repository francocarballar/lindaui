import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";

interface QRRefreshOptions {
  enabled: boolean;
  expirySeconds: number;
  error?: ReactNode;
  errorLabel: ReactNode;
  onRefresh: () => Promise<void>;
}

/** Pause hidden challenges and never overlap refreshes or automatically retry failures. */
export function useQRRefresh({ enabled, expirySeconds, error, errorLabel, onRefresh }: QRRefreshOptions) {
  const [timeRemaining, setTimeRemaining] = useState(expirySeconds);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [actionError, setActionError] = useState<ReactNode>(null);
  const pending = useRef(false);

  const refresh = useCallback(async () => {
    if (pending.current) return;
    pending.current = true;
    setIsRefreshing(true);
    setActionError(null);
    try {
      await onRefresh();
      setTimeRemaining(expirySeconds);
    } catch {
      setActionError(errorLabel);
    } finally {
      pending.current = false;
      setIsRefreshing(false);
    }
  }, [onRefresh, expirySeconds, errorLabel]);

  useEffect(() => {
    if (!enabled) {
      setTimeRemaining(expirySeconds);
      return;
    }
    if (isRefreshing || error || actionError) return;
    const timer = setInterval(() => setTimeRemaining((value) => Math.max(0, value - 1)), 1000);
    return () => clearInterval(timer);
  }, [enabled, expirySeconds, isRefreshing, error, actionError]);

  useEffect(() => {
    if (enabled && timeRemaining === 0 && !error && !actionError && !isRefreshing) {
      setTimeRemaining(expirySeconds);
      void refresh();
    }
  }, [enabled, timeRemaining, expirySeconds, error, actionError, isRefreshing, refresh]);

  return { timeRemaining, isRefreshing, actionError, setActionError, refresh };
}
