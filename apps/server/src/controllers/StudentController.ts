import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { StudentService } from '../services/StudentService';
import { AuthenticatedRequest } from '../middleware/auth';

export class StudentController {
  private studentService: StudentService;

  constructor(prisma: PrismaClient) {
    this.studentService = new StudentService(prisma);
  }

  async createStudent(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { name, email, phone } = req.body;

      if (!name || !email) {
        res.status(400).json({
          error: 'Missing required fields: name, email',
        });
        return;
      }

      const student = await this.studentService.createStudent({
        name,
        email,
        phone,
        workspaceId: req.user.workspaceId,
      });

      res.status(201).json(student);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create student';
      res.status(400).json({ error: message });
    }
  }

  async getStudents(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const page = req.query.page ? parseInt(req.query.page as string) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;

      const result = await this.studentService.getStudentsByWorkspace(
        req.user.workspaceId,
        page,
        limit,
      );

      res.status(200).json(result);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch students';
      res.status(500).json({ error: message });
    }
  }

  async getStudentById(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { id } = req.params;

      const student = await this.studentService.getStudentById(id, req.user.workspaceId);

      res.status(200).json(student);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch student';
      const status = message.includes('not found') ? 404 : 500;
      res.status(status).json({ error: message });
    }
  }

  async updateStudent(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { id } = req.params;
      const { name, email, phone } = req.body;

      const student = await this.studentService.updateStudent(id, req.user.workspaceId, {
        name,
        email,
        phone,
      });

      res.status(200).json(student);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update student';
      const status = message.includes('not found') ? 404 : 400;
      res.status(status).json({ error: message });
    }
  }

  async deleteStudent(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { id } = req.params;

      const result = await this.studentService.deleteStudent(id, req.user.workspaceId);

      res.status(200).json(result);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete student';
      const status = message.includes('not found') ? 404 : 500;
      res.status(status).json({ error: message });
    }
  }

  async searchStudents(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { q } = req.query;

      if (!q) {
        res.status(400).json({ error: 'Search query required' });
        return;
      }

      const students = await this.studentService.searchStudents(
        req.user.workspaceId,
        q as string,
      );

      res.status(200).json(students);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Search failed';
      res.status(500).json({ error: message });
    }
  }
}
