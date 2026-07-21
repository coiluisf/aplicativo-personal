import { Router, raw } from 'express';
import { PrismaClient } from '@prisma/client';
import { SubscriptionController } from '../controllers/SubscriptionController';
import { verifyToken, verifyWorkspaceAccess } from '../middleware/auth';

export function createSubscriptionRoutes(prisma: PrismaClient): Router {
  const router = Router();
  const subscriptionController = new SubscriptionController(prisma);

  // Webhook (public - no auth needed, but needs raw body for Stripe signature)
  router.post(
    '/webhook',
    raw({ type: 'application/octet-stream' }),
    (req, res) => subscriptionController.webhookHandler(req, res),
  );

  // Protected routes (require authentication)
  router.use(verifyToken);
  router.use(verifyWorkspaceAccess);

  router.get('/', (req, res) => subscriptionController.getSubscription(req, res));
  router.post('/', (req, res) => subscriptionController.createSubscription(req, res));
  router.patch('/plan', (req, res) => subscriptionController.changePlan(req, res));
  router.delete('/', (req, res) => subscriptionController.cancelSubscription(req, res));

  // Payments
  router.post('/payments', (req, res) => subscriptionController.createPayment(req, res));
  router.post('/payments/confirm', (req, res) => subscriptionController.confirmPayment(req, res));

  return router;
}
