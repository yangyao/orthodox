"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface User {
  id: string;
  openid: string;
  mobile: string | null;
  status: string;
  createdAt: string;
  nickname: string | null;
  province: string | null;
  city: string | null;
  lastLoginAt: string | null;
}

function formatDate(date: string | null) {
  return date ? new Date(date).toLocaleString("zh-CN") : "-";
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("");
  const [keyword, setKeyword] = useState("");
  const pageSize = 20;

  useEffect(() => {
    const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
    if (status) params.set("status", status);
    if (keyword) params.set("keyword", keyword);

    fetch(`/api/admin/v1/users?${params}`)
      .then((r) => r.json())
      .then((json) => {
        setUsers(json.data?.items ?? []);
        setTotal(json.data?.total ?? 0);
      });
  }, [page, status, keyword]);

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">用户管理</h1>
        <p className="text-sm text-muted-foreground">查看用户资料、状态与最近登录信息。</p>
      </div>

      <div className="flex flex-wrap gap-2">
        <Input
          placeholder="搜索昵称 / 手机号 / openid..."
          value={keyword}
          onChange={(e) => {
            setKeyword(e.target.value);
            setPage(1);
          }}
          className="max-w-sm"
        />
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
          className="rounded-md border px-3 py-2 text-sm"
        >
          <option value="">全部状态</option>
          <option value="active">正常</option>
          <option value="disabled">禁用</option>
        </select>
      </div>

      <div className="rounded-md border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-4 py-3 text-left font-medium">用户</th>
              <th className="px-4 py-3 text-left font-medium">手机号</th>
              <th className="px-4 py-3 text-left font-medium">地区</th>
              <th className="px-4 py-3 text-left font-medium">状态</th>
              <th className="px-4 py-3 text-left font-medium">最近登录</th>
              <th className="px-4 py-3 text-left font-medium">注册时间</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-t hover:bg-muted/30">
                <td className="px-4 py-3">
                  <div className="font-medium">{user.nickname ?? `用户 ${user.id}`}</div>
                  <div className="text-xs text-muted-foreground">{user.openid}</div>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{user.mobile ?? "-"}</td>
                <td className="px-4 py-3 text-muted-foreground">
                  {[user.province, user.city].filter(Boolean).join(" / ") || "-"}
                </td>
                <td className="px-4 py-3">
                  <Badge variant={user.status === "active" ? "default" : "secondary"}>
                    {user.status === "active" ? "正常" : user.status}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{formatDate(user.lastLoginAt)}</td>
                <td className="px-4 py-3 text-muted-foreground">{formatDate(user.createdAt)}</td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                  暂无用户
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
            上一页
          </Button>
          <span className="py-2 text-sm text-muted-foreground">
            {page}/{totalPages}
          </span>
          <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
            下一页
          </Button>
        </div>
      )}
    </div>
  );
}
