import { request } from "./request";

interface LoginResponse {
  token: string;
  user: {
    id: string;
    openid: string;
    isNewUser: boolean;
  };
}

export function getToken(): string {
  return wx.getStorageSync("access_token") || "";
}

export async function silentLogin(): Promise<void> {
  const existingToken = getToken();
  if (existingToken) return;

  const { code } = await wx.login();

  const data = await request<LoginResponse>({
    url: "/api/v1/auth/login",
    method: "POST",
    data: { code },
  });

  wx.setStorageSync("access_token", data.token);
}
