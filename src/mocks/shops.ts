import type { MedicalShop, ShopStockItem } from "@/types"

/**
 * Privately-run medical/pharmacy shops. Unlike government Facilities these
 * have no login of their own — inventory is entered and kept up to date by
 * facility admin staff via ShopInventoryPage.
 */
export const MOCK_SHOPS: MedicalShop[] = [
  { id: "shop-001", name: "Sharma Medical Store", address: "Main Bazaar, Bahadrabad", district: "Haridwar", state: "Uttarakhand", phone: "+911334200001", latitude: 29.9250, longitude: 78.0340 },
  { id: "shop-002", name: "Jai Mata Di Pharmacy", address: "Station Road, Roorkee", district: "Haridwar", state: "Uttarakhand", phone: "+911332200002", latitude: 29.8560, longitude: 77.8865 },
  { id: "shop-003", name: "Ganga Medicos", address: "Upper Road, Haridwar", district: "Haridwar", state: "Uttarakhand", phone: "+911334200003", latitude: 29.9475, longitude: 78.1610 },
  { id: "shop-004", name: "Kisan Pharmacy", address: "Bus Stand, Narsan", district: "Haridwar", state: "Uttarakhand", phone: "+911334200004", latitude: 29.8420, longitude: 78.0600 },
]

export const MOCK_SHOP_STOCK: ShopStockItem[] = [
  { id: "sstk-001", shopId: "shop-001", name: "Paracetamol 500mg", category: "Medicine", status: "Available", updatedAt: "2026-08-24T08:00:00+05:30" },
  { id: "sstk-002", shopId: "shop-001", name: "ORS Sachets", category: "Medicine", status: "Available", updatedAt: "2026-08-24T08:00:00+05:30" },
  { id: "sstk-003", shopId: "shop-002", name: "Amoxicillin 500mg", category: "Medicine", status: "LowStock", updatedAt: "2026-08-23T18:00:00+05:30" },
  { id: "sstk-004", shopId: "shop-003", name: "Chest X-ray", category: "Diagnostic", status: "Unavailable", updatedAt: "2026-08-23T18:00:00+05:30" },
  { id: "sstk-005", shopId: "shop-004", name: "Iron & Folic Acid tablets", category: "Medicine", status: "Available", updatedAt: "2026-08-24T08:00:00+05:30" },
]
