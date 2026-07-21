import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { WorkspaceService } from '../services/WorkspaceService';
import { AuthenticatedRequest } from '../middleware/auth';

export class WorkspaceController {
  private workspaceService: WorkspaceService;

  constructor(prisma: PrismaClient) {
    this.workspaceService = new WorkspaceService(prisma);
  }

  async getWorkspace(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const workspace = await this.workspaceService.getWorkspaceById(req.user.workspaceId);

      res.status(200).json(workspace);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch workspace';
      res.status(500).json({ error: message });
    }
  }

  async getWorkspaceStats(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const result = await this.workspaceService.getWorkspaceStats(req.user.workspaceId);

      res.status(200).json(result);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch stats';
      res.status(500).json({ error: message });
    }
  }

  async updateWorkspace(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { name, description } = req.body;

      const workspace = await this.workspaceService.updateWorkspace(req.user.workspaceId, {
        name,
        description,
      });

      res.status(200).json(workspace);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update workspace';
      res.status(400).json({ error: message });
    }
  }

  async getWorkspaceUsers(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const users = await this.workspaceService.getWorkspaceUsers(req.user.workspaceId);

      res.status(200).json(users);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch users';
      res.status(500).json({ error: message });
    }
  }

  async suspendWorkspace(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const workspace = await this.workspaceService.suspendWorkspace(req.user.workspaceId);

      res.status(200).json(workspace);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to suspend workspace';
      res.status(400).json({ error: message });
    }
  }

  async reactivateWorkspace(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const workspace = await this.workspaceService.reactivateWorkspace(req.user.workspaceId);

      res.status(200).json(workspace);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to reactivate workspace';
      res.status(400).json({ error: message });
    }
  }

  async deleteWorkspace(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const workspace = await this.workspaceService.deleteWorkspace(req.user.workspaceId);

      res.status(200).json(workspace);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete workspace';
      res.status(400).json({ error: message });
    }
  }
}
