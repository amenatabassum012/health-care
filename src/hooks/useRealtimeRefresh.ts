import { useEffect } from "react"
import { supabase } from "@/lib/supabaseClient"

/**
 * Subscribes to Postgres changes on `table` (optionally scoped with a
 * PostgREST-style filter, e.g. "facility_id=eq.fac-phc-001") and calls
 * `onChange` whenever a row is inserted/updated/deleted, so dashboards can
 * refetch and reflect live data without a manual refresh.
 */
export function useRealtimeRefresh(table: string, onChange: () => void, filter?: string) {
  useEffect(() => {
    const channel = supabase
      .channel(`realtime:${table}:${filter ?? "all"}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table, ...(filter ? { filter } : {}) },
        () => onChange()
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [table, filter])
}
