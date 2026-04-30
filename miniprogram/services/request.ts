import { CONFIG } from "../utils/config";

const BASE_URL = CONFIG.BASE_URL;

interface RequestOptions {
  url: string;
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  data?: unknown;
  header?: Record<string, string>;
}

interface ApiResponse<T = unknown> {
  code: number;
  message: string;
  data: T;
}

function getToken(): string {
  return wx.getStorageSync("access_token") || "";
}

export function request<T = unknown>(options: RequestOptions): Promise<T> {
  const token = getToken();
  const header: Record<string, string> = {
    "Content-Type": "application/json",
    ...options.header,
  };
  if (token) {
    header["Authorization"] = `Bearer ${token}`;
  }

  return new Promise((resolve, reject) => {
    wx.request({
      url: `${BASE_URL}${options.url}`,
      method: options.method || "GET",
      data: options.data,
      header,
      success(res) {
        // Handle 401 Unauthorized
        if (res.statusCode === 401) {
          // If we are already on login page or trying to login, don't redirect again
          if (options.url === "/api/v1/auth/login") {
            reject(new Error("登录失败"));
            return;
          }

          console.warn("Unauthorized request, redirecting to login...");
          const pages = getCurrentPages();
          const currentPage = pages[pages.length - 1]?.route;
          
          if (currentPage !== 'pages/login/login') {
            wx.navigateTo({
              url: '/pages/login/login'
            });
          }
          reject(new Error("未登录"));
          return;
        }

        if (res.statusCode >= 500) {
          reject(new Error("服务器错误，请稍后重试"));
          return;
        }

        if (res.statusCode >= 400) {
          console.error(`API Error [${options.method || "GET"}] ${options.url}:`, res.statusCode, res.data);
          const body = res.data as ApiResponse;
          
          // Special handling for missing bank authorization
          if (body?.code === 40301) {
            wx.showModal({
              title: "提示",
              content: body.message || "您还没有开通该题库",
              confirmText: "去查看",
              showCancel: false,
            });
          }
          reject(new Error(body?.message || `请求失败 (${res.statusCode})`));
          return;
        }

        const body = res.data as ApiResponse<T>;
        if (body.code !== 0) {
          console.error(`Business Error [${options.method || "GET"}] ${options.url}:`, body);
          reject(new Error(body.message || "请求失败"));
          return;
        }
        resolve(body.data);
      },
      fail() {
        reject(new Error("网络异常，请稍后重试"));
      },
    });
  });
}
