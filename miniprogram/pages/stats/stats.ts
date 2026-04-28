import { learningService } from '../../services/learning';

Page({
  data: {
    activeTab: 'record', // record | stats
    bankId: '',
    records: [] as any[],
    page: 1,
    hasMore: true,
    loading: false,
    refreshing: false,
    overview: {} as any,
    bankStats: {} as any,
    granularity: 'day', // day | week | month
    anchorDate: new Date(),
    currentMonthStr: '',
    calendar: {
      series: [],
      calendar: []
    } as any
  },

  onLoad(options: any) {
    if (options.bankId) {
      this.setData({ bankId: options.bankId });
    }
    this.updateMonthStr();
    this.fetchRecords();
    this.fetchOverview();
    this.fetchCalendar();
    if (this.data.bankId) {
      this.fetchBankStats();
    }
  },

  async fetchBankStats() {
    try {
      const res = await learningService.getBankStats(this.data.bankId);
      this.setData({ bankStats: res });
    } catch (err) {
      console.error('Fetch bank stats failed', err);
    }
  },

  switchTab(e: any) {
    const tab = e.currentTarget.dataset.tab;
    if (tab === this.data.activeTab) return;
    this.setData({ activeTab: tab });
  },

  updateMonthStr() {
    const d = this.data.anchorDate;
    this.setData({
      currentMonthStr: `${d.getFullYear()}年${d.getMonth() + 1}月`
    });
  },

  async fetchRecords(isRefresh = false) {
    if (this.data.loading) return;
    
    const page = isRefresh ? 1 : this.data.page;
    this.setData({ loading: true });

    try {
      const res = await learningService.getRecords(page);
      const newRecords = res.items;
      
      this.setData({
        records: isRefresh ? newRecords : [...this.data.records, ...newRecords],
        page: page + 1,
        hasMore: newRecords.length === 20,
        loading: false,
        refreshing: false
      });
    } catch (err) {
      console.error('Fetch records failed', err);
      this.setData({ loading: false, refreshing: false });
    }
  },

  async fetchOverview() {
    try {
      const overview = await learningService.getOverview();
      this.setData({ overview });
    } catch (err) {
      console.error('Fetch overview failed', err);
    }
  },

  async fetchCalendar() {
    try {
      const res = await learningService.getCalendar(
        this.data.granularity, 
        this.data.anchorDate.toISOString().split('T')[0]
      );
      this.setData({ calendar: res });
    } catch (err) {
      console.error('Fetch calendar failed', err);
    }
  },

  onRefreshRecords() {
    this.setData({ refreshing: true });
    this.fetchRecords(true);
  },

  loadMoreRecords() {
    if (this.data.hasMore && !this.data.loading) {
      this.fetchRecords();
    }
  },

  changeGranularity(e: any) {
    const g = e.currentTarget.dataset.g;
    if (g === this.data.granularity) return;
    this.setData({ granularity: g }, () => {
      this.fetchCalendar();
    });
  },

  prevMonth() {
    const d = new Date(this.data.anchorDate);
    d.setMonth(d.getMonth() - 1);
    this.setData({ anchorDate: d }, () => {
      this.updateMonthStr();
      this.fetchCalendar();
    });
  },

  nextMonth() {
    const d = new Date(this.data.anchorDate);
    d.setMonth(d.getMonth() + 1);
    this.setData({ anchorDate: d }, () => {
      this.updateMonthStr();
      this.fetchCalendar();
    });
  },

  goToBanks() {
    wx.switchTab({
      url: '/pages/index/index'
    });
  }
});
