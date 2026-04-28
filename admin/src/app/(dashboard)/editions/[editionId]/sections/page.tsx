"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { SectionTree, buildTree, type Section } from "@/components/sections/section-tree";

export default function SectionsPage() {
  const { editionId } = useParams<{ editionId: string }>();
  const [bankId, setBankId] = useState<string | null>(null);
  const [sections, setSections] = useState<Section[]>([]);

  async function load() {
    const sectionsRes = await fetch(`/api/admin/v1/editions/${editionId}/sections`);
    const sectionsJson = await sectionsRes.json();
    setSections(sectionsJson.data);

    if (!bankId) {
      const editionRes = await fetch(`/api/admin/v1/editions/${editionId}`);
      const editionJson = await editionRes.json();
      setBankId(editionJson.data?.bankId ?? null);
    }
  }

  useEffect(() => {
    load();
  }, [editionId]);

  const handleAdd = useCallback(async (parentId: string | null, title: string) => {
    const res = await fetch(`/api/admin/v1/editions/${editionId}/sections`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, parentId }),
    });
    if (!res.ok) {
      const json = await res.json();
      alert(json.message);
      return;
    }
    await load();
  }, [editionId]);

  const handleUpdate = useCallback(async (sectionId: string, title: string) => {
    const res = await fetch(`/api/admin/v1/sections/${sectionId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    });
    if (!res.ok) {
      const json = await res.json();
      alert(json.message);
      return;
    }
    await load();
  }, []);

  const handleDelete = useCallback(async (sectionId: string) => {
    const res = await fetch(`/api/admin/v1/sections/${sectionId}`, { method: "DELETE" });
    if (!res.ok) {
      const json = await res.json();
      alert(json.message);
      return;
    }
    await load();
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/banks" className="hover:underline">题库管理</Link>
        <span>/</span>
        <span>章节管理</span>
      </div>
      <h1 className="text-2xl font-bold tracking-tight">章节管理</h1>

      <div className="rounded-md border p-4">
        <SectionTree
          sections={sections}
          bankId={bankId}
          onAdd={handleAdd}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
        />
      </div>
    </div>
  );
}
