import Dexie, { type EntityTable } from "dexie"
import type { Appointment, DoctorFeedback, HealthRecordEntry, Referral, ShopStockItem, StoredCertificate, TriageSession } from "@/types"

/**
 * Local-first cache per Architecture Specification §6 (Offline-First & Sync Strategy).
 * Triage, health records, and appointment/queue state are readable and writable
 * offline; a background sync layer reconciles with the server when it exists.
 */
class RuralHealthConnectDB extends Dexie {
  triageSessions!: EntityTable<TriageSession, "id">
  healthRecords!: EntityTable<HealthRecordEntry, "id">
  appointments!: EntityTable<Appointment, "id">
  referrals!: EntityTable<Referral, "id">
  certificateFiles!: EntityTable<StoredCertificate, "id">
  feedback!: EntityTable<DoctorFeedback, "id">
  shopStock!: EntityTable<ShopStockItem, "id">

  constructor() {
    super("rhc-offline-cache")
    this.version(1).stores({
      triageSessions: "id, patientId, createdAt",
      healthRecords: "id, patientId, date",
      appointments: "id, patientId, status",
      referrals: "id, patientId, status",
      certificateFiles: "id",
    })
    this.version(2).stores({
      triageSessions: "id, patientId, createdAt",
      healthRecords: "id, patientId, date",
      appointments: "id, patientId, status",
      referrals: "id, patientId, status",
      certificateFiles: "id",
      feedback: "id, doctorId, appointmentId, patientId",
    })
    this.version(3).stores({
      triageSessions: "id, patientId, createdAt",
      healthRecords: "id, patientId, date",
      appointments: "id, patientId, status",
      referrals: "id, patientId, status",
      certificateFiles: "id",
      feedback: "id, doctorId, appointmentId, patientId",
      shopStock: "id, shopId",
    })
  }
}

export const db = new RuralHealthConnectDB()
