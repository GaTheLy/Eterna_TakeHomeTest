import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import { ArrowLeft, Plus, Edit2, Trash2 } from 'lucide-react';
import classNames from 'classnames';
import TaskFormModal from '../components/TaskFormModal';
import TaskFilters from '../components/TaskFilters';
import { StatusBadge, Button, LoadingSpinner } from '../components/ui';

interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  status: 'TODO' | 'IN_PROGRESS' | 'DONE';
  scheduledStart: string;
  scheduledEnd: string;
  assignee: {
    id: string;
    name: string;
  };
}

interface Project {
  id: string;
  name: string;
  description: string;
  status: 'ACTIVE' | 'ARCHIVED';
}

export default function ProjectDetails() {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [filters, setFilters] = useState({
    status: undefined,
    priority: undefined,
    sortBy: 'scheduledStart',
    sortOrder: 'ASC'
  });

  const fetchProjectAndTasks = useCallback(async () => {
    try {
      setLoading(true);
      const [projectRes, tasksRes] = await Promise.all([
        api.get(`/projects/${id}`),
        api.get(`/projects/${id}/tasks`, { params: filters })
      ]);
      setProject(projectRes.data);
      setTasks(tasksRes.data);
    } catch (error) {
      console.error('Failed to fetch project details', error);
    } finally {
      setLoading(false);
    }
  }, [id, filters]);

  useEffect(() => {
    fetchProjectAndTasks();
  }, [fetchProjectAndTasks]);

  const handleDeleteTask = async (taskId: string) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      await api.delete(`/tasks/${taskId}`);
      fetchProjectAndTasks();
    } catch (error) {
      console.error('Failed to delete task', error);
    }
  };

  if (loading && !project) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900">Project not found</h2>
        <Link to="/" className="mt-4 inline-flex items-center text-indigo-600 hover:text-indigo-500">
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to Projects
        </Link>
      </div>
    );
  }

  const stats = {
    total: tasks.length,
    todo: tasks.filter(t => t.status === 'TODO').length,
    inProgress: tasks.filter(t => t.status === 'IN_PROGRESS').length,
    done: tasks.filter(t => t.status === 'DONE').length,
  };

  return (
    <div>
      <div className="mb-6">
        <Link to="/" className="inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-500">
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to Projects
        </Link>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-8 border border-gray-200">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
          <div>
            <h3 className="text-xl leading-6 font-bold text-gray-900">{project.name}</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">{project.description}</p>
          </div>
          <StatusBadge status={project.status} type="project" />
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-4 mb-8">
        <div className="bg-white overflow-hidden shadow rounded-lg p-5 border border-gray-200">
          <dt className="text-sm font-medium text-gray-500 truncate text-center">Total Tasks</dt>
          <dd className="mt-1 text-3xl font-bold text-indigo-600 text-center">{stats.total}</dd>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg p-5 border border-gray-200 border-t-4 border-t-gray-400">
          <dt className="text-sm font-medium text-gray-500 truncate text-center">To Do</dt>
          <dd className="mt-1 text-3xl font-bold text-gray-900 text-center">{stats.todo}</dd>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg p-5 border border-gray-200 border-t-4 border-t-blue-500">
          <dt className="text-sm font-medium text-gray-500 truncate text-center">In Progress</dt>
          <dd className="mt-1 text-3xl font-bold text-blue-600 text-center">{stats.inProgress}</dd>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg p-5 border border-gray-200 border-t-4 border-t-green-500">
          <dt className="text-sm font-medium text-gray-500 truncate text-center">Done</dt>
          <dd className="mt-1 text-3xl font-bold text-green-600 text-center">{stats.done}</dd>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
        <h2 className="text-xl font-semibold text-gray-900">Tasks Management</h2>
        <Button
          onClick={() => { setEditingTask(null); setIsModalOpen(true); }}
          icon={Plus}
        >
          Create Task
        </Button>
      </div>

      <TaskFilters filters={filters} onFilterChange={(newFilters) => setFilters(prev => ({ ...prev, ...newFilters }))} />

      <div className="flex flex-col">
        <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
            <div className="shadow overflow-hidden border border-gray-200 sm:rounded-lg bg-white">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assignee</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Schedule</th>
                    <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {tasks.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-10 whitespace-nowrap text-sm text-gray-500 text-center">
                        {loading ? <LoadingSpinner size="sm" /> : 'No tasks found matching current filters.'}
                      </td>
                    </tr>
                  ) : (
                    tasks.map((task) => (
                      <tr key={task.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <StatusBadge status={task.status} type="task" />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{task.title}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{task.assignee?.name || 'Unassigned'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <StatusBadge status={task.priority} type="priority" />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(task.scheduledStart).toLocaleDateString()} - {new Date(task.scheduledEnd).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end gap-2">
                            <Button 
                              variant="secondary" 
                              size="sm"
                              onClick={() => { setEditingTask(task); setIsModalOpen(true); }}
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </Button>
                            <Button 
                              variant="danger" 
                              size="sm"
                              onClick={() => handleDeleteTask(task.id)}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      
      <TaskFormModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingTask(null); }}
        onSuccess={() => {
          setIsModalOpen(false);
          setEditingTask(null);
          fetchProjectAndTasks();
        }}
        projectId={id!}
        task={editingTask}
      />
    </div>
  );
}
