"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { QuestionPicker } from "@/components/mock-papers/question-picker";
import { RandomDraw } from "@/components/mock-papers/random-draw";

interface PaperQuestion {
  questionId: string;
  sortOrder: number;
  score: string;
  questionType: string;
  stem: string;
}

interface Paper {
  id: string;
  bankId: string;
  title: string;
  paperYear: number | null;
  totalQuestions: number;
  totalScore: number;
  passingScore: number | null;
  durationMinutes: number;
  status: string;
  questions: PaperQuestion[];
}

interface Section {
  id: number;
  title: string;
}

const TYPE_MAP: Record<string, string> = {
  single: "单选",
  multi: "多选",
  judge: "判断",
  fill: "填空",
};

export default function EditPaperPage() {
  const { bankId, paperId } = useParams<{ bankId: string; paperId: string }>();
  const router = useRouter();
  const [paper, setPaper] = useState<Paper | null>(null);
  const [sections, setSections] = useState<Section[]>([]);
  const [tab, setTab] = useState<"manual" | "random">("manual");
  const [editingInfo, setEditingInfo] = useState(false);
  const [form, setForm] = useState({ title: "", durationMinutes: 60, passingScore: "", paperYear: "" });
  const [saving, setSaving] = useState(false);

  const loadPaper = useCallback(async () => {
    const res = await fetch(`/api/admin/v1/mock-papers/${paperId}`);
    const json = await res.json();
    if (json.data) {
      setPaper(json.data);
      setForm({
        title: json.data.title,
        durationMinutes: json.data.durationMinutes,
        passingScore: json.data.passingScore ?? "",
        paperYear: json.data.paperYear ?? "",
      });
    }
  }, [paperId]);

  useEffect(() => {
    loadPaper();
  }, [loadPaper]);

  useEffect(() => {
    fetch(`/api/admin/v1/banks/${bankId}/editions`)
      .then((r) => r.json())
      .then(async (editionsJson) => {
        const editions = editionsJson.data ?? [];
        const allSections: Section[] = [];
        for (const ed of editions) {
          const res = await fetch(`/api/admin/v1/editions/${ed.id}/sections`);
          const json = await res.json();
          for (const s of json.data ?? []) {
            allSections.push({ id: Number(s.id), title: s.title });
          }
        }
        setSections(allSections);
      });
  }, [bankId]);

  async function handleSaveInfo() {
    setSaving(true);
    await fetch(`/api/admin/v1/mock-papers/${paperId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: form.title,
        durationMinutes: form.durationMinutes,
        passingScore: form.passingScore ? Number(form.passingScore) : null,
        paperYear: form.paperYear ? Number(form.paperYear) : null,
      }),
    });
    setEditingInfo(false);
    await loadPaper();
    setSaving(false);
  }

  async function handleAddQuestions(questionIds: string[]) {
    const items = questionIds.map((id, i) => ({
      questionId: Number(id),
      score: 1,
      sortOrder: (paper?.questions.length ?? 0) + i + 1,
    }));
    await fetch(`/api/admin/v1/mock-papers/${paperId}/questions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items }),
    });
    await loadPaper();
  }

  async function handleRemoveQuestion(questionId: string) {
    await fetch(`/api/admin/v1/mock-papers/${paperId}/questions/${questionId}`, {
      method: "DELETE",
    });
    await loadPaper();
  }

  async function handleUpdateScore(questionId: string, score: number) {
    await fetch(`/api/admin/v1/mock-papers/${paperId}/questions/${questionId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ score }),
    });
    await loadPaper();
  }

  async function handlePublish() {
    if (!confirm("确定发布此试卷？发布后用户将可以看到。")) return;
    await fetch(`/api/admin/v1/mock-papers/${paperId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "published" }),
    });
    await loadPaper();
  }

  if (!paper) {
    return <p className="text-muted-foreground p-8">加载中...</p>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/banks" className="hover:underline">题库管理</Link>
        <span>/</span>
        <Link href={`/banks/${bankId}/mock-papers`} className="hover:underline">模考试卷</Link>
        <span>/</span>
        <span>{paper.title}</span>
      </div>

      {/* Paper info */}
      <div className="rounded-md border p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">{paper.title}</h1>
          <div className="flex gap-2">
            <Badge variant={paper.status === "published" ? "default" : "secondary"}>
              {paper.status === "draft" ? "草稿" : paper.status === "published" ? "已发布" : "已归档"}
            </Badge>
            {!editingInfo && (
              <Button variant="outline" size="sm" onClick={() => setEditingInfo(true)}>编辑信息</Button>
            )}
            {paper.status === "draft" && paper.totalQuestions > 0 && (
              <Button size="sm" onClick={handlePublish}>发布</Button>
            )}
          </div>
        </div>

        {editingInfo ? (
          <form
            onSubmit={(e) => { e.preventDefault(); handleSaveInfo(); }}
            className="grid grid-cols-2 gap-3"
          >
            <div>
              <label className="text-sm text-muted-foreground">标题</label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
            </div>
            <div>
              <label className="text-sm text-muted-foreground">考试时长(分钟)</label>
              <Input type="number" value={form.durationMinutes} onChange={(e) => setForm({ ...form, durationMinutes: Number(e.target.value) })} required min={1} />
            </div>
            <div>
              <label className="text-sm text-muted-foreground">及格分</label>
              <Input type="number" value={form.passingScore} onChange={(e) => setForm({ ...form, passingScore: e.target.value })} placeholder="可选" />
            </div>
            <div>
              <label className="text-sm text-muted-foreground">年份</label>
              <Input type="number" value={form.paperYear} onChange={(e) => setForm({ ...form, paperYear: e.target.value })} placeholder="可选" />
            </div>
            <div className="col-span-2 flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={() => setEditingInfo(false)}>取消</Button>
              <Button type="submit" disabled={saving}>{saving ? "保存中..." : "保存"}</Button>
            </div>
          </form>
        ) : (
          <div className="flex gap-6 text-sm text-muted-foreground">
            <span>时长: {paper.durationMinutes} 分钟</span>
            <span>题数: {paper.totalQuestions}</span>
            <span>总分: {paper.totalScore}</span>
            {paper.passingScore != null && <span>及格分: {paper.passingScore}</span>}
            {paper.paperYear != null && <span>年份: {paper.paperYear}</span>}
          </div>
        )}
      </div>

      {/* Question selection tools */}
      <div className="rounded-md border p-4 space-y-3">
        <div className="flex gap-2">
          <Button variant={tab === "manual" ? "default" : "outline"} size="sm" onClick={() => setTab("manual")}>手动选题</Button>
          <Button variant={tab === "random" ? "default" : "outline"} size="sm" onClick={() => setTab("random")}>随机抽题</Button>
        </div>
        {tab === "manual" ? (
          <QuestionPicker bankId={bankId} sections={sections} onAdd={handleAddQuestions} />
        ) : (
          <RandomDraw paperId={paperId} sections={sections} onAdd={handleAddQuestions} />
        )}
      </div>

      {/* Current questions list */}
      <div className="rounded-md border">
        <div className="px-4 py-3 border-b bg-muted/50">
          <h3 className="font-medium text-sm">已选题目 ({paper.totalQuestions} 题 / 总分 {paper.totalScore})</h3>
        </div>
        {paper.questions.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-muted-foreground">暂无题目，请通过上方工具添加</p>
        ) : (
          <div className="max-h-[500px] overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/30 sticky top-0">
                <tr>
                  <th className="px-3 py-2 w-10 font-medium">#</th>
                  <th className="px-3 py-2 text-left font-medium">题干</th>
                  <th className="px-3 py-2 w-16 font-medium">类型</th>
                  <th className="px-3 py-2 w-20 font-medium">分值</th>
                  <th className="px-3 py-2 w-16 font-medium">操作</th>
                </tr>
              </thead>
              <tbody>
                {paper.questions.map((q, i) => (
                  <tr key={q.questionId} className="border-t hover:bg-muted/20">
                    <td className="px-3 py-2 text-muted-foreground">{i + 1}</td>
                    <td className="px-3 py-2 max-w-md truncate">{q.stem}</td>
                    <td className="px-3 py-2">
                      <Badge variant="secondary">{TYPE_MAP[q.questionType] ?? q.questionType}</Badge>
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="number"
                        value={Number(q.score)}
                        min={0}
                        max={100}
                        className="w-16 border rounded px-2 py-1 text-sm text-center"
                        onBlur={(e) => {
                          const val = Number(e.target.value);
                          if (val !== Number(q.score)) handleUpdateScore(q.questionId, val);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") (e.target as HTMLInputElement).blur();
                        }}
                      />
                    </td>
                    <td className="px-3 py-2">
                      <Button variant="ghost" size="sm" className="text-destructive h-7 px-2" onClick={() => handleRemoveQuestion(q.questionId)}>
                        移除
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
