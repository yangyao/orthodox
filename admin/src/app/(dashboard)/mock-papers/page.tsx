"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface MockPaper {
  id: string;
  bankId: string;
  bankName: string | null;
  title: string;
  paperYear: number | null;
  totalQuestions: number;
  totalScore: number;
  durationMinutes: number;
  status: string;
}

export default function MockPapersOverviewPage() {
  const [papers, setPapers] = useState<MockPaper[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("");
  const [keyword, setKeyword] = useState("");
  const pageSize = 20;

  useEffect(() => {
    const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
    if (status) params.set("status", status);
    if (keyword) params.set("keyword", keyword);

    fetch(`/api/admin/v1/mock-papers?${params}`)
      .then((r) => r.json())
      .then((json) => {
        setPapers(json.data?.items ?? []);
        setTotal(json.data?.total ?? 0);
      });
  }, [page, status, keyword]);

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">模考管理</h1>
          <p className="text-sm text-muted-foreground">跨题库查看和进入单份模考试卷。</p>
        </div>
        <Link href="/banks">
          <Button variant="outline">前往题库管理</Button>
        </Link>
      </div>

      <div className="flex flex-wrap gap-2">
        <Input
          placeholder="搜索试卷标题..."
          value={keyword}
          onChange={(e) => {
            setKeyword(e.target.value);
            setPage(1);
          }}
          className="max-w-xs"
        />
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
          className="rounded-md border px-3 py-2 text-sm"
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
              <th className="px-4 py-3 text-left font-medium">试卷</th>
              <th className="px-4 py-3 text-left font-medium">题库</th>
              <th className="px-4 py-3 text-left font-medium">年份</th>
              <th className="px-4 py-3 text-left font-medium">题数</th>
              <th className="px-4 py-3 text-left font-medium">总分</th>
              <th className="px-4 py-3 text-left font-medium">状态</th>
              <th className="px-4 py-3 text-left font-medium">操作</th>
            </tr>
          </thead>
          <tbody>
            {papers.map((paper) => (
              <tr key={paper.id} className="border-t hover:bg-muted/30">
                <td className="px-4 py-3">
                  <div className="font-medium">{paper.title}</div>
                  <div className="text-xs text-muted-foreground">{paper.durationMinutes} 分钟</div>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{paper.bankName ?? `题库 ${paper.bankId}`}</td>
                <td className="px-4 py-3 text-muted-foreground">{paper.paperYear ?? "-"}</td>
                <td className="px-4 py-3">{paper.totalQuestions}</td>
                <td className="px-4 py-3">{paper.totalScore}</td>
                <td className="px-4 py-3">
                  <Badge variant={paper.status === "published" ? "default" : "secondary"}>
                    {paper.status === "draft" ? "草稿" : paper.status === "published" ? "已发布" : "已归档"}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <Link href={`/banks/${paper.bankId}/mock-papers/${paper.id}/edit`}>
                      <Button variant="outline" size="sm">组卷</Button>
                    </Link>
                    <Link href={`/banks/${paper.bankId}/mock-papers`}>
                      <Button variant="ghost" size="sm">所属题库</Button>
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
            {papers.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                  暂无模考试卷
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
            上一页
          </Button>
          <span className="py-2 text-sm text-muted-foreground">
            {page}/{totalPages}
          </span>
          <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
            下一页
          </Button>
        </div>
      )}
    </div>
  );
}
