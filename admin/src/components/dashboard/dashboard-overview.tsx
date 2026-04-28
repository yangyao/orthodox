"use client";

import { useEffect, useState, useCallback } from "react";
import { APP_NAME } from "@/lib/config";
import { 
  TrendingUp, 
  Users, 
  CreditCard, 
  BookOpen, 
  Activity, 
  ShoppingBag,
  Wallet,
  ArrowUpRight,
  Layout,
  Award,
  BarChart3
} from "lucide-react";
import { cn } from "@/lib/utils";

type DashboardRange = "7d" | "30d";

interface OverviewData {
  range: DashboardRange;
  cards: {
    gmvFen: number;
    paidUserCount: number;
    paidOrderCount: number;
    activeLearningUserCount: number;
  };
  trends: { date: string; gmvFen: number; paidOrderCount: number; activeLearningUserCount: number }[];
}

interface LearningData {
  range: DashboardRange;
  cards: {
    practiceSessionCount: number;
    practiceAnswerCount: number;
    mockExamCount: number;
    activeLearningUserCount: number;
  };
  trends: { date: string; practiceSessionCount: number; practiceAnswerCount: number; mockExamCount: number; activeLearningUserCount: number }[];
}

interface ProductData {
  range: DashboardRange;
  productRanking: { productId: string; skuId: string; title: string; productType: string; soldCount: number; paidAmountFen: number }[];
  rechargeAmountFen: number;
  paymentMethods: { wechatFen: number; walletFen: number; codeFen: number };
}

type LoadingState = "loading" | "success" | "error";

function fenToYuan(fen: number): string {
  return (fen / 100).toFixed(2);
}

function KpiCard({ label, value, sub, icon: Icon, color, trend }: { label: string; value: string; sub?: string; icon: any; color: string; trend?: string }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-white bg-white/60 backdrop-blur-sm p-6 shadow-sm transition-all hover:shadow-md hover:border-blue-100">
      <div className="flex items-center justify-between mb-4">
        <div className={cn("p-2.5 rounded-xl text-white shadow-lg", color)}>
          <Icon className="h-5 w-5" />
        </div>
        {trend && (
          <div className="flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">
            {trend}
          </div>
        )}
      </div>
      <div>
        <p className="text-sm font-bold text-gray-500 mb-1">{label}</p>
        <h3 className="text-2xl font-black tracking-tight text-gray-900">{value}</h3>
        {sub && <p className="text-[11px] text-gray-400 mt-1 font-medium">{sub}</p>}
      </div>
    </div>
  );
}

function MiniBarChart({ data, valueKey, label }: { data: Record<string, unknown>[]; valueKey: string; label: string }) {
  const values = (data || []).map((d) => Number(d[valueKey]));
  const max = Math.max(...values, 1);

  return (
    <div className="flex items-end gap-1.5 h-32 pt-6">
      {(data && data.length > 0) ? data.map((d, i) => {
        const v = Number(d[valueKey]);
        const pct = (v / max) * 100;
        return (
          <div key={i} className="flex-1 group relative">
            <div
              className="bg-blue-500/20 rounded-t-lg group-hover:bg-blue-500 transition-all cursor-pointer"
              style={{ height: `${Math.max(pct, 6)}%` }}
            />
          </div>
        );
      }) : (
        <div className="w-full flex items-center justify-center text-gray-300 text-xs italic">暂无趋势数据</div>
      )}
    </div>
  );
}

