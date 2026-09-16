import { supabase } from "@/lib/supabaseClient"
import type { Appointment, CaseMessage } from "@/types"

function mapAppointment(row: any): Appointment {
  return {
    id: row.id,
    patientId: row.patient_id,
    facilityId: row.facility_id,
    doctorId: row.doctor_id ?? undefined,
    type: row.type,
    slotTime: row.slot_time,
    queuePosition: row.queue_position ?? undefined,
    estimatedWaitMinutes: row.estimated_wait_minutes ?? undefined,
    status: row.status,
    bookedForName: row.booked_for_name ?? undefined,
    bookedForRelation: row.booked_for_relation ?? undefined,
    cancellationReason: row.cancellation_reason ?? undefined,
    wantsAsha: row.wants_asha ?? false,
    ashaWorkerId: row.asha_worker_id ?? undefined,
  }
}

function mapCaseMessage(row: any): CaseMessage {
  return {
    id: row.id,
    appointmentId: row.appointment_id,
    senderStaffId: row.sender_staff_id,
    body: row.body,
    createdAt: row.created_at,
  }
}

/* =========================================================
   ASHA REQUEST QUEUE
   ========================================================= */

export type AshaCase = Appointment & { patientName: string }

export async function getUnclaimedAshaRequests(facilityId: string): Promise<AshaCase[]> {
  const { data, error } = await supabase
    .from("appointments")
    .select("*, patients(name)")
    .eq("facility_id", facilityId)
    .eq("wants_asha", true)
    .is("asha_worker_id", null)
    .order("slot_time", { ascending: true })

  if (error) throw error

  return (data ?? []).map((row: any) => ({
    ...mapAppointment(row),
    patientName: row.patients?.name ?? row.patient_id,
  }))
}

// Guarded by `.is("asha_worker_id", null)` on the update itself, so two ASHA
// workers racing to claim the same case can't both succeed — whoever's update
// lands first wins, the second gets no row back and should refetch the queue.
export async function claimAshaCase(appointmentId: string, ashaStaffId: string): Promise<Appointment> {
  const { data, error } = await supabase
    .from("appointments")
    .update({ asha_worker_id: ashaStaffId })
    .eq("id", appointmentId)
    .is("asha_worker_id", null)
    .select()
    .single()

  if (error) throw new Error("This case was already claimed by another ASHA worker.")
  return mapAppointment(data)
}

export async function getMyAshaCases(ashaStaffId: string): Promise<AshaCase[]> {
  const { data, error } = await supabase
    .from("appointments")
    .select("*, patients(name)")
    .eq("asha_worker_id", ashaStaffId)
    .order("slot_time", { ascending: false })

  if (error) throw error

  return (data ?? []).map((row: any) => ({
    ...mapAppointment(row),
    patientName: row.patients?.name ?? row.patient_id,
  }))
}

/* =========================================================
   CASE CHAT
   ========================================================= */

export async function getCaseMessages(appointmentId: string): Promise<CaseMessage[]> {
  const { data, error } = await supabase
    .from("case_messages")
    .select("*")
    .eq("appointment_id", appointmentId)
    .order("created_at", { ascending: true })

  if (error) throw error
  return (data ?? []).map(mapCaseMessage)
}

export async function sendCaseMessage(
  appointmentId: string,
  senderStaffId: string,
  body: string,
): Promise<CaseMessage> {
  const { data, error } = await supabase
    .from("case_messages")
    .insert({
      appointment_id: appointmentId,
      sender_staff_id: senderStaffId,
      body,
    })
    .select()
    .single()

  if (error) throw error
  return mapCaseMessage(data)
}
