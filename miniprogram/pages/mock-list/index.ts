import { getMockPapers, startMockSession } from '../../services/mock';
import { MockPaper } from '../../services/types';

Page({
  data: {
    bankId: '',
    papers: [] as MockPaper[],
    loading: false,
    isRefreshing: false,
    showModal: false,
    selectedPaper: null as MockPaper | null,
  },

  onLoad(options: any) {
    if (options.bankId) {
      this.setData({ bankId: options.bankId });
      this.fetchPapers();
    }
  },

  async fetchPapers() {
    this.setData({ loading: true });
    try {
      const res = await getMockPapers(this.data.bankId);
      this.setData({ 
        papers: res.items,
        loading: false,
        isRefreshing: false
      });
    } catch (err) {
      console.error('Failed to fetch mock papers:', err);
      this.setData({ loading: false, isRefreshing: false });
      wx.showToast({ title: '加载失败', icon: 'none' });
    }
  },

  onRefresh() {
    this.setData({ isRefreshing: true });
    this.fetchPapers();
  },

  selectPaper(e: any) {
    const { paper } = e.currentTarget.dataset;
    this.setData({ 
      selectedPaper: paper,
      showModal: true 
    });
  },

  closeModal() {
    this.setData({ showModal: false });
  },

  async startExam() {
    if (!this.data.selectedPaper) return;
    
    wx.showLoading({ title: '准备中' });
    try {
      const res = await startMockSession(this.data.selectedPaper.id);
      wx.hideLoading();
      this.setData({ showModal: false });
      
      // Navigate to mock-exam page
      wx.navigateTo({
        url: `/pages/mock-exam/index?id=${res.sessionId}&qids=${res.questionIds.join(',')}&duration=${res.durationMinutes}`
      });
    } catch (err) {
      wx.hideLoading();
      wx.showToast({ title: '启动失败', icon: 'none' });
    }
  }
});
