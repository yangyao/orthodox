import { getMyFavorites } from "../../services/questions";
import { FavoriteQuestion } from "../../services/types";

Page({
  data: {
    favorites: [] as FavoriteQuestion[],
    page: 1,
    pageSize: 20,
    loading: false,
    noMore: false,
    isRefreshing: false,
  },

  onLoad() {
    this.fetchFavorites(true);
  },

  async fetchFavorites(refresh = false) {
    if (this.data.loading) return;

    const page = refresh ? 1 : this.data.page;
    this.setData({ loading: true });

    try {
      const res = await getMyFavorites(undefined, page, this.data.pageSize);
      const newItems = res.items;

      this.setData({
        favorites: refresh ? newItems : [...this.data.favorites, ...newItems],
        page: page + 1,
        noMore: newItems.length < this.data.pageSize,
        loading: false,
        isRefreshing: false,
      });
    } catch (error) {
      console.error("Failed to fetch favorites:", error);
      this.setData({ loading: false, isRefreshing: false });
    }
  },

  onRefresh() {
    this.setData({ isRefreshing: true });
    this.fetchFavorites(true);
  },

  onLoadMore() {
    if (!this.data.noMore) {
      this.fetchFavorites();
    }
  },

  onItemTap(e: any) {
    const { id } = e.currentTarget.dataset;
    // For now, navigate to practice page with just this question
    // We might need a "review" mode for practice page
    wx.showToast({ title: "即将支持题目回顾", icon: "none" });
  },
});
