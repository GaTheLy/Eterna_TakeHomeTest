import React from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import api from '../api/axios';
import { Modal, Input, Button, ErrorMessage } from './ui';

const schema = yup.object({
  name: yup.string().required('Name is required'),
  description: yup.string().max(500, 'Description is too long').default(''),
}).required();

type FormData = yup.InferType<typeof schema>;

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ProjectFormModal({ isOpen, onClose, onSuccess }: Props) {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: yupResolver(schema)
  });
  const [error, setError] = React.useState('');

  const onSubmit = async (data: FormData) => {
    try {
      setError('');
      await api.post('/projects', data);
      reset();
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create project');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Project"
    >
      <form id="project-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Project Name"
          {...register('name')}
          error={errors.name?.message}
          placeholder="Enter project name"
        />
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            {...register('description')}
            rows={3}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="Enter project description"
          />
          {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>}
        </div>

        {error && <ErrorMessage message={error} />}

        <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="sm:col-start-2"
          >
            {isSubmitting ? 'Saving...' : 'Save Project'}
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
