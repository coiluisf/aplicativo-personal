import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
});

export interface CreateSubscriptionParams {
  email: string;
  priceId: string;
  workspaceId: string;
  trialDays?: number;
}

export interface CreatePaymentIntentParams {
  amount: number;
  currency: string;
  description: string;
  metadata: Record<string, string>;
}

export class StripeService {
  async createCustomer(email: string, workspaceId: string) {
    const customer = await stripe.customers.create({
      email,
      metadata: {
        workspaceId,
      },
    });

    return customer;
  }

  async getCustomerByWorkspaceId(workspaceId: string) {
    const customers = await stripe.customers.search({
      query: `metadata['workspaceId']:'${workspaceId}'`,
    });

    return customers.data[0] || null;
  }

  async createSubscription(params: CreateSubscriptionParams) {
    const { email, priceId, workspaceId, trialDays = 0 } = params;

    // Get or create customer
    let customer = await this.getCustomerByWorkspaceId(workspaceId);

    if (!customer) {
      customer = await this.createCustomer(email, workspaceId);
    }

    // Create subscription
    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: priceId }],
      ...(trialDays > 0 && { trial_period_days: trialDays }),
      metadata: {
        workspaceId,
      },
    });

    return subscription;
  }

  async getSubscription(subscriptionId: string) {
    return stripe.subscriptions.retrieve(subscriptionId);
  }

  async updateSubscription(
    subscriptionId: string,
    params: {
      priceId?: string;
      trialDays?: number;
    },
  ) {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);

    if (!subscription.items.data[0]) {
      throw new Error('Subscription has no items');
    }

    const updates: any = {};

    if (params.priceId) {
      updates.items = [
        {
          id: subscription.items.data[0].id,
          price: params.priceId,
        },
      ];
    }

    if (params.trialDays !== undefined) {
      updates.trial_period_days = params.trialDays;
    }

    return stripe.subscriptions.update(subscriptionId, updates);
  }

  async cancelSubscription(subscriptionId: string, immediately = false) {
    return stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: !immediately,
    });
  }

  async createPaymentIntent(params: CreatePaymentIntentParams) {
    const { amount, currency, description, metadata } = params;

    return stripe.paymentIntents.create({
      amount,
      currency,
      description,
      metadata,
    });
  }

  async confirmPaymentIntent(intentId: string, paymentMethodId: string) {
    return stripe.paymentIntents.confirm(intentId, {
      payment_method: paymentMethodId,
    });
  }

  async getInvoices(customerId: string) {
    return stripe.invoices.list({
      customer: customerId,
      limit: 50,
    });
  }

  async createInvoice(customerId: string, subscriptionId: string) {
    return stripe.invoices.create({
      customer: customerId,
      subscription: subscriptionId,
    });
  }

  async refund(chargeId: string, amount?: number) {
    return stripe.refunds.create({
      charge: chargeId,
      ...(amount && { amount }),
    });
  }

  verifyWebhookSignature(body: string, signature: string) {
    try {
      return stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET || '',
      );
    } catch (error) {
      throw new Error('Invalid webhook signature');
    }
  }
}

export const stripeService = new StripeService();
