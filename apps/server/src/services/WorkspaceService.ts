import { PrismaClient, WorkspaceStatus } from '@prisma/client';

export interface UpdateWorkspacePayload {
  name?: string;
  description?: string;
}

export class WorkspaceService {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async getWorkspaceById(workspaceId: string) {
    const workspace = await this.prisma.workspace.findUnique({
      where: { id: workspaceId },
      include: {
        users: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            createdAt: true,
          },
        },
        _count: {
          select: {
            students: true,
            sessions: true,
            subscriptions: true,
          },
        },
      },
    });

    if (!workspace) {
      throw new Error('Workspace not found');
    }

    return workspace;
  }

  async getWorkspaceStats(workspaceId: string) {
    const workspace = await this.prisma.workspace.findUnique({
      where: { id: workspaceId },
    });

    if (!workspace) {
      throw new Error('Workspace not found');
    }

    const [
      totalStudents,
      activeStudents,
      totalSessions,
      completedSessions,
      upcomingSessions,
      activeSubscriptions,
      totalRevenue,
    ] = await Promise.all([
      this.prisma.student.count({
        where: { workspaceId, status: { not: 'INACTIVE' } },
      }),
      this.prisma.student.count({
        where: { workspaceId, status: 'ACTIVE' },
      }),
      this.prisma.session.count({
        where: { workspaceId },
      }),
      this.prisma.session.count({
        where: { workspaceId, status: 'COMPLETED' },
      }),
      this.prisma.session.count({
        where: {
          workspaceId,
          status: 'SCHEDULED',
          startTime: { gte: new Date() },
        },
      }),
      this.prisma.subscription.count({
        where: { workspaceId, status: 'ACTIVE' },
      }),
      this.prisma.payment.aggregate({
        where: {
          workspaceId,
          status: 'SUCCEEDED',
        },
        _sum: {
          amount: true,
        },
      }),
    ]);

    return {
      workspace,
      stats: {
        totalStudents,
        activeStudents,
        totalSessions,
        completedSessions,
        upcomingSessions,
        activeSubscriptions,
        totalRevenue: totalRevenue._sum.amount || 0,
      },
    };
  }

  async updateWorkspace(workspaceId: string, payload: UpdateWorkspacePayload) {
    const workspace = await this.prisma.workspace.findUnique({
      where: { id: workspaceId },
    });

    if (!workspace) {
      throw new Error('Workspace not found');
    }

    const updated = await this.prisma.workspace.update({
      where: { id: workspaceId },
      data: {
        ...(payload.name && { name: payload.name }),
        ...(payload.description && { description: payload.description }),
      },
    });

    return updated;
  }

  async getWorkspaceUsers(workspaceId: string) {
    const workspace = await this.prisma.workspace.findUnique({
      where: { id: workspaceId },
      include: {
        users: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            createdAt: true,
          },
        },
      },
    });

    if (!workspace) {
      throw new Error('Workspace not found');
    }

    return workspace.users;
  }

  async suspendWorkspace(workspaceId: string) {
    const workspace = await this.prisma.workspace.findUnique({
      where: { id: workspaceId },
    });

    if (!workspace) {
      throw new Error('Workspace not found');
    }

    const updated = await this.prisma.workspace.update({
      where: { id: workspaceId },
      data: { status: 'SUSPENDED' },
    });

    return updated;
  }

  async reactivateWorkspace(workspaceId: string) {
    const workspace = await this.prisma.workspace.findUnique({
      where: { id: workspaceId },
    });

    if (!workspace) {
      throw new Error('Workspace not found');
    }

    const updated = await this.prisma.workspace.update({
      where: { id: workspaceId },
      data: { status: 'ACTIVE' },
    });

    return updated;
  }

  async deleteWorkspace(workspaceId: string) {
    const workspace = await this.prisma.workspace.findUnique({
      where: { id: workspaceId },
    });

    if (!workspace) {
      throw new Error('Workspace not found');
    }

    const updated = await this.prisma.workspace.update({
      where: { id: workspaceId },
      data: { status: 'CANCELLED' },
    });

    return updated;
  }
}
