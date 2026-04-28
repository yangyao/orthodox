import { getPracticeHistory } from '../../services/practice';
import { PracticeSession } from '../../services/types';
import { formatTime } from '../../utils/util';

interface HistoryItem extends PracticeSession {
  modeText: string;
  accuracy: string;
  formattedDate: string;
}

Page({
  data: {
    historyItems: [] as HistoryItem[],
    page: 1,
    pageSize: 20,
    loading: false,
    hasMore: true,
    isRefreshing: false,
  },

  onLoad() {
    this.fetchHistory(true);
  },

  async fetchHistory(refresh = false) {
    if (this.data.loading) return;

    const page = refresh ? 1 : this.data.page;
    this.setData({ loading: true });

    try {
      const res = await getPracticeHistory(page, this.data.pageSize);
      
      const formattedItems = res.items.map(item => ({
        ...item,
        modeText: this.getModeText(item.mode),
        accuracy: item.totalQuestions > 0 
          ? ((item.correctCount / item.totalQuestions) * 100).toFixed(1) 
          : '0.0',
        formattedDate: formatTime(new Date(item.createdAt))
      }));

      this.setData({
        historyItems: refresh ? formattedItems : [...this.data.historyItems, ...formattedItems],
        page: page + 1,
        hasMore: res.items.length === this.data.pageSize,
        loading: false,
        isRefreshing: false,
      });
    } catch (err) {
      console.error('Failed to fetch history:', err);
      this.setData({ loading: false, isRefreshing: false });
      wx.showToast({ title: '加载失败', icon: 'none' });
    }
  },

  getModeText(mode: string) {
    const map: Record<string, string> = {
      'sequential': '顺序练习',
      'random': '随机练习',
      'mistake': '错题复习',
      'mock': '模拟考试'
    };
    return map[mode] || '练习';
  },

  onRefresh() {
    this.setData({ isRefreshing: true });
    this.fetchHistory(true);
  },

  loadMore() {
    if (this.data.hasMore && !this.data.loading) {
      this.fetchHistory();
    }
  },

  goToResults(e: any) {
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/results/index?id=${id}`
    });
  }
});
