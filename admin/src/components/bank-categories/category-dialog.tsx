"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export interface CategoryFormData {
  code: string;
  name: string;
  sortOrder: number;
  isVisible: boolean;
}

interface CategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: CategoryFormData;
  onSubmit: (data: CategoryFormData) => Promise<void>;
  title: string;
}

export function CategoryDialog({
  open,
  onOpenChange,
  initialData,
  onSubmit,
  title,
}: CategoryDialogProps) {
  const [code, setCode] = useState(initialData?.code ?? "");
  const [name, setName] = useState(initialData?.name ?? "");
  const [sortOrder, setSortOrder] = useState(initialData?.sortOrder ?? 0);
  const [isVisible, setIsVisible] = useState(initialData?.isVisible ?? true);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit({ code, name, sortOrder, isVisible });
      onOpenChange(false);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="code">编码</Label>
            <Input
              id="code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              disabled={!!initialData}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="name">名称</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
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
          <div className="flex items-center gap-2">
            <input
              id="isVisible"
              type="checkbox"
              checked={isVisible}
              onChange={(e) => setIsVisible(e.target.checked)}
            />
            <Label htmlFor="isVisible">显示</Label>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              取消
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "保存中..." : "保存"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
