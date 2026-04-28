Page({
  navTo(e: any) {
    const { url } = e.currentTarget.dataset;
    wx.navigateTo({ url });
  }
});
