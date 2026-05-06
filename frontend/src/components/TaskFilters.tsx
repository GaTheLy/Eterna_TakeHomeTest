import React from 'react';
import { Filter, SortAsc } from 'lucide-react';

interface Props {
  filters: {
    status?: string;
    priority?: string;
    sortBy?: string;
    sortOrder?: string;
  };
  onFilterChange: (newFilters: any) => void;
}

export default function TaskFilters({ filters, onFilterChange }: Props) {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    onFilterChange({ [name]: value || undefined });
  };

  return (
    <div className="bg-gray-50 p-4 rounded-lg mb-6 flex flex-wrap gap-4 items-end border border-gray-200">
      <div className="flex-1 min-w-[150px]">
        <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Status</label>
        <select
          name="status"
          value={filters.status || ''}
          onChange={handleChange}
          className="block w-full border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        >
          <option value="">All Statuses</option>
          <option value="TODO">To Do</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="DONE">Done</option>
        </select>
      </div>

      <div className="flex-1 min-w-[150px]">
        <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Priority</label>
        <select
          name="priority"
          value={filters.priority || ''}
          onChange={handleChange}
          className="block w-full border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        >
          <option value="">All Priorities</option>
          <option value="LOW">Low</option>
          <option value="MEDIUM">Medium</option>
          <option value="HIGH">High</option>
        </select>
      </div>

      <div className="flex-1 min-w-[150px]">
        <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Sort By</label>
        <select
          name="sortBy"
          value={filters.sortBy || 'scheduledStart'}
          onChange={handleChange}
          className="block w-full border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        >
          <option value="scheduledStart">Start Date</option>
          <option value="priority">Priority</option>
        </select>
      </div>

      <div className="flex-1 min-w-[100px]">
        <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Order</label>
        <select
          name="sortOrder"
          value={filters.sortOrder || 'ASC'}
          onChange={handleChange}
          className="block w-full border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        >
          <option value="ASC">Ascending</option>
          <option value="DESC">Descending</option>
        </select>
      </div>
      
      <button 
        onClick={() => onFilterChange({ status: undefined, priority: undefined, sortBy: 'scheduledStart', sortOrder: 'ASC' })}
        className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-indigo-600"
      >
        Reset
      </button>
    </div>
  );
}
