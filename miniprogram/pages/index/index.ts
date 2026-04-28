// index.ts
import { getHomeData } from "../../services/catalog";
import { Banner, QuestionBank } from "../../services/types";
import { CONFIG } from "../../utils/config";

Page({
  data: {
    appName: CONFIG.APP_NAME,
    banners: [] as Banner[],
    featuredBanks: [] as QuestionBank[],
    loading: true,
  },

  async onLoad() {
    await this.fetchData();
  },

  async onPullDownRefresh() {
    await this.fetchData();
    wx.stopPullDownRefresh();
  },

  async fetchData() {
    this.setData({ loading: true });
    try {
      const data = await getHomeData();
      
      // If no banners from API, use our beautiful designed local SVG
      const banners = data.banners && data.banners.length > 0 
        ? data.banners 
        : [{ id: 'default', imageUrl: '/assets/images/home_banner.svg', title: 'Default Banner' }];

      this.setData({
        banners: banners,
        featuredBanks: data.featuredBanks,
        loading: false,
      });
    } catch (error) {
      console.error("Failed to fetch home data:", error);
      this.setData({ loading: false });
      wx.showToast({
        title: "加载失败",
        icon: "none",
      });
    }
  },

  goToCatalog() {
    wx.navigateTo({
      url: "/pages/catalog/catalog",
    });
  },

  onBankClick(e: any) {
    const bank = e.detail as QuestionBank;
    wx.navigateTo({
      url: `/pages/bank-detail/bank-detail?id=${bank.id}`,
    });
  },

  // Placeholder navigation methods
  goToMock() {
    wx.showToast({ title: "开发中", icon: "none" });
  },
  goToMistakes() {
    wx.navigateTo({
      url: "/pages/mistakes/index",
    });
  },
  goToStats() {
    wx.navigateTo({
      url: "/pages/history/index",
    });
  },
});
