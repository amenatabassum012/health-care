import { db } from "@/lib/db"
import { distanceKm } from "@/lib/geo"
import { MOCK_SHOPS, MOCK_SHOP_STOCK } from "@/mocks/shops"
import type { MedicalShop, ShopStockItem } from "@/types"
import { networkDelay } from "./delay"

/** Seeds the offline cache from mock data the first time it's read, so admin edits persist locally afterwards. */
async function ensureShopStockSeeded() {
  const count = await db.shopStock.count()
  if (count === 0) await db.shopStock.bulkPut(MOCK_SHOP_STOCK)
}

export async function getNearbyShops(
  origin?: { latitude: number; longitude: number }
): Promise<(MedicalShop & { distanceKm?: number })[]> {
  await networkDelay(350)
  const shops = MOCK_SHOPS.map((shop) => ({
    ...shop,
    distanceKm: origin ? distanceKm(origin.latitude, origin.longitude, shop.latitude, shop.longitude) : undefined,
  }))
  return origin ? shops.sort((a, b) => (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity)) : shops
}

export async function searchShopStock(shopId: string, query: string): Promise<ShopStockItem[]> {
  await networkDelay(300)
  await ensureShopStockSeeded()
  const q = query.trim().toLowerCase()
  return db.shopStock
    .where("shopId")
    .equals(shopId)
    .filter((s) => !q || s.name.toLowerCase().includes(q))
    .toArray()
}

export async function getShopStock(shopId: string): Promise<ShopStockItem[]> {
  await ensureShopStockSeeded()
  return db.shopStock.where("shopId").equals(shopId).toArray()
}

export async function upsertShopStockItem(item: Omit<ShopStockItem, "updatedAt"> & { updatedAt?: string }): Promise<ShopStockItem> {
  await networkDelay(300)
  const saved: ShopStockItem = { ...item, updatedAt: new Date().toISOString() }
  await db.shopStock.put(saved)
  return saved
}

export async function deleteShopStockItem(id: string): Promise<void> {
  await networkDelay(200)
  await db.shopStock.delete(id)
}
