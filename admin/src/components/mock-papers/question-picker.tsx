"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface Question {
  id: string;
  questionType: string;
  stem: string;
  difficulty: number;
}

interface Section {
  id: number;
  title: string;
}

interface QuestionPickerProps {
  bankId: string;
  sections: Section[];
  onAdd: (questionIds: string[]) => Promise<void>;
}

const TYPE_MAP: Record<string, string> = { single: "单选", multi: "多选", judge: "判断", fill: "填空" };

export function QuestionPicker({ bankId, sections, onAdd }: QuestionPickerProps) {
  const [keyword, setKeyword] = useState("");
  const [sectionId, setSectionId] = useState("");
  const [questionType, setQuestionType] = useState("");
  const [results, setResults] = useState<Question[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);

  async function handleSearch() {
    setLoading(true);
    const params = new URLSearchParams({ page: "1", pageSize: "50" });
    if (keyword) params.set("keyword", keyword);
    if (sectionId) params.set("sectionId", sectionId);
    if (questionType) params.set("questionType", questionType);
    const res = await fetch(`/api/admin/v1/banks/${bankId}/questions?${params}`);
    const json = await res.json();
    setResults(json.data?.items ?? []);
    setSelected(new Set());
    setLoading(false);
  }

  function toggleSelect(id: string) {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
  }

  async function handleConfirm() {
    if (selected.size === 0) return;
    setAdding(true);
    await onAdd(Array.from(selected));
    setSelected(new Set());
    setAdding(false);
  }

  return (
    <div className="space-y-3">
      <h4 className="font-medium text-sm">手动选题</h4>
      <div className="flex gap-2 flex-wrap">
        <Input
          placeholder="搜索题干..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          className="max-w-xs"
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
        />
        <select
          value={sectionId}
          onChange={(e) => setSectionId(e.target.value)}
          className="border rounded-md px-3 py-2 text-sm"
        >
          <option value="">全部章节</option>
          {sections.map((s) => (
            <option key={s.id} value={s.id}>{s.title}</option>
          ))}
        </select>
        <select
          value={questionType}
          onChange={(e) => setQuestionType(e.target.value)}
          className="border rounded-md px-3 py-2 text-sm"
        >
          <option value="">全部题型</option>
          <option value="single">单选</option>
          <option value="multi">多选</option>
          <option value="judge">判断</option>
          <option value="fill">填空</option>
        </select>
        <Button variant="outline" size="sm" onClick={handleSearch} disabled={loading}>搜索</Button>
      </div>

      {results.length > 0 && (
        <div className="rounded-md border max-h-64 overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 sticky top-0">
              <tr>
                <th className="px-3 py-2 w-10"></th>
                <th className="px-3 py-2 text-left font-medium">题干</th>
                <th className="px-3 py-2 w-16 font-medium">类型</th>
                <th className="px-3 py-2 w-16 font-medium">难度</th>
              </tr>
            </thead>
            <tbody>
              {results.map((q) => (
                <tr key={q.id} className="border-t hover:bg-muted/30 cursor-pointer" onClick={() => toggleSelect(q.id)}>
                  <td className="px-3 py-2 text-center">
                    <input type="checkbox" checked={selected.has(q.id)} onChange={() => toggleSelect(q.id)} />
                  </td>
                  <td className="px-3 py-2 max-w-md truncate">{q.stem}</td>
                  <td className="px-3 py-2">
                    <Badge variant="secondary">{TYPE_MAP[q.questionType] ?? q.questionType}</Badge>
                  </td>
                  <td className="px-3 py-2">{q.difficulty}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selected.size > 0 && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">已选 {selected.size} 题</span>
          <Button size="sm" onClick={handleConfirm} disabled={adding}>
            {adding ? "添加中..." : "添加到试卷"}
          </Button>
        </div>
      )}
    </div>
  );
}
