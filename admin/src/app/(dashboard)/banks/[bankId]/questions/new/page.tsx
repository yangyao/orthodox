"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import QuestionForm, { type QuestionForm as QuestionFormType } from "@/components/questions/question-form";

interface Section {
  id: number;
  title: string;
  parentId: number | null;
}

export default function NewQuestionPage() {
  const { bankId } = useParams<{ bankId: string }>();
  const router = useRouter();
  const [bankName, setBankName] = useState("");
  const [sections, setSections] = useState<Section[]>([]);

  useEffect(() => {
    Promise.all([
      fetch(`/api/admin/v1/banks/${bankId}`).then((r) => r.json()),
      fetch(`/api/admin/v1/banks/${bankId}/sections`).then((r) => r.json()),
    ]).then(([bankJson, sectionJson]) => {
      setBankName(bankJson.data?.name ?? "");
      setSections(sectionJson.data ?? []);
    });
  }, [bankId]);

  async function handleSubmit(form: QuestionFormType) {
    const body: Record<string, unknown> = {
      questionType: form.questionType,
      stem: form.stem,
      correctAnswer: form.correctAnswer,
      difficulty: form.difficulty,
      sortOrder: form.sortOrder,
    };
    if (form.sectionId) body.sectionId = form.sectionId;
    if (form.options.length > 0) body.options = form.options;
    if (form.explanation) body.explanation = form.explanation;
    if (form.sourceLabel) body.sourceLabel = form.sourceLabel;

    await fetch(`/api/admin/v1/banks/${bankId}/questions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    router.push(`/banks/${bankId}/questions`);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Link href={`/banks/${bankId}/questions`} className="text-sm text-muted-foreground hover:underline">
          题目列表
        </Link>
        <span className="text-muted-foreground">/</span>
        <h1 className="text-2xl font-bold tracking-tight">{bankName} - 新增题目</h1>
      </div>

      <QuestionForm
        sections={sections.map((s) => ({ id: s.id, title: s.title }))}
        onSubmit={handleSubmit}
        submitLabel="创建"
      />
    </div>
  );
}
