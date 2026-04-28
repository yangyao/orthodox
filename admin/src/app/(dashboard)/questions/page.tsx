"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BookOpen } from "lucide-react";

interface Bank {
  id: string;
  name: string;
  code: string;
  subtitle: string | null;
}

export default function QuestionsIndexPage() {
  const [banks, setBanks] = useState<Bank[]>([]);

  useEffect(() => {
    fetch("/api/admin/v1/banks?pageSize=100")
      .then((r) => r.json())
      .then((json) => setBanks(json.data?.items ?? []));
  }, []);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold tracking-tight">题目管理</h1>
      <p className="text-sm text-muted-foreground">选择题库查看和管理题目</p>

      {banks.length === 0 && (
        <p className="text-sm text-muted-foreground py-8 text-center">暂无题库，请先创建题库</p>
      )}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {banks.map((bank) => (
          <Link
            key={bank.id}
            href={`/banks/${bank.id}/questions`}
            className="rounded-lg border bg-card p-4 hover:bg-muted/50 transition-colors flex items-center gap-3"
          >
            <BookOpen className="h-8 w-8 text-muted-foreground" />
            <div>
              <div className="font-medium">{bank.name}</div>
              {bank.subtitle && (
                <div className="text-xs text-muted-foreground">{bank.subtitle}</div>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
