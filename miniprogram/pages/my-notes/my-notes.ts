import { getMyNotes } from "../../services/questions";
import { NoteQuestion } from "../../services/types";

Page({
  data: {
    notes: [] as NoteQuestion[],
    page: 1,
    pageSize: 20,
    loading: false,
    noMore: false,
    isRefreshing: false,
  },

  onLoad() {
    this.fetchNotes(true);
  },

  async fetchNotes(refresh = false) {
    if (this.data.loading) return;

    const page = refresh ? 1 : this.data.page;
    this.setData({ loading: true });

    try {
      const res = await getMyNotes(undefined, page, this.data.pageSize);
      const newItems = res.items;

      this.setData({
        notes: refresh ? newItems : [...this.data.notes, ...newItems],
        page: page + 1,
        noMore: newItems.length < this.data.pageSize,
        loading: false,
        isRefreshing: false,
      });
    } catch (error) {
      console.error("Failed to fetch notes:", error);
      this.setData({ loading: false, isRefreshing: false });
    }
  },

  onRefresh() {
    this.setData({ isRefreshing: true });
    this.fetchNotes(true);
  },

  onLoadMore() {
    if (!this.data.noMore) {
      this.fetchNotes();
    }
  },

  onItemTap(e: any) {
    const { id } = e.currentTarget.dataset;
    wx.showToast({ title: "即将支持题目回顾", icon: "none" });
  },
});
