import { PrismaClient, PricingPlan, SubscriptionStatus } from '@prisma/client';
import { stripeService } from './StripeService';

export interface CreateSubscriptionParams {
  workspaceId: string;
  plan: PricingPlan;
  stripeSubscriptionId: string;
  stripeCustomerId: string;
  trialEndsAt?: Date;
}

export interface UpdateSubscriptionParams {
  plan?: PricingPlan;
  status?: SubscriptionStatus;
  currentPeriodStart?: Date;
  currentPeriodEnd?: Date;
}

export class SubscriptionService {
  private prisma: PrismaClient;
  private pricingPlans = {
    STARTER: {
      priceId: process.env.STRIPE_PRICE_STARTER,
      maxStudents: 50,
      maxSessions: 500,
      price: 4900, // R$ 49.00 em centavos
    },
    PROFESSIONAL: {
      priceId: process.env.STRIPE_PRICE_PROFESSIONAL,
      maxStudents: 200,
      maxSessions: 2000,
      price: 9900, // R$ 99.00
    },
    ENTERPRISE: {
      priceId: process.env.STRIPE_PRICE_ENTERPRISE,
      maxStudents: -1, // unlimited
      maxSessions: -1, // unlimited
      price: 29900, // R$ 299.00
    },
  };

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async createSubscription(params: CreateSubscriptionParams) {
    const { workspaceId, plan, stripeSubscriptionId, stripeCustomerId, trialEndsAt } = params;

    const subscription = await this.prisma.subscription.create({
      data: {
        workspaceId,
        plan,
        status: 'ACTIVE',
        stripeSubscriptionId,
        stripeCustomerId,
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        trialEndsAt: trialEndsAt || null,
      },
    });

    // Update workspace status
    await this.prisma.workspace.update({
      where: { id: workspaceId },
      data: { status: 'ACTIVE' },
    });

    return subscription;
  }

  async getSubscription(workspaceId: string) {
    return this.prisma.subscription.findFirst({
      where: { workspaceId },
    });
  }

  async getSubscriptionById(subscriptionId: string) {
    return this.prisma.subscription.findUnique({
      where: { id: subscriptionId },
    });
  }

  async updateSubscription(subscriptionId: string, params: UpdateSubscriptionParams) {
    return this.prisma.subscription.update({
      where: { id: subscriptionId },
      data: params,
    });
  }

  async changePlan(workspaceId: string, newPlan: PricingPlan) {
    const subscription = await this.getSubscription(workspaceId);

    if (!subscription) {
      throw new Error('Subscription not found');
    }

    const planConfig = this.pricingPlans[newPlan];
    if (!planConfig || !planConfig.priceId) {
      throw new Error('Invalid plan or Stripe price ID not configured');
    }

    // Update Stripe subscription
    await stripeService.updateSubscription(subscription.stripeSubscriptionId, {
      priceId: planConfig.priceId,
    });

    // Update database
    return this.updateSubscription(subscription.id, { plan: newPlan });
  }

  async cancelSubscription(workspaceId: string, immediately = false) {
    const subscription = await this.getSubscription(workspaceId);

    if (!subscription) {
      throw new Error('Subscription not found');
    }

    // Cancel in Stripe
    await stripeService.cancelSubscription(subscription.stripeSubscriptionId, immediately);

    // Update database
    return this.updateSubscription(subscription.id, {
      status: immediately ? 'CANCELED' : 'ACTIVE', // Will be canceled at period end
    });
  }

  async syncFromStripe(stripeSubscriptionId: string) {
    const stripeSubscription = await stripeService.getSubscription(stripeSubscriptionId);

    const subscription = await this.prisma.subscription.findFirst({
      where: { stripeSubscriptionId },
    });

    if (!subscription) {
      throw new Error('Subscription not found in database');
    }

    const statusMap: Record<string, SubscriptionStatus> = {
      active: 'ACTIVE',
      past_due: 'PAST_DUE',
      canceled: 'CANCELED',
      unpaid: 'PAST_DUE',
    };

    return this.updateSubscription(subscription.id, {
      status: statusMap[stripeSubscription.status] || 'ACTIVE',
      currentPeriodStart: new Date(stripeSubscription.current_period_start * 1000),
      currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
    });
  }

  async createPayment(
    workspaceId: string,
    amount: number,
    description: string,
  ) {
    const subscription = await this.getSubscription(workspaceId);

    if (!subscription) {
      throw new Error('Subscription not found');
    }

    const paymentIntent = await stripeService.createPaymentIntent({
      amount,
      currency: 'brl',
      description,
      metadata: {
        workspaceId,
        subscriptionId: subscription.id,
      },
    });

    // Save payment in database
    const payment = await this.prisma.payment.create({
      data: {
        workspaceId,
        amount,
        status: 'PENDING',
        stripePaymentIntentId: paymentIntent.id,
        metadata: paymentIntent.metadata || {},
      },
    });

    return {
      payment,
      clientSecret: paymentIntent.client_secret,
    };
  }

  async confirmPayment(paymentId: string, paymentMethodId: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
    });

    if (!payment) {
      throw new Error('Payment not found');
    }

    const confirmed = await stripeService.confirmPaymentIntent(
      payment.stripePaymentIntentId,
      paymentMethodId,
    );

    if (confirmed.status === 'succeeded') {
      await this.prisma.payment.update({
        where: { id: paymentId },
        data: { status: 'SUCCEEDED' },
      });
    }

    return confirmed;
  }

  async getPlanLimits(plan: PricingPlan) {
    return this.pricingPlans[plan] || null;
  }

  async getSubscriptionWithLimits(workspaceId: string) {
    const subscription = await this.getSubscription(workspaceId);

    if (!subscription) {
      return null;
    }

    const limits = await this.getPlanLimits(subscription.plan);

    return {
      subscription,
      limits,
    };
  }
}
