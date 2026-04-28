"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export interface QuestionForm {
  sectionId: number | null;
  questionType: "single" | "multi" | "judge" | "fill";
  stem: string;
  options: { label: string; text: string }[];
  correctAnswer: string | string[];
  explanation: string;
  difficulty: number;
  sourceLabel: string;
  sortOrder: number;
}

interface Props {
  initial?: Partial<QuestionForm>;
  sections: { id: number; title: string }[];
  onSubmit: (form: QuestionForm) => Promise<void>;
  submitLabel?: string;
}

const LABELS = "ABCDEFGHIJKLMNOP".split("");

function emptyOption(index: number) {
  return { label: LABELS[index] ?? String(index + 1), text: "" };
}

export default function QuestionForm({ initial, sections, onSubmit, submitLabel = "保存" }: Props) {
  const [questionType, setQuestionType] = useState<QuestionForm["questionType"]>(
    initial?.questionType ?? "single"
  );
  const [stem, setStem] = useState(initial?.stem ?? "");
  const [options, setOptions] = useState<{ label: string; text: string }[]>(
    initial?.options ?? [emptyOption(0), emptyOption(1), emptyOption(2), emptyOption(3)]
  );
  const [correctAnswer, setCorrectAnswer] = useState<string | string[]>(
    initial?.correctAnswer ?? ""
  );
  const [explanation, setExplanation] = useState(initial?.explanation ?? "");
  const [difficulty, setDifficulty] = useState(initial?.difficulty ?? 1);
  const [sourceLabel, setSourceLabel] = useState(initial?.sourceLabel ?? "");
  const [sortOrder, setSortOrder] = useState(initial?.sortOrder ?? 0);
  const [sectionId, setSectionId] = useState<number | null>(initial?.sectionId ?? null);
  const [loading, setLoading] = useState(false);

  function handleTypeChange(type: QuestionForm["questionType"]) {
    setQuestionType(type);
    if (type === "single") {
      setOptions([emptyOption(0), emptyOption(1), emptyOption(2), emptyOption(3)]);
      setCorrectAnswer("");
    } else if (type === "multi") {
      setOptions([emptyOption(0), emptyOption(1), emptyOption(2), emptyOption(3)]);
      setCorrectAnswer([]);
    } else if (type === "judge") {
      setOptions([]);
      setCorrectAnswer("T");
    } else {
      setOptions([]);
      setCorrectAnswer("");
    }
  }

  function updateOption(index: number, text: string) {
    setOptions((prev) => prev.map((o, i) => (i === index ? { ...o, text } : o)));
  }

  function addOption() {
    setOptions((prev) => [...prev, emptyOption(prev.length)]);
  }

  function removeOption(index: number) {
    setOptions((prev) => prev.filter((_, i) => i !== index).map((o, i) => ({ ...o, label: LABELS[i] })));
  }

  function toggleMultiAnswer(label: string) {
    setCorrectAnswer((prev) => {
      const arr = Array.isArray(prev) ? prev : [];
      return arr.includes(label) ? arr.filter((a) => a !== label) : [...arr, label].sort();
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const form: QuestionForm = {
        sectionId,
        questionType,
        stem,
        options: questionType === "single" || questionType === "multi" ? options : [],
        correctAnswer,
        explanation,
        difficulty,
        sourceLabel,
        sortOrder,
      };
      await onSubmit(form);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      <div className="space-y-2">
        <Label>题型 *</Label>
        <div className="flex gap-2">
          {(["single", "multi", "judge", "fill"] as const).map((t) => (
            <Button
              key={t}
              type="button"
              variant={questionType === t ? "default" : "outline"}
              size="sm"
              onClick={() => handleTypeChange(t)}
            >
              {{ single: "单选", multi: "多选", judge: "判断", fill: "填空" }[t]}
            </Button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="section">所属章节</Label>
        <select
          id="section"
          value={sectionId ?? ""}
          onChange={(e) => setSectionId(e.target.value ? Number(e.target.value) : null)}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          <option value="">无章节</option>
          {sections.map((s) => (
            <option key={s.id} value={s.id}>{s.title}</option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="stem">题干 *</Label>
        <Textarea
          id="stem"
          value={stem}
          onChange={(e) => setStem(e.target.value)}
          rows={3}
          required
        />
      </div>

      {(questionType === "single" || questionType === "multi") && (
        <div className="space-y-3">
          <Label>选项</Label>
          {options.map((opt, i) => (
            <div key={i} className="flex items-center gap-2">
              {questionType === "single" ? (
                <input
                  type="radio"
                  name="correctSingle"
                  checked={correctAnswer === opt.label}
                  onChange={() => setCorrectAnswer(opt.label)}
                />
              ) : (
                <input
                  type="checkbox"
                  checked={Array.isArray(correctAnswer) && correctAnswer.includes(opt.label)}
                  onChange={() => toggleMultiAnswer(opt.label)}
                />
              )}
              <span className="font-medium w-6">{opt.label}</span>
              <Input
                value={opt.text}
                onChange={(e) => updateOption(i, e.target.value)}
                placeholder={`选项 ${opt.label}`}
                className="flex-1"
              />
              {options.length > 2 && (
                <Button type="button" variant="ghost" size="sm" onClick={() => removeOption(i)}>删除</Button>
              )}
            </div>
          ))}
          <Button type="button" variant="outline" size="sm" onClick={addOption}>添加选项</Button>
        </div>
      )}

      {questionType === "judge" && (
        <div className="space-y-2">
          <Label>正确答案 *</Label>
          <div className="flex gap-2">
            <Button
              type="button"
              variant={correctAnswer === "T" ? "default" : "outline"}
              size="sm"
              onClick={() => setCorrectAnswer("T")}
            >
              正确 (T)
            </Button>
            <Button
              type="button"
              variant={correctAnswer === "F" ? "default" : "outline"}
              size="sm"
              onClick={() => setCorrectAnswer("F")}
            >
              错误 (F)
            </Button>
          </div>
        </div>
      )}

      {questionType === "fill" && (
        <div className="space-y-2">
          <Label htmlFor="fillAnswer">正确答案 *</Label>
          <Input
            id="fillAnswer"
            value={typeof correctAnswer === "string" ? correctAnswer : correctAnswer.join(",")}
            onChange={(e) => setCorrectAnswer(e.target.value)}
            placeholder="填空答案"
            required
          />
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="explanation">解析</Label>
        <Textarea
          id="explanation"
          value={explanation}
          onChange={(e) => setExplanation(e.target.value)}
          rows={2}
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="difficulty">难度</Label>
          <select
            id="difficulty"
            value={difficulty}
            onChange={(e) => setDifficulty(Number(e.target.value))}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            {[1, 2, 3, 4, 5].map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="sourceLabel">来源标签</Label>
          <Input
            id="sourceLabel"
            value={sourceLabel}
            onChange={(e) => setSourceLabel(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="sortOrder">排序</Label>
          <Input
            id="sortOrder"
            type="number"
            value={sortOrder}
            onChange={(e) => setSortOrder(Number(e.target.value))}
          />
        </div>
      </div>

      <div className="flex gap-2">
        <Button type="submit" disabled={loading}>
          {loading ? "保存中..." : submitLabel}
        </Button>
      </div>
    </form>
  );
}
