import { getCatalogData } from "../../services/catalog";
import { Category, QuestionBank } from "../../services/types";

Page({
  data: {
    categories: [] as Category[],
    banks: [] as QuestionBank[],
    filteredBanks: [] as QuestionBank[],
    activeCategoryId: "",
    searchKeyword: "",
    loading: true,
  },

  async onLoad() {
    await this.fetchData();
  },

  async fetchData() {
    this.setData({ loading: true });
    try {
      const data = await getCatalogData();
      const activeCategoryId = data.categories.length > 0 ? data.categories[0].id : "";
      this.setData({
        categories: data.categories,
        banks: data.banks,
        activeCategoryId,
        loading: false,
      }, () => {
        this.filterBanks();
      });
    } catch (error) {
      console.error("Failed to fetch catalog data:", error);
      this.setData({ loading: false });
    }
  },

  onCategorySelect(e: any) {
    const id = e.currentTarget.dataset.id;
    this.setData({ activeCategoryId: id }, () => {
      this.filterBanks();
    });
  },

  onSearchInput(e: any) {
    this.setData({ searchKeyword: e.detail.value }, () => {
      this.filterBanks();
    });
  },

  onSearch(e: any) {
    this.setData({ searchKeyword: e.detail.value }, () => {
      this.filterBanks();
    });
  },

  filterBanks() {
    const { banks, activeCategoryId, searchKeyword } = this.data;
    let filtered = banks;

    if (activeCategoryId) {
      filtered = filtered.filter(b => b.categoryId === activeCategoryId);
    }

    if (searchKeyword) {
      const keyword = searchKeyword.toLowerCase();
      filtered = filtered.filter(b => 
        b.title.toLowerCase().includes(keyword) || 
        (b.tags && b.tags.some(t => t.toLowerCase().includes(keyword)))
      );
    }

    this.setData({ filteredBanks: filtered });
  },

  onBankClick(e: any) {
    const bank = e.detail as QuestionBank;
    wx.navigateTo({
      url: `/pages/bank-detail/bank-detail?id=${bank.id}`,
    });
  },

  onBack() {
    wx.navigateBack({
      delta: 1,
      fail: () => {
        wx.switchTab({ url: '/pages/index/index' });
      }
    });
  },
});
