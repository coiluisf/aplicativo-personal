import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiServices } from './services';
import {
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
// AUTH HOOKS
// ============================================================================

export const useRegister = () => {
  return useMutation({
    mutationFn: (data: RegisterRequest) => apiServices.auth.register(data),
  });
};

export const useLogin = () => {
  return useMutation({
    mutationFn: (data: LoginRequest) => apiServices.auth.login(data),
  });
};

export const useRefreshToken = () => {
  return useMutation({
    mutationFn: () => apiServices.auth.refreshToken(),
  });
};

export const useLogout = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => apiServices.auth.logout(),
    onSuccess: () => {
      queryClient.clear();
    },
  });
};

// ============================================================================
// WORKSPACE HOOKS
// ============================================================================

export const useWorkspace = () => {
  return useQuery({
    queryKey: ['workspace'],
    queryFn: () => apiServices.workspace.getWorkspace(),
  });
};

export const useWorkspaceStats = () => {
  return useQuery({
    queryKey: ['workspace', 'stats'],
    queryFn: () => apiServices.workspace.getStats(),
  });
};

export const useUpdateWorkspace = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateWorkspaceRequest) => apiServices.workspace.update(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspace'] });
    },
  });
};

export const useWorkspaceUsers = () => {
  return useQuery({
    queryKey: ['workspace', 'users'],
    queryFn: () => apiServices.workspace.getUsers(),
  });
};

export const useSuspendWorkspace = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => apiServices.workspace.suspend(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspace'] });
    },
  });
};

export const useReactivateWorkspace = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => apiServices.workspace.reactivate(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspace'] });
    },
  });
};

export const useDeleteWorkspace = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => apiServices.workspace.delete(),
    onSuccess: () => {
      queryClient.clear();
    },
  });
};

// ============================================================================
// STUDENT HOOKS
// ============================================================================

export const useCreateStudent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateStudentRequest) => apiServices.students.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
    },
  });
};

export const useStudents = (pagination?: PaginationParams) => {
  return useQuery({
    queryKey: ['students', pagination],
    queryFn: () => apiServices.students.list(pagination),
  });
};

export const useStudentById = (id: string) => {
  return useQuery({
    queryKey: ['students', id],
    queryFn: () => apiServices.students.getById(id),
    enabled: !!id,
  });
};

export const useUpdateStudent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateStudentRequest }) =>
      apiServices.students.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
    },
  });
};

export const useDeleteStudent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiServices.students.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
    },
  });
};

export const useSearchStudents = (query: string) => {
  return useQuery({
    queryKey: ['students', 'search', query],
    queryFn: () => apiServices.students.search(query),
    enabled: !!query && query.length > 0,
  });
};

// ============================================================================
// SESSION HOOKS
// ============================================================================

export const useCreateSession = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateSessionRequest) => apiServices.sessions.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      queryClient.invalidateQueries({ queryKey: ['sessions', 'upcoming'] });
    },
  });
};

export const useSessions = (
  pagination?: PaginationParams,
  filters?: {
    status?: string;
    studentId?: string;
    startDate?: string;
    endDate?: string;
  },
) => {
  return useQuery({
    queryKey: ['sessions', pagination, filters],
    queryFn: () => apiServices.sessions.list(pagination, filters),
  });
};

export const useSessionById = (id: string) => {
  return useQuery({
    queryKey: ['sessions', id],
    queryFn: () => apiServices.sessions.getById(id),
    enabled: !!id,
  });
};

export const useUpdateSession = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateSessionRequest }) =>
      apiServices.sessions.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      queryClient.invalidateQueries({ queryKey: ['sessions', 'upcoming'] });
    },
  });
};

export const useCancelSession = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiServices.sessions.cancel(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      queryClient.invalidateQueries({ queryKey: ['sessions', 'upcoming'] });
    },
  });
};

export const useUpcomingSessions = (days?: number) => {
  return useQuery({
    queryKey: ['sessions', 'upcoming', days],
    queryFn: () => apiServices.sessions.getUpcoming(days),
  });
};

// ============================================================================
// SUBSCRIPTION HOOKS
// ============================================================================

export const useSubscription = () => {
  return useQuery({
    queryKey: ['subscription'],
    queryFn: () => apiServices.subscriptions.getSubscription(),
  });
};

export const useCreateSubscription = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ plan, trialDays }: { plan: string; trialDays?: number }) =>
      apiServices.subscriptions.createSubscription(plan, trialDays),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription'] });
      queryClient.invalidateQueries({ queryKey: ['workspace', 'stats'] });
    },
  });
};

export const useChangePlan = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (plan: string) => apiServices.subscriptions.changePlan(plan),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription'] });
      queryClient.invalidateQueries({ queryKey: ['workspace', 'stats'] });
    },
  });
};

export const useCancelSubscription = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (immediately?: boolean) =>
      apiServices.subscriptions.cancelSubscription(immediately),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription'] });
      queryClient.invalidateQueries({ queryKey: ['workspace', 'stats'] });
    },
  });
};

export const useCreatePayment = () => {
  return useMutation({
    mutationFn: ({ amount, description }: { amount: number; description: string }) =>
      apiServices.subscriptions.createPayment(amount, description),
  });
};

export const useConfirmPayment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ paymentId, paymentMethodId }: { paymentId: string; paymentMethodId: string }) =>
      apiServices.subscriptions.confirmPayment(paymentId, paymentMethodId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription'] });
    },
  });
};
