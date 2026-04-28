import { db } from "./db";
import { orders, orderItems, paymentTransactions, walletLedgerEntries, practiceSessions, practiceAnswers, catalogProducts } from "./schema";
import { and, sql, gte, lte, eq, desc } from "drizzle-orm";

// --- Time range helpers ---

export type DashboardRange = "7d" | "30d";

export function getRangeDates(range: DashboardRange) {
  const now = new Date();
  const start = new Date();
  start.setDate(now.getDate() - (range === "7d" ? 7 : 30));
  start.setHours(0, 0, 0, 0);
  return { start, end: now };
}

export function generateTrendDates(range: DashboardRange): string[] {
  const days = range === "7d" ? 7 : 30;
  const dates: string[] = [];
  const now = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    dates.push(d.toISOString().slice(0, 10));
  }
  return dates;
}

// --- Overview stats ---

export interface OverviewCards {
  gmvFen: number;
  paidUserCount: number;
  paidOrderCount: number;
  activeLearningUserCount: number;
}

export interface OverviewTrend {
  date: string;
  gmvFen: number;
  paidOrderCount: number;
  activeLearningUserCount: number;
}

export async function getOverviewStats(range: DashboardRange) {
  const { start, end } = getRangeDates(range);

  // GMV, paid user count, paid order count from orders (non-recharge, status=paid)
  const [orderStats] = await db
    .select({
      gmvFen: sql<number>`COALESCE(SUM(${orders.payAmountFen}), 0)`,
      paidOrderCount: sql<number>`COUNT(*)`,
      paidUserCount: sql<number>`COUNT(DISTINCT ${orders.userId})`,
    })
    .from(orders)
    .where(
      and(
        eq(orders.status, "paid"),
        sql`${orders.orderType} != 'recharge'`,
        gte(orders.paidAt, start),
        lte(orders.paidAt, end),
      )
    );

  // Active learning users: distinct users with practice sessions in the period
  const [learningStats] = await db
    .select({
      activeLearningUserCount: sql<number>`COUNT(DISTINCT ${practiceSessions.userId})`,
    })
    .from(practiceSessions)
    .where(
      and(
        gte(practiceSessions.createdAt, start),
        lte(practiceSessions.createdAt, end),
      )
    );

  const cards: OverviewCards = {
    gmvFen: Number(orderStats.gmvFen),
    paidUserCount: Number(orderStats.paidUserCount),
    paidOrderCount: Number(orderStats.paidOrderCount),
    activeLearningUserCount: Number(learningStats.activeLearningUserCount),
  };

  // Daily trends
  const days = range === "7d" ? 7 : 30;
  const trends = await getOrderTrends(start, days);

  return { cards, trends };
}

async function getOrderTrends(start: Date, days: number): Promise<OverviewTrend[]> {
  // GMV trends from paid non-recharge orders
  const orderTrends = await db
    .select({
      date: sql<string>`DATE(${orders.paidAt})::text`,
      gmvFen: sql<number>`COALESCE(SUM(${orders.payAmountFen}), 0)`,
      paidOrderCount: sql<number>`COUNT(*)`,
    })
    .from(orders)
    .where(
      and(
        eq(orders.status, "paid"),
        sql`${orders.orderType} != 'recharge'`,
        gte(orders.paidAt, start),
      )
    )
    .groupBy(sql`DATE(${orders.paidAt})`)
    .orderBy(sql`DATE(${orders.paidAt})`);

  // Learning trends
  const learningTrends = await db
    .select({
      date: sql<string>`DATE(${practiceSessions.createdAt})::text`,
      activeLearningUserCount: sql<number>`COUNT(DISTINCT ${practiceSessions.userId})`,
    })
    .from(practiceSessions)
    .where(gte(practiceSessions.createdAt, start))
    .groupBy(sql`DATE(${practiceSessions.createdAt})`)
    .orderBy(sql`DATE(${practiceSessions.createdAt})`);

  // Merge into a complete date map
  const now = new Date();
  const dateMap = new Map<string, OverviewTrend>();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    dateMap.set(key, { date: key, gmvFen: 0, paidOrderCount: 0, activeLearningUserCount: 0 });
  }

  for (const t of orderTrends) {
    const entry = dateMap.get(t.date);
    if (entry) {
      entry.gmvFen = Number(t.gmvFen);
      entry.paidOrderCount = Number(t.paidOrderCount);
    }
  }

  for (const t of learningTrends) {
    const entry = dateMap.get(t.date);
    if (entry) {
      entry.activeLearningUserCount = Number(t.activeLearningUserCount);
    }
  }

  return Array.from(dateMap.values());
}

