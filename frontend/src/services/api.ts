import {
  User,
  FoodListing,
  DonationRequest,
  ImpactMetrics,
  NotificationItem,
  ReportItem,
  AuditLogItem,
  DemoUser,
  VerificationStatus,
  ReportStatus
} from '../types';

const API_BASE = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : '/api';

function getToken(): string | null {
  return localStorage.getItem('foodbridge_token');
}

export function setToken(token: string) {
  localStorage.setItem('foodbridge_token', token);
}

export function clearToken() {
  localStorage.removeItem('foodbridge_token');
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMsg = `Error ${response.status}: ${response.statusText}`;
    try {
      const errorJson = await response.json();
      if (errorJson.detail) {
        if (typeof errorJson.detail === 'string') {
          errorMsg = errorJson.detail;
        } else if (Array.isArray(errorJson.detail)) {
          errorMsg = errorJson.detail.map((d: any) => d.msg || JSON.stringify(d)).join(', ');
        }
      }
    } catch {
      // ignore json parse error
    }
    throw new Error(errorMsg);
  }

  // Handle 204 or empty response
  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

export const api = {
  // Auth
  async login(email: string, password: string): Promise<{ access_token: string; user: User }> {
    return request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  async register(data: any): Promise<{ access_token: string; user: User }> {
    return request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async getMe(): Promise<User> {
    return request('/auth/me');
  },

  async getDemoUsers(): Promise<DemoUser[]> {
    return request('/auth/demo-users');
  },

  async demoLogin(userId: number): Promise<{ access_token: string; user: User }> {
    return request(`/auth/demo-login/${userId}`, {
      method: 'POST',
    });
  },

  // Listings
  async getListings(params?: {
    category?: string;
    status?: string;
    storage?: string;
    dietary?: string;
    search?: string;
    urgent_only?: boolean;
    donor_id?: number;
    include_all_statuses?: boolean;
  }): Promise<FoodListing[]> {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '') {
          query.append(k, String(v));
        }
      });
    }
    const qStr = query.toString();
    return request(`/listings${qStr ? `?${qStr}` : ''}`);
  },

  async getListing(id: number): Promise<FoodListing> {
    return request(`/listings/${id}`);
  },

  async createListing(data: any): Promise<FoodListing> {
    return request('/listings', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateListing(id: number, data: any): Promise<FoodListing> {
    return request(`/listings/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async cancelListing(id: number, reason?: string): Promise<{ message: string }> {
    const q = reason ? `?reason=${encodeURIComponent(reason)}` : '';
    return request(`/listings/${id}${q}`, {
      method: 'DELETE',
    });
  },

  // Requests & Workflow
  async getRequests(params?: { status?: string; listing_id?: number }): Promise<DonationRequest[]> {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '') {
          query.append(k, String(v));
        }
      });
    }
    const qStr = query.toString();
    return request(`/requests${qStr ? `?${qStr}` : ''}`);
  },

  async getRequest(id: number): Promise<DonationRequest> {
    return request(`/requests/${id}`);
  },

  async createRequest(data: {
    listing_id: number;
    requested_quantity?: string;
    transport_type: string;
    estimated_pickup_time: string;
    contact_phone: string;
    recipient_notes?: string;
  }): Promise<DonationRequest> {
    return request('/requests', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async handleRequestAction(
    requestId: number,
    action: 'accept' | 'reject' | 'cancel' | 'confirm_pickup' | 'complete',
    options?: { notes?: string; pickup_code?: string }
  ): Promise<DonationRequest> {
    return request(`/requests/${requestId}/action`, {
      method: 'POST',
      body: JSON.stringify({ action, ...options }),
    });
  },

  // Impact
  async getImpact(): Promise<ImpactMetrics> {
    return request('/impact');
  },

  // Notifications
  async getNotifications(): Promise<NotificationItem[]> {
    return request('/notifications');
  },

  async markNotificationRead(id: number): Promise<NotificationItem> {
    return request(`/notifications/${id}/read`, {
      method: 'PATCH',
    });
  },

  async markAllNotificationsRead(): Promise<{ message: string }> {
    return request('/notifications/read-all', {
      method: 'PATCH',
    });
  },

  // Reports
  async submitReport(data: {
    listing_id?: number;
    reported_user_id?: number;
    reason: string;
    details: string;
  }): Promise<ReportItem> {
    return request('/reports', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Admin
  async getAdminStats(): Promise<any> {
    return request('/admin/stats');
  },

  async getAdminUsers(params?: { role?: string; verification_status?: string }): Promise<User[]> {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '') {
          query.append(k, String(v));
        }
      });
    }
    const qStr = query.toString();
    return request(`/admin/users${qStr ? `?${qStr}` : ''}`);
  },

  async updateUserVerification(
    userId: number,
    status: VerificationStatus,
    admin_notes?: string
  ): Promise<User> {
    return request(`/admin/users/${userId}/verification`, {
      method: 'PATCH',
      body: JSON.stringify({ status, admin_notes }),
    });
  },

  async toggleUserActive(userId: number): Promise<User> {
    return request(`/admin/users/${userId}/toggle-active`, {
      method: 'PATCH',
    });
  },

  async getAdminReports(status_filter?: string): Promise<ReportItem[]> {
    const q = status_filter ? `?status_filter=${status_filter}` : '';
    return request(`/admin/reports${q}`);
  },

  async resolveAdminReport(
    reportId: number,
    status: ReportStatus,
    admin_notes?: string
  ): Promise<ReportItem> {
    return request(`/admin/reports/${reportId}`, {
      method: 'PATCH',
      body: JSON.stringify({ status, admin_notes }),
    });
  },

  async getAdminAuditLogs(limit = 50): Promise<AuditLogItem[]> {
    return request(`/admin/audit-logs?limit=${limit}`);
  },
};
