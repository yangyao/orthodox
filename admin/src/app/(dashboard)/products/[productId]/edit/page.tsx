"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Sku {
  id: string;
  skuCode: string;
  title: string;
  priceFen: number;
  originalPriceFen: number | null;
  validityDays: number | null;
  wechatPayEnabled: boolean;
  walletPayEnabled: boolean;
  activationEnabled: boolean;
  status: string;
}

interface Product {
  id: string;
  productType: string;
  refId: string;
  title: string;
  coverUrl: string | null;
  sellingPoints: string[] | null;
  status: string;
  bankName: string | null;
  skus: Sku[];
}

const defaultSku = {
  title: "",
  priceFen: 0,
  originalPriceFen: null as number | null,
  validityDays: null as number | null,
  wechatPayEnabled: true,
  walletPayEnabled: true,
  activationEnabled: true,
};

export default function EditProductPage() {
  const { productId } = useParams<{ productId: string }>();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ title: "", coverUrl: "", status: "active" });
  const [saving, setSaving] = useState(false);

  // SKU dialog
  const [skuDialogOpen, setSkuDialogOpen] = useState(false);
  const [editingSku, setEditingSku] = useState<Sku | null>(null);
  const [skuForm, setSkuForm] = useState({ ...defaultSku });
  const [skuSaving, setSkuSaving] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch(`/api/admin/v1/products/${productId}`);
    const json = await res.json();
    if (json.data) {
      setProduct(json.data);
      setForm({
        title: json.data.title,
        coverUrl: json.data.coverUrl ?? "",
        status: json.data.status,
      });
    }
  }, [productId]);

  useEffect(() => { load(); }, [load]);

  async function handleSaveProduct() {
    setSaving(true);
    await fetch(`/api/admin/v1/products/${productId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: form.title,
        coverUrl: form.coverUrl || null,
        status: form.status,
      }),
    });
    setEditing(false);
    await load();
    setSaving(false);
  }

  async function handleArchive() {
    if (!confirm("确定归档此商品？")) return;
    await fetch(`/api/admin/v1/products/${productId}`, { method: "DELETE" });
    router.push("/products");
  }

  function openAddSku() {
    setEditingSku(null);
    setSkuForm({ ...defaultSku });
    setSkuDialogOpen(true);
  }

  function openEditSku(sku: Sku) {
    setEditingSku(sku);
    setSkuForm({
      title: sku.title,
      priceFen: sku.priceFen,
      originalPriceFen: sku.originalPriceFen,
      validityDays: sku.validityDays,
      wechatPayEnabled: sku.wechatPayEnabled,
      walletPayEnabled: sku.walletPayEnabled,
      activationEnabled: sku.activationEnabled,
    });
    setSkuDialogOpen(true);
  }

  async function handleSaveSku(e: React.FormEvent) {
    e.preventDefault();
    setSkuSaving(true);
    const url = editingSku
      ? `/api/admin/v1/products/${productId}/skus/${editingSku.id}`
      : `/api/admin/v1/products/${productId}/skus`;
    await fetch(url, {
      method: editingSku ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(skuForm),
    });
    setSkuDialogOpen(false);
    await load();
    setSkuSaving(false);
  }

  async function handleDeleteSku(skuId: string) {
    if (!confirm("确定删除此 SKU？")) return;
    await fetch(`/api/admin/v1/products/${productId}/skus/${skuId}`, { method: "DELETE" });
    await load();
  }

  if (!product) return <p className="text-muted-foreground p-8">加载中...</p>;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/products" className="hover:underline">商品管理</Link>
        <span>/</span>
        <span>{product.title}</span>
      </div>

      {/* Product info */}
      <div className="rounded-md border p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">{product.title}</h1>
          <div className="flex gap-2">
            <Badge variant={product.status === "active" ? "default" : "secondary"}>
              {product.status === "active" ? "上架" : product.status === "inactive" ? "下架" : "已归档"}
            </Badge>
            <Badge variant="outline">{product.productType === "bank" ? "题库" : "资料包"}</Badge>
            {!editing && <Button variant="outline" size="sm" onClick={() => setEditing(true)}>编辑</Button>}
          </div>
        </div>

        {product.bankName && (
          <p className="text-sm text-muted-foreground">关联题库: {product.bankName}</p>
        )}

        {editing ? (
          <form onSubmit={(e) => { e.preventDefault(); handleSaveProduct(); }} className="grid grid-cols-2 gap-3">
            <div>
              <Label>标题</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
            </div>
            <div>
              <Label>封面图 URL</Label>
              <Input value={form.coverUrl} onChange={(e) => setForm({ ...form, coverUrl: e.target.value })} />
            </div>
            <div>
              <Label>状态</Label>
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full border rounded-md px-3 py-2 text-sm">
                <option value="active">上架</option>
                <option value="inactive">下架</option>
              </select>
            </div>
            <div className="col-span-2 flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={() => setEditing(false)}>取消</Button>
              <Button type="submit" disabled={saving}>{saving ? "保存中..." : "保存"}</Button>
            </div>
          </form>
        ) : (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="text-destructive" onClick={handleArchive}>归档</Button>
          </div>
        )}
      </div>

      {/* SKU list */}
      <div className="rounded-md border">
        <div className="px-4 py-3 border-b bg-muted/50 flex items-center justify-between">
          <h3 className="font-medium text-sm">SKU 列表 ({product.skus.length})</h3>
          <Button size="sm" onClick={openAddSku}>添加 SKU</Button>
        </div>

        {product.skus.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-muted-foreground">暂无 SKU，请点击上方按钮添加</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-muted/30">
              <tr>
                <th className="px-3 py-2 text-left font-medium">标题</th>
                <th className="px-3 py-2 font-medium w-20">价格(元)</th>
                <th className="px-3 py-2 font-medium w-24">原价(元)</th>
                <th className="px-3 py-2 font-medium w-20">有效期</th>
                <th className="px-3 py-2 font-medium w-24">支付方式</th>
                <th className="px-3 py-2 font-medium w-24">操作</th>
              </tr>
            </thead>
            <tbody>
              {product.skus.map((sku) => (
                <tr key={sku.id} className="border-t">
                  <td className="px-3 py-2 font-medium">{sku.title}</td>
                  <td className="px-3 py-2">{(sku.priceFen / 100).toFixed(2)}</td>
                  <td className="px-3 py-2 text-muted-foreground">{sku.originalPriceFen ? (sku.originalPriceFen / 100).toFixed(2) : "-"}</td>
                  <td className="px-3 py-2">{sku.validityDays ? `${sku.validityDays}天` : "永久"}</td>
                  <td className="px-3 py-2">
                    <div className="flex gap-1 flex-wrap">
                      {sku.wechatPayEnabled && <Badge variant="secondary" className="text-xs">微信</Badge>}
                      {sku.walletPayEnabled && <Badge variant="secondary" className="text-xs">钱包</Badge>}
                      {sku.activationEnabled && <Badge variant="secondary" className="text-xs">激活码</Badge>}
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex gap-1">
                      <Button variant="outline" size="sm" className="h-7 px-2" onClick={() => openEditSku(sku)}>编辑</Button>
                      <Button variant="ghost" size="sm" className="h-7 px-2 text-destructive" onClick={() => handleDeleteSku(sku.id)}>删除</Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* SKU Dialog */}
      <Dialog open={skuDialogOpen} onOpenChange={setSkuDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingSku ? "编辑 SKU" : "添加 SKU"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveSku} className="space-y-4">
            <div className="space-y-2">
              <Label>标题 *</Label>
              <Input value={skuForm.title} onChange={(e) => setSkuForm({ ...skuForm, title: e.target.value })} required placeholder="如：月度会员" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>价格(分) *</Label>
                <Input type="number" value={skuForm.priceFen} onChange={(e) => setSkuForm({ ...skuForm, priceFen: Number(e.target.value) })} required min={1} />
              </div>
              <div className="space-y-2">
                <Label>原价(分)</Label>
                <Input type="number" value={skuForm.originalPriceFen ?? ""} onChange={(e) => setSkuForm({ ...skuForm, originalPriceFen: e.target.value ? Number(e.target.value) : null })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>有效期(天)</Label>
              <Input type="number" value={skuForm.validityDays ?? ""} onChange={(e) => setSkuForm({ ...skuForm, validityDays: e.target.value ? Number(e.target.value) : null })} placeholder="留空表示永久" />
            </div>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={skuForm.wechatPayEnabled} onChange={(e) => setSkuForm({ ...skuForm, wechatPayEnabled: e.target.checked })} />
                <span className="text-sm">微信支付</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={skuForm.walletPayEnabled} onChange={(e) => setSkuForm({ ...skuForm, walletPayEnabled: e.target.checked })} />
                <span className="text-sm">钱包支付</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={skuForm.activationEnabled} onChange={(e) => setSkuForm({ ...skuForm, activationEnabled: e.target.checked })} />
                <span className="text-sm">激活码</span>
              </label>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setSkuDialogOpen(false)}>取消</Button>
              <Button type="submit" disabled={skuSaving}>{skuSaving ? "保存中..." : "保存"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