// --- Learning stats ---

export interface LearningCards {
  practiceSessionCount: number;
  practiceAnswerCount: number;
  mockExamCount: number;
  activeLearningUserCount: number;
}

export interface LearningTrend {
  date: string;
  practiceSessionCount: number;
  practiceAnswerCount: number;
  mockExamCount: number;
  activeLearningUserCount: number;
}

export async function getLearningStats(range: DashboardRange) {
  const { start, end } = getRangeDates(range);

  const [stats] = await db
    .select({
      practiceSessionCount: sql<number>`COUNT(*) FILTER (WHERE ${practiceSessions.mode} != 'mock')`,
      mockExamCount: sql<number>`COUNT(*) FILTER (WHERE ${practiceSessions.mode} = 'mock')`,
      activeLearningUserCount: sql<number>`COUNT(DISTINCT ${practiceSessions.userId})`,
    })
    .from(practiceSessions)
    .where(
      and(
        gte(practiceSessions.createdAt, start),
        lte(practiceSessions.createdAt, end),
      )
    );

  // Answer count from practice_answers joined via sessions in range
  const [answerStats] = await db
    .select({
      practiceAnswerCount: sql<number>`COUNT(*)`,
    })
    .from(practiceAnswers)
    .innerJoin(practiceSessions, eq(practiceAnswers.sessionId, practiceSessions.id))
    .where(
      and(
        gte(practiceSessions.createdAt, start),
        lte(practiceSessions.createdAt, end),
      )
    );

  const cards: LearningCards = {
    practiceSessionCount: Number(stats.practiceSessionCount),
    practiceAnswerCount: Number(answerStats.practiceAnswerCount),
    mockExamCount: Number(stats.mockExamCount),
    activeLearningUserCount: Number(stats.activeLearningUserCount),
  };

  // Daily trends
  const days = range === "7d" ? 7 : 30;
  const trends = await getLearningTrends(start, days);

  return { cards, trends };
}

async function getLearningTrends(start: Date, days: number): Promise<LearningTrend[]> {
  const sessionTrends = await db
    .select({
      date: sql<string>`DATE(${practiceSessions.createdAt})::text`,
      practiceSessionCount: sql<number>`COUNT(*) FILTER (WHERE ${practiceSessions.mode} != 'mock')`,
      mockExamCount: sql<number>`COUNT(*) FILTER (WHERE ${practiceSessions.mode} = 'mock')`,
      activeLearningUserCount: sql<number>`COUNT(DISTINCT ${practiceSessions.userId})`,
    })
    .from(practiceSessions)
    .where(gte(practiceSessions.createdAt, start))
    .groupBy(sql`DATE(${practiceSessions.createdAt})`)
    .orderBy(sql`DATE(${practiceSessions.createdAt})`);

  const answerTrends = await db
    .select({
      date: sql<string>`DATE(${practiceSessions.createdAt})::text`,
      practiceAnswerCount: sql<number>`COUNT(*)`,
    })
    .from(practiceAnswers)
    .innerJoin(practiceSessions, eq(practiceAnswers.sessionId, practiceSessions.id))
    .where(gte(practiceSessions.createdAt, start))
    .groupBy(sql`DATE(${practiceSessions.createdAt})`)
    .orderBy(sql`DATE(${practiceSessions.createdAt})`);

  const now = new Date();
  const dateMap = new Map<string, LearningTrend>();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    dateMap.set(key, { date: key, practiceSessionCount: 0, practiceAnswerCount: 0, mockExamCount: 0, activeLearningUserCount: 0 });
  }

  for (const t of sessionTrends) {
    const entry = dateMap.get(t.date);
    if (entry) {
      entry.practiceSessionCount = Number(t.practiceSessionCount);
      entry.mockExamCount = Number(t.mockExamCount);
      entry.activeLearningUserCount = Number(t.activeLearningUserCount);
    }
  }

  for (const t of answerTrends) {
    const entry = dateMap.get(t.date);
    if (entry) {
      entry.practiceAnswerCount = Number(t.practiceAnswerCount);
    }
  }

  return Array.from(dateMap.values());
}

