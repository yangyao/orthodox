"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Product {
  id: string;
  productType: string;
  refId: string;
  title: string;
  coverUrl: string | null;
  status: string;
  createdAt: string;
  bankName: string | null;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [productType, setProductType] = useState("");
  const [status, setStatus] = useState("");
  const pageSize = 20;

  useEffect(() => {
    const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
    if (productType) params.set("productType", productType);
    if (status) params.set("status", status);
    fetch(`/api/admin/v1/products?${params}`)
      .then((r) => r.json())
      .then((json) => {
        setProducts(json.data?.items ?? []);
        setTotal(json.data?.total ?? 0);
      });
  }, [page, productType, status]);

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">商品管理</h1>
        <Link href="/products/new">
          <Button>新建商品</Button>
        </Link>
      </div>

      <div className="flex gap-2">
        <select
          value={productType}
          onChange={(e) => { setProductType(e.target.value); setPage(1); }}
          className="border rounded-md px-3 py-2 text-sm"
        >
          <option value="">全部类型</option>
          <option value="bank">题库商品</option>
          <option value="material">资料包商品</option>
        </select>
        <select
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          className="border rounded-md px-3 py-2 text-sm"
        >
          <option value="">全部状态</option>
          <option value="active">上架</option>
          <option value="inactive">下架</option>
          <option value="archived">已归档</option>
        </select>
      </div>

      <div className="rounded-md border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-4 py-3 text-left font-medium">标题</th>
              <th className="px-4 py-3 text-left font-medium w-24">类型</th>
              <th className="px-4 py-3 text-left font-medium w-40">关联</th>
              <th className="px-4 py-3 text-left font-medium w-24">状态</th>
              <th className="px-4 py-3 text-right font-medium w-32">操作</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-t hover:bg-muted/30">
                <td className="px-4 py-3 font-medium">{p.title}</td>
                <td className="px-4 py-3">
                  <Badge variant="secondary">{p.productType === "bank" ? "题库" : "资料包"}</Badge>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{p.bankName ?? "-"}</td>
                <td className="px-4 py-3">
                  <Badge variant={p.status === "active" ? "default" : p.status === "archived" ? "outline" : "secondary"}>
                    {p.status === "active" ? "上架" : p.status === "inactive" ? "下架" : "已归档"}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/products/${p.id}/edit`}>
                    <Button variant="outline" size="sm">编辑</Button>
                  </Link>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">暂无商品</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex gap-2 justify-center">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>上一页</Button>
          <span className="py-2 text-sm text-muted-foreground">{page}/{totalPages}</span>
          <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>下一页</Button>
        </div>
      )}
    </div>
  );
}
