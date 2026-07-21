import { apiClient } from './client';
import {
  AuthResponse,
  Workspace,
  WorkspaceStats,
  Student,
  StudentListResponse,
  Session,
  SessionListResponse,
  RegisterRequest,
  LoginRequest,
  CreateStudentRequest,
  UpdateStudentRequest,
  CreateSessionRequest,
  UpdateSessionRequest,
  UpdateWorkspaceRequest,
  PaginationParams,
} from './types';

// ============================================================================
// AUTH SERVICES
// ============================================================================

export const authServices = {
  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    return apiClient.post('/auth/register', data);
  },

  login: async (data: LoginRequest): Promise<AuthResponse> => {
    return apiClient.post('/auth/login', data);
  },

  refreshToken: async (): Promise<AuthResponse> => {
    return apiClient.post('/auth/refresh-token');
  },

  logout: async (): Promise<{ message: string }> => {
    return apiClient.post('/auth/logout');
  },
};

// ============================================================================
// WORKSPACE SERVICES
// ============================================================================

export const workspaceServices = {
  getWorkspace: async (): Promise<Workspace> => {
    return apiClient.get('/workspaces');
  },

  getStats: async (): Promise<WorkspaceStats> => {
    return apiClient.get('/workspaces/stats');
  },

  update: async (data: UpdateWorkspaceRequest): Promise<Workspace> => {
    return apiClient.patch('/workspaces', data);
  },

  getUsers: async () => {
    return apiClient.get('/workspaces/users');
  },

  suspend: async (): Promise<Workspace> => {
    return apiClient.post('/workspaces/suspend');
  },

  reactivate: async (): Promise<Workspace> => {
    return apiClient.post('/workspaces/reactivate');
  },

  delete: async (): Promise<Workspace> => {
    return apiClient.delete('/workspaces');
  },
};

// ============================================================================
// STUDENT SERVICES
// ============================================================================

export const studentServices = {
  create: async (data: CreateStudentRequest): Promise<Student> => {
    return apiClient.post('/students', data);
  },

  list: async (pagination?: PaginationParams): Promise<StudentListResponse> => {
    const params = new URLSearchParams();
    if (pagination?.page) params.append('page', pagination.page.toString());
    if (pagination?.limit) params.append('limit', pagination.limit.toString());
    return apiClient.get(`/students?${params.toString()}`);
  },

  getById: async (id: string): Promise<Student> => {
    return apiClient.get(`/students/${id}`);
  },

  update: async (id: string, data: UpdateStudentRequest): Promise<Student> => {
    return apiClient.patch(`/students/${id}`, data);
  },

  delete: async (id: string): Promise<{ message: string }> => {
    return apiClient.delete(`/students/${id}`);
  },

  search: async (query: string): Promise<Student[]> => {
    return apiClient.get(`/students/search?q=${encodeURIComponent(query)}`);
  },
};

// ============================================================================
// SESSION SERVICES
// ============================================================================

export const sessionServices = {
  create: async (data: CreateSessionRequest): Promise<Session> => {
    return apiClient.post('/sessions', data);
  },

  list: async (
    pagination?: PaginationParams,
    filters?: {
      status?: string;
      studentId?: string;
      startDate?: string;
      endDate?: string;
    },
  ): Promise<SessionListResponse> => {
    const params = new URLSearchParams();
    if (pagination?.page) params.append('page', pagination.page.toString());
    if (pagination?.limit) params.append('limit', pagination.limit.toString());
    if (filters?.status) params.append('status', filters.status);
    if (filters?.studentId) params.append('studentId', filters.studentId);
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    return apiClient.get(`/sessions?${params.toString()}`);
  },

  getById: async (id: string): Promise<Session> => {
    return apiClient.get(`/sessions/${id}`);
  },

  update: async (id: string, data: UpdateSessionRequest): Promise<Session> => {
    return apiClient.patch(`/sessions/${id}`, data);
  },

  cancel: async (id: string): Promise<Session> => {
    return apiClient.delete(`/sessions/${id}`);
  },

  getUpcoming: async (days?: number): Promise<Session[]> => {
    const params = days ? `?days=${days}` : '';
    return apiClient.get(`/sessions/upcoming${params}`);
  },
};

// ============================================================================
// EXPORT ALL SERVICES
// ============================================================================

export const apiServices = {
  auth: authServices,
  workspace: workspaceServices,
  students: studentServices,
  sessions: sessionServices,
};
