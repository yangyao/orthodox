import { getPracticeSession } from "../../services/practice";
import { PracticeSession } from "../../services/types";

Page({
  data: {
    session: null as PracticeSession | null,
    mode: '',
  },

  async onLoad(options: any) {
    const { id, sessionId, mode } = options;
    const finalId = id || sessionId;
    if (finalId) {
      this.setData({ mode: mode || '' });
      await this.fetchSession(finalId);
    }
  },

  async fetchSession(id: string) {
    try {
      const session = await getPracticeSession(id);
      this.setData({ session });
    } catch (error) {
      console.error("Failed to fetch session results:", error);
    }
  },

  goHome() {
    wx.reLaunch({
      url: "/pages/index/index",
    });
  },
});
