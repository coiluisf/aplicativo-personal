'use client';

import { useState } from 'react';
import { useCreateSubscription } from '@/lib/api/hooks';
import { PLANS } from '@/lib/stripe/client';
import { useRouter } from 'next/navigation';
import { Check } from '@phosphor-icons/react';

export default function OnboardPage() {
  const [selectedPlan, setSelectedPlan] = useState<'STARTER' | 'PROFESSIONAL' | 'ENTERPRISE' | null>(null);
  const createSubscription = useCreateSubscription();
  const router = useRouter();

  const handleSelectPlan = async (plan: 'STARTER' | 'PROFESSIONAL' | 'ENTERPRISE') => {
    setSelectedPlan(plan);
    try {
      await createSubscription.mutateAsync({ plan, trialDays: 7 });
      router.push('/dashboard');
    } catch (error) {
      console.error('Error creating subscription:', error);
    }
  };

  const planConfig = {
    STARTER: { ...PLANS.STARTER, id: 'STARTER' as const },
    PROFESSIONAL: { ...PLANS.PROFESSIONAL, id: 'PROFESSIONAL' as const },
    ENTERPRISE: { ...PLANS.ENTERPRISE, id: 'ENTERPRISE' as const },
  };

  return (
    <div className="min-h-[100dvh] bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-950 dark:to-zinc-900 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 mb-3">
            Escolha seu plano
          </h1>
          <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-[50ch] mx-auto">
            Comece com 7 dias grátis. Sem cartão de crédito necessário.
          </p>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {(['STARTER', 'PROFESSIONAL', 'ENTERPRISE'] as const).map((planKey) => {
            const plan = planConfig[planKey];
            const isPopular = planKey === 'PROFESSIONAL';

            return (
              <div
                key={planKey}
                className={`relative rounded-xl border transition-all duration-300 ${
                  isPopular
                    ? 'border-indigo-600 dark:border-indigo-500 bg-white dark:bg-zinc-900 ring-1 ring-indigo-600/20 dark:ring-indigo-500/20 shadow-lg'
                    : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm hover:shadow-md hover:border-zinc-300 dark:hover:border-zinc-700'
                }`}
              >
                {/* Popular Badge */}
                {isPopular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="inline-block bg-indigo-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
                      Mais popular
                    </span>
                  </div>
                )}

                <div className="p-6 sm:p-8">
                  {/* Plan Header */}
                  <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">
                    {plan.name}
                  </h3>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-6">
                    {plan.description}
                  </p>

                  {/* Price */}
                  <div className="mb-6">
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-bold text-zinc-900 dark:text-zinc-50">
                        R$ {(plan.price / 100).toFixed(2)}
                      </span>
                      <span className="text-zinc-600 dark:text-zinc-400">/mês</span>
                    </div>
                    <p className="text-xs text-zinc-500 dark:text-zinc-500 mt-2">
                      7 dias grátis após o período de teste
                    </p>
                  </div>

                  {/* CTA Button */}
                  <button
                    onClick={() => handleSelectPlan(planKey)}
                    disabled={createSubscription.isPending}
                    className={`w-full py-2.5 px-4 rounded-lg font-medium transition-colors mb-6 ${
                      isPopular
                        ? 'bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50'
                        : 'border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-50 hover:bg-zinc-50 dark:hover:bg-zinc-800 disabled:opacity-50'
                    }`}
                  >
                    {createSubscription.isPending && selectedPlan === planKey
                      ? 'Processando...'
                      : 'Começar com este plano'}
                  </button>

                  {/* Features List */}
                  <div className="space-y-3">
                    {plan.features.map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <Check
                          weight="bold"
                          className="text-indigo-600 dark:text-indigo-400 mt-0.5 flex-shrink-0"
                          size={18}
                        />
                        <span className="text-sm text-zinc-700 dark:text-zinc-300">
                          {feature}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* FAQ or Additional Info */}
        <div className="mt-16 max-w-2xl mx-auto text-center">
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Todos os planos incluem suporte por email. Você pode cancelar a qualquer momento.
          </p>
        </div>
      </div>
    </div>
  );
}
