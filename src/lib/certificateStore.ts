import { db } from "@/lib/db"
import type { StoredCertificate } from "@/types"

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
}

export async function saveCertificateFile(id: string, file: File): Promise<StoredCertificate> {
  const dataUrl = await readFileAsDataUrl(file)
  const record: StoredCertificate = {
    id,
    fileName: file.name,
    mimeType: file.type || "application/octet-stream",
    dataUrl,
  }
  await db.certificateFiles.put(record)
  return record
}

export async function getCertificateFile(id: string) {
  return db.certificateFiles.get(id)
}
