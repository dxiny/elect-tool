import { api } from '@/utils/request';

export interface ChatMsg {
  role: "user" | "assistant";
  content: string;
}

export interface Session {
  id: string;
  title: string;
  messages: ChatMsg[];
  updatedAt: number;
}

export const getSessions = () => {
  return api.get<{ code: number; data: Session[] }>('/api/ai');
};

export const createSession = (data: Session) => {
  return api.post<{ code: number; data: Session }>('/api/ai', data);
};

export const updateSession = (id: string, data: Session) => {
  return api.put<{ code: number; data: Session }>(`/api/ai/${id}`, data);
};

export const deleteSession = (id: string) => {
  return api.delete<{ code: number; message: string }>(`/api/ai/${id}`);
};
