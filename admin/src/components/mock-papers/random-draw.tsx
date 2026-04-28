"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Section {
  id: number;
  title: string;
}

interface DrawnQuestion {
  id: string;
  questionType: string;
  stem: string;
  difficulty: number;
}

interface RandomDrawProps {
  paperId: string;
  sections: Section[];
  onAdd: (questionIds: string[]) => Promise<void>;
}

const TYPE_MAP: Record<string, string> = { single: "单选", multi: "多选", judge: "判断", fill: "填空" };

export function RandomDraw({ paperId, sections, onAdd }: RandomDrawProps) {
  const [sectionId, setSectionId] = useState("");
  const [questionType, setQuestionType] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [count, setCount] = useState("20");
  const [drawn, setDrawn] = useState<DrawnQuestion[]>([]);
  const [warning, setWarning] = useState<string | null>(null);
  const [drawing, setDrawing] = useState(false);
  const [adding, setAdding] = useState(false);

  async function handleDraw() {
    setDrawing(true);
    setWarning(null);
    const body: Record<string, unknown> = { count: Number(count) };
    if (sectionId) body.sectionId = Number(sectionId);
    if (questionType) body.questionType = questionType;
    if (difficulty) body.difficulty = Number(difficulty);

    const res = await fetch(`/api/admin/v1/mock-papers/${paperId}/draw`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const json = await res.json();
    if (json.data) {
      setDrawn(json.data.items ?? []);
      setWarning(json.data.warning ?? null);
    } else {
      setDrawn([]);
      setWarning(json.message ?? "抽题失败");
    }
    setDrawing(false);
  }

  async function handleConfirm() {
    if (drawn.length === 0) return;
    setAdding(true);
    await onAdd(drawn.map((q) => q.id));
    setDrawn([]);
    setWarning(null);
    setAdding(false);
  }

  return (
    <div className="space-y-3">
      <h4 className="font-medium text-sm">随机抽题</h4>
      <div className="flex gap-2 flex-wrap">
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
        <select
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value)}
          className="border rounded-md px-3 py-2 text-sm"
        >
          <option value="">全部难度</option>
          <option value="1">1</option>
          <option value="2">2</option>
          <option value="3">3</option>
          <option value="4">4</option>
          <option value="5">5</option>
        </select>
        <input
          type="number"
          value={count}
          onChange={(e) => setCount(e.target.value)}
          className="border rounded-md px-3 py-2 text-sm w-24"
          placeholder="数量"
          min={1}
          max={200}
        />
        <Button variant="outline" size="sm" onClick={handleDraw} disabled={drawing}>
          {drawing ? "抽取中..." : "抽题"}
        </Button>
      </div>

      {warning && (
        <p className="text-sm text-orange-600">{warning}</p>
      )}

      {drawn.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">抽中 {drawn.length} 题：</p>
          <div className="rounded-md border max-h-48 overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 sticky top-0">
                <tr>
                  <th className="px-3 py-2 w-10 font-medium">#</th>
                  <th className="px-3 py-2 text-left font-medium">题干</th>
                  <th className="px-3 py-2 w-16 font-medium">类型</th>
                  <th className="px-3 py-2 w-16 font-medium">难度</th>
                </tr>
              </thead>
              <tbody>
                {drawn.map((q, i) => (
                  <tr key={q.id} className="border-t">
                    <td className="px-3 py-2 text-muted-foreground">{i + 1}</td>
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
          <Button size="sm" onClick={handleConfirm} disabled={adding}>
            {adding ? "添加中..." : `确认添加 ${drawn.length} 题`}
          </Button>
        </div>
      )}
    </div>
  );
}
