import { Request, Response, NextFunction } from 'express';
import { asaasService } from '../services/AsaasService';
import logger from '../utils/logger';

/**
 * Middleware para validar webhooks do Asaas
 * Verifica a autenticidade do webhook antes de processar
 */
export const validateAsaasWebhook = (req: Request, res: Response, next: NextFunction) => {
  try {
    const signature = req.headers['x-asaas-access-token'] as string;

    if (!signature) {
      logger.warn('Asaas webhook missing signature header');
      res.status(401).json({ error: 'Missing webhook signature' });
      return;
    }

    // Validate signature
    if (!asaasService.validateWebhook(signature, req.body)) {
      logger.warn('Asaas webhook invalid signature');
      res.status(401).json({ error: 'Invalid webhook signature' });
      return;
    }

    next();
  } catch (error) {
    logger.error('Asaas webhook validation error', { error });
    res.status(400).json({ error: 'Webhook validation failed' });
  }
};
