'use client';

import { useWorkspaceStats, useUpcomingSessions } from '@/lib/api/hooks';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Calendar, Users, BookOpen, TrendingUp } from '@phosphor-icons/react';
import Link from 'next/link';

// Mock data for chart
const chartData = [
  { name: 'Seg', sessions: 4 },
  { name: 'Ter', sessions: 3 },
  { name: 'Qua', sessions: 5 },
  { name: 'Qui', sessions: 2 },
  { name: 'Sex', sessions: 6 },
  { name: 'Sáb', sessions: 2 },
];

export default function DashboardPage() {
  const { data: statsData, isLoading: isStatsLoading } = useWorkspaceStats();
  const { data: sessions } = useUpcomingSessions(7);

  if (isStatsLoading) {
    return <div>Carregando...</div>;
  }

  const stats = statsData?.stats;

  const StatCard = ({
    icon: Icon,
    label,
    value,
    trend,
  }: {
    icon: React.ComponentType<any>;
    label: string;
    value: number | string;
    trend?: string;
  }) => (
    <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-zinc-600 dark:text-zinc-400">{label}</h3>
        <Icon className="text-indigo-600 dark:text-indigo-400" weight="duotone" size={20} />
      </div>
      <p className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">{value}</p>
      {trend && <p className="text-xs text-zinc-500 dark:text-zinc-500 mt-2">{trend}</p>}
    </div>
  );

  return (
    <div className="min-h-[100dvh] bg-zinc-50 dark:bg-zinc-950 pb-12">
      {/* Header */}
      <div className="bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Dashboard</h1>
          <Link
            href="/dashboard/agendamentos"
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium text-sm hover:bg-indigo-700 transition-colors"
          >
            Novo agendamento
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={Users}
            label="Alunos ativos"
            value={stats?.activeStudents || 0}
            trend="Este mês"
          />
          <StatCard
            icon={BookOpen}
            label="Sessões agendadas"
            value={stats?.upcomingSessions || 0}
            trend="Próximos 7 dias"
          />
          <StatCard
            icon={TrendingUp}
            label="Receita"
            value={stats?.totalRevenue ? `R$ ${(stats.totalRevenue / 100).toFixed(2)}` : 'R$ 0,00'}
            trend="Este período"
          />
          <StatCard
            icon={Calendar}
            label="Assinaturas ativas"
            value={stats?.activeSubscriptions || 0}
            trend="Clientes pagantes"
          />
        </div>

        {/* Charts and Sessions Row */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Chart */}
          <div className="lg:col-span-2 bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm">
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 mb-6">
              Sessões esta semana
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
                <XAxis dataKey="name" stroke="#71717a" />
                <YAxis stroke="#71717a" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#27272a',
                    border: '1px solid #3f3f46',
                    borderRadius: '8px',
                  }}
                />
                <Bar dataKey="sessions" fill="#4f46e5" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Upcoming Sessions */}
          <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm">
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 mb-4">
              Próximas sessões
            </h2>
            <div className="space-y-3">
              {sessions && sessions.length > 0 ? (
                sessions.slice(0, 5).map((session) => (
                  <div
                    key={session.id}
                    className="p-3 bg-zinc-50 dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700"
                  >
                    <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                      {session.student?.name}
                    </p>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">
                      {new Date(session.startTime).toLocaleDateString('pt-BR', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-zinc-600 dark:text-zinc-400">Nenhuma sessão agendada</p>
              )}
            </div>
            <Link
              href="/dashboard/agendamentos"
              className="mt-4 w-full py-2 px-3 border border-zinc-300 dark:border-zinc-700 rounded-lg text-center text-sm font-medium text-zinc-900 dark:text-zinc-50 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
            >
              Ver todas as sessões
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
