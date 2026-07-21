'use client';

import { useState } from 'react';
import {
  useStudents,
  useCreateStudent,
  useDeleteStudent,
  useUpdateStudent,
  useSearchStudents,
} from '@/lib/api/hooks';
import { User, Plus, Trash2, MagnifyingGlass, X } from '@phosphor-icons/react';

export default function AlunosPage() {
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
  });

  const { data: studentsData } = useStudents({ limit: 50 });
  const { data: searchData } = useSearchStudents(searchQuery);
  const createStudent = useCreateStudent();
  const deleteStudent = useDeleteStudent();
  const updateStudent = useUpdateStudent();

  const students = searchQuery ? searchData?.students : studentsData?.students || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateStudent.mutateAsync({
          id: editingId,
          data: {
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
          },
        });
        setEditingId(null);
      } else {
        await createStudent.mutateAsync({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
        });
      }
      setFormData({ name: '', email: '', phone: '' });
      setShowForm(false);
    } catch (error) {
      console.error('Error saving student:', error);
    }
  };

  const handleEdit = (student: any) => {
    setFormData({
      name: student.name,
      email: student.email,
      phone: student.phone || '',
    });
    setEditingId(student.id);
    setShowForm(true);
  };

  const handleDelete = async (studentId: string) => {
    if (confirm('Tem certeza que deseja deletar este aluno?')) {
      try {
        await deleteStudent.mutateAsync(studentId);
      } catch (error) {
        console.error('Error deleting student:', error);
      }
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({ name: '', email: '', phone: '' });
  };

  return (
    <div className="min-h-[100dvh] bg-zinc-50 dark:bg-zinc-950 pb-12">
      {/* Header */}
      <div className="bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Alunos</h1>
          <button
            onClick={() => {
              setEditingId(null);
              setFormData({ name: '', email: '', phone: '' });
              setShowForm(!showForm);
            }}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium text-sm hover:bg-indigo-700 transition-colors flex items-center gap-2"
          >
            <Plus weight="bold" size={18} />
            Novo aluno
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* New/Edit Student Form */}
        {showForm && (
          <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-6 mb-8 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
                {editingId ? 'Editar aluno' : 'Adicionar novo aluno'}
              </h2>
              <button
                onClick={handleCancel}
                className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
              >
                <X size={20} className="text-zinc-600 dark:text-zinc-400" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Nome
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="João Silva"
                  className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 placeholder-zinc-500 dark:placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 dark:focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="joao@email.com"
                  className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 placeholder-zinc-500 dark:placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 dark:focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Telefone (opcional)
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="(11) 98765-4321"
                  className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 placeholder-zinc-500 dark:placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 dark:focus:ring-indigo-500"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={createStudent.isPending || updateStudent.isPending}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                >
                  {createStudent.isPending || updateStudent.isPending
                    ? 'Salvando...'
                    : editingId
                      ? 'Atualizar aluno'
                      : 'Adicionar aluno'}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-4 py-2 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-50 rounded-lg font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Search Bar */}
        <div className="mb-6 relative">
          <MagnifyingGlass
            size={20}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-600"
            weight="bold"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar aluno por nome ou email..."
            className="w-full pl-10 pr-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 placeholder-zinc-500 dark:placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 dark:focus:ring-indigo-500"
          />
        </div>

        {/* Students List */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {students && students.length > 0 ? (
            students.map((student) => (
              <div
                key={student.id}
                className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-4 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center flex-shrink-0">
                    <User size={20} className="text-indigo-600 dark:text-indigo-400" weight="duotone" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-zinc-900 dark:text-zinc-50 truncate">
                      {student.name}
                    </h3>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400 truncate">
                      {student.email}
                    </p>
                  </div>
                </div>

                {student.phone && (
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-4">{student.phone}</p>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(student)}
                    className="flex-1 px-3 py-2 text-xs font-medium border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-50 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(student.id)}
                    disabled={deleteStudent.isPending}
                    className="px-3 py-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50"
                  >
                    <Trash2
                      size={16}
                      className="text-red-600 dark:text-red-400"
                      weight="duotone"
                    />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <User
                size={40}
                className="text-zinc-300 dark:text-zinc-700 mx-auto mb-4"
                weight="thin"
              />
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                {searchQuery ? 'Nenhum aluno encontrado' : 'Nenhum aluno registrado'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