export function DashboardOverview() {
  const [range, setRange] = useState<DashboardRange>("7d");
  const [overview, setOverview] = useState<{ data: OverviewData; state: LoadingState }>({ data: null as any, state: "loading" });
  const [learning, setLearning] = useState<{ data: LearningData; state: LoadingState }>({ data: null as any, state: "loading" });
  const [products, setProducts] = useState<{ data: ProductData; state: LoadingState }>({ data: null as any, state: "loading" });

  const fetchOverview = useCallback(() => {
    setOverview((p) => ({ ...p, state: "loading" }));
    fetch(`/api/admin/v1/dashboard/overview?range=${range}`)
      .then((r) => r.json())
      .then((json) => setOverview({ data: json.data, state: "success" }))
      .catch(() => setOverview((p) => ({ ...p, state: "error" })));
  }, [range]);

  const fetchLearning = useCallback(() => {
    setLearning((p) => ({ ...p, state: "loading" }));
    fetch(`/api/admin/v1/dashboard/learning?range=${range}`)
      .then((r) => r.json())
      .then((json) => setLearning({ data: json.data, state: "success" }))
      .catch(() => setLearning((p) => ({ ...p, state: "error" })));
  }, [range]);

  const fetchProducts = useCallback(() => {
    setProducts((p) => ({ ...p, state: "loading" }));
    fetch(`/api/admin/v1/dashboard/products?range=${range}`)
      .then((r) => r.json())
      .then((json) => setProducts({ data: json.data, state: "success" }))
      .catch(() => setProducts((p) => ({ ...p, state: "error" })));
  }, [range]);

  useEffect(() => {
    fetchOverview();
    fetchLearning();
    fetchProducts();
  }, [fetchOverview, fetchLearning, fetchProducts]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">运营大盘</h1>
          <p className="text-gray-500 font-medium">欢迎回来，这是您的业务实时监控</p>
        </div>
        <div className="flex bg-white rounded-xl shadow-sm border p-1">
          {["7d", "30d"].map((r) => (
            <button
              key={r}
              onClick={() => setRange(r as any)}
              className={cn(
                "px-6 py-2 text-sm font-bold rounded-lg transition-all",
                range === r ? "bg-blue-600 text-white shadow-md" : "text-gray-500 hover:text-gray-900"
              )}
            >
              {r === "7d" ? "近7天" : "近30天"}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard 
          label="成交总额" 
          value={overview.data ? `¥${fenToYuan(overview.data.cards.gmvFen)}` : "¥0.00"}
          icon={CreditCard}
          color="bg-blue-600"
          trend="+12%"
          sub="统计期间内已支付总额"
        />
        <KpiCard 
          label="新增订单" 
          value={overview.data ? String(overview.data.cards.paidOrderCount) : "0"}
          icon={ShoppingBag}
          color="bg-indigo-600"
          trend="+5%"
          sub="已成功支付的商品订单"
        />
        <KpiCard 
          label="活跃学员" 
          value={learning.data ? String(learning.data.cards.activeLearningUserCount) : "0"}
          icon={Users}
          color="bg-emerald-600"
          trend="+24%"
          sub="至少进行过一次练习的用户"
        />
        <KpiCard 
          label="练习总量" 
          value={learning.data ? String(learning.data.cards.practiceSessionCount) : "0"}
          icon={Activity}
          color="bg-amber-600"
          trend="+18%"
          sub="用户发起的刷题会话总数"
        />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 bg-white rounded-3xl border shadow-sm overflow-hidden">
          <div className="p-8 border-b border-gray-50 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">活跃趋势分析</h2>
              <p className="text-sm text-gray-400 font-medium">每日答题数量波动情况</p>
            </div>
            <BarChart3 className="h-5 w-5 text-gray-300" />
          </div>
          <div className="p-8">
            <MiniBarChart 
              data={learning.data?.trends || []} 
              valueKey="practiceAnswerCount" 
              label="题" 
            />
          </div>
        </div>

        <div className="bg-white rounded-3xl border shadow-sm overflow-hidden">
          <div className="p-8 border-b border-gray-50">
            <h2 className="text-xl font-bold text-gray-900">爆款排行</h2>
            <p className="text-sm text-gray-400 font-medium">销量前三名商品</p>
          </div>
          <div className="p-8 space-y-6">
            {products.data?.productRanking.length ? products.data.productRanking.slice(0, 3).map((item, i) => (
              <div key={i} className="flex items-center gap-4 group">
                <div className={cn(
                  "h-12 w-12 rounded-2xl flex items-center justify-center font-black text-lg shadow-sm transition-transform group-hover:scale-110",
                  i === 0 ? "bg-amber-100 text-amber-600" : i === 1 ? "bg-gray-100 text-gray-600" : "bg-orange-50 text-orange-600"
                )}>
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-900 truncate">{item.title}</p>
                  <p className="text-xs text-gray-400 font-medium">销量: {item.soldCount}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-blue-600">¥{fenToYuan(item.paidAmountFen)}</p>
                </div>
              </div>
            )) : (
              <div className="text-center py-10">
                <ShoppingBag className="h-10 w-10 text-gray-100 mx-auto mb-2" />
                <p className="text-gray-300 text-sm italic">暂无销售数据</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
