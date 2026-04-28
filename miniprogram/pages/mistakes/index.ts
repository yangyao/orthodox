import { getMistakes, removeMistake, startPracticeSession } from '../../services/practice';
import { WrongQuestion } from '../../services/types';

Page({
  data: {
    mistakeItems: [] as WrongQuestion[],
    totalMistakes: 0,
    page: 1,
    pageSize: 20,
    loading: false,
    hasMore: true,
    isRefreshing: false,
  },

  onLoad() {
    this.fetchMistakes(true);
  },

  async fetchMistakes(refresh = false) {
    if (this.data.loading) return;

    const page = refresh ? 1 : this.data.page;
    this.setData({ loading: true });

    try {
      const res = await getMistakes(undefined, page, this.data.pageSize);
      
      this.setData({
        mistakeItems: refresh ? res.items : [...this.data.mistakeItems, ...res.items],
        totalMistakes: res.total,
        page: page + 1,
        hasMore: res.items.length === this.data.pageSize,
        loading: false,
        isRefreshing: false,
      });
    } catch (err) {
      console.error('Failed to fetch mistakes:', err);
      this.setData({ loading: false, isRefreshing: false });
      wx.showToast({ title: '加载失败', icon: 'none' });
    }
  },

  onRefresh() {
    this.setData({ isRefreshing: true });
    this.fetchMistakes(true);
  },

  loadMore() {
    if (this.data.hasMore && !this.data.loading) {
      this.fetchMistakes();
    }
  },

  async onRemove(e: any) {
    const { id } = e.currentTarget.dataset;
    wx.showModal({
      title: '提示',
      content: '确定要从错题集中移除该题吗？',
      success: async (res) => {
        if (res.confirm) {
          try {
            await removeMistake(id);
            const items = this.data.mistakeItems.filter(item => item.id !== id);
            this.setData({
              mistakeItems: items,
              totalMistakes: this.data.totalMistakes - 1
            });
            wx.showToast({ title: '已移除', icon: 'success' });
          } catch (err) {
            wx.showToast({ title: '移除失败', icon: 'none' });
          }
        }
      }
    });
  },

  async startReview() {
    // For now, "Review All" might need a bank selection or we just use the first bank's mistakes
    // If we want to review ALL across all banks, we'd need a special endpoint or handle it.
    // The design said "mistake mode" session. Let's use the bankId of the first item for now
    // or better, if the user came from a specific bank's mistake set.
    
    if (this.data.mistakeItems.length === 0) return;

    const bankId = this.data.mistakeItems[0].bankId;
    
    wx.showLoading({ title: '准备中' });
    try {
      const res = await startPracticeSession(bankId, undefined, 'mistake');
      wx.hideLoading();
      wx.navigateTo({
        url: `/pages/practice/index?id=${res.sessionId}&qids=${res.questionIds.join(',')}`
      });
    } catch (err) {
      wx.hideLoading();
      wx.showToast({ title: '启动失败', icon: 'none' });
    }
  },

  viewQuestion(e: any) {
    // Maybe navigate to practice page in "view-only" or "single-question" mode?
    // For now, let's just do nothing or toast.
    wx.showToast({ title: '查看详情开发中', icon: 'none' });
  }
});
