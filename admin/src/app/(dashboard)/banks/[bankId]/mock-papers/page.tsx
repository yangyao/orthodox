"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface Paper {
  id: string;
  title: string;
  paperYear: number | null;
  totalQuestions: number;
  totalScore: number;
  passingScore: number | null;
  durationMinutes: number;
  status: string;
  createdAt: string;
}

export default function MockPapersPage() {
  const { bankId } = useParams<{ bankId: string }>();
  const router = useRouter();
  const [bankName, setBankName] = useState("");
  const [papers, setPapers] = useState<Paper[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("");
  const [keyword, setKeyword] = useState("");

  const pageSize = 20;

  useEffect(() => {
    fetch(`/api/admin/v1/banks/${bankId}`).then((r) => r.json()).then((j) => setBankName(j.data?.name ?? ""));
  }, [bankId]);

  useEffect(() => {
    const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
    if (status) params.set("status", status);
    if (keyword) params.set("keyword", keyword);
    fetch(`/api/admin/v1/banks/${bankId}/mock-papers?${params}`)
      .then((r) => r.json())
      .then((json) => {
        setPapers(json.data?.items ?? []);
        setTotal(json.data?.total ?? 0);
      });
  }, [bankId, page, status, keyword]);

  async function handleCreate() {
    const title = prompt("请输入试卷标题");
    if (!title) return;
    const duration = prompt("考试时长（分钟）", "60");
    if (!duration) return;

    const res = await fetch(`/api/admin/v1/banks/${bankId}/mock-papers`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, durationMinutes: Number(duration) }),
    });
    const json = await res.json();
    if (json.data?.id) {
      router.push(`/banks/${bankId}/mock-papers/${json.data.id}/edit`);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("确定要删除这份试卷吗？")) return;
    await fetch(`/api/admin/v1/mock-papers/${id}`, { method: "DELETE" });
    setPage(1);
    const params = new URLSearchParams({ page: "1", pageSize: String(pageSize) });
    if (status) params.set("status", status);
    if (keyword) params.set("keyword", keyword);
    const res = await fetch(`/api/admin/v1/banks/${bankId}/mock-papers?${params}`);
    const json = await res.json();
    setPapers(json.data?.items ?? []);
    setTotal(json.data?.total ?? 0);
  }

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/banks" className="hover:underline">题库管理</Link>
        <span>/</span>
        <span>{bankName}</span>
        <span>/</span>
        <span>模考试卷</span>
      </div>

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">模考试卷</h1>
        <div className="flex gap-2">
          <Link href={`/banks/${bankId}/questions`}>
            <Button variant="outline" size="sm">题目管理</Button>
          </Link>
          <Button size="sm" onClick={handleCreate}>新建试卷</Button>
        </div>
      </div>

      <div className="flex gap-2">
        <Input
          placeholder="搜索试卷标题..."
          value={keyword}
          onChange={(e) => { setKeyword(e.target.value); setPage(1); }}
          className="max-w-xs"
        />
        <select
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          className="border rounded-md px-3 py-2 text-sm"
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
              <th className="px-4 py-3 text-left font-medium">标题</th>
              <th className="px-4 py-3 text-left font-medium w-20">年份</th>
              <th className="px-4 py-3 text-left font-medium w-20">题数</th>
              <th className="px-4 py-3 text-left font-medium w-20">总分</th>
              <th className="px-4 py-3 text-left font-medium w-24">时长(分)</th>
              <th className="px-4 py-3 text-left font-medium w-24">状态</th>
              <th className="px-4 py-3 text-left font-medium w-40">操作</th>
            </tr>
          </thead>
          <tbody>
            {papers.map((p) => (
              <tr key={p.id} className="border-t hover:bg-muted/30">
                <td className="px-4 py-3 font-medium">{p.title}</td>
                <td className="px-4 py-3 text-muted-foreground">{p.paperYear ?? "-"}</td>
                <td className="px-4 py-3">{p.totalQuestions}</td>
                <td className="px-4 py-3">{p.totalScore}</td>
                <td className="px-4 py-3">{p.durationMinutes}</td>
                <td className="px-4 py-3">
                  <Badge variant={p.status === "published" ? "default" : "secondary"}>
                    {p.status === "draft" ? "草稿" : p.status === "published" ? "已发布" : "已归档"}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <Link href={`/banks/${bankId}/mock-papers/${p.id}/edit`}>
                      <Button variant="outline" size="sm">组卷</Button>
                    </Link>
                    <Button variant="ghost" size="sm" className="text-destructive" onClick={() => handleDelete(p.id)}>
                      删除
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
            {papers.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">暂无模考试卷</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex gap-2 justify-center">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>上一页</Button>
          <span className="py-2 text-sm text-muted-foreground">{page}/{totalPages}</span>
          <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>下一页</Button>
        </div>
      )}
    </div>
  );
}
