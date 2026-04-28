"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface Category {
  id: string;
  name: string;
}

interface BankFormProps {
  bankId?: string;
}

const STATUS_MAP: Record<string, string> = {
  draft: "草稿",
  published: "已发布",
  archived: "已归档",
};

export function BankForm({ bankId }: BankFormProps) {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    categoryId: "",
    code: "",
    name: "",
    subtitle: "",
    coverUrl: "",
    description: "",
    saleType: "paid",
    defaultValidDays: "",
    sortOrder: "0",
    isRecommended: false,
  });

  useEffect(() => {
    fetch("/api/admin/v1/bank-categories")
      .then((r) => r.json())
      .then((json) => setCategories(json.data));

    if (bankId) {
      fetch(`/api/admin/v1/banks/${bankId}`)
        .then((r) => r.json())
        .then((json) => {
          const b = json.data;
          setForm({
            categoryId: String(b.categoryId),
            code: b.code,
            name: b.name,
            subtitle: b.subtitle ?? "",
            coverUrl: b.coverUrl ?? "",
            description: b.description ?? "",
            saleType: b.saleType,
            defaultValidDays: b.defaultValidDays ? String(b.defaultValidDays) : "",
            sortOrder: String(b.sortOrder),
            isRecommended: b.isRecommended,
          });
        });
    }
  }, [bankId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const payload = {
      categoryId: Number(form.categoryId),
      code: form.code,
      name: form.name,
      subtitle: form.subtitle || undefined,
      coverUrl: form.coverUrl || undefined,
      description: form.description || undefined,
      saleType: form.saleType,
      defaultValidDays: form.defaultValidDays ? Number(form.defaultValidDays) : null,
      sortOrder: Number(form.sortOrder),
      isRecommended: form.isRecommended,
    };

    const url = bankId ? `/api/admin/v1/banks/${bankId}` : "/api/admin/v1/banks";
    const method = bankId ? "PATCH" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const json = await res.json();
        alert(json.message);
        return;
      }
      router.push("/banks");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
      <div className="space-y-2">
        <Label htmlFor="categoryId">分类 *</Label>
        <select
          id="categoryId"
          value={form.categoryId}
          onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          required
        >
          <option value="">请选择分类</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="code">编码 *</Label>
        <Input
          id="code"
          value={form.code}
          onChange={(e) => setForm({ ...form, code: e.target.value })}
          disabled={!!bankId}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="name">名称 *</Label>
        <Input
          id="name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="subtitle">副标题</Label>
        <Input
          id="subtitle"
          value={form.subtitle}
          onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="coverUrl">封面 URL</Label>
        <Input
          id="coverUrl"
          value={form.coverUrl}
          onChange={(e) => setForm({ ...form, coverUrl: e.target.value })}
          placeholder="https://..."
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">描述</Label>
        <Textarea
          id="description"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          rows={4}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="saleType">售卖类型</Label>
          <select
            id="saleType"
            value={form.saleType}
            onChange={(e) => setForm({ ...form, saleType: e.target.value })}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="paid">付费</option>
            <option value="free">免费</option>
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="defaultValidDays">有效天数</Label>
          <Input
            id="defaultValidDays"
            type="number"
            value={form.defaultValidDays}
            onChange={(e) => setForm({ ...form, defaultValidDays: e.target.value })}
            placeholder="留空表示永久"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="sortOrder">排序</Label>
          <Input
            id="sortOrder"
            type="number"
            value={form.sortOrder}
            onChange={(e) => setForm({ ...form, sortOrder: e.target.value })}
          />
        </div>

        <div className="flex items-center gap-2 pt-8">
          <input
            id="isRecommended"
            type="checkbox"
            checked={form.isRecommended}
            onChange={(e) => setForm({ ...form, isRecommended: e.target.checked })}
          />
          <Label htmlFor="isRecommended">推荐</Label>
        </div>
      </div>

      <div className="flex gap-2">
        <Button type="submit" disabled={loading}>
          {loading ? "保存中..." : bankId ? "保存" : "创建"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.push("/banks")}>
          取消
        </Button>
      </div>
    </form>
  );
}
