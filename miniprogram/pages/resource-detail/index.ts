import { getResourcePackDetail } from "../../services/resources";
import { ResourcePack, ResourceItem } from "../../services/types";

Page({
  data: {
    pack: null as ResourcePack | null,
    loading: true,
  },

  onLoad(options: any) {
    const { id } = options;
    if (id) {
      this.fetchDetail(id);
    } else {
      wx.showToast({ title: "参数错误", icon: "none" });
      setTimeout(() => wx.navigateBack(), 1500);
    }
  },

  async fetchDetail(id: string) {
    this.setData({ loading: true });
    try {
      const pack = await getResourcePackDetail(id);
      this.setData({ pack, loading: false });
    } catch (error) {
      console.error("Failed to fetch pack detail:", error);
      wx.showToast({ title: "加载失败", icon: "none" });
      this.setData({ loading: false });
    }
  },

  onItemTap(e: any) {
    const item = e.currentTarget.dataset.item as ResourceItem;
    
    if (item.type === 'pdf') {
      this.openPdf(item.url);
    } else if (item.type === 'link') {
      this.copyLink(item.url);
    } else if (item.type === 'image') {
      this.viewImage(item.url);
    }
  },

  openPdf(url: string) {
    wx.showLoading({ title: "正在下载..." });
    wx.downloadFile({
      url,
      success: (res) => {
        if (res.statusCode === 200) {
          wx.openDocument({
            filePath: res.tempFilePath,
            success: () => console.log("Open document success"),
            fail: (err) => {
              console.error("Open document failed", err);
              wx.showToast({ title: "打开失败", icon: "none" });
            }
          });
        }
      },
      fail: (err) => {
        console.error("Download file failed", err);
        wx.showToast({ title: "下载失败", icon: "none" });
      },
      complete: () => wx.hideLoading()
    });
  },

  copyLink(url: string) {
    wx.setClipboardData({
      data: url,
      success: () => {
        wx.showToast({ title: "链接已复制", icon: "success" });
      }
    });
  },

  viewImage(url: string) {
    wx.previewImage({
      urls: [url],
      current: url
    });
  }
});
