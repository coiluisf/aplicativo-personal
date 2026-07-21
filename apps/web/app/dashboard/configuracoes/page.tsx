'use client';

import { useState } from 'react';
import {
  useWorkspace,
  useUpdateWorkspace,
  useSubscription,
  useChangePlan,
  useCancelSubscription,
} from '@/lib/api/hooks';
import Link from 'next/link';
import { Gear, CreditCard, SignOut, WarningCircle } from '@phosphor-icons/react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api/client';

export default function ConfiguracoesPage() {
  const router = useRouter();
  const [showDangerZone, setShowDangerZone] = useState(false);
  const [editingWorkspace, setEditingWorkspace] = useState(false);
  const [workspaceName, setWorkspaceName] = useState('');

  const { data: workspace } = useWorkspace();
  const { data: subscription } = useSubscription();
  const updateWorkspace = useUpdateWorkspace();
  const changePlan = useChangePlan();
  const cancelSubscription = useCancelSubscription();

  const handleUpdateWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateWorkspace.mutateAsync({
        name: workspaceName,
      });
      setEditingWorkspace(false);
    } catch (error) {
      console.error('Error updating workspace:', error);
    }
  };

  const handleCancelSubscription = async () => {
    if (
      confirm(
        'Tem certeza que deseja cancelar sua assinatura? Você perderá acesso aos recursos premium.'
      )
    ) {
      try {
        await cancelSubscription.mutateAsync(false);
      } catch (error) {
        console.error('Error cancelling subscription:', error);
      }
    }
  };

  const handleLogout = async () => {
    apiClient.clearAccessToken();
    router.push('/auth');
  };

  const getPlanName = (planId?: string) => {
    switch (planId) {
      case 'STARTER':
        return 'Starter';
      case 'PROFESSIONAL':
        return 'Professional';
      case 'ENTERPRISE':
        return 'Enterprise';
      default:
        return 'Nenhum plano ativo';
    }
  };

  const getPlanPrice = (planId?: string) => {
    switch (planId) {
      case 'STARTER':
        return 'R$ 49,00/mês';
      case 'PROFESSIONAL':
        return 'R$ 99,00/mês';
      case 'ENTERPRISE':
        return 'R$ 299,00/mês';
      default:
        return '';
    }
  };

  return (
    <div className="min-h-[100dvh] bg-zinc-50 dark:bg-zinc-950 pb-12">
      {/* Header */}
      <div className="bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Configurações</h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {/* Workspace Settings */}
        <section className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm">
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 mb-6 flex items-center gap-2">
            <Gear size={20} className="text-indigo-600 dark:text-indigo-400" weight="duotone" />
            Configurações da Conta
          </h2>

          {editingWorkspace ? (
            <form onSubmit={handleUpdateWorkspace} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Nome do Workspace
                </label>
                <input
                  type="text"
                  value={workspaceName}
                  onChange={(e) => setWorkspaceName(e.target.value)}
                  className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-indigo-600 dark:focus:ring-indigo-500"
                  required
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={updateWorkspace.isPending}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                >
                  {updateWorkspace.isPending ? 'Salvando...' : 'Salvar'}
                </button>
                <button
                  type="button"
                  onClick={() => setEditingWorkspace(false)}
                  className="px-4 py-2 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-50 rounded-lg font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </form>
          ) : (
            <div>
              <div className="mb-4">
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-1">Workspace</p>
                <p className="text-lg font-medium text-zinc-900 dark:text-zinc-50">
                  {workspace?.name}
                </p>
              </div>
              <button
                onClick={() => {
                  setWorkspaceName(workspace?.name || '');
                  setEditingWorkspace(true);
                }}
                className="px-4 py-2 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-50 rounded-lg font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
              >
                Editar
              </button>
            </div>
          )}
        </section>

        {/* Subscription Settings */}
        <section className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm">
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 mb-6 flex items-center gap-2">
            <CreditCard size={20} className="text-indigo-600 dark:text-indigo-400" weight="duotone" />
            Plano de Assinatura
          </h2>

          <div className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
              <div>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-1">Plano Atual</p>
                <p className="text-lg font-medium text-zinc-900 dark:text-zinc-50">
                  {getPlanName(subscription?.plan)}
                </p>
              </div>
              <div>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-1">Valor Mensal</p>
                <p className="text-lg font-medium text-zinc-900 dark:text-zinc-50">
                  {getPlanPrice(subscription?.plan)}
                </p>
              </div>
              <div>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-1">Status</p>
                <p className="text-lg font-medium text-green-600 dark:text-green-400">
                  {subscription?.status === 'active' ? 'Ativo' : 'Inativo'}
                </p>
              </div>
            </div>

            {subscription?.currentPeriodEnd && (
              <div>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-1">
                  Próxima Cobrança
                </p>
                <p className="text-zinc-900 dark:text-zinc-50">
                  {new Date(subscription.currentPeriodEnd).toLocaleDateString('pt-BR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <Link
                href="/onboard"
                className="px-4 py-2 border border-indigo-600 dark:border-indigo-500 text-indigo-600 dark:text-indigo-400 rounded-lg font-medium hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"
              >
                Mudar Plano
              </Link>
              <button
                onClick={handleCancelSubscription}
                className="px-4 py-2 border border-red-600 dark:border-red-500 text-red-600 dark:text-red-400 rounded-lg font-medium hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              >
                Cancelar Assinatura
              </button>
            </div>
          </div>
        </section>

        {/* Danger Zone */}
        <section className="bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-200 dark:border-red-900 p-6 shadow-sm">
          <h2 className="text-lg font-bold text-red-600 dark:text-red-400 mb-4 flex items-center gap-2">
            <WarningCircle size={20} weight="duotone" />
            Zona de Risco
          </h2>

          <button
            onClick={() => setShowDangerZone(!showDangerZone)}
            className="px-4 py-2 border border-red-300 dark:border-red-800 text-red-600 dark:text-red-400 rounded-lg font-medium hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors"
          >
            {showDangerZone ? 'Ocultar' : 'Mostrar Opções'}
          </button>

          {showDangerZone && (
            <div className="mt-4 space-y-3 pt-4 border-t border-red-200 dark:border-red-900">
              <button
                onClick={handleLogout}
                className="w-full px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
              >
                <SignOut size={18} weight="bold" />
                Fazer Logout
              </button>
              <p className="text-xs text-red-600 dark:text-red-400">
                Você será desconectado de sua conta e redirecionado para a página de login.
              </p>
            </div>
          )}
        </section>

        {/* Help Section */}
        <section className="bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-200 dark:border-blue-900 p-6 shadow-sm">
          <h3 className="text-sm font-bold text-blue-900 dark:text-blue-200 mb-2">Precisa de ajuda?</h3>
          <p className="text-sm text-blue-800 dark:text-blue-300 mb-3">
            Entre em contato com nosso suporte ou confira nossa documentação.
          </p>
          <Link
            href="#"
            className="inline-block px-3 py-2 text-sm font-medium border border-blue-300 dark:border-blue-800 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/20 transition-colors"
          >
            Enviar Email para Suporte
          </Link>
        </section>
      </div>
    </div>
  );
}
