import { distanceKm } from "@/lib/geo"
import { supabase } from "@/lib/supabaseClient"
import type { MedicalShop, ShopStockItem } from "@/types"

function mapShop(row: any): MedicalShop {
  return {
    id: row.id,
    name: row.name,
    address: row.address,
    district: row.district,
    state: row.state,
    phone: row.phone ?? undefined,
    latitude: row.latitude,
    longitude: row.longitude,
  }
}

function mapShopStock(row: any): ShopStockItem {
  return {
    id: row.id,
    shopId: row.shop_id,
    name: row.name,
    category: row.category,
    status: row.status,
    updatedAt: row.updated_at,
  }
}

export async function getNearbyShops(
  origin?: { latitude: number; longitude: number }
): Promise<(MedicalShop & { distanceKm?: number })[]> {
  const { data, error } = await supabase.from("medical_shops").select("*")
  if (error) throw error

  const shops = (data ?? []).map(mapShop).map((shop) => ({
    ...shop,
    distanceKm: origin ? distanceKm(origin.latitude, origin.longitude, shop.latitude, shop.longitude) : undefined,
  }))
  return origin ? shops.sort((a, b) => (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity)) : shops
}

export async function searchShopStock(shopId: string, query: string): Promise<ShopStockItem[]> {
  const q = query.trim()
  let request = supabase.from("shop_stock").select("*").eq("shop_id", shopId)
  if (q) request = request.ilike("name", `%${q}%`)
  const { data, error } = await request
  if (error) throw error
  return (data ?? []).map(mapShopStock)
}

export async function getShopStock(shopId: string): Promise<ShopStockItem[]> {
  const { data, error } = await supabase.from("shop_stock").select("*").eq("shop_id", shopId)
  if (error) throw error
  return (data ?? []).map(mapShopStock)
}

export async function upsertShopStockItem(item: Omit<ShopStockItem, "updatedAt"> & { updatedAt?: string }): Promise<ShopStockItem> {
  const { data, error } = await supabase
    .from("shop_stock")
    .upsert({
      id: item.id,
      shop_id: item.shopId,
      name: item.name,
      category: item.category,
      status: item.status,
      updated_at: item.updatedAt ?? new Date().toISOString(),
    })
    .select()
    .single()

  if (error) throw error
  return mapShopStock(data)
}

export async function deleteShopStockItem(id: string): Promise<void> {
  const { error } = await supabase.from("shop_stock").delete().eq("id", id)
  if (error) throw error
}
