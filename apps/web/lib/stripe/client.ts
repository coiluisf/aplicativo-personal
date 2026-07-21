import { loadStripe, Stripe } from '@stripe/stripe-js';

let stripePromise: Promise<Stripe | null>;

export const getStripe = async () => {
  if (!stripePromise) {
    stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY || '');
  }
  return stripePromise;
};

export const PLANS = {
  STARTER: {
    name: 'Starter',
    price: 4900, // R$ 49.00
    description: 'Até 50 alunos',
    features: [
      'Até 50 alunos',
      'Até 500 sessões/mês',
      'Dashboard básico',
      'Suporte por email',
    ],
  },
  PROFESSIONAL: {
    name: 'Profissional',
    price: 9900, // R$ 99.00
    description: 'Até 200 alunos',
    features: [
      'Até 200 alunos',
      'Até 2.000 sessões/mês',
      'Dashboard avançado',
      'Relatórios detalhados',
      'Suporte prioritário',
    ],
  },
  ENTERPRISE: {
    name: 'Enterprise',
    price: 29900, // R$ 299.00
    description: 'Ilimitado',
    features: [
      'Alunos ilimitados',
      'Sessões ilimitadas',
      'API completa',
      'Integrações customizadas',
      'Suporte dedicado',
    ],
  },
};
