// 个人资料相关接口封装
import { api } from '@/utils/request';

// 个人资料结构
export interface UserProfile {
  id: string;
  name: string;
  email?: string;
  avatarDataUrl?: string;
  themeMode: 'light' | 'dark';
}

// 个人资料 API
export const profileApi = {
  getProfile: () => api.get<UserProfile>('/api/profile'),
  updateTheme: (themeMode: 'light' | 'dark') =>
    api.put<UserProfile>('/api/profile/theme', { themeMode }),
  updateBasic: (payload: { name?: string; email?: string }) =>
    api.put<UserProfile>('/api/profile/basic', payload),
  updateAvatar: (payload: { dataUrl?: string; url?: string }) =>
    api.put<UserProfile>('/api/profile/avatar', payload),
};
