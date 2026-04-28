"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface Question {
  id: string;
  questionType: string;
  stem: string;
  difficulty: number;
  sectionTitle: string | null;
  sourceLabel: string | null;
  status: string;
  createdAt: string;
}

const TYPE_MAP: Record<string, string> = { single: "单选", multi: "多选", judge: "判断", fill: "填空" };

export default function QuestionsPage() {
  const { bankId } = useParams<{ bankId: string }>();
  const [bankName, setBankName] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [pageSize] = useState(20);
  const [questionType, setQuestionType] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [keyword, setKeyword] = useState("");

  async function load() {
    const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
    if (questionType) params.set("questionType", questionType);
    if (difficulty) params.set("difficulty", difficulty);
    if (keyword) params.set("keyword", keyword);
    const res = await fetch(`/api/admin/v1/banks/${bankId}/questions?${params}`);
    const json = await res.json();
    setQuestions(json.data.items);
    setTotal(json.data.total);
  }

  useEffect(() => {
    fetch(`/api/admin/v1/banks/${bankId}`).then((r) => r.json()).then((j) => setBankName(j.data?.name ?? ""));
    load();
  }, [bankId, page, questionType, difficulty]);

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Link href="/banks" className="text-sm text-muted-foreground hover:underline">题库管理</Link>
        <span className="text-muted-foreground">/</span>
        <h1 className="text-2xl font-bold tracking-tight">{bankName} - 题目管理</h1>
      </div>

      <div className="flex flex-wrap gap-3 items-center">
        <Input
          placeholder="搜索题干..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          className="max-w-xs"
          onKeyDown={(e) => { if (e.key === "Enter") { setPage(1); load(); } }}
        />
        <select
          value={questionType}
          onChange={(e) => { setQuestionType(e.target.value); setPage(1); }}
          className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          <option value="">全部类型</option>
          <option value="single">单选</option>
          <option value="multi">多选</option>
          <option value="judge">判断</option>
          <option value="fill">填空</option>
        </select>
        <select
          value={difficulty}
          onChange={(e) => { setDifficulty(e.target.value); setPage(1); }}
          className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          <option value="">全部难度</option>
          {[1, 2, 3, 4, 5].map((d) => <option key={d} value={d}>难度 {d}</option>)}
        </select>
        <div className="ml-auto flex gap-2">
          <Link href={`/banks/${bankId}/questions/import`}>
            <Button variant="outline">批量导入</Button>
          </Link>
          <Link href={`/banks/${bankId}/questions/new`}>
            <Button>新增题目</Button>
          </Link>
        </div>
      </div>

      <div className="rounded-md border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-4 py-3 text-left font-medium w-12">序号</th>
              <th className="px-4 py-3 text-left font-medium">题干</th>
              <th className="px-4 py-3 text-left font-medium w-16">类型</th>
              <th className="px-4 py-3 text-left font-medium w-16">难度</th>
              <th className="px-4 py-3 text-left font-medium">章节</th>
              <th className="px-4 py-3 text-right font-medium w-20">操作</th>
            </tr>
          </thead>
          <tbody>
            {questions.map((q, i) => (
              <tr key={q.id} className="border-t">
                <td className="px-4 py-3 text-muted-foreground">{(page - 1) * pageSize + i + 1}</td>
                <td className="px-4 py-3 max-w-md truncate">{q.stem}</td>
                <td className="px-4 py-3">
                  <Badge variant="secondary">{TYPE_MAP[q.questionType] ?? q.questionType}</Badge>
                </td>
                <td className="px-4 py-3">{q.difficulty}</td>
                <td className="px-4 py-3 text-muted-foreground text-xs">{q.sectionTitle ?? "-"}</td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/questions/${q.id}/edit`}>
                    <Button variant="outline" size="sm">编辑</Button>
                  </Link>
                </td>
              </tr>
            ))}
            {questions.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">暂无题目</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">共 {total} 题，第 {page}/{totalPages} 页</p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>上一页</Button>
            <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>下一页</Button>
          </div>
        </div>
      )}
    </div>
  );
}
