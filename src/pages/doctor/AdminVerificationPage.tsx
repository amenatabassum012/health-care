import { useState } from "react"
import { useTranslation } from "react-i18next"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { FileCheck2, ShieldCheck, ShieldX } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { EmptyState } from "@/components/shared/EmptyState"
import { AllCaughtUp } from "@/components/illustrations/AllCaughtUp"
import { CertificateViewButton } from "@/components/shared/CertificateViewButton"
import { approveStaff, getPendingStaff, rejectStaff } from "@/lib/api/doctor"
import { getSpecialties } from "@/lib/api/shared"
import { useSession } from "@/state/session"
import type { StaffUser } from "@/types"

export function AdminVerificationPage() {
  const { t } = useTranslation()
  const { staff } = useSession()
  const qc = useQueryClient()
  const [rejectTarget, setRejectTarget] = useState<StaffUser | null>(null)
  const [reason, setReason] = useState("")

  const { data: pending } = useQuery({
    queryKey: ["pending-staff", staff?.facilityId],
    queryFn: () => getPendingStaff(staff!.facilityId),
    enabled: !!staff,
  })
  const { data: specialties } = useQuery({ queryKey: ["specialties"], queryFn: getSpecialties })

  const approveMutation = useMutation({
    mutationFn: approveStaff,
    onSuccess: () => {
      toast.success(t("doctor.admin.approve"))
      qc.invalidateQueries({ queryKey: ["pending-staff"] })
    },
  })
  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => rejectStaff(id, reason),
    onSuccess: () => {
      toast.success(t("doctor.admin.reject"))
      qc.invalidateQueries({ queryKey: ["pending-staff"] })
      setRejectTarget(null)
      setReason("")
    },
  })

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold text-foreground">{t("doctor.admin.verificationQueue")}</h1>

      {pending?.length === 0 && (
        <EmptyState illustration={AllCaughtUp} title={t("doctor.admin.nothingPending")} />
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {pending?.map((s) => {
          const specialty = specialties?.find((sp) => sp.id === s.specialtyId)
          return (
            <div key={s.id} className="rounded-2xl border border-warning/30 bg-warning/5 p-5">
              <p className="text-base font-bold text-foreground">{s.name}</p>
              <p className="text-xs text-muted-foreground">
                {s.role}{specialty ? ` · ${specialty.label}` : ""}
              </p>
              <div className="mt-3 space-y-1 text-xs text-muted-foreground">
                <p>{s.phone} · {s.email}</p>
                <p>NMC/SMC: {s.nmcRegistrationNo}</p>
                <div className="flex items-center gap-2">
                  <p className="flex items-center gap-1.5">
                    <FileCheck2 className="size-3.5" />
                    {s.credentialFileName ?? "credential_scan.jpg"}
                  </p>
                  <CertificateViewButton
                    certificateId={s.id}
                    fileName={s.credentialFileName}
                    label={t("certificate.view")}
                  />
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <Button
                  size="sm"
                  className="flex-1 bg-success text-white hover:bg-success/90"
                  onClick={() => approveMutation.mutate(s.id)}
                >
                  <ShieldCheck className="size-3.5" />
                  {t("doctor.admin.approve")}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 border-coral/40 text-coral hover:bg-coral/10"
                  onClick={() => setRejectTarget(s)}
                >
                  <ShieldX className="size-3.5" />
                  {t("doctor.admin.reject")}
                </Button>
              </div>
            </div>
          )
        })}
      </div>

      <Dialog open={!!rejectTarget} onOpenChange={(o) => !o && setRejectTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("doctor.admin.reject")} — {rejectTarget?.name}</DialogTitle>
          </DialogHeader>
          <Textarea
            placeholder={t("doctor.admin.rejectReason")}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
          />
          <Button
            className="mt-2 bg-coral text-white hover:bg-coral/90"
            disabled={!reason}
            onClick={() => rejectTarget && rejectMutation.mutate({ id: rejectTarget.id, reason })}
          >
            {t("doctor.admin.reject")}
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  )
}
