import { Response, Request } from 'express';
import { PrismaClient } from '@prisma/client';
import { SubscriptionService } from '../services/SubscriptionService';
import { stripeService } from '../services/StripeService';
import { AuthenticatedRequest } from '../middleware/auth';

export class SubscriptionController {
  private subscriptionService: SubscriptionService;

  constructor(prisma: PrismaClient) {
    this.subscriptionService = new SubscriptionService(prisma);
  }

  async getSubscription(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const subscription = await this.subscriptionService.getSubscriptionWithLimits(
        req.user.workspaceId,
      );

      if (!subscription) {
        res.status(404).json({ error: 'No active subscription' });
        return;
      }

      res.status(200).json(subscription);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch subscription';
      res.status(500).json({ error: message });
    }
  }

  async createSubscription(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { plan, trialDays } = req.body;

      if (!plan) {
        res.status(400).json({ error: 'Missing required field: plan' });
        return;
      }

      const planConfig = {
        STARTER: process.env.STRIPE_PRICE_STARTER,
        PROFESSIONAL: process.env.STRIPE_PRICE_PROFESSIONAL,
        ENTERPRISE: process.env.STRIPE_PRICE_ENTERPRISE,
      }[plan];

      if (!planConfig) {
        res.status(400).json({ error: 'Invalid plan' });
        return;
      }

      // Create Stripe subscription
      const stripeSubscription = await stripeService.createSubscription({
        email: req.user.email,
        priceId: planConfig,
        workspaceId: req.user.workspaceId,
        trialDays: trialDays || 0,
      });

      // Create in database
      const subscription = await this.subscriptionService.createSubscription({
        workspaceId: req.user.workspaceId,
        plan: plan as any,
        stripeSubscriptionId: stripeSubscription.id,
        stripeCustomerId: stripeSubscription.customer as string,
        trialEndsAt: trialDays ? new Date(Date.now() + trialDays * 24 * 60 * 60 * 1000) : undefined,
      });

      res.status(201).json(subscription);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create subscription';
      res.status(400).json({ error: message });
    }
  }

  async changePlan(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { plan } = req.body;

      if (!plan) {
        res.status(400).json({ error: 'Missing required field: plan' });
        return;
      }

      const updated = await this.subscriptionService.changePlan(req.user.workspaceId, plan);

      res.status(200).json(updated);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to change plan';
      res.status(400).json({ error: message });
    }
  }

  async cancelSubscription(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { immediately } = req.body;

      const updated = await this.subscriptionService.cancelSubscription(
        req.user.workspaceId,
        immediately || false,
      );

      res.status(200).json(updated);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to cancel subscription';
      res.status(400).json({ error: message });
    }
  }

  async createPayment(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { amount, description } = req.body;

      if (!amount || !description) {
        res.status(400).json({ error: 'Missing required fields: amount, description' });
        return;
      }

      const result = await this.subscriptionService.createPayment(
        req.user.workspaceId,
        amount,
        description,
      );

      res.status(201).json(result);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create payment';
      res.status(400).json({ error: message });
    }
  }

  async confirmPayment(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { paymentId, paymentMethodId } = req.body;

      if (!paymentId || !paymentMethodId) {
        res.status(400).json({ error: 'Missing required fields: paymentId, paymentMethodId' });
        return;
      }

      const result = await this.subscriptionService.confirmPayment(paymentId, paymentMethodId);

      res.status(200).json(result);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to confirm payment';
      res.status(400).json({ error: message });
    }
  }

  async webhookHandler(req: Request, res: Response): Promise<void> {
    try {
      const signature = req.headers['stripe-signature'] as string;
      const event = stripeService.verifyWebhookSignature(req.body, signature);

      switch (event.type) {
        case 'customer.subscription.created':
        case 'customer.subscription.updated':
          await this.subscriptionService.syncFromStripe(event.data.object.id);
          break;

        case 'customer.subscription.deleted':
          // Handle subscription deletion
          break;

        case 'invoice.payment_succeeded':
          // Handle payment success
          break;

        case 'invoice.payment_failed':
          // Handle payment failure
          break;
      }

      res.status(200).json({ received: true });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Webhook processing failed';
      res.status(400).json({ error: message });
    }
  }
}
