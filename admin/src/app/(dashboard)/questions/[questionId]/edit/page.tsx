"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import QuestionForm, { type QuestionForm as QuestionFormType } from "@/components/questions/question-form";

interface Question {
  id: string;
  bankId: string;
  sectionId: number | null;
  questionType: "single" | "multi" | "judge" | "fill";
  stem: string;
  options: { label: string; text: string }[] | null;
  correctAnswer: string | string[];
  explanation: string | null;
  difficulty: number;
  sourceLabel: string | null;
  sortOrder: number;
}

interface Section {
  id: number;
  title: string;
}

export default function EditQuestionPage() {
  const { questionId } = useParams<{ questionId: string }>();
  const router = useRouter();
  const [question, setQuestion] = useState<Question | null>(null);
  const [bankName, setBankName] = useState("");
  const [sections, setSections] = useState<Section[]>([]);

  useEffect(() => {
    fetch(`/api/admin/v1/questions/${questionId}`)
      .then((r) => r.json())
      .then((json) => {
        const q = json.data as Question;
        setQuestion(q);
        return Promise.all([
          fetch(`/api/admin/v1/banks/${q.bankId}`).then((r) => r.json()),
          fetch(`/api/admin/v1/banks/${q.bankId}/sections`).then((r) => r.json()),
        ]);
      })
      .then(([bankJson, sectionJson]) => {
        setBankName(bankJson.data?.name ?? "");
        setSections(sectionJson.data ?? []);
      });
  }, [questionId]);

  async function handleSubmit(form: QuestionFormType) {
    const body: Record<string, unknown> = {
      questionType: form.questionType,
      stem: form.stem,
      correctAnswer: form.correctAnswer,
      difficulty: form.difficulty,
      sortOrder: form.sortOrder,
    };
    if (form.sectionId) body.sectionId = form.sectionId;
    else body.sectionId = null;
    if (form.options.length > 0) body.options = form.options;
    else if (form.questionType === "single" || form.questionType === "multi") body.options = null;
    if (form.explanation) body.explanation = form.explanation;
    if (form.sourceLabel) body.sourceLabel = form.sourceLabel;

    await fetch(`/api/admin/v1/questions/${questionId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (question) {
      router.push(`/banks/${question.bankId}/questions`);
    }
  }

  if (!question) {
    return <p className="text-muted-foreground">加载中...</p>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Link href={`/banks/${question.bankId}/questions`} className="text-sm text-muted-foreground hover:underline">
          题目列表
        </Link>
        <span className="text-muted-foreground">/</span>
        <h1 className="text-2xl font-bold tracking-tight">{bankName} - 编辑题目</h1>
      </div>

      <QuestionForm
        initial={{
          sectionId: question.sectionId,
          questionType: question.questionType,
          stem: question.stem,
          options: question.options ?? undefined,
          correctAnswer: question.correctAnswer,
          explanation: question.explanation ?? undefined,
          difficulty: question.difficulty,
          sourceLabel: question.sourceLabel ?? undefined,
          sortOrder: question.sortOrder,
        }}
        sections={sections.map((s) => ({ id: s.id, title: s.title }))}
        onSubmit={handleSubmit}
        submitLabel="更新"
      />
    </div>
  );
}
