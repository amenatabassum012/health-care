import Dexie, { type EntityTable } from "dexie"
import type { Appointment, HealthRecordEntry, Referral, StoredCertificate, TriageSession } from "@/types"

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

  constructor() {
    super("rhc-offline-cache")
    this.version(1).stores({
      triageSessions: "id, patientId, createdAt",
      healthRecords: "id, patientId, date",
      appointments: "id, patientId, status",
      referrals: "id, patientId, status",
      certificateFiles: "id",
    })
  }
}

export const db = new RuralHealthConnectDB()
