import { getBankDetail, openBank } from "../../services/catalog";
import { QuestionBank } from "../../services/types";

Page({
  data: {
    bank: null as QuestionBank | null,
    loading: false,
  },

  onIconError() {
    const { bank } = this.data;
    if (bank) {
      this.setData({ 'bank.icon': '/assets/images/bank_default.svg' });
    }
  },

  async onLoad(options: any) {
    const { id } = options;
    if (id) {
      await this.fetchBank(id);
    }
  },

  async fetchBank(id: string) {
    this.setData({ loading: true });
    try {
      const bank = await getBankDetail(id);
      this.setData({ bank });
    } catch (error: any) {
      console.error("Failed to fetch bank:", error);
      wx.showToast({ title: error.message || "获取题库详情失败", icon: "none" });
    } finally {
      this.setData({ loading: false });
    }
  },

  async handleOpenBank() {
    const { bank } = this.data;
    if (!bank) return;

    wx.showLoading({ title: "开通中..." });
    try {
      await openBank(bank.id);
      wx.showToast({ title: "开通成功", icon: "success" });
      // Refresh data
      await this.fetchBank(bank.id);
    } catch (error: any) {
      console.error("Failed to open bank:", error);
      wx.showToast({ title: error.message || "开通失败", icon: "none" });
    } finally {
      wx.hideLoading();
    }
  },

  startPractice(e: any) {
    const { mode } = e.currentTarget.dataset;
    const { bank } = this.data;
    if (!bank) return;

    if (!bank.isOpened) {
      wx.showModal({
        title: "提示",
        content: "该题库尚未开通，请先开通后再练习",
        confirmText: "去开通",
        success: (res) => {
          if (res.confirm) {
            this.handleOpenBank();
          }
        }
      });
      return;
    }

    wx.navigateTo({
      url: `/pages/practice/practice?bankId=${bank.id}&mode=${mode}`,
    });
  },

  goToMock() {
    const { bank } = this.data;
    if (!bank) return;

    if (!bank.isOpened) {
      wx.showToast({ title: "请先开通题库", icon: "none" });
      return;
    }

    wx.navigateTo({
      url: `/pages/mock-list/index?bankId=${bank.id}`,
    });
  },
});
