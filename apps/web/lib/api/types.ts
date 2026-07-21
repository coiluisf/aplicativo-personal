// Auth Types
export interface User {
  id: string;
  email: string;
  name: string;
  workspaceId: string;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}

// Workspace Types
export interface Workspace {
  id: string;
  name: string;
  description?: string;
  status: 'ACTIVE' | 'SUSPENDED' | 'CANCELLED';
  createdAt: string;
  users?: WorkspaceUser[];
  _count?: {
    students: number;
    sessions: number;
    subscriptions: number;
  };
}

export interface WorkspaceUser {
  id: string;
  email: string;
  name: string;
  role: string;
  createdAt: string;
}

export interface WorkspaceStats {
  workspace: Workspace;
  stats: {
    totalStudents: number;
    activeStudents: number;
    totalSessions: number;
    completedSessions: number;
    upcomingSessions: number;
    activeSubscriptions: number;
    totalRevenue: number;
  };
}

// Student Types
export interface Student {
  id: string;
  name: string;
  email: string;
  phone?: string;
  status: 'ACTIVE' | 'INACTIVE';
  workspaceId: string;
  createdAt: string;
  studentPlans?: StudentPlan[];
  sessions?: Session[];
}

export interface StudentPlan {
  id: string;
  status: string;
  subscription?: {
    id: string;
    plan: string;
    status: string;
  };
}

export interface StudentListResponse {
  students: Student[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

// Session Types
export interface Session {
  id: string;
  studentId: string;
  startTime: string;
  endTime: string;
  notes?: string;
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW' | 'RESCHEDULED';
  workspaceId: string;
  createdAt: string;
  student?: {
    id: string;
    name: string;
  };
  exerciseLogs?: ExerciseLog[];
}

export interface SessionListResponse {
  sessions: Session[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export interface ExerciseLog {
  id: string;
  sessionId: string;
  exerciseId: string;
  sets: number;
  reps: number;
  weight?: number;
  notes?: string;
}

// Form Request Types
export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  workspaceName: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface CreateStudentRequest {
  name: string;
  email: string;
  phone?: string;
}

export interface UpdateStudentRequest {
  name?: string;
  email?: string;
  phone?: string;
}

export interface CreateSessionRequest {
  studentId: string;
  startTime: string;
  endTime: string;
  notes?: string;
}

export interface UpdateSessionRequest {
  status?: string;
  startTime?: string;
  endTime?: string;
  notes?: string;
}

export interface UpdateWorkspaceRequest {
  name?: string;
  description?: string;
}

// Pagination Options
export interface PaginationParams {
  page?: number;
  limit?: number;
}

// Error Response
export interface ErrorResponse {
  error: string;
}
