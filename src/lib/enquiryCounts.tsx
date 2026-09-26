import { createContext, use, useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { api } from "./api";
import type { EnquiryStatus } from "./types";

type Counts = Record<EnquiryStatus, number>;
type State = { counts: Counts | null; refresh: () => Promise<void> };

const EnquiryCountsContext = createContext<State | null>(null);

// Shared so the sidebar badge and the Enquiries tabs stay in sync.
// Polls every minute so new website enquiries show up without a reload.
export function EnquiryCountsProvider({ children }: { children: ReactNode }) {
  const [counts, setCounts] = useState<Counts | null>(null);

  const refresh = useCallback(async () => {
    try {
      setCounts(await api<Counts>("/enquiries/counts"));
    } catch {
      // Keep the last known counts; the page itself shows connection errors
    }
  }, []);

  useEffect(() => {
    void refresh();
    const timer = setInterval(() => void refresh(), 60_000);
    return () => clearInterval(timer);
  }, [refresh]);

  const value = useMemo(() => ({ counts, refresh }), [counts, refresh]);
  return <EnquiryCountsContext value={value}>{children}</EnquiryCountsContext>;
}

export function useEnquiryCounts() {
  const ctx = use(EnquiryCountsContext);
  if (!ctx) throw new Error("useEnquiryCounts must be used inside EnquiryCountsProvider");
  return ctx;
}
