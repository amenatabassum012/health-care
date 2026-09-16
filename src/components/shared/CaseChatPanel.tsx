import { useEffect, useRef, useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { useRealtimeRefresh } from "@/hooks/useRealtimeRefresh"
import { getCaseMessages, sendCaseMessage } from "@/lib/api/asha"
import { cn } from "@/lib/utils"

/**
 * A text thread scoped to one appointment — used for both the doctor-side
 * "Message ASHA worker" and the ASHA-side "Message doctor" actions, so a
 * conversation always stays tied to a specific case rather than becoming a
 * generic inbox.
 */
export function CaseChatPanel({
  open,
  onOpenChange,
  appointmentId,
  currentStaffId,
  title,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  appointmentId: string
  currentStaffId: string
  title: string
}) {
  const qc = useQueryClient()
  const [body, setBody] = useState("")
  const scrollRef = useRef<HTMLDivElement>(null)

  const { data: messages } = useQuery({
    queryKey: ["case-messages", appointmentId],
    queryFn: () => getCaseMessages(appointmentId),
    enabled: open,
  })

  useRealtimeRefresh(
    "case_messages",
    () => qc.invalidateQueries({ queryKey: ["case-messages", appointmentId] }),
    `appointment_id=eq.${appointmentId}`
  )

  const sendMutation = useMutation({
    mutationFn: (text: string) => sendCaseMessage(appointmentId, currentStaffId, text),
    onSuccess: () => {
      setBody("")
      qc.invalidateQueries({ queryKey: ["case-messages", appointmentId] })
    },
  })

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight })
  }, [messages])

  function submit() {
    const text = body.trim()
    if (!text) return
    sendMutation.mutate(text)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[80vh] flex-col">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div ref={scrollRef} className="flex-1 space-y-2 overflow-y-auto py-2">
          {messages?.length === 0 && (
            <p className="py-6 text-center text-sm text-muted-foreground">No messages yet — say hello.</p>
          )}
          {messages?.map((m) => {
            const mine = m.senderStaffId === currentStaffId
            return (
              <div key={m.id} className={cn("flex", mine ? "justify-end" : "justify-start")}>
                <div
                  className={cn(
                    "max-w-[80%] rounded-2xl px-3.5 py-2 text-sm",
                    mine ? "bg-brand-blue text-white" : "bg-muted text-foreground"
                  )}
                >
                  {m.body}
                </div>
              </div>
            )
          })}
        </div>

        <div className="flex items-center gap-2 border-t border-border pt-3">
          <Input
            value={body}
            onChange={(e) => setBody(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            placeholder="Type a message…"
            className="h-11"
          />
          <Button size="icon" className="h-11 w-11 shrink-0" onClick={submit} disabled={sendMutation.isPending}>
            <Send className="size-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
