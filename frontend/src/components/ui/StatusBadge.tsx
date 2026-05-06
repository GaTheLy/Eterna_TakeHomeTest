import React from 'react';
import classNames from 'classnames';

type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE';
type ProjectStatus = 'ACTIVE' | 'ARCHIVED';
type Priority = 'LOW' | 'MEDIUM' | 'HIGH';

interface StatusBadgeProps {
  status: TaskStatus | ProjectStatus | Priority;
  type?: 'task' | 'project' | 'priority';
}

export default function StatusBadge({ status, type = 'task' }: StatusBadgeProps) {
  const getColorClasses = () => {
    if (type === 'task') {
      switch (status) {
        case 'TODO':
          return 'bg-gray-100 text-gray-800';
        case 'IN_PROGRESS':
          return 'bg-blue-100 text-blue-800';
        case 'DONE':
          return 'bg-green-100 text-green-800';
        default:
          return 'bg-gray-100 text-gray-800';
      }
    }
    
    if (type === 'project') {
      switch (status) {
        case 'ACTIVE':
          return 'bg-green-100 text-green-800';
        case 'ARCHIVED':
          return 'bg-gray-100 text-gray-800';
        default:
          return 'bg-gray-100 text-gray-800';
      }
    }
    
    if (type === 'priority') {
      switch (status) {
        case 'HIGH':
          return 'bg-red-100 text-red-800';
        case 'MEDIUM':
          return 'bg-yellow-100 text-yellow-800';
        case 'LOW':
          return 'bg-blue-100 text-blue-800';
        default:
          return 'bg-gray-100 text-gray-800';
      }
    }
    
    return 'bg-gray-100 text-gray-800';
  };

  const getDisplayText = () => {
    if (status === 'IN_PROGRESS') return 'In Progress';
    return status.charAt(0) + status.slice(1).toLowerCase();
  };

  return (
    <span
      className={classNames(
        'px-2 inline-flex text-xs leading-5 font-semibold rounded-full',
        getColorClasses()
      )}
    >
      {getDisplayText()}
    </span>
  );
}
