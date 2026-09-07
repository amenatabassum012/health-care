import { useState } from "react"
import { useTranslation } from "react-i18next"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { Pill, Plus, Store, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { StatusBadge, type StatusTone } from "@/components/shared/StatusBadge"
import { getShopStock, deleteShopStockItem, upsertShopStockItem } from "@/lib/api/shops"
import { MOCK_SHOPS } from "@/mocks/shops"
import type { ShopStockItem } from "@/types"

const STATUS_TONE: Record<ShopStockItem["status"], StatusTone> = {
  Available: "completed",
  LowStock: "pending",
  Unavailable: "emergency",
}

export function ShopInventoryPage() {
  const { t } = useTranslation()
  const qc = useQueryClient()
  const [shopId, setShopId] = useState(MOCK_SHOPS[0]?.id)
  const [name, setName] = useState("")
  const [category, setCategory] = useState<ShopStockItem["category"]>("Medicine")
  const [status, setStatus] = useState<ShopStockItem["status"]>("Available")

  const { data: items } = useQuery({
    queryKey: ["shop-inventory", shopId],
    queryFn: () => getShopStock(shopId!),
    enabled: !!shopId,
  })

  const saveMutation = useMutation({
    mutationFn: upsertShopStockItem,
    onSuccess: () => {
      toast.success(t("doctor.shop.saved"))
      qc.invalidateQueries({ queryKey: ["shop-inventory", shopId] })
      setName("")
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteShopStockItem,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["shop-inventory", shopId] }),
  })

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold text-foreground">{t("doctor.shop.title")}</h1>

      <div className="space-y-1.5">
        <Label className="text-xs">{t("doctor.shop.selectShop")}</Label>
        <Select value={shopId} onValueChange={(v) => setShopId(v ?? undefined)}>
          <SelectTrigger className="h-11 w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {MOCK_SHOPS.map((shop) => (
              <SelectItem key={shop.id} value={shop.id}>
                {shop.name} — {shop.address}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-2xl border border-border bg-card p-5">
        <h2 className="mb-3 flex items-center gap-1.5 text-sm font-bold uppercase tracking-wide text-muted-foreground">
          <Plus className="size-3.5" />
          {t("doctor.shop.addItem")}
        </h2>
        <div className="grid gap-3 sm:grid-cols-3">
          <Input
            placeholder={t("doctor.shop.itemName")}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Select value={category} onValueChange={(v) => v && setCategory(v as ShopStockItem["category"])}>
            <SelectTrigger className="h-10 w-full"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Medicine">{t("doctor.shop.categoryMedicine")}</SelectItem>
              <SelectItem value="Diagnostic">{t("doctor.shop.categoryDiagnostic")}</SelectItem>
            </SelectContent>
          </Select>
          <Select value={status} onValueChange={(v) => v && setStatus(v as ShopStockItem["status"])}>
            <SelectTrigger className="h-10 w-full"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Available">{t("status.available")}</SelectItem>
              <SelectItem value="LowStock">{t("status.lowStock")}</SelectItem>
              <SelectItem value="Unavailable">{t("status.unavailable")}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button
          className="mt-3"
          disabled={!name.trim() || !shopId}
          onClick={() =>
            shopId &&
            saveMutation.mutate({ id: `sstk-${Date.now()}`, shopId, name: name.trim(), category, status })
          }
        >
          <Plus className="size-4" />
          {t("doctor.shop.addItem")}
        </Button>
      </div>

      <div className="rounded-2xl border border-border bg-card p-5">
        <h2 className="mb-3 flex items-center gap-1.5 text-sm font-bold uppercase tracking-wide text-muted-foreground">
          <Store className="size-3.5" />
          {t("doctor.shop.currentStock")}
        </h2>
        <div className="space-y-2">
          {items?.map((item) => (
            <div key={item.id} className="flex items-center justify-between rounded-lg bg-muted px-3.5 py-2.5 text-sm">
              <div className="flex items-center gap-2.5">
                <Pill className="size-4 text-teal-dark" />
                <span>{item.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge tone={STATUS_TONE[item.status]} label={t(`status.${item.status.charAt(0).toLowerCase() + item.status.slice(1)}`)} />
                <button
                  type="button"
                  onClick={() => deleteMutation.mutate(item.id)}
                  className="text-muted-foreground hover:text-coral"
                  aria-label={t("doctor.shop.removeItem")}
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            </div>
          ))}
          {items?.length === 0 && (
            <p className="text-xs text-muted-foreground">{t("doctor.shop.noItems")}</p>
          )}
        </div>
      </div>
    </div>
  )
}