// --- Product stats ---

export interface ProductRankingItem {
  productId: string;
  skuId: string;
  title: string;
  productType: string;
  soldCount: number;
  paidAmountFen: number;
}

export interface PaymentMethodBreakdown {
  wechatFen: number;
  walletFen: number;
  codeFen: number;
}

export async function getProductStats(range: DashboardRange, productType?: string) {
  const { start, end } = getRangeDates(range);

  // Product sales ranking: aggregate order_items from paid non-recharge orders
  const productFilter = productType
    ? and(
        eq(orders.status, "paid"),
        sql`${orders.orderType} != 'recharge'`,
        gte(orders.paidAt, start),
        lte(orders.paidAt, end),
        eq(catalogProducts.productType, productType),
      )
    : and(
        eq(orders.status, "paid"),
        sql`${orders.orderType} != 'recharge'`,
        gte(orders.paidAt, start),
        lte(orders.paidAt, end),
      );

  const productRanking = await db
    .select({
      productId: catalogProducts.id,
      skuId: orderItems.skuId,
      title: catalogProducts.title,
      productType: catalogProducts.productType,
      soldCount: sql<number>`COALESCE(SUM(${orderItems.quantity}), 0)`,
      paidAmountFen: sql<number>`COALESCE(SUM(${orderItems.totalPriceFen}), 0)`,
    })
    .from(orderItems)
    .innerJoin(orders, eq(orderItems.orderId, orders.id))
    .innerJoin(catalogProducts, eq(orderItems.productId, catalogProducts.id))
    .where(productFilter)
    .groupBy(catalogProducts.id, orderItems.skuId, catalogProducts.title, catalogProducts.productType)
    .orderBy(desc(sql`SUM(${orderItems.totalPriceFen})`))
    .limit(20);

  // Recharge amount from wallet ledger entries
  const [rechargeStats] = await db
    .select({
      rechargeAmountFen: sql<number>`COALESCE(SUM(${walletLedgerEntries.amountFen}), 0)`,
    })
    .from(walletLedgerEntries)
    .where(
      and(
        eq(walletLedgerEntries.entryType, "recharge"),
        eq(walletLedgerEntries.direction, "in"),
        gte(walletLedgerEntries.createdAt, start),
        lte(walletLedgerEntries.createdAt, end),
      )
    );

  // Payment method breakdown from successful payment transactions
  const [paymentBreakdown] = await db
    .select({
      wechatFen: sql<number>`COALESCE(SUM(${paymentTransactions.amountFen}) FILTER (WHERE ${paymentTransactions.paymentMethod} = 'wechat'), 0)`,
      walletFen: sql<number>`COALESCE(SUM(${paymentTransactions.amountFen}) FILTER (WHERE ${paymentTransactions.paymentMethod} = 'wallet'), 0)`,
      codeFen: sql<number>`COALESCE(SUM(${paymentTransactions.amountFen}) FILTER (WHERE ${paymentTransactions.paymentMethod} = 'code'), 0)`,
    })
    .from(paymentTransactions)
    .where(
      and(
        eq(paymentTransactions.status, "success"),
        gte(paymentTransactions.paidAt, start),
        lte(paymentTransactions.paidAt, end),
      )
    );

  const ranking: ProductRankingItem[] = productRanking.map(r => ({
    productId: String(r.productId),
    skuId: String(r.skuId),
    title: r.title,
    productType: r.productType,
    soldCount: Number(r.soldCount),
    paidAmountFen: Number(r.paidAmountFen),
  }));

  const paymentMethods: PaymentMethodBreakdown = {
    wechatFen: Number(paymentBreakdown.wechatFen),
    walletFen: Number(paymentBreakdown.walletFen),
    codeFen: Number(paymentBreakdown.codeFen),
  };

  return {
    productRanking: ranking,
    rechargeAmountFen: Number(rechargeStats.rechargeAmountFen),
    paymentMethods,
  };
}
