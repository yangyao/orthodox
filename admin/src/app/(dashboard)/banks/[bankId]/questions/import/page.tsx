"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";

interface Section {
  id: number;
  title: string;
}

interface ImportItem {
  questionType: string;
  stem: string;
  options?: { label: string; text: string }[] | null;
  correctAnswer: string | string[];
  difficulty?: number;
  sectionId?: number | null;
}

const TYPE_MAP: Record<string, string> = { single: "单选", multi: "多选", judge: "判断", fill: "填空" };

const SAMPLE_JSON = JSON.stringify(
  {
    sectionId: 1,
    items: [
      {
        questionType: "single",
        stem: "示例单选题干？",
        options: [
          { label: "A", text: "选项A" },
          { label: "B", text: "选项B" },
          { label: "C", text: "选项C" },
          { label: "D", text: "选项D" },
        ],
        correctAnswer: "A",
        difficulty: 1,
      },
    ],
  },
  null,
  2
);

export default function ImportQuestionsPage() {
  const { bankId } = useParams<{ bankId: string }>();
  const router = useRouter();
  const [bankName, setBankName] = useState("");
  const [sections, setSections] = useState<Section[]>([]);
  const [jsonText, setJsonText] = useState("");
  const [parsed, setParsed] = useState<ImportItem[] | null>(null);
  const [parseError, setParseError] = useState("");
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<{ created: number } | null>(null);

  useEffect(() => {
    Promise.all([
      fetch(`/api/admin/v1/banks/${bankId}`).then((r) => r.json()),
      fetch(`/api/admin/v1/banks/${bankId}/sections`).then((r) => r.json()),
    ]).then(([bankJson, sectionJson]) => {
      setBankName(bankJson.data?.name ?? "");
      setSections(sectionJson.data ?? []);
    });
  }, [bankId]);

  function handleParse() {
    setParseError("");
    setParsed(null);
    setResult(null);
    try {
      const obj = JSON.parse(jsonText);
      if (!Array.isArray(obj.items)) {
        setParseError("JSON 格式错误：缺少 items 数组");
        return;
      }
      setParsed(obj.items);
    } catch {
      setParseError("JSON 解析失败，请检查格式");
    }
  }

  async function handleImport() {
    if (!parsed) return;
    setImporting(true);
    try {
      const obj = JSON.parse(jsonText);
      const body = {
        sectionId: obj.sectionId ?? undefined,
        items: obj.items,
      };
      const res = await fetch(`/api/admin/v1/banks/${bankId}/questions/import`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (json.code === 0) {
        setResult(json.data);
      } else {
        setParseError(json.message ?? "导入失败");
      }
    } catch {
      setParseError("导入请求失败");
    } finally {
      setImporting(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Link href={`/banks/${bankId}/questions`} className="text-sm text-muted-foreground hover:underline">
          题目列表
        </Link>
        <span className="text-muted-foreground">/</span>
        <h1 className="text-2xl font-bold tracking-tight">{bankName} - 批量导入</h1>
      </div>

      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">
          粘贴 JSON 格式数据，结构为 {"{ \"sectionId\": 可选, \"items\": [...] }"}，最多 500 题。
          <Button
            type="button"
            variant="link"
            className="px-1 text-sm"
            onClick={() => setJsonText(SAMPLE_JSON)}
          >
            加载示例
          </Button>
        </p>
        <Textarea
          value={jsonText}
          onChange={(e) => { setJsonText(e.target.value); setParsed(null); setParseError(""); setResult(null); }}
          rows={12}
          placeholder='{"sectionId": 1, "items": [...]}'
          className="font-mono text-sm"
        />
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleParse} disabled={!jsonText.trim()}>
            预览
          </Button>
        </div>
      </div>

      {parseError && (
        <p className="text-sm text-destructive">{parseError}</p>
      )}

      {parsed && !result && (
        <div className="space-y-3">
          <h3 className="font-medium">预览 ({parsed.length} 题)</h3>
          <div className="rounded-md border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium w-10">#</th>
                  <th className="px-4 py-3 text-left font-medium">题干</th>
                  <th className="px-4 py-3 text-left font-medium w-16">类型</th>
                  <th className="px-4 py-3 text-left font-medium w-16">难度</th>
                </tr>
              </thead>
              <tbody>
                {parsed.slice(0, 50).map((item, i) => (
                  <tr key={i} className="border-t">
                    <td className="px-4 py-2 text-muted-foreground">{i + 1}</td>
                    <td className="px-4 py-2 max-w-md truncate">{item.stem}</td>
                    <td className="px-4 py-2">
                      <Badge variant="secondary">{TYPE_MAP[item.questionType] ?? item.questionType}</Badge>
                    </td>
                    <td className="px-4 py-2">{item.difficulty ?? 1}</td>
                  </tr>
                ))}
                {parsed.length > 50 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-2 text-center text-muted-foreground">
                      ... 还有 {parsed.length - 50} 题未显示
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <Button onClick={handleImport} disabled={importing}>
            {importing ? "导入中..." : `确认导入 ${parsed.length} 题`}
          </Button>
        </div>
      )}

      {result && (
        <div className="space-y-3">
          <p className="text-sm text-green-600 font-medium">导入成功！共创建 {result.created} 题</p>
          <Button onClick={() => router.push(`/banks/${bankId}/questions`)}>返回题目列表</Button>
        </div>
      )}
    </div>
  );
}
