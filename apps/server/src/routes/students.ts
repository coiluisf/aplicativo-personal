import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { StudentController } from '../controllers/StudentController';
import { verifyToken, verifyWorkspaceAccess } from '../middleware/auth';

export function createStudentRoutes(prisma: PrismaClient): Router {
  const router = Router();
  const studentController = new StudentController(prisma);

  // All student routes require authentication
  router.use(verifyToken);
  router.use(verifyWorkspaceAccess);

  router.post('/', (req, res) => studentController.createStudent(req, res));
  router.get('/', (req, res) => studentController.getStudents(req, res));
  router.get('/search', (req, res) => studentController.searchStudents(req, res));
  router.get('/:id', (req, res) => studentController.getStudentById(req, res));
  router.patch('/:id', (req, res) => studentController.updateStudent(req, res));
  router.delete('/:id', (req, res) => studentController.deleteStudent(req, res));

  return router;
}
