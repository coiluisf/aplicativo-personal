import { PrismaClient, SessionStatus } from '@prisma/client';

export interface CreateSessionPayload {
  studentId: string;
  startTime: Date;
  endTime: Date;
  notes?: string;
  workspaceId: string;
}

export interface UpdateSessionPayload {
  status?: SessionStatus;
  startTime?: Date;
  endTime?: Date;
  notes?: string;
}

export interface ListSessionsPayload {
  workspaceId: string;
  page?: number;
  limit?: number;
  status?: SessionStatus;
  studentId?: string;
  startDate?: Date;
  endDate?: Date;
}

export class SessionService {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async createSession(payload: CreateSessionPayload) {
    const { studentId, startTime, endTime, notes, workspaceId } = payload;

    // Verify student exists and belongs to workspace
    const student = await this.prisma.student.findFirst({
      where: {
        AND: [{ id: studentId }, { workspaceId }],
      },
    });

    if (!student) {
      throw new Error('Student not found');
    }

    // Check for overlapping sessions
    const overlapping = await this.prisma.session.findFirst({
      where: {
        AND: [
          { workspaceId },
          { status: { in: ['SCHEDULED', 'COMPLETED'] } },
          {
            OR: [
              { AND: [{ startTime: { lt: endTime } }, { endTime: { gt: startTime } }] },
            ],
          },
        ],
      },
    });

    if (overlapping) {
      throw new Error('Time slot already booked');
    }

    const session = await this.prisma.session.create({
      data: {
        studentId,
        startTime,
        endTime,
        notes: notes || null,
        status: 'SCHEDULED',
        workspaceId,
      },
      include: { student: true },
    });

    return session;
  }

  async listSessions(payload: ListSessionsPayload) {
    const { workspaceId, page = 1, limit = 20, status, studentId, startDate, endDate } = payload;
    const skip = (page - 1) * limit;

    const whereClause: any = { workspaceId };

    if (status) {
      whereClause.status = status;
    }

    if (studentId) {
      whereClause.studentId = studentId;
    }

    if (startDate || endDate) {
      whereClause.startTime = {};
      if (startDate) {
        whereClause.startTime.gte = startDate;
      }
      if (endDate) {
        whereClause.startTime.lte = endDate;
      }
    }

    const [sessions, total] = await Promise.all([
      this.prisma.session.findMany({
        where: whereClause,
        include: { student: true },
        skip,
        take: limit,
        orderBy: { startTime: 'desc' },
      }),
      this.prisma.session.count({ where: whereClause }),
    ]);

    return {
      sessions,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async getSessionById(sessionId: string, workspaceId: string) {
    const session = await this.prisma.session.findFirst({
      where: {
        AND: [{ id: sessionId }, { workspaceId }],
      },
      include: {
        student: true,
        exerciseLogs: true,
      },
    });

    if (!session) {
      throw new Error('Session not found');
    }

    return session;
  }

  async updateSession(sessionId: string, workspaceId: string, payload: UpdateSessionPayload) {
    const session = await this.prisma.session.findFirst({
      where: {
        AND: [{ id: sessionId }, { workspaceId }],
      },
    });

    if (!session) {
      throw new Error('Session not found');
    }

    // Check for time conflicts if updating times
    if (payload.startTime || payload.endTime) {
      const newStartTime = payload.startTime || session.startTime;
      const newEndTime = payload.endTime || session.endTime;

      const overlapping = await this.prisma.session.findFirst({
        where: {
          AND: [
            { workspaceId },
            { id: { not: sessionId } },
            { status: { in: ['SCHEDULED', 'COMPLETED'] } },
            {
              OR: [
                { AND: [{ startTime: { lt: newEndTime } }, { endTime: { gt: newStartTime } }] },
              ],
            },
          ],
        },
      });

      if (overlapping) {
        throw new Error('Time slot already booked');
      }
    }

    const updated = await this.prisma.session.update({
      where: { id: sessionId },
      data: {
        ...(payload.status && { status: payload.status }),
        ...(payload.startTime && { startTime: payload.startTime }),
        ...(payload.endTime && { endTime: payload.endTime }),
        ...(payload.notes !== undefined && { notes: payload.notes }),
      },
      include: { student: true },
    });

    return updated;
  }

  async cancelSession(sessionId: string, workspaceId: string) {
    const session = await this.prisma.session.findFirst({
      where: {
        AND: [{ id: sessionId }, { workspaceId }],
      },
    });

    if (!session) {
      throw new Error('Session not found');
    }

    const updated = await this.prisma.session.update({
      where: { id: sessionId },
      data: { status: 'CANCELLED' },
      include: { student: true },
    });

    return updated;
  }

  async getUpcomingSessions(workspaceId: string, days = 7) {
    const now = new Date();
    const futureDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

    const sessions = await this.prisma.session.findMany({
      where: {
        AND: [
          { workspaceId },
          { status: 'SCHEDULED' },
          { startTime: { gte: now, lte: futureDate } },
        ],
      },
      include: { student: true },
      orderBy: { startTime: 'asc' },
    });

    return sessions;
  }

  async getStudentUpcomingSessions(studentId: string, workspaceId: string) {
    const now = new Date();

    const sessions = await this.prisma.session.findMany({
      where: {
        AND: [
          { studentId },
          { workspaceId },
          { status: 'SCHEDULED' },
          { startTime: { gte: now } },
        ],
      },
      orderBy: { startTime: 'asc' },
    });

    return sessions;
  }
}
