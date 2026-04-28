Page({
  data: {
    items: [] as any[],
    page: 1,
    total: 0,
    loading: false,
    empty: false,
  },

  onLoad() {
    this.loadLedger();
  },

  async loadLedger() {
    if (this.data.loading) return;
    this.setData({ loading: true });

    try {
      const { getWalletLedger } = require("../../services/wallet") as { getWalletLedger: (p: number) => Promise<any> };
      const res = await getWalletLedger(1);
      this.setData({
        items: res.items || [],
        page: res.page,
        total: res.total,
        empty: res.total === 0,
      });
    } catch (e: any) {
      wx.showToast({ title: e.message || "加载失败", icon: "none" });
    } finally {
      this.setData({ loading: false });
    }
  },

  async onLoadMore() {
    const { page, total, items, loading } = this.data;
    if (loading || items.length >= total) return;

    this.setData({ loading: true });
    try {
      const { getWalletLedger } = require("../../services/wallet") as { getWalletLedger: (p: number) => Promise<any> };
      const res = await getWalletLedger(page + 1);
      this.setData({
        items: [...items, ...(res.items || [])],
        page: res.page,
        total: res.total,
      });
    } catch (e: any) {
      wx.showToast({ title: e.message || "加载失败", icon: "none" });
    } finally {
      this.setData({ loading: false });
    }
  },
});
