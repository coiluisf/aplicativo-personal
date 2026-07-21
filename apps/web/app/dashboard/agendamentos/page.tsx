'use client';

import { useState } from 'react';
import { useSessions, useStudents, useCancelSession, useCreateSession } from '@/lib/api/hooks';
import Link from 'next/link';
import { Calendar, Clock, User, X, Plus, Trash2 } from '@phosphor-icons/react';

export default function AgendamentosPage() {
  const [showForm, setShowForm] = useState(false);
  const [filterStatus, setFilterStatus] = useState<'all' | 'upcoming' | 'completed' | 'cancelled'>('all');
  const [formData, setFormData] = useState({
    studentId: '',
    startTime: '',
    endTime: '',
    notes: '',
  });

  const { data: sessionsData } = useSessions(undefined, {
    status: filterStatus === 'all' ? undefined : filterStatus,
  });
  const { data: studentsData } = useStudents({ limit: 100 });
  const cancelSession = useCancelSession();
  const createSession = useCreateSession();

  const sessions = sessionsData?.sessions || [];
  const students = studentsData?.students || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createSession.mutateAsync({
        studentId: formData.studentId,
        startTime: formData.startTime,
        endTime: formData.endTime,
        notes: formData.notes || undefined,
      });
      setFormData({
        studentId: '',
        startTime: '',
        endTime: '',
        notes: '',
      });
      setShowForm(false);
    } catch (error) {
      console.error('Error creating session:', error);
    }
  };

  const handleCancel = async (sessionId: string) => {
    if (confirm('Tem certeza que deseja cancelar esta sessão?')) {
      try {
        await cancelSession.mutateAsync(sessionId);
      } catch (error) {
        console.error('Error cancelling session:', error);
      }
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'upcoming':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300';
      case 'completed':
        return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300';
      case 'cancelled':
        return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300';
      default:
        return 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300';
    }
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-[100dvh] bg-zinc-50 dark:bg-zinc-950 pb-12">
      {/* Header */}
      <div className="bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Agendamentos</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium text-sm hover:bg-indigo-700 transition-colors flex items-center gap-2"
          >
            <Plus weight="bold" size={18} />
            Novo agendamento
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* New Session Form */}
        {showForm && (
          <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-6 mb-8 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
                Criar novo agendamento
              </h2>
              <button
                onClick={() => setShowForm(false)}
                className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
              >
                <X size={20} className="text-zinc-600 dark:text-zinc-400" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                    Aluno
                  </label>
                  <select
                    value={formData.studentId}
                    onChange={(e) =>
                      setFormData({ ...formData, studentId: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-indigo-600 dark:focus:ring-indigo-500"
                    required
                  >
                    <option value="">Selecione um aluno</option>
                    {students.map((student) => (
                      <option key={student.id} value={student.id}>
                        {student.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                    Data e hora de início
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.startTime}
                    onChange={(e) =>
                      setFormData({ ...formData, startTime: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-indigo-600 dark:focus:ring-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                    Data e hora de término
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.endTime}
                    onChange={(e) =>
                      setFormData({ ...formData, endTime: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-indigo-600 dark:focus:ring-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                    Notas (opcional)
                  </label>
                  <input
                    type="text"
                    value={formData.notes}
                    onChange={(e) =>
                      setFormData({ ...formData, notes: e.target.value })
                    }
                    placeholder="Ex: Treino de perna"
                    className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 placeholder-zinc-500 dark:placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 dark:focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={createSession.isPending}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                >
                  {createSession.isPending ? 'Criando...' : 'Criar agendamento'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-50 rounded-lg font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6 border-b border-zinc-200 dark:border-zinc-800">
          {(['all', 'upcoming', 'completed', 'cancelled'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                filterStatus === status
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              {status === 'all'
                ? 'Todos'
                : status === 'upcoming'
                  ? 'Próximos'
                  : status === 'completed'
                    ? 'Concluídos'
                    : 'Cancelados'}
            </button>
          ))}
        </div>

        {/* Sessions List */}
        <div className="space-y-3">
          {sessions.length > 0 ? (
            sessions.map((session) => (
              <div
                key={session.id}
                className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-4 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <User size={18} className="text-indigo-600 dark:text-indigo-400" weight="duotone" />
                      <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                        {session.student?.name}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 mb-1">
                      <Calendar
                        size={16}
                        className="text-zinc-400 dark:text-zinc-600"
                        weight="duotone"
                      />
                      <p className="text-xs text-zinc-600 dark:text-zinc-400">
                        {formatDateTime(session.startTime)}
                      </p>
                    </div>
                    {session.notes && (
                      <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">
                        {session.notes}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`text-xs font-medium px-2 py-1 rounded ${getStatusBadgeColor(session.status)}`}
                    >
                      {session.status === 'upcoming'
                        ? 'Próximo'
                        : session.status === 'completed'
                          ? 'Concluído'
                          : 'Cancelado'}
                    </span>
                    {session.status === 'upcoming' && (
                      <button
                        onClick={() => handleCancel(session.id)}
                        disabled={cancelSession.isPending}
                        className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50"
                      >
                        <Trash2
                          size={18}
                          className="text-red-600 dark:text-red-400"
                          weight="duotone"
                        />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <Calendar
                size={40}
                className="text-zinc-300 dark:text-zinc-700 mx-auto mb-4"
                weight="thin"
              />
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Nenhum agendamento encontrado
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
