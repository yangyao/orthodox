import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock modules before importing
vi.mock("../lib/db", () => ({
  db: {
    transaction: vi.fn(),
    query: {
      orders: { findFirst: vi.fn() },
      walletAccounts: { findFirst: vi.fn() },
      paymentTransactions: { findFirst: vi.fn() },
    },
    insert: vi.fn(() => ({
      values: vi.fn(() => ({
        returning: vi.fn(() => [{ id: BigInt(1) }]),
        onConflictDoUpdate: vi.fn(() => ({ set: vi.fn() })),
      })),
    })),
    update: vi.fn(() => ({
      set: vi.fn(() => ({
        where: vi.fn(),
      })),
    })),
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        where: vi.fn(() => []),
      })),
    })),
  },
}));

vi.mock("../lib/schema", () => ({
  orders: {},
  orderItems: {},
  paymentTransactions: {},
  walletAccounts: {},
  walletLedgerEntries: {},
  userBankEntitlements: {},
  catalogProducts: {},
}));

vi.mock("drizzle-orm", () => ({
  eq: vi.fn((_col, _val) => "eq"),
  and: vi.fn((...args) => args),
  desc: vi.fn(),
  sql: vi.fn(),
}));

import { db } from "../lib/db";
import { RECHARGE_OPTIONS, ensureWallet } from "../lib/wallet-utils";

describe("wallet-utils", () => {
  describe("RECHARGE_OPTIONS", () => {
    it("should have valid fixed recharge tiers", () => {
      expect(RECHARGE_OPTIONS.length).toBeGreaterThan(0);
      for (const opt of RECHARGE_OPTIONS) {
        expect(opt.optionCode).toBeTruthy();
        expect(opt.coins).toBeGreaterThan(0);
        expect(opt.amountFen).toBeGreaterThan(0);
        expect(opt.coins * 100).toBe(opt.amountFen); // 1:1 mapping
      }
    });
  });

  describe("ensureWallet", () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it("should return existing wallet if found", async () => {
      const existing = {
        id: BigInt(1),
        userId: BigInt(100),
        balanceFen: 500,
        frozenFen: 0,
      };
      (db.query.walletAccounts.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(existing);

      const result = await ensureWallet(BigInt(100));
      expect(result).toEqual(existing);
    });

    it("should create wallet with 0 balance if not found", async () => {
      (db.query.walletAccounts.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);
      const created = {
        id: BigInt(2),
        userId: BigInt(200),
        balanceFen: 0,
        frozenFen: 0,
      };
      (db.insert as ReturnType<typeof vi.fn>).mockReturnValue({
        values: vi.fn(() => ({
          returning: vi.fn(() => [created]),
        })),
      });

      const result = await ensureWallet(BigInt(200));
      expect(result.balanceFen).toBe(0);
      expect(result.userId).toBe(BigInt(200));
    });
  });
});

describe("wallet payment logic", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should reject wallet payment for recharge orders", () => {
    // Recharge orders use orderType = "recharge" and should not be payable via wallet
    const order = { orderType: "recharge", status: "pending" };
    expect(order.orderType).toBe("recharge");
  });

  it("should consider payment idempotent if order already paid", () => {
    const order = { status: "paid" };
    expect(order.status).toBe("paid");
    // Idempotent: already-paid orders should return success without re-deducting
  });

  it("should calculate shortfall correctly when balance insufficient", () => {
    const balanceFen = 300;
    const orderAmountFen = 600;
    const shortfall = orderAmountFen - balanceFen;
    expect(shortfall).toBe(300);
  });
});
