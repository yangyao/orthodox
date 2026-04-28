Page({
  data: {
    balanceFen: 0,
    balanceDisplay: "0.00",
    rechargeOptions: [] as { optionCode: string; coins: number; amountFen: number; label: string }[],
    selectedOptionCode: "" as string,
    loading: false,
  },

  onLoad() {
    this.loadWallet();
  },

  onShow() {
    this.loadWallet();
  },

  async loadWallet() {
    try {
      const { getWallet } = require("../../services/wallet") as { getWallet: () => Promise<any> };
      const data = await getWallet();
      this.setData({
        balanceFen: data.balanceFen,
        balanceDisplay: data.balanceDisplay,
        rechargeOptions: data.rechargeOptions,
        selectedOptionCode: data.rechargeOptions.length > 0 ? data.rechargeOptions[0].optionCode : "",
      });
    } catch (e: any) {
      wx.showToast({ title: e.message || "加载失败", icon: "none" });
    }
  },

  onSelectOption(e: any) {
    this.setData({ selectedOptionCode: e.currentTarget.dataset.code });
  },

  async onRecharge() {
    const { selectedOptionCode, rechargeOptions } = this.data;
    if (!selectedOptionCode) {
      wx.showToast({ title: "请选择充值档位", icon: "none" });
      return;
    }

    const option = rechargeOptions.find((o: any) => o.optionCode === selectedOptionCode);
    if (!option) return;

    this.setData({ loading: true });
    try {
      const { createRechargeOrder } = require("../../services/wallet") as { createRechargeOrder: (code: string) => Promise<any> };
      const res = await createRechargeOrder(selectedOptionCode);
      // 跳转到订单支付页，让用户通过微信支付完成充值
      wx.navigateTo({ url: `/pages/order-pay/index?orderId=${res.orderId}` });
    } catch (e: any) {
      wx.showToast({ title: e.message || "创建充值订单失败", icon: "none" });
    } finally {
      this.setData({ loading: false });
    }
  },

  navToLedger() {
    wx.navigateTo({ url: "/pages/wallet-ledger/index" });
  },
});
