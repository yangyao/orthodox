import { getResourcePacks } from "../../services/resources";
import { ResourcePack } from "../../services/types";

Page({
  data: {
    bankId: "" as string,
    packs: [] as ResourcePack[],
    page: 1,
    pageSize: 20,
    loading: false,
    noMore: false,
    isRefreshing: false,
  },

  onLoad(options: any) {
    if (options.bankId) {
      this.setData({ bankId: options.bankId });
    }
    this.fetchPacks(true);
  },

  async fetchPacks(refresh = false) {
    if (this.data.loading) return;

    const page = refresh ? 1 : this.data.page;
    this.setData({ loading: true });

    try {
      const res = await getResourcePacks(this.data.bankId || undefined, page, this.data.pageSize);
      const newPacks = res.items;

      this.setData({
        packs: refresh ? newPacks : [...this.data.packs, ...newPacks],
        page: page + 1,
        noMore: newPacks.length < this.data.pageSize,
        loading: false,
        isRefreshing: false,
      });
    } catch (error) {
      console.error("Failed to fetch resource packs:", error);
      this.setData({ loading: false, isRefreshing: false });
      wx.showToast({ title: "加载失败", icon: "none" });
    }
  },

  onRefresh() {
    this.setData({ isRefreshing: true });
    this.fetchPacks(true);
  },

  onLoadMore() {
    if (!this.data.noMore) {
      this.fetchPacks();
    }
  },

  goToDetail(e: any) {
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/resource-detail/index?id=${id}`,
    });
  },
});
