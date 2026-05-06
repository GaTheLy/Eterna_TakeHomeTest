import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import api from '../api/axios';
import { Modal, Input, Select, Button, ErrorMessage } from './ui';

const schema = yup.object({
  title: yup.string().required('Title is required'),
  description: yup.string().default(''),
  priority: yup.string().oneOf(['LOW', 'MEDIUM', 'HIGH']).default('MEDIUM'),
  status: yup.string().oneOf(['TODO', 'IN_PROGRESS', 'DONE']).default('TODO'),
  assigneeId: yup.string().required('Assignee is required'),
  scheduledStart: yup.string().required('Start date is required'),
  scheduledEnd: yup.string().required('End date is required'),
}).required();

type FormData = yup.InferType<typeof schema>;

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

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  projectId: string;
  task?: Task | null;
}

export default function TaskFormModal({ isOpen, onClose, onSuccess, projectId, task }: Props) {
  const { register, handleSubmit, reset, setValue, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: yupResolver(schema)
  });
  const [error, setError] = useState('');
  const [users, setUsers] = useState<Array<{id: string, name: string}>>([]);

  useEffect(() => {
    if (isOpen) {
      // Fetch users for assignee dropdown
      api.get('/users').then(res => setUsers(res.data)).catch(console.error);
      
      if (task) {
        setValue('title', task.title);
        setValue('description', task.description);
        setValue('priority', task.priority);
        setValue('status', task.status);
        setValue('assigneeId', task.assignee.id);
        // Format ISO string to datetime-local format: YYYY-MM-DDThh:mm
        const start = new Date(task.scheduledStart);
        const end = new Date(task.scheduledEnd);
        const formatLocal = (d: Date) => {
          const pad = (n: number) => n.toString().padStart(2, '0');
          return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
        };
        setValue('scheduledStart', formatLocal(start));
        setValue('scheduledEnd', formatLocal(end));
      } else {
        reset();
      }
    }
  }, [isOpen, task, setValue, reset]);

  const onSubmit = async (data: FormData) => {
    try {
      setError('');
      // Make sure date is in ISO 8601 format
      const payload = {
        ...data,
        scheduledStart: new Date(data.scheduledStart).toISOString(),
        scheduledEnd: new Date(data.scheduledEnd).toISOString(),
      };
      
      if (task) {
        await api.patch(`/tasks/${task.id}`, payload);
      } else {
        await api.post(`/projects/${projectId}/tasks`, payload);
      }
      
      reset();
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save task');
    }
  };

  const priorityOptions = [
    { value: 'LOW', label: 'Low' },
    { value: 'MEDIUM', label: 'Medium' },
    { value: 'HIGH', label: 'High' },
  ];

  const statusOptions = [
    { value: 'TODO', label: 'To Do' },
    { value: 'IN_PROGRESS', label: 'In Progress' },
    { value: 'DONE', label: 'Done' },
  ];

  const userOptions = [
    { value: '', label: 'Select Assignee' },
    ...users.map(u => ({ value: u.id, label: u.name }))
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={task ? 'Edit Task' : 'Create New Task'}
    >
      <form id="task-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Title"
          {...register('title')}
          error={errors.title?.message}
          placeholder="Enter task title"
        />
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            {...register('description')}
            rows={3}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="Enter task description"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Status"
            {...register('status')}
            options={statusOptions}
            error={errors.status?.message}
          />
          <Select
            label="Priority"
            {...register('priority')}
            options={priorityOptions}
            error={errors.priority?.message}
          />
        </div>

        <Select
          label="Assignee"
          {...register('assigneeId')}
          options={userOptions}
          error={errors.assigneeId?.message}
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Start Date"
            type="datetime-local"
            {...register('scheduledStart')}
            error={errors.scheduledStart?.message}
          />
          <Input
            label="End Date"
            type="datetime-local"
            {...register('scheduledEnd')}
            error={errors.scheduledEnd?.message}
          />
        </div>

        {error && <ErrorMessage message={error} />}

        <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="sm:col-start-2"
          >
            {isSubmitting ? 'Saving...' : 'Save Task'}
          </Button>
          <Button
            variant="secondary"
            onClick={onClose}
            className="mt-3 sm:mt-0 sm:col-start-1"
          >
            Cancel
          </Button>
        </div>
      </form>
    </Modal>
  );
}
