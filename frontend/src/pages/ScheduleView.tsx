import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { Calendar, AlertCircle } from 'lucide-react';
import classNames from 'classnames';

interface Task {
  id: string;
  title: string;
  scheduledStart: string;
  scheduledEnd: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  status: 'TODO' | 'IN_PROGRESS' | 'DONE';
  assignee: {
    name: string;
  };
  project: {
    name: string;
  };
}

interface Conflict {
  assignee: {
    name: string;
  };
  conflictingTasks: Array<{
    title: string;
    projectName: string;
    scheduledStart: string;
    scheduledEnd: string;
  }>;
}

export default function ScheduleView() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [conflicts, setConflicts] = useState<Conflict[]>([]);
  const [loading, setLoading] = useState(true);
  const [showConflicts, setShowConflicts] = useState(false);
  
  // Set default date range to current week
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setHours(0,0,0,0);
    return d.toISOString().split('T')[0];
  });
  
  const [endDate, setEndDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    d.setHours(23,59,59,999);
    return d.toISOString().split('T')[0];
  });

  const fetchSchedule = async () => {
    try {
      setLoading(true);
      const startIso = new Date(startDate).toISOString();
      const endIso = new Date(endDate + 'T23:59:59').toISOString();
      
      const response = await api.get(`/schedule?start=${startIso}&end=${endIso}`);
      setTasks(response.data);
    } catch (error) {
      console.error('Failed to fetch schedule', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchConflicts = async () => {
    try {
      const response = await api.get('/schedule/conflicts');
      setConflicts(response.data);
      setShowConflicts(true);
    } catch (error) {
      console.error('Failed to fetch conflicts', error);
    }
  };

  useEffect(() => {
    fetchSchedule();
  }, [startDate, endDate]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH': return 'bg-red-100 border-red-300 text-red-800';
      case 'MEDIUM': return 'bg-yellow-100 border-yellow-300 text-yellow-800';
      case 'LOW': return 'bg-blue-100 border-blue-300 text-blue-800';
      default: return 'bg-gray-100 border-gray-300 text-gray-800';
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Schedule</h1>
        <button
          onClick={fetchConflicts}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
        >
          <AlertCircle className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
          Check Conflicts
        </button>
      </div>

      <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6 mb-6">
        <div className="md:grid md:grid-cols-3 md:gap-6">
          <div className="md:col-span-1">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Date Range</h3>
            <p className="mt-1 text-sm text-gray-500">Filter scheduled tasks by date range.</p>
          </div>
          <div className="mt-5 md:mt-0 md:col-span-2">
            <div className="grid grid-cols-6 gap-6">
              <div className="col-span-6 sm:col-span-3">
                <label className="block text-sm font-medium text-gray-700">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md py-2 px-3 border"
                />
              </div>
              <div className="col-span-6 sm:col-span-3">
                <label className="block text-sm font-medium text-gray-700">End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md py-2 px-3 border"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {showConflicts && conflicts.length > 0 && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6 rounded-md shadow-sm">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-red-400" aria-hidden="true" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Schedule Conflicts Detected</h3>
              <div className="mt-2 text-sm text-red-700">
                <ul className="list-disc pl-5 space-y-2">
                  {conflicts.map((conflict, idx) => (
                    <li key={idx}>
                      <span className="font-semibold">{conflict.assignee.name}</span> has overlapping tasks:
                      <ul className="list-circle pl-5 mt-1 space-y-1 text-xs">
                        {conflict.conflictingTasks.map((t, tIdx) => (
                          <li key={tIdx}>
                            {t.title} ({t.projectName}) - {new Date(t.scheduledStart).toLocaleString()} to {new Date(t.scheduledEnd).toLocaleString()}
                          </li>
                        ))}
                      </ul>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {showConflicts && conflicts.length === 0 && (
        <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-6 rounded-md shadow-sm">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-green-700">No schedule conflicts detected.</p>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12">Loading...</div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {tasks.length === 0 ? (
              <li className="px-6 py-12 text-center text-gray-500">
                <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                No tasks scheduled in this date range.
              </li>
            ) : (
              tasks.map((task) => (
                <li key={task.id}>
                  <div className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-indigo-600 truncate">{task.title}</p>
                      <div className="ml-2 flex-shrink-0 flex">
                        <p className={classNames('px-2 inline-flex text-xs leading-5 font-semibold rounded-full border', getPriorityColor(task.priority))}>
                          {task.priority}
                        </p>
                      </div>
                    </div>
                    <div className="mt-2 sm:flex sm:justify-between">
                      <div className="sm:flex">
                        <p className="flex items-center text-sm text-gray-500">
                          Project: {task.project?.name || '-'}
                        </p>
                        <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                          Assignee: {task.assignee?.name || '-'}
                        </p>
                      </div>
                      <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                        <Calendar className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                        <p>
                          {new Date(task.scheduledStart).toLocaleDateString()} {new Date(task.scheduledStart).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} 
                          &nbsp;&mdash;&nbsp; 
                          {new Date(task.scheduledEnd).toLocaleDateString()} {new Date(task.scheduledEnd).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </p>
                      </div>
                    </div>
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
