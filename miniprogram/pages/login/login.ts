import { request } from "../../services/request";

Page({
  data: {
    loading: false
  },

  async handleLogin() {
    if (this.data.loading) return;
    
    this.setData({ loading: true });
    
    try {
      const { code } = await wx.login();
      
      const res = await request<{ token: string; user: any }>({
        url: "/api/v1/auth/login",
        method: "POST",
        data: { code }
      });

      wx.setStorageSync("access_token", res.token);
      wx.setStorageSync("user_info", res.user);

      wx.showToast({
        title: "登录成功",
        icon: "success"
      });

      // Navigate back to previous page
      setTimeout(() => {
        const pages = getCurrentPages();
        if (pages.length > 1) {
          wx.navigateBack();
        } else {
          wx.reLaunch({
            url: "/pages/index/index"
          });
        }
      }, 1500);

    } catch (error: any) {
      console.error("Login failed:", error);
      wx.showModal({
        title: "登录失败",
        content: error.message || "请检查您的网络并重试",
        showCancel: false
      });
    } finally {
      this.setData({ loading: false });
    }
  }
});
