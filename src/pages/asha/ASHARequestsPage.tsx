import { useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { CalendarClock, MessageCircle, UserRound } from "lucide-react"
import { EmptyState } from "@/components/shared/EmptyState"
import { AllCaughtUp } from "@/components/illustrations/AllCaughtUp"
import { Button } from "@/components/ui/button"
import { CaseChatPanel } from "@/components/shared/CaseChatPanel"
import { useRealtimeRefresh } from "@/hooks/useRealtimeRefresh"
import { claimAshaCase, getMyAshaCases, getUnclaimedAshaRequests, type AshaCase } from "@/lib/api/asha"
import { getStaff } from "@/lib/api/shared"
import { useSession } from "@/state/session"

function formatSlot(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  })
}

export default function ASHARequestsPage() {
  const { staff } = useSession()
  const qc = useQueryClient()
  const [chatCase, setChatCase] = useState<AshaCase | null>(null)

  const { data: unclaimed } = useQuery({
    queryKey: ["asha-unclaimed", staff?.facilityId],
    queryFn: () => getUnclaimedAshaRequests(staff!.facilityId),
    enabled: !!staff,
  })
  const { data: myCases } = useQuery({
    queryKey: ["asha-my-cases", staff?.id],
    queryFn: () => getMyAshaCases(staff!.id),
    enabled: !!staff,
  })
  const { data: staffDirectory } = useQuery({ queryKey: ["staff"], queryFn: getStaff })

  useRealtimeRefresh(
    "appointments",
    () => {
      qc.invalidateQueries({ queryKey: ["asha-unclaimed", staff?.facilityId] })
      qc.invalidateQueries({ queryKey: ["asha-my-cases", staff?.id] })
    },
    staff ? `facility_id=eq.${staff.facilityId}` : undefined
  )

  const claimMutation = useMutation({
    mutationFn: (appointmentId: string) => claimAshaCase(appointmentId, staff!.id),
    onSuccess: () => {
      toast.success("Case claimed — it's now in My Cases.")
      qc.invalidateQueries({ queryKey: ["asha-unclaimed", staff?.facilityId] })
      qc.invalidateQueries({ queryKey: ["asha-my-cases", staff?.id] })
    },
    onError: (error: unknown) => {
      toast.error(error instanceof Error ? error.message : "Couldn't claim this case.")
      qc.invalidateQueries({ queryKey: ["asha-unclaimed", staff?.facilityId] })
    },
  })

  function doctorName(doctorId?: string) {
    if (!doctorId) return "Any doctor"
    return staffDirectory?.find((s) => s.id === doctorId)?.name ?? doctorId
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Case requests</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Patients at your facility who asked for ASHA worker help when booking.
        </p>
      </div>

      <section>
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-muted-foreground">
          Unclaimed requests
        </h2>
        {unclaimed?.length === 0 && (
          <EmptyState illustration={AllCaughtUp} title="No unclaimed requests right now" />
        )}
        <div className="grid gap-4 sm:grid-cols-2">
          {unclaimed?.map((c) => (
            <div key={c.id} className="rounded-2xl border border-teal/30 bg-mint/40 p-5">
              <div className="flex items-center gap-2">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-mint text-teal-dark">
                  <UserRound className="size-4" />
                </span>
                <p className="text-base font-bold text-foreground">{c.patientName}</p>
              </div>
              <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                <CalendarClock className="size-3.5" />
                {formatSlot(c.slotTime)} · Doctor: {doctorName(c.doctorId)}
              </p>
              <Button
                size="sm"
                className="mt-4 w-full bg-teal text-white hover:bg-teal-dark"
                disabled={claimMutation.isPending}
                onClick={() => claimMutation.mutate(c.id)}
              >
                Accept case
              </Button>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-muted-foreground">My cases</h2>
        {myCases?.length === 0 && (
          <EmptyState illustration={AllCaughtUp} title="You haven't claimed any cases yet" />
        )}
        <div className="grid gap-4 sm:grid-cols-2">
          {myCases?.map((c) => (
            <div key={c.id} className="rounded-2xl border border-border bg-card p-5">
              <div className="flex items-center gap-2">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                  <UserRound className="size-4" />
                </span>
                <p className="text-base font-bold text-foreground">{c.patientName}</p>
              </div>
              <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                <CalendarClock className="size-3.5" />
                {formatSlot(c.slotTime)} · Doctor: {doctorName(c.doctorId)}
              </p>
              <Button
                size="sm"
                variant="outline"
                className="mt-4 w-full"
                onClick={() => setChatCase(c)}
              >
                <MessageCircle className="size-3.5" />
                Message doctor
              </Button>
            </div>
          ))}
        </div>
      </section>

      {chatCase && staff && (
        <CaseChatPanel
          open={!!chatCase}
          onOpenChange={(open) => !open && setChatCase(null)}
          appointmentId={chatCase.id}
          currentStaffId={staff.id}
          title={`Case: ${chatCase.patientName}`}
        />
      )}
    </div>
  )
}
