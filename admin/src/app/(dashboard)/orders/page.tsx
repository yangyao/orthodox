"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface OrderItem {
  id: string;
  snapshot: {
    title: string;
  };
}

interface Order {
  id: string;
  orderNo: string;
  userId: string;
  orderType: string;
  status: string;
  payAmountFen: number;
  createdAt: string;
  items: OrderItem[];
}

function formatAmount(amountFen: number) {
  return `¥${(amountFen / 100).toFixed(2)}`;
}

function formatDate(date: string) {
  return new Date(date).toLocaleString("zh-CN");
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("");
  const [orderType, setOrderType] = useState("");
  const [keyword, setKeyword] = useState("");
  const pageSize = 20;

  useEffect(() => {
    const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
    if (status) params.set("status", status);
    if (orderType) params.set("orderType", orderType);
    if (keyword) params.set("keyword", keyword);

    fetch(`/api/admin/v1/orders?${params}`)
      .then((r) => r.json())
      .then((json) => {
        setOrders(json.data?.items ?? []);
        setTotal(json.data?.total ?? 0);
      });
  }, [page, status, orderType, keyword]);

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">订单管理</h1>
        <p className="text-sm text-muted-foreground">查看题库、资料包与充值订单。</p>
      </div>

      <div className="flex flex-wrap gap-2">
        <Input
          placeholder="搜索订单号..."
          value={keyword}
          onChange={(e) => {
            setKeyword(e.target.value);
            setPage(1);
          }}
          className="max-w-xs"
        />
        <select
          value={orderType}
          onChange={(e) => {
            setOrderType(e.target.value);
            setPage(1);
          }}
          className="rounded-md border px-3 py-2 text-sm"
        >
          <option value="">全部类型</option>
          <option value="bank">题库</option>
          <option value="material">资料包</option>
          <option value="recharge">充值</option>
        </select>
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
          className="rounded-md border px-3 py-2 text-sm"
        >
          <option value="">全部状态</option>
          <option value="pending">待支付</option>
          <option value="paid">已支付</option>
          <option value="cancelled">已取消</option>
          <option value="closed">已关闭</option>
          <option value="refunded">已退款</option>
        </select>
      </div>

      <div className="rounded-md border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-4 py-3 text-left font-medium">订单号</th>
              <th className="px-4 py-3 text-left font-medium">商品</th>
              <th className="px-4 py-3 text-left font-medium">用户</th>
              <th className="px-4 py-3 text-left font-medium">类型</th>
              <th className="px-4 py-3 text-left font-medium">状态</th>
              <th className="px-4 py-3 text-left font-medium">金额</th>
              <th className="px-4 py-3 text-left font-medium">创建时间</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-t hover:bg-muted/30">
                <td className="px-4 py-3 font-medium">{order.orderNo}</td>
                <td className="px-4 py-3 text-muted-foreground">
                  {order.items.length > 0
                    ? order.items.map((item) => item.snapshot?.title ?? "未命名商品").join("、")
                    : "-"}
                </td>
                <td className="px-4 py-3 text-muted-foreground">{order.userId}</td>
                <td className="px-4 py-3">
                  <Badge variant="secondary">
                    {order.orderType === "bank"
                      ? "题库"
                      : order.orderType === "material"
                        ? "资料包"
                        : "充值"}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <Badge variant={order.status === "paid" ? "default" : "secondary"}>
                    {order.status === "pending"
                      ? "待支付"
                      : order.status === "paid"
                        ? "已支付"
                        : order.status === "cancelled"
                          ? "已取消"
                          : order.status === "closed"
                            ? "已关闭"
                            : "已退款"}
                  </Badge>
                </td>
                <td className="px-4 py-3">{formatAmount(order.payAmountFen)}</td>
                <td className="px-4 py-3 text-muted-foreground">{formatDate(order.createdAt)}</td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                  暂无订单
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
