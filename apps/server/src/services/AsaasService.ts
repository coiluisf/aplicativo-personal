import axios, { AxiosInstance } from 'axios';
import logger from '../utils/logger';

/**
 * Serviço de integração com Asaas
 * Gerencia pagamentos, clientes e assinaturas via API Asaas
 */

interface AsaasCustomer {
  id: string;
  name: string;
  email: string;
  cpfCnpj?: string;
  mobilePhone?: string;
}

interface AsaasSubscription {
  id: string;
  customer: string;
  billingType: 'CREDIT_CARD' | 'BOLETO' | 'PIX';
  cycle: 'MONTHLY' | 'YEARLY';
  value: number;
  status: 'ACTIVE' | 'EXPIRED' | 'SUSPENDED' | 'CANCELLED';
  description: string;
  nextDueDate: string;
}

interface AsaasPayment {
  id: string;
  subscription: string;
  value: number;
  status: 'PENDING' | 'CONFIRMED' | 'RECEIVED' | 'OVERDUE' | 'CANCELLED' | 'REFUNDED';
  dueDate: string;
  confirmationDate?: string;
}

class AsaasServiceClass {
  private api: AxiosInstance;
  private webhookToken: string;

  constructor() {
    const apiKey = process.env.ASAAS_API_KEY;
    const environment = process.env.ASAAS_ENVIRONMENT || 'test';

    if (!apiKey) {
      throw new Error('ASAAS_API_KEY não configurada no .env');
    }

    const baseURL =
      environment === 'production'
        ? 'https://api.asaas.com/v3'
        : 'https://sandbox.asaas.com/v3';

    this.api = axios.create({
      baseURL,
      headers: {
        'access_token': apiKey,
        'Content-Type': 'application/json',
      },
    });

    this.webhookToken = process.env.ASAAS_WEBHOOK_TOKEN || '';

    // Interceptor de erro
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        logger.error('Asaas API Error:', {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message,
        });
        throw error;
      }
    );
  }

  /**
   * Criar cliente no Asaas
   */
  async createCustomer(data: {
    name: string;
    email: string;
    cpfCnpj?: string;
    mobilePhone?: string;
  }): Promise<AsaasCustomer> {
    try {
      const response = await this.api.post('/customers', {
        name: data.name,
        email: data.email,
        cpfCnpj: data.cpfCnpj,
        mobilePhone: data.mobilePhone,
      });

      logger.info('Customer created in Asaas', {
        customerId: response.data.id,
        email: data.email,
      });

      return {
        id: response.data.id,
        name: response.data.name,
        email: response.data.email,
        cpfCnpj: response.data.cpfCnpj,
        mobilePhone: response.data.mobilePhone,
      };
    } catch (error: any) {
      logger.error('Failed to create customer in Asaas', {
        email: data.email,
        error: error.response?.data || error.message,
      });
      throw new Error(`Failed to create Asaas customer: ${error.message}`);
    }
  }

  /**
   * Obter cliente no Asaas
   */
  async getCustomer(customerId: string): Promise<AsaasCustomer | null> {
    try {
      const response = await this.api.get(`/customers/${customerId}`);
      return {
        id: response.data.id,
        name: response.data.name,
        email: response.data.email,
        cpfCnpj: response.data.cpfCnpj,
        mobilePhone: response.data.mobilePhone,
      };
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Criar assinatura (subscription)
   * Será cobrado automaticamente todo mês
   */
  async createSubscription(data: {
    customerId: string;
    value: number;
    billingType?: 'CREDIT_CARD' | 'BOLETO' | 'PIX';
    description: string;
    cycle?: 'MONTHLY' | 'YEARLY';
  }): Promise<AsaasSubscription> {
    try {
      const response = await this.api.post('/subscriptions', {
        customer: data.customerId,
        billingType: data.billingType || 'CREDIT_CARD',
        value: data.value,
        cycle: data.cycle || 'MONTHLY',
        description: data.description,
      });

      logger.info('Subscription created in Asaas', {
        subscriptionId: response.data.id,
        customerId: data.customerId,
        value: data.value,
      });

      return {
        id: response.data.id,
        customer: response.data.customer,
        billingType: response.data.billingType,
        cycle: response.data.cycle,
        value: response.data.value,
        status: response.data.status,
        description: response.data.description,
        nextDueDate: response.data.nextDueDate,
      };
    } catch (error: any) {
      logger.error('Failed to create subscription in Asaas', {
        customerId: data.customerId,
        error: error.response?.data || error.message,
      });
      throw new Error(`Failed to create Asaas subscription: ${error.message}`);
    }
  }

  /**
   * Obter assinatura
   */
  async getSubscription(subscriptionId: string): Promise<AsaasSubscription | null> {
    try {
      const response = await this.api.get(`/subscriptions/${subscriptionId}`);
      return {
        id: response.data.id,
        customer: response.data.customer,
        billingType: response.data.billingType,
        cycle: response.data.cycle,
        value: response.data.value,
        status: response.data.status,
        description: response.data.description,
        nextDueDate: response.data.nextDueDate,
      };
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Atualizar/cancelar assinatura
   */
  async updateSubscription(
    subscriptionId: string,
    data: Partial<{ status: 'ACTIVE' | 'SUSPENDED' | 'CANCELLED'; value: number }>
  ): Promise<AsaasSubscription> {
    try {
      const response = await this.api.put(`/subscriptions/${subscriptionId}`, data);

      logger.info('Subscription updated in Asaas', {
        subscriptionId,
        status: data.status,
      });

      return {
        id: response.data.id,
        customer: response.data.customer,
        billingType: response.data.billingType,
        cycle: response.data.cycle,
        value: response.data.value,
        status: response.data.status,
        description: response.data.description,
        nextDueDate: response.data.nextDueDate,
      };
    } catch (error: any) {
      logger.error('Failed to update subscription in Asaas', {
        subscriptionId,
        error: error.response?.data || error.message,
      });
      throw new Error(`Failed to update Asaas subscription: ${error.message}`);
    }
  }

  /**
   * Cancelar assinatura
   */
  async cancelSubscription(subscriptionId: string): Promise<void> {
    try {
      await this.updateSubscription(subscriptionId, { status: 'CANCELLED' });
      logger.info('Subscription cancelled in Asaas', { subscriptionId });
    } catch (error) {
      logger.error('Failed to cancel subscription in Asaas', { subscriptionId, error });
      throw error;
    }
  }

  /**
   * Obter pagamentos de uma assinatura
   */
  async getPayments(subscriptionId: string): Promise<AsaasPayment[]> {
    try {
      const response = await this.api.get('/payments', {
        params: {
          subscription: subscriptionId,
          limit: 100,
        },
      });

      return response.data.data.map((payment: any) => ({
        id: payment.id,
        subscription: payment.subscription,
        value: payment.value,
        status: payment.status,
        dueDate: payment.dueDate,
        confirmationDate: payment.confirmationDate,
      }));
    } catch (error: any) {
      logger.error('Failed to get payments from Asaas', { subscriptionId, error });
      throw error;
    }
  }

  /**
   * Validar webhook (verificar se veio realmente do Asaas)
   */
  validateWebhook(signature: string, body: any): boolean {
    if (!this.webhookToken) {
      logger.warn('ASAAS_WEBHOOK_TOKEN não configurado');
      return false;
    }

    // Asaas usa X-Asaas-Access-Token header
    // Compare com o token configurado
    const isValid = signature === this.webhookToken;

    if (!isValid) {
      logger.warn('Invalid Asaas webhook signature');
    }

    return isValid;
  }

  /**
   * Processar evento de webhook
   */
  async processWebhookEvent(event: any): Promise<{
    success: boolean;
    action: string;
    data: any;
  }> {
    const { event: eventType, data } = event;

    logger.info('Processing Asaas webhook event', { eventType });

    switch (eventType) {
      case 'payment_confirmed':
      case 'payment.confirmed':
        return {
          success: true,
          action: 'PAYMENT_CONFIRMED',
          data: {
            paymentId: data.id,
            subscriptionId: data.subscription,
            value: data.value,
            status: 'CONFIRMED',
          },
        };

      case 'payment_created':
      case 'payment.created':
        return {
          success: true,
          action: 'PAYMENT_CREATED',
          data: {
            paymentId: data.id,
            subscriptionId: data.subscription,
            value: data.value,
            dueDate: data.dueDate,
            status: 'PENDING',
          },
        };

      case 'payment_failed':
      case 'payment.failed':
        return {
          success: true,
          action: 'PAYMENT_FAILED',
          data: {
            paymentId: data.id,
            subscriptionId: data.subscription,
            value: data.value,
            reason: data.description,
          },
        };

      case 'subscription_active':
      case 'subscription.active':
        return {
          success: true,
          action: 'SUBSCRIPTION_ACTIVE',
          data: {
            subscriptionId: data.id,
            customerId: data.customer,
            status: 'ACTIVE',
          },
        };

      case 'subscription_inactive':
      case 'subscription.inactive':
        return {
          success: true,
          action: 'SUBSCRIPTION_INACTIVE',
          data: {
            subscriptionId: data.id,
            customerId: data.customer,
            status: 'INACTIVE',
          },
        };

      default:
        logger.warn('Unknown webhook event type', { eventType });
        return {
          success: true,
          action: 'UNKNOWN',
          data,
        };
    }
  }
}

export const asaasService = new AsaasServiceClass();
