const envVersion = wx.getAccountInfoSync().miniProgram.envVersion;

const BASE_URL_MAP = {
  develop: "http://127.0.0.1:3001",
  trial: "https://orthodox-taupe.vercel.app",
  release: "https://orthodox-taupe.vercel.app",
};

/**
 * 全局配置
 */
export const CONFIG = {
  APP_NAME: "守正题库",
  VERSION: "1.0.0",
  BASE_URL: BASE_URL_MAP[envVersion],
  BRAND_COLOR: "#1890ff",
};
