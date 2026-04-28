"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Bank {
  id: string;
  name: string;
}

export default function NewProductPage() {
  const router = useRouter();
  const [banks, setBanks] = useState<Bank[]>([]);
  const [banksLoaded, setBanksLoaded] = useState(false);
  const [form, setForm] = useState({
    productType: "bank",
    refId: "",
    title: "",
    coverUrl: "",
    status: "active",
  });
  const [loading, setLoading] = useState(false);

  function loadBanks() {
    if (banksLoaded) return;
    fetch("/api/admin/v1/banks?pageSize=100")
      .then((r) => r.json())
      .then((json) => {
        setBanks(json.data?.items ?? []);
        setBanksLoaded(true);
      });
  }

  // Load banks on mount since default type is bank
  useState(() => { loadBanks(); });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/admin/v1/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        refId: Number(form.refId),
        coverUrl: form.coverUrl || undefined,
      }),
    });
    const json = await res.json();
    if (json.data?.id) {
      router.push(`/products/${json.data.id}/edit`);
    } else {
      alert(json.message ?? "创建失败");
    }
    setLoading(false);
  }

  return (
    <div className="space-y-4 max-w-lg">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/products" className="hover:underline">商品管理</Link>
        <span>/</span>
        <span>新建商品</span>
      </div>

      <h1 className="text-2xl font-bold tracking-tight">新建商品</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label>商品类型</Label>
          <select
            value={form.productType}
            onChange={(e) => {
              setForm({ ...form, productType: e.target.value, refId: "" });
              if (e.target.value === "bank") loadBanks();
            }}
            className="w-full border rounded-md px-3 py-2 text-sm"
          >
            <option value="bank">题库商品</option>
            <option value="material">资料包商品</option>
          </select>
        </div>

        {form.productType === "bank" && (
          <div className="space-y-2">
            <Label>关联题库 *</Label>
            <select
              value={form.refId}
              onChange={(e) => setForm({ ...form, refId: e.target.value })}
              className="w-full border rounded-md px-3 py-2 text-sm"
              required
            >
              <option value="">请选择题库</option>
              {banks.map((b) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="title">商品标题 *</Label>
          <Input id="title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
        </div>

        <div className="space-y-2">
          <Label htmlFor="coverUrl">封面图 URL</Label>
          <Input id="coverUrl" value={form.coverUrl} onChange={(e) => setForm({ ...form, coverUrl: e.target.value })} placeholder="可选" />
        </div>

        <div className="space-y-2">
          <Label>状态</Label>
          <select
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
            className="w-full border rounded-md px-3 py-2 text-sm"
          >
            <option value="active">上架</option>
            <option value="inactive">下架</option>
          </select>
        </div>

        <div className="flex gap-2">
          <Button type="submit" disabled={loading || !form.refId}>
            {loading ? "创建中..." : "创建商品"}
          </Button>
          <Link href="/products">
            <Button type="button" variant="outline">取消</Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
