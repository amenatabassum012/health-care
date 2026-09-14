import Dexie, { type EntityTable } from "dexie"
import type { StoredCertificate, TriageSession } from "@/types"

/**
 * Local-first cache per Architecture Specification §6 (Offline-First & Sync Strategy).
 * Triage sessions and uploaded credential files are readable/writable offline;
 * everything else (appointments, referrals, health records, feedback, shop
 * stock) now lives in Supabase as the source of truth.
 *
 * Table versions are kept below so existing users' IndexedDB (which already
 * has tables up to version 3) upgrades cleanly instead of erroring.
 */
class RuralHealthConnectDB extends Dexie {
  triageSessions!: EntityTable<TriageSession, "id">
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
    this.version(4).stores({
      triageSessions: "id, patientId, createdAt",
      healthRecords: null,
      appointments: null,
      referrals: null,
      certificateFiles: "id",
      feedback: null,
      shopStock: null,
    })
  }
}

export const db = new RuralHealthConnectDB()
