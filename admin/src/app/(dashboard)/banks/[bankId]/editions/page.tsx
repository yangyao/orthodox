"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Edition {
  id: string;
  name: string;
  versionLabel: string | null;
  sortOrder: number;
  isTrial: boolean;
  isActive: boolean;
}

interface BankInfo {
  data: { name: string };
}

export default function EditionsPage() {
  const { bankId } = useParams<{ bankId: string }>();
  const [bankName, setBankName] = useState("");
  const [editions, setEditions] = useState<Edition[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Edition | null>(null);
  const [form, setForm] = useState({ name: "", versionLabel: "", sortOrder: 0, isTrial: false, isActive: true });
  const [loading, setLoading] = useState(false);

  async function load() {
    const [bankRes, editionRes] = await Promise.all([
      fetch(`/api/admin/v1/banks/${bankId}`),
      fetch(`/api/admin/v1/banks/${bankId}/editions`),
    ]);
    const bankJson = await bankRes.json();
    const editionJson = await editionRes.json();
    setBankName(bankJson.data?.name ?? "");
    setEditions(editionJson.data);
  }

  useEffect(() => {
    load();
  }, [bankId]);

  function openCreate() {
    setEditing(null);
    setForm({ name: "", versionLabel: "", sortOrder: 0, isTrial: false, isActive: true });
    setDialogOpen(true);
  }

  function openEdit(ed: Edition) {
    setEditing(ed);
    setForm({
      name: ed.name,
      versionLabel: ed.versionLabel ?? "",
      sortOrder: ed.sortOrder,
      isTrial: ed.isTrial,
      isActive: ed.isActive,
    });
    setDialogOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (editing) {
        await fetch(`/api/admin/v1/editions/${editing.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
      } else {
        await fetch(`/api/admin/v1/banks/${bankId}/editions`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
      }
      setDialogOpen(false);
      await load();
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("确定删除此卷册？关联的章节也会被一并删除。")) return;
    await fetch(`/api/admin/v1/editions/${id}`, { method: "DELETE" });
    await load();
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Link href="/banks" className="text-sm text-muted-foreground hover:underline">
          题库管理
        </Link>
        <span className="text-muted-foreground">/</span>
        <h1 className="text-2xl font-bold tracking-tight">{bankName} - 卷册管理</h1>
      </div>

      <div className="flex justify-end gap-2">
        <Link href={`/banks/${bankId}/questions`}>
          <Button variant="outline">题目列表</Button>
        </Link>
        <Link href={`/banks/${bankId}/mock-papers`}>
          <Button variant="outline">模考试卷</Button>
        </Link>
        <Button onClick={openCreate}>新增卷册</Button>
      </div>

      <div className="rounded-md border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-4 py-3 text-left font-medium">名称</th>
              <th className="px-4 py-3 text-left font-medium">版本标签</th>
              <th className="px-4 py-3 text-left font-medium">排序</th>
              <th className="px-4 py-3 text-left font-medium">试用</th>
              <th className="px-4 py-3 text-left font-medium">状态</th>
              <th className="px-4 py-3 text-right font-medium">操作</th>
            </tr>
          </thead>
          <tbody>
            {editions.map((ed) => (
              <tr key={ed.id} className="border-t">
                <td className="px-4 py-3 font-medium">{ed.name}</td>
                <td className="px-4 py-3 text-muted-foreground">{ed.versionLabel || "-"}</td>
                <td className="px-4 py-3">{ed.sortOrder}</td>
                <td className="px-4 py-3">
                  <Badge variant={ed.isTrial ? "default" : "secondary"}>
                    {ed.isTrial ? "试用" : "正式"}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <Badge variant={ed.isActive ? "default" : "outline"}>
                    {ed.isActive ? "启用" : "停用"}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-right space-x-2">
                  <Link href={`/editions/${ed.id}/sections`}>
                    <Button variant="outline" size="sm">章节</Button>
                  </Link>
                  <Button variant="outline" size="sm" onClick={() => openEdit(ed)}>编辑</Button>
                  <Button variant="outline" size="sm" onClick={() => handleDelete(ed.id)}>删除</Button>
                </td>
              </tr>
            ))}
            {editions.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">暂无卷册</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? "编辑卷册" : "新增卷册"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">名称 *</Label>
              <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="versionLabel">版本标签</Label>
              <Input id="versionLabel" value={form.versionLabel} onChange={(e) => setForm({ ...form, versionLabel: e.target.value })} placeholder="如 v2025.1" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sortOrder">排序</Label>
              <Input id="sortOrder" type="number" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })} />
            </div>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={form.isTrial} onChange={(e) => setForm({ ...form, isTrial: e.target.checked })} />
                <span className="text-sm">试用卷册</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
                <span className="text-sm">启用</span>
              </label>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>取消</Button>
              <Button type="submit" disabled={loading}>{loading ? "保存中..." : "保存"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
