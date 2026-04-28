Page({
  data: {
    orderId: "",
    order: null as any,
    walletBalance: 0,
    walletBalanceDisplay: "0.00",
    selectedMethod: "wechat" as "wechat" | "wallet",
    paying: false,
    canUseWallet: false,
  },

  onLoad(options: any) {
    if (options.orderId) {
      this.setData({ orderId: options.orderId });
      this.loadOrder(options.orderId);
      this.loadWalletBalance();
    }
  },

  async loadOrder(orderId: string) {
    try {
      const { request } = require("../../services/request") as { request: (o: any) => Promise<any> };
      const data = await request({ url: `/api/v1/orders/${orderId}`, method: "GET" });
      this.setData({ order: data });
    } catch (e: any) {
      wx.showToast({ title: e.message || "加载订单失败", icon: "none" });
    }
  },

  async loadWalletBalance() {
    try {
      const { getWallet } = require("../../services/wallet") as { getWallet: () => Promise<any> };
      const data = await getWallet();
      this.setData({
        walletBalance: data.balanceFen,
        walletBalanceDisplay: data.balanceDisplay,
      });
    } catch {
      // 钱包加载失败不阻塞页面
    }
  },

  onSelectMethod(e: any) {
    this.setData({ selectedMethod: e.currentTarget.dataset.method });
  },

  navToWallet() {
    wx.navigateTo({ url: "/pages/wallet/index" });
  },

  async onPay() {
    const { selectedMethod, order, paying } = this.data;
    if (paying || !order) return;

    if (order.orderType === "recharge" && selectedMethod === "wallet") {
      wx.showToast({ title: "充值订单不支持余额支付", icon: "none" });
      return;
    }

    this.setData({ paying: true });
    try {
      if (selectedMethod === "wallet") {
        await this.payWithWallet();
      } else {
        await this.payWithWechat();
      }
    } catch (e: any) {
      wx.showToast({ title: e.message || "支付失败", icon: "none" });
    } finally {
      this.setData({ paying: false });
    }
  },

  async payWithWallet() {
    const { request } = require("../../services/request") as { request: (o: any) => Promise<any> };
    await request({
      url: `/api/v1/orders/${this.data.orderId}/payments/wallet`,
      method: "POST",
    });
    wx.showToast({ title: "支付成功", icon: "success" });
    setTimeout(() => wx.navigateBack(), 1500);
  },

  async payWithWechat() {
    const { request } = require("../../services/request") as { request: (o: any) => Promise<any> };
    const payParams = await request({
      url: "/api/v1/payments/wechat/orders",
      method: "POST",
      data: { orderId: this.data.orderId },
    });

    await new Promise<void>((resolve, reject) => {
      wx.requestPayment({
        timeStamp: payParams.timeStamp,
        nonceStr: payParams.nonceStr,
        package: payParams.package,
        signType: payParams.signType,
        paySign: payParams.paySign,
        success: () => resolve(),
        fail: (err: any) => reject(new Error(err.errMsg || "支付取消")),
      });
    });

    wx.showToast({ title: "支付成功", icon: "success" });
    setTimeout(() => wx.navigateBack(), 1500);
  },
});
