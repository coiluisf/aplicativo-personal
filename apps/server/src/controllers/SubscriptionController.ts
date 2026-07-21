import { Response, Request } from 'express';
import { PrismaClient } from '@prisma/client';
import { SubscriptionService } from '../services/SubscriptionService';
import { asaasService } from '../services/AsaasService';
import { AuthenticatedRequest } from '../middleware/auth';
import logger from '../utils/logger';

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

      const planPrices = {
        STARTER: 49.0,
        PROFESSIONAL: 99.0,
        ENTERPRISE: 299.0,
      };

      const planPrice = planPrices[plan as keyof typeof planPrices];

      if (!planPrice) {
        res.status(400).json({ error: 'Invalid plan' });
        return;
      }

      // Step 1: Create/get customer in Asaas
      let asaasCustomer;
      try {
        asaasCustomer = await asaasService.createCustomer({
          name: req.user.name,
          email: req.user.email,
        });
      } catch (error) {
        logger.error('Failed to create Asaas customer', { error });
        res.status(400).json({ error: 'Failed to create payment customer' });
        return;
      }

      // Step 2: Create subscription in Asaas
      let asaasSubscription;
      try {
        asaasSubscription = await asaasService.createSubscription({
          customerId: asaasCustomer.id,
          value: planPrice,
          description: `TrainApp ${plan} Plan - Monthly Subscription`,
          billingType: 'CREDIT_CARD',
          cycle: 'MONTHLY',
        });
      } catch (error) {
        logger.error('Failed to create Asaas subscription', { error });
        res.status(400).json({ error: 'Failed to create subscription' });
        return;
      }

      // Step 3: Create in database
      const subscription = await this.subscriptionService.createSubscription({
        workspaceId: req.user.workspaceId,
        plan: plan as any,
        stripeSubscriptionId: asaasSubscription.id,
        stripeCustomerId: asaasCustomer.id,
        trialEndsAt: trialDays ? new Date(Date.now() + trialDays * 24 * 60 * 60 * 1000) : undefined,
      });

      res.status(201).json({
        ...subscription,
        paymentDetails: {
          provider: 'asaas',
          customerId: asaasCustomer.id,
          subscriptionId: asaasSubscription.id,
          status: asaasSubscription.status,
          nextDueDate: asaasSubscription.nextDueDate,
        },
      });
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

      // Get subscription from database
      const subscription = await this.subscriptionService.getSubscription(req.user.workspaceId);

      if (!subscription || !subscription.stripeSubscriptionId) {
        res.status(404).json({ error: 'No active subscription found' });
        return;
      }

      // Cancel in Asaas
      try {
        await asaasService.cancelSubscription(subscription.stripeSubscriptionId);
      } catch (error) {
        logger.error('Failed to cancel Asaas subscription', { error });
        res.status(400).json({ error: 'Failed to cancel subscription with payment provider' });
        return;
      }

      // Cancel in database
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
      // Validate Asaas webhook signature
      const asaasToken = req.headers['x-asaas-access-token'] as string;

      if (!asaasService.validateWebhook(asaasToken, req.body)) {
        logger.warn('Invalid Asaas webhook signature');
        res.status(401).json({ error: 'Invalid signature' });
        return;
      }

      // Process webhook event
      const result = await asaasService.processWebhookEvent(req.body);

      switch (result.action) {
        case 'PAYMENT_CONFIRMED':
        case 'SUBSCRIPTION_ACTIVE':
          // Payment confirmed - subscription is active
          logger.info('Payment confirmed', { data: result.data });
          // Could sync subscription status here if needed
          break;

        case 'PAYMENT_FAILED':
          // Payment failed - notify user
          logger.warn('Payment failed', { data: result.data });
          // Could trigger email notification here
          break;

        case 'SUBSCRIPTION_INACTIVE':
          // Subscription cancelled
          logger.info('Subscription cancelled', { data: result.data });
          // Could update database status here
          break;

        default:
          logger.info('Webhook processed', { action: result.action });
      }

      res.status(200).json({ received: true, action: result.action });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Webhook processing failed';
      logger.error('Webhook processing error', { message });
      res.status(400).json({ error: message });
    }
  }
}
