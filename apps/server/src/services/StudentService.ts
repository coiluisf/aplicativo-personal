import { PrismaClient } from '@prisma/client';

export interface CreateStudentPayload {
  name: string;
  email: string;
  phone?: string;
  workspaceId: string;
}

export interface UpdateStudentPayload {
  name?: string;
  email?: string;
  phone?: string;
}

export class StudentService {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async createStudent(payload: CreateStudentPayload) {
    const { name, email, phone, workspaceId } = payload;

    const existingStudent = await this.prisma.student.findFirst({
      where: {
        AND: [{ email }, { workspaceId }],
      },
    });

    if (existingStudent) {
      throw new Error('Student already exists in this workspace');
    }

    const student = await this.prisma.student.create({
      data: {
        name,
        email,
        phone: phone || null,
        workspaceId,
        status: 'ACTIVE',
      },
    });

    return student;
  }

  async getStudentsByWorkspace(workspaceId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [students, total] = await Promise.all([
      this.prisma.student.findMany({
        where: { workspaceId },
        include: {
          studentPlans: {
            where: { status: 'ACTIVE' },
            include: { subscription: true },
          },
          sessions: {
            where: { status: { in: ['SCHEDULED', 'COMPLETED'] } },
            orderBy: { startTime: 'desc' },
            take: 5,
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.student.count({
        where: { workspaceId },
      }),
    ]);

    return {
      students,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async getStudentById(studentId: string, workspaceId: string) {
    const student = await this.prisma.student.findFirst({
      where: {
        AND: [{ id: studentId }, { workspaceId }],
      },
      include: {
        studentPlans: {
          include: { subscription: true },
        },
        sessions: {
          orderBy: { startTime: 'desc' },
        },
      },
    });

    if (!student) {
      throw new Error('Student not found');
    }

    return student;
  }

  async updateStudent(studentId: string, workspaceId: string, payload: UpdateStudentPayload) {
    const student = await this.prisma.student.findFirst({
      where: {
        AND: [{ id: studentId }, { workspaceId }],
      },
    });

    if (!student) {
      throw new Error('Student not found');
    }

    if (payload.email) {
      const existingStudent = await this.prisma.student.findFirst({
        where: {
          AND: [{ email: payload.email }, { workspaceId }, { id: { not: studentId } }],
        },
      });

      if (existingStudent) {
        throw new Error('Email already in use');
      }
    }

    const updated = await this.prisma.student.update({
      where: { id: studentId },
      data: {
        ...(payload.name && { name: payload.name }),
        ...(payload.email && { email: payload.email }),
        ...(payload.phone && { phone: payload.phone }),
      },
    });

    return updated;
  }

  async deleteStudent(studentId: string, workspaceId: string) {
    const student = await this.prisma.student.findFirst({
      where: {
        AND: [{ id: studentId }, { workspaceId }],
      },
    });

    if (!student) {
      throw new Error('Student not found');
    }

    await this.prisma.student.update({
      where: { id: studentId },
      data: { status: 'INACTIVE' },
    });

    return { message: 'Student deactivated successfully' };
  }

  async searchStudents(workspaceId: string, query: string) {
    const students = await this.prisma.student.findMany({
      where: {
        AND: [
          { workspaceId },
          {
            OR: [
              { name: { contains: query, mode: 'insensitive' } },
              { email: { contains: query, mode: 'insensitive' } },
            ],
          },
        ],
      },
      take: 10,
    });

    return students;
  }
}
