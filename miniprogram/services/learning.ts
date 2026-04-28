import { request } from '../utils/request';

export const learningService = {
  /**
   * 获取学习记录流
   */
  getRecords(page: number = 1, pageSize: number = 20) {
    return request({
      url: '/api/v1/learning/records',
      data: { page, pageSize }
    });
  },

  /**
   * 获取学习统计总览
   */
  getOverview() {
    return request({
      url: '/api/v1/learning/stats/overview'
    });
  },

  /**
   * 获取趋势与日历统计
   */
  getCalendar(granularity: string = 'day', anchorDate?: string) {
    return request({
      url: '/api/v1/learning/stats/calendar',
      data: { granularity, anchorDate }
    });
  },

  /**
   * 获取单题库统计
   */
  getBankStats(bankId: string) {
    return request({
      url: `/api/v1/learning/stats/banks/${bankId}`
    });
  }
};
