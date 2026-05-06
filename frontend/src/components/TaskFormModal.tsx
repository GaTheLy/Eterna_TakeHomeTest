import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { X } from 'lucide-react';
import api from '../api/axios';

const schema = yup.object({
  title: yup.string().required('Title is required'),
  description: yup.string().default(''),
  priority: yup.string().oneOf(['LOW', 'MEDIUM', 'HIGH']).default('MEDIUM'),
  assigneeId: yup.string().required('Assignee is required'),
  scheduledStart: yup.string().required('Start date is required'),
  scheduledEnd: yup.string().required('End date is required'),
}).required();

type FormData = yup.InferType<typeof schema>;

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  projectId: string;
}

export default function TaskFormModal({ isOpen, onClose, onSuccess, projectId }: Props) {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: yupResolver(schema)
  });
  const [error, setError] = useState('');
  const [users, setUsers] = useState<Array<{id: string, name: string}>>([]);

  useEffect(() => {
    if (isOpen) {
      // Fetch users for assignee dropdown
      api.get('/users').then(res => setUsers(res.data)).catch(console.error);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const onSubmit = async (data: FormData) => {
    try {
      setError('');
      // Make sure date is in ISO 8601 format
      const payload = {
        ...data,
        scheduledStart: new Date(data.scheduledStart).toISOString(),
        scheduledEnd: new Date(data.scheduledEnd).toISOString(),
      };
      
      await api.post(`/projects/${projectId}/tasks`, payload);
      reset();
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create task');
    }
  };

  return (
    <div className="fixed inset-0 z-10 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={onClose}></div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
          <div className="absolute top-0 right-0 pt-4 pr-4">
            <button type="button" className="bg-white rounded-md text-gray-400 hover:text-gray-500" onClick={onClose}>
              <span className="sr-only">Close</span>
              <X className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>
          <div className="sm:flex sm:items-start w-full">
            <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
              <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">Create New Task</h3>
              <div className="mt-4">
                <form id="task-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Title</label>
                    <input type="text" {...register('title')} className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3 sm:text-sm" />
                    {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea {...register('description')} rows={3} className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3 sm:text-sm" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Priority</label>
                      <select {...register('priority')} className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3 sm:text-sm">
                        <option value="LOW">Low</option>
                        <option value="MEDIUM">Medium</option>
                        <option value="HIGH">High</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Assignee</label>
                      <select {...register('assigneeId')} className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3 sm:text-sm">
                        <option value="">Select Assignee</option>
                        {users.map(user => (
                          <option key={user.id} value={user.id}>{user.name}</option>
                        ))}
                      </select>
                      {errors.assigneeId && <p className="mt-1 text-sm text-red-600">{errors.assigneeId.message}</p>}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Start Date</label>
                      <input type="datetime-local" {...register('scheduledStart')} className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3 sm:text-sm" />
                      {errors.scheduledStart && <p className="mt-1 text-sm text-red-600">{errors.scheduledStart.message}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">End Date</label>
                      <input type="datetime-local" {...register('scheduledEnd')} className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3 sm:text-sm" />
                      {errors.scheduledEnd && <p className="mt-1 text-sm text-red-600">{errors.scheduledEnd.message}</p>}
                    </div>
                  </div>
                  {error && <p className="text-sm text-red-600">{error}</p>}
                </form>
              </div>
            </div>
          </div>
          <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
            <button type="submit" form="task-form" disabled={isSubmitting} className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm">
              {isSubmitting ? 'Saving...' : 'Save Task'}
            </button>
            <button type="button" className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm" onClick={onClose}>
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
