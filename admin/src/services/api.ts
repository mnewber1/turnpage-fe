import { AdminStats, AuthResponse, BookClub, Message, PageResponse, User } from '../types';

const API_URL = import.meta.env.PROD
  ? 'https://pagematch-api.onrender.com'
  : 'http://localhost:8080';

class ApiService {
  private token: string | null = null;

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('admin_token', token);
    } else {
      localStorage.removeItem('admin_token');
    }
  }

  getToken(): string | null {
    if (!this.token) {
      this.token = localStorage.getItem('admin_token');
    }
    return this.token;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (response.status === 401 || response.status === 403) {
      this.setToken(null);
      window.location.href = '/admin-build/';
      throw new Error('Unauthorized');
    }

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'Request failed');
    }

    if (response.status === 204) {
      return {} as T;
    }

    return response.json();
  }

  // Auth - don't use request() to avoid redirect on 401
  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'Invalid credentials');
    }

    const data = await response.json();
    this.setToken(data.token);
    return data;
  }

  async getCurrentUser(): Promise<User> {
    const userId = localStorage.getItem('admin_user_id');
    if (!userId) throw new Error('No user ID');
    return this.request<User>(`/api/users/${userId}`);
  }

  logout() {
    this.setToken(null);
    localStorage.removeItem('admin_user_id');
  }

  // Admin endpoints
  async getStats(): Promise<AdminStats> {
    return this.request<AdminStats>('/api/admin/stats');
  }

  async getUsers(page = 0, size = 20, search?: string): Promise<PageResponse<User>> {
    const params = new URLSearchParams({ page: String(page), size: String(size) });
    if (search) params.append('search', search);
    return this.request<PageResponse<User>>(`/api/admin/users?${params}`);
  }

  async banUser(userId: string): Promise<User> {
    return this.request<User>(`/api/admin/users/${userId}/ban`, { method: 'POST' });
  }

  async unbanUser(userId: string): Promise<User> {
    return this.request<User>(`/api/admin/users/${userId}/unban`, { method: 'POST' });
  }

  async getClubs(): Promise<BookClub[]> {
    return this.request<BookClub[]>('/api/admin/clubs');
  }

  async deleteClub(clubId: string): Promise<void> {
    return this.request<void>(`/api/admin/clubs/${clubId}`, { method: 'DELETE' });
  }

  async getClubMessages(clubId: string, page = 0, size = 50): Promise<PageResponse<Message>> {
    const params = new URLSearchParams({ page: String(page), size: String(size) });
    return this.request<PageResponse<Message>>(`/api/admin/clubs/${clubId}/messages?${params}`);
  }

  async deleteMessage(messageId: string): Promise<void> {
    return this.request<void>(`/api/admin/messages/${messageId}`, { method: 'DELETE' });
  }

  async getReportedMessages(page = 0, size = 20): Promise<PageResponse<Message>> {
    const params = new URLSearchParams({ page: String(page), size: String(size) });
    return this.request<PageResponse<Message>>(`/api/admin/messages/reported?${params}`);
  }

  async dismissReport(messageId: string): Promise<void> {
    return this.request<void>(`/api/admin/messages/${messageId}/dismiss`, { method: 'POST' });
  }

  async sendBroadcast(title: string, body: string): Promise<{ sentCount: number }> {
    return this.request<{ sentCount: number }>('/api/admin/broadcast', {
      method: 'POST',
      body: JSON.stringify({ title, body }),
    });
  }
}

export const api = new ApiService();
