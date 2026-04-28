"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface Bank {
  id: string;
  code: string;
  name: string;
  subtitle: string | null;
  status: string;
  saleType: string;
  categoryName: string | null;
  sortOrder: number;
  createdAt: string;
}

const STATUS_MAP: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  draft: { label: "草稿", variant: "secondary" },
  published: { label: "已发布", variant: "default" },
  archived: { label: "已归档", variant: "outline" },
};

export default function BanksPage() {
  const [banks, setBanks] = useState<Bank[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [pageSize] = useState(20);
  const [status, setStatus] = useState("");
  const [keyword, setKeyword] = useState("");

  async function load() {
    const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
    if (status) params.set("status", status);
    if (keyword) params.set("keyword", keyword);

    const res = await fetch(`/api/admin/v1/banks?${params}`);
    const json = await res.json();
    setBanks(json.data.items);
    setTotal(json.data.total);
  }

  useEffect(() => {
    load();
  }, [page, status]);

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">题库管理</h1>
        <Link href="/banks/new">
          <Button>新增题库</Button>
        </Link>
      </div>

      <div className="flex gap-3">
        <Input
          placeholder="搜索题库名称..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          className="max-w-xs"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              setPage(1);
              load();
            }
          }}
        />
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
          className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          <option value="">全部状态</option>
          <option value="draft">草稿</option>
          <option value="published">已发布</option>
          <option value="archived">已归档</option>
        </select>
      </div>

      <div className="rounded-md border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-4 py-3 text-left font-medium">名称</th>
              <th className="px-4 py-3 text-left font-medium">分类</th>
              <th className="px-4 py-3 text-left font-medium">状态</th>
              <th className="px-4 py-3 text-left font-medium">售卖类型</th>
              <th className="px-4 py-3 text-left font-medium">排序</th>
              <th className="px-4 py-3 text-left font-medium">创建时间</th>
              <th className="px-4 py-3 text-right font-medium">操作</th>
            </tr>
          </thead>
          <tbody>
            {banks.map((bank) => (
              <tr key={bank.id} className="border-t">
                <td className="px-4 py-3">
                  <div>
                    <div className="font-medium">{bank.name}</div>
                    {bank.subtitle && (
                      <div className="text-xs text-muted-foreground">{bank.subtitle}</div>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3">{bank.categoryName ?? "-"}</td>
                <td className="px-4 py-3">
                  <Badge variant={STATUS_MAP[bank.status]?.variant ?? "secondary"}>
                    {STATUS_MAP[bank.status]?.label ?? bank.status}
                  </Badge>
                </td>
                <td className="px-4 py-3">{bank.saleType === "paid" ? "付费" : "免费"}</td>
                <td className="px-4 py-3">{bank.sortOrder}</td>
                <td className="px-4 py-3 text-muted-foreground">
                  {new Date(bank.createdAt).toLocaleDateString()}
                </td>
                <td className="px-4 py-3 text-right space-x-2">
                  <Link href={`/banks/${bank.id}/editions`}>
                    <Button variant="outline" size="sm">卷册</Button>
                  </Link>
                  <Link href={`/banks/${bank.id}/edit`}>
                    <Button variant="outline" size="sm">编辑</Button>
                  </Link>
                </td>
              </tr>
            ))}
            {banks.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                  暂无题库
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            共 {total} 条，第 {page}/{totalPages} 页
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
            >
              上一页
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage(page + 1)}
            >
              下一页
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
