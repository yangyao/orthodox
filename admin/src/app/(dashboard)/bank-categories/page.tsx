"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CategoryDialog, type CategoryFormData } from "@/components/bank-categories/category-dialog";

interface Category {
  id: string;
  code: string;
  name: string;
  sortOrder: number;
  isVisible: boolean;
}

export default function BankCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);

  async function load() {
    const res = await fetch("/api/admin/v1/bank-categories");
    const json = await res.json();
    setCategories(json.data);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleCreate(data: CategoryFormData) {
    await fetch("/api/admin/v1/bank-categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    await load();
  }

  async function handleUpdate(data: CategoryFormData) {
    if (!editing) return;
    await fetch(`/api/admin/v1/bank-categories/${editing.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    setEditing(null);
    await load();
  }

  async function handleDelete(id: string) {
    if (!confirm("确定删除此分类？")) return;
    const res = await fetch(`/api/admin/v1/bank-categories/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const json = await res.json();
      alert(json.message);
      return;
    }
    await load();
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">题库分类</h1>
        <Button
          onClick={() => {
            setEditing(null);
            setDialogOpen(true);
          }}
        >
          新增分类
        </Button>
      </div>

      <div className="rounded-md border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-4 py-3 text-left font-medium">排序</th>
              <th className="px-4 py-3 text-left font-medium">编码</th>
              <th className="px-4 py-3 text-left font-medium">名称</th>
              <th className="px-4 py-3 text-left font-medium">显示</th>
              <th className="px-4 py-3 text-right font-medium">操作</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((cat) => (
              <tr key={cat.id} className="border-t">
                <td className="px-4 py-3">{cat.sortOrder}</td>
                <td className="px-4 py-3 font-mono text-xs">{cat.code}</td>
                <td className="px-4 py-3">{cat.name}</td>
                <td className="px-4 py-3">
                  <Badge variant={cat.isVisible ? "default" : "secondary"}>
                    {cat.isVisible ? "显示" : "隐藏"}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-right space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditing(cat);
                      setDialogOpen(true);
                    }}
                  >
                    编辑
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(cat.id)}
                  >
                    删除
                  </Button>
                </td>
              </tr>
            ))}
            {categories.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                  暂无分类
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <CategoryDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setEditing(null);
        }}
        initialData={editing ?? undefined}
        onSubmit={editing ? handleUpdate : handleCreate}
        title={editing ? "编辑分类" : "新增分类"}
      />
    </div>
  );
}
