// 请求基础地址，来自环境变量
const BASE_URL = import.meta.env.VITE_API_BASE_URL || '';
// const BASE_URL = 'http://116.62.133.219'

// 统一的接口返回结构
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

// 通用请求封装：合并默认头、处理错误
export async function request<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = `${BASE_URL}${endpoint}`;
  const defaultHeaders = {
    'Content-Type': 'application/json',
  };

  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error: any) {
    console.error('请求失败：', error);
    return {
      success: false,
      error: error.message || '网络错误',
    };
  }
}

// 简化的 GET/POST/PUT/DELETE 方法
export const api = {
  get: <T = any>(endpoint: string) => request<T>(endpoint, { method: 'GET' }),
  post: <T = any>(endpoint: string, body: any) =>
    request<T>(endpoint, { method: 'POST', body: JSON.stringify(body) }),
  put: <T = any>(endpoint: string, body: any) =>
    request<T>(endpoint, { method: 'PUT', body: JSON.stringify(body) }),
  delete: <T = any>(endpoint: string) => request<T>(endpoint, { method: 'DELETE' }),
};
