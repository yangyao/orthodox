"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronRight, ChevronDown, Plus, Pencil, Trash2, List } from "lucide-react";
import Link from "next/link";

export interface Section {
  id: string;
  parentId: string | null;
  title: string;
  sectionType: string;
  sortOrder: number;
  questionCount: number;
  isTrial: boolean;
}

interface TreeNode {
  section: Section;
  children: TreeNode[];
}

interface SectionTreeProps {
  sections: Section[];
  bankId: string | null;
  onAdd: (parentId: string | null, title: string) => Promise<void>;
  onUpdate: (sectionId: string, title: string) => Promise<void>;
  onDelete: (sectionId: string) => Promise<void>;
}

export function buildTree(sections: Section[]): TreeNode[] {
  const map = new Map<string, TreeNode>();
  const roots: TreeNode[] = [];

  for (const s of sections) {
    map.set(s.id, { section: s, children: [] });
  }

  for (const s of sections) {
    const node = map.get(s.id)!;
    if (s.parentId && map.has(s.parentId)) {
      map.get(s.parentId)!.children.push(node);
    } else {
      roots.push(node);
    }
  }

  return roots;
}

function TreeNodeView({
  node,
  depth,
  bankId,
  onAdd,
  onUpdate,
  onDelete,
}: {
  node: TreeNode;
  depth: number;
  bankId: string | null;
  onAdd: SectionTreeProps["onAdd"];
  onUpdate: SectionTreeProps["onUpdate"];
  onDelete: SectionTreeProps["onDelete"];
}) {
  const [expanded, setExpanded] = useState(true);
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState(false);
  const [newTitle, setNewTitle] = useState(node.section.title);
  const [addTitle, setAddTitle] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleAdd() {
    if (!addTitle.trim()) return;
    setLoading(true);
    try {
      await onAdd(node.section.id, addTitle.trim());
      setAddTitle("");
      setAdding(false);
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdate() {
    if (!newTitle.trim()) return;
    setLoading(true);
    try {
      await onUpdate(node.section.id, newTitle.trim());
      setEditing(false);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    await onDelete(node.section.id);
  }

  const hasChildren = node.children.length > 0;
  const questionsHref = bankId ? `/banks/${bankId}/questions?sectionId=${node.section.id}` : null;

  return (
    <div>
      <div
        className="flex items-center gap-1 py-1.5 hover:bg-muted/50 rounded group"
        style={{ paddingLeft: `${depth * 24 + 8}px` }}
      >
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-5 h-5 flex items-center justify-center shrink-0"
        >
          {hasChildren ? (
            expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />
          ) : (
            <span className="w-4" />
          )}
        </button>

        {editing ? (
          <div className="flex items-center gap-2 flex-1">
            <Input
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="h-7 text-sm"
              autoFocus
              onKeyDown={(e) => e.key === "Enter" && handleUpdate()}
            />
            <Button size="sm" variant="outline" onClick={handleUpdate} disabled={loading}>保存</Button>
            <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>取消</Button>
          </div>
        ) : (
          <>
            <span className="text-sm flex-1">{node.section.title}</span>
            <span className="text-xs text-muted-foreground mr-2">
              {node.section.questionCount} 题
            </span>
            <div className="opacity-0 group-hover:opacity-100 flex gap-1 transition-opacity">
              {questionsHref && (
                <Link href={questionsHref}>
                  <Button size="sm" variant="ghost" className="h-7 w-7 p-0" title="查看题目">
                    <List className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              )}
              <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => { setAdding(true); setExpanded(true); }}>
                <Plus className="h-3.5 w-3.5" />
              </Button>
              <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => { setEditing(true); setNewTitle(node.section.title); }}>
                <Pencil className="h-3.5 w-3.5" />
              </Button>
              <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={handleDelete}>
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </>
        )}
      </div>

      {adding && (
        <div className="flex items-center gap-2 py-1" style={{ paddingLeft: `${(depth + 1) * 24 + 28}px` }}>
          <Input
            value={addTitle}
            onChange={(e) => setAddTitle(e.target.value)}
            placeholder="输入章节标题"
            className="h-7 text-sm"
            autoFocus
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          />
          <Button size="sm" variant="outline" onClick={handleAdd} disabled={loading}>添加</Button>
          <Button size="sm" variant="ghost" onClick={() => { setAdding(false); setAddTitle(""); }}>取消</Button>
        </div>
      )}

      {expanded && node.children.map((child) => (
        <TreeNodeView
          key={child.section.id}
          node={child}
          depth={depth + 1}
          bankId={bankId}
          onAdd={onAdd}
          onUpdate={onUpdate}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}

export function SectionTree({ sections, bankId, onAdd, onUpdate, onDelete }: SectionTreeProps) {
  const tree = buildTree(sections);

  const [rootAdding, setRootAdding] = useState(false);
  const [rootTitle, setRootTitle] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleRootAdd() {
    if (!rootTitle.trim()) return;
    setLoading(true);
    try {
      await onAdd(null, rootTitle.trim());
      setRootTitle("");
      setRootAdding(false);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-2">
      {tree.map((node) => (
        <TreeNodeView
          key={node.section.id}
          node={node}
          depth={0}
          bankId={bankId}
          onAdd={onAdd}
          onUpdate={onUpdate}
          onDelete={onDelete}
        />
      ))}

      {rootAdding ? (
        <div className="flex items-center gap-2 py-1 pl-8">
          <Input
            value={rootTitle}
            onChange={(e) => setRootTitle(e.target.value)}
            placeholder="输入章节标题"
            className="h-7 text-sm max-w-xs"
            autoFocus
            onKeyDown={(e) => e.key === "Enter" && handleRootAdd()}
          />
          <Button size="sm" variant="outline" onClick={handleRootAdd} disabled={loading}>添加</Button>
          <Button size="sm" variant="ghost" onClick={() => { setRootAdding(false); setRootTitle(""); }}>取消</Button>
        </div>
      ) : (
        <Button variant="outline" size="sm" className="ml-8" onClick={() => setRootAdding(true)}>
          <Plus className="h-3.5 w-3.5 mr-1" /> 添加根章节
        </Button>
      )}

      {tree.length === 0 && !rootAdding && (
        <p className="text-sm text-muted-foreground pl-8 py-4">暂无章节，点击上方按钮添加</p>
      )}
    </div>
  );
}
