import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { SessionController } from '../controllers/SessionController';
import { verifyToken, verifyWorkspaceAccess } from '../middleware/auth';

export function createSessionRoutes(prisma: PrismaClient): Router {
  const router = Router();
  const sessionController = new SessionController(prisma);

  // All session routes require authentication
  router.use(verifyToken);
  router.use(verifyWorkspaceAccess);

  router.post('/', (req, res) => sessionController.createSession(req, res));
  router.get('/', (req, res) => sessionController.listSessions(req, res));
  router.get('/upcoming', (req, res) => sessionController.getUpcomingSessions(req, res));
  router.get('/:id', (req, res) => sessionController.getSessionById(req, res));
  router.patch('/:id', (req, res) => sessionController.updateSession(req, res));
  router.delete('/:id', (req, res) => sessionController.cancelSession(req, res));

  return router;
}
