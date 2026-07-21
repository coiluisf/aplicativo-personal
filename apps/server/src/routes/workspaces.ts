import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { WorkspaceController } from '../controllers/WorkspaceController';
import { verifyToken, verifyWorkspaceAccess } from '../middleware/auth';

export function createWorkspaceRoutes(prisma: PrismaClient): Router {
  const router = Router();
  const workspaceController = new WorkspaceController(prisma);

  // All workspace routes require authentication
  router.use(verifyToken);
  router.use(verifyWorkspaceAccess);

  router.get('/', (req, res) => workspaceController.getWorkspace(req, res));
  router.get('/stats', (req, res) => workspaceController.getWorkspaceStats(req, res));
  router.patch('/', (req, res) => workspaceController.updateWorkspace(req, res));
  router.get('/users', (req, res) => workspaceController.getWorkspaceUsers(req, res));
  router.post('/suspend', (req, res) => workspaceController.suspendWorkspace(req, res));
  router.post('/reactivate', (req, res) => workspaceController.reactivateWorkspace(req, res));
  router.delete('/', (req, res) => workspaceController.deleteWorkspace(req, res));

  return router;
}
