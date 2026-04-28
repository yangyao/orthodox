import { request } from "./request";

export interface RechargeOption {
  optionCode: string;
  coins: number;
  amountFen: number;
  label: string;
}

export interface WalletData {
  balanceFen: number;
  balanceDisplay: string;
  rechargeOptions: RechargeOption[];
  ledgerEntryCount: number;
}

export interface LedgerEntry {
  id: string;
  entryType: string;
  direction: string;
  amountFen: number;
  balanceAfterFen: number;
  remark: string | null;
  createdAt: string;
}

export interface LedgerResponse {
  items: LedgerEntry[];
  page: number;
  pageSize: number;
  total: number;
}

export interface RechargeOrderResponse {
  orderId: string;
  orderNo: string;
  payAmountFen: number;
  rechargeOption: RechargeOption;
}

export function getWallet(): Promise<WalletData> {
  return request<WalletData>({ url: "/api/v1/wallet", method: "GET" });
}

export function getWalletLedger(page = 1, pageSize = 20): Promise<LedgerResponse> {
  return request<LedgerResponse>({
    url: `/api/v1/wallet/ledger?page=${page}&pageSize=${pageSize}`,
    method: "GET",
  });
}

export function createRechargeOrder(optionCode: string): Promise<RechargeOrderResponse> {
  return request<RechargeOrderResponse>({
    url: "/api/v1/wallet/recharge-orders",
    method: "POST",
    data: { optionCode },
  });
}

export function payWithWallet(orderId: string): Promise<{ orderId: string; paymentMethod: string; status: string }> {
  return request({
    url: `/api/v1/orders/${orderId}/payments/wallet`,
    method: "POST",
  });
}
