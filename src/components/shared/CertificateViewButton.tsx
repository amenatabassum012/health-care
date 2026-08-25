import { useState } from "react"
import { useTranslation } from "react-i18next"
import { Eye, FileWarning } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { getCertificateFile } from "@/lib/certificateStore"
import type { StoredCertificate } from "@/types"

export function CertificateViewButton({
  certificateId,
  fileName,
  label,
}: {
  certificateId: string
  fileName?: string
  label: string
}) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const [record, setRecord] = useState<StoredCertificate | null | undefined>(undefined)

  async function handleOpen() {
    setOpen(true)
    const found = await getCertificateFile(certificateId)
    setRecord(found ?? null)
  }

  return (
    <>
      <Button type="button" variant="outline" size="sm" onClick={handleOpen}>
        <Eye className="size-3.5" />
        {label}
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="truncate">{fileName ?? label}</DialogTitle>
          </DialogHeader>
          {record === undefined && (
            <p className="py-10 text-center text-sm text-muted-foreground">{t("common.loading")}</p>
          )}
          {record === null && (
            <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border p-8 text-center">
              <FileWarning className="size-8 text-muted-foreground" />
              <p className="text-sm font-medium text-foreground">{t("certificate.noFileTitle")}</p>
              <p className="text-xs text-muted-foreground">{t("certificate.noFileBody")}</p>
            </div>
          )}
          {record && record.mimeType.startsWith("image/") && (
            <img
              src={record.dataUrl}
              alt={record.fileName}
              className="max-h-[70vh] w-full rounded-lg border border-border object-contain"
            />
          )}
          {record && !record.mimeType.startsWith("image/") && (
            <iframe
              src={record.dataUrl}
              title={record.fileName}
              className="h-[70vh] w-full rounded-lg border border-border"
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
