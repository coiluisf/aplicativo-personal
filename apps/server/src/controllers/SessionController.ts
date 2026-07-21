import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { SessionService } from '../services/SessionService';
import { AuthenticatedRequest } from '../middleware/auth';

export class SessionController {
  private sessionService: SessionService;

  constructor(prisma: PrismaClient) {
    this.sessionService = new SessionService(prisma);
  }

  async createSession(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { studentId, startTime, endTime, notes } = req.body;

      if (!studentId || !startTime || !endTime) {
        res.status(400).json({
          error: 'Missing required fields: studentId, startTime, endTime',
        });
        return;
      }

      const session = await this.sessionService.createSession({
        studentId,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        notes,
        workspaceId: req.user.workspaceId,
      });

      res.status(201).json(session);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create session';
      const status = message.includes('not found') ? 404 : 400;
      res.status(status).json({ error: message });
    }
  }

  async listSessions(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const page = req.query.page ? parseInt(req.query.page as string) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
      const status = req.query.status as string;
      const studentId = req.query.studentId as string;
      const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
      const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;

      const result = await this.sessionService.listSessions({
        workspaceId: req.user.workspaceId,
        page,
        limit,
        status: status as any,
        studentId,
        startDate,
        endDate,
      });

      res.status(200).json(result);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch sessions';
      res.status(500).json({ error: message });
    }
  }

  async getSessionById(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { id } = req.params;

      const session = await this.sessionService.getSessionById(id, req.user.workspaceId);

      res.status(200).json(session);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch session';
      const status = message.includes('not found') ? 404 : 500;
      res.status(status).json({ error: message });
    }
  }

  async updateSession(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { id } = req.params;
      const { status, startTime, endTime, notes } = req.body;

      const session = await this.sessionService.updateSession(id, req.user.workspaceId, {
        status: status as any,
        startTime: startTime ? new Date(startTime) : undefined,
        endTime: endTime ? new Date(endTime) : undefined,
        notes,
      });

      res.status(200).json(session);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update session';
      const status = message.includes('not found') ? 404 : 400;
      res.status(status).json({ error: message });
    }
  }

  async cancelSession(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { id } = req.params;

      const session = await this.sessionService.cancelSession(id, req.user.workspaceId);

      res.status(200).json(session);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to cancel session';
      const status = message.includes('not found') ? 404 : 500;
      res.status(status).json({ error: message });
    }
  }

  async getUpcomingSessions(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const days = req.query.days ? parseInt(req.query.days as string) : 7;

      const sessions = await this.sessionService.getUpcomingSessions(req.user.workspaceId, days);

      res.status(200).json(sessions);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch sessions';
      res.status(500).json({ error: message });
    }
  }
}
