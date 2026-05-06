import React, { useEffect, useState, useMemo, useCallback } from 'react';
import api from '../api/axios';
import { AlertCircle } from 'lucide-react';
import { Calendar, dateFnsLocalizer, Views, type EventProps } from 'react-big-calendar';
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop';
import { format, parse, startOfWeek, getDay, startOfMonth, endOfMonth, endOfWeek } from 'date-fns';
import { enUS } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css';
import { Button, LoadingSpinner } from '../components/ui';

const locales = {
  'en-US': enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

// Enable drag and drop with compatibility fix for ESM/CJS
const DnDCalendar = (withDragAndDrop as any).default 
  ? (withDragAndDrop as any).default(Calendar) 
  : withDragAndDrop(Calendar);

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

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource: Task;
}

interface Conflict {
  assignee: {
    name: string;
  };
  conflictingTasks: Array<{
    id?: string;
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
  const [viewDate, setViewDate] = useState(new Date());
  const [currentView, setCurrentView] = useState(Views.MONTH);

  const fetchSchedule = useCallback(async (start: Date, end: Date) => {
    try {
      setLoading(true);
      const response = await api.get(`/schedule`, {
        params: {
          start: start.toISOString(),
          end: end.toISOString(),
        }
      });
      setTasks(response.data);
    } catch (error) {
      console.error('Failed to fetch schedule', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchConflicts = async () => {
    try {
      const response = await api.get('/schedule/conflicts');
      setConflicts(response.data);
      setShowConflicts(true);
    } catch (error) {
      console.error('Failed to fetch conflicts', error);
    }
  };

  // Handle event drop (drag and drop rescheduling)
  const handleEventDrop = async ({ event, start, end }: any) => {
    // Basic validation: ensure end is after start
    if (new Date(end) <= new Date(start)) {
      // If same date, set end to end of day
      const newEnd = new Date(start);
      newEnd.setHours(23, 59, 59, 999);
      end = newEnd;
    }
    try {
      // Update task dates via API
      await api.patch(`/tasks/${event.id}`, {
        scheduledStart: start.toISOString(),
        scheduledEnd: end.toISOString(),
      });

      // Refresh schedule to show updated task
      let rangeStart, rangeEnd;
      if (currentView === Views.MONTH) {
        rangeStart = startOfWeek(startOfMonth(viewDate));
        rangeEnd = endOfWeek(endOfMonth(viewDate));
      } else if (currentView === Views.WEEK) {
        rangeStart = startOfWeek(viewDate);
        rangeEnd = endOfWeek(viewDate);
      } else {
        rangeStart = new Date(viewDate);
        rangeStart.setHours(0, 0, 0, 0);
        rangeEnd = new Date(viewDate);
        rangeEnd.setHours(23, 59, 59, 999);
      }
      fetchSchedule(rangeStart, rangeEnd);
    } catch (error: any) {
      console.error('Failed to reschedule task', error);
      alert(error.response?.data?.message || 'Failed to reschedule task. Please try again.');
    }
  };

  // Handle event resize (change duration)
  const handleEventResize = async ({ event, start, end }: any) => {
    // Basic validation: ensure end is after start
    if (new Date(end) <= new Date(start)) {
      const newEnd = new Date(start);
      newEnd.setHours(23, 59, 59, 999);
      end = newEnd;
    }
    try {
      // Update task dates via API
      await api.patch(`/tasks/${event.id}`, {
        scheduledStart: start.toISOString(),
        scheduledEnd: end.toISOString(),
      });

      // Refresh schedule to show updated task
      let rangeStart, rangeEnd;
      if (currentView === Views.MONTH) {
        rangeStart = startOfWeek(startOfMonth(viewDate));
        rangeEnd = endOfWeek(endOfMonth(viewDate));
      } else if (currentView === Views.WEEK) {
        rangeStart = startOfWeek(viewDate);
        rangeEnd = endOfWeek(viewDate);
      } else {
        rangeStart = new Date(viewDate);
        rangeStart.setHours(0, 0, 0, 0);
        rangeEnd = new Date(viewDate);
        rangeEnd.setHours(23, 59, 59, 999);
      }
      fetchSchedule(rangeStart, rangeEnd);
    } catch (error: any) {
      console.error('Failed to resize task', error);
      alert(error.response?.data?.message || 'Failed to resize task. Please try again.');
    }
  };

  // Fetch data when date or view changes
  useEffect(() => {
    let start, end;
    if (currentView === Views.MONTH) {
      start = startOfWeek(startOfMonth(viewDate));
      end = endOfWeek(endOfMonth(viewDate));
    } else if (currentView === Views.WEEK) {
      start = startOfWeek(viewDate);
      end = endOfWeek(viewDate);
    } else {
      // Day view or other: ensure end is strictly after start
      start = new Date(viewDate);
      start.setHours(0, 0, 0, 0);
      end = new Date(viewDate);
      end.setHours(23, 59, 59, 999);
    }

    // Final safety check for backend validation
    if (start.getTime() >= end.getTime()) {
      end = new Date(start.getTime() + 1000 * 60 * 60 * 24 - 1); // +1 day minus 1ms
    }

    fetchSchedule(start, end);
  }, [viewDate, currentView, fetchSchedule]);

  const events = useMemo<CalendarEvent[]>(() => {
    return tasks.map(task => ({
      id: task.id,
      title: task.title,
      start: new Date(task.scheduledStart),
      end: new Date(task.scheduledEnd),
      resource: task
    }));
  }, [tasks]);

  const eventPropGetter = (event: CalendarEvent) => {
    const priority = event.resource.priority;
    let backgroundColor = '#6366f1'; // indigo-500
    if (priority === 'HIGH') backgroundColor = '#ef4444'; // red-500
    if (priority === 'MEDIUM') backgroundColor = '#f59e0b'; // amber-500
    if (priority === 'LOW') backgroundColor = '#10b981'; // emerald-500

    // Highlight if in conflicts
    const isConflicting = conflicts.some(c => 
      c.conflictingTasks.some(t => t.title === event.resource.title)
    );

    return {
      style: {
        backgroundColor,
        borderRadius: '4px',
        opacity: 0.9,
        color: 'white',
        border: isConflicting ? '2px solid #000' : 'none',
        display: 'block',
        fontSize: '12px',
        padding: '2px 5px',
      }
    };
  };

  return (
    <div className="h-full flex flex-col space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Schedule Calendar</h1>
        <div className="flex gap-3">
          {showConflicts && (
            <Button
              variant="secondary"
              onClick={() => setShowConflicts(false)}
            >
              Clear Highlights
            </Button>
          )}
          <Button
            variant="danger"
            onClick={fetchConflicts}
            icon={AlertCircle}
          >
            Check Conflicts
          </Button>
        </div>
      </div>

      {showConflicts && conflicts.length > 0 && (
        <div className="bg-red-50 border-l-4 border-red-500 p-5 rounded-r-lg shadow-sm animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertCircle className="h-6 w-6 text-red-500" aria-hidden="true" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-bold text-red-800">Schedule Conflicts Detected</h3>
              <div className="mt-3 text-sm text-red-700">
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {conflicts.map((conflict, idx) => (
                    <li key={idx} className="bg-white/50 p-3 rounded border border-red-100">
                      <span className="font-bold text-red-900 underline decoration-red-200">{conflict.assignee.name}</span>
                      <ul className="mt-2 space-y-2">
                        {conflict.conflictingTasks.map((t, tIdx) => (
                          <li key={tIdx} className="text-xs">
                            <p className="font-semibold text-gray-900">{t.title}</p>
                            <p className="text-gray-500 font-medium">{t.projectName}</p>
                            <p className="text-gray-400 tabular-nums">
                              {format(new Date(t.scheduledStart), 'MMM d, HH:mm')} - {format(new Date(t.scheduledEnd), 'MMM d, HH:mm')}
                            </p>
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
        <div className="bg-green-50 border-l-4 border-green-500 p-5 rounded-r-lg shadow-sm animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <AlertCircle className="h-6 w-6 text-green-500" aria-hidden="true" />
            </div>
            <div className="ml-4">
              <p className="text-base font-bold text-green-800">Perfect Harmony! No schedule conflicts detected.</p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white shadow-2xl rounded-2xl p-6 border border-gray-100 relative flex-1 min-h-[700px]">
        {loading && (
          <div className="absolute inset-0 z-20 bg-white/60 flex items-center justify-center backdrop-blur-sm rounded-2xl">
            <div className="flex flex-col items-center gap-3">
              <LoadingSpinner size="lg" />
              <p className="text-sm font-medium text-gray-500 animate-pulse">Syncing schedule...</p>
            </div>
          </div>
        )}
        <div style={{ height: '700px' }} className="select-none cursor-default">
          <DnDCalendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            style={{ height: '100%' }}
            onNavigate={(date) => setViewDate(date)}
            onView={(view) => setCurrentView(view)}
            view={currentView as any}
            date={viewDate}
            eventPropGetter={eventPropGetter}
            views={[Views.MONTH, Views.WEEK, Views.DAY]}
            onEventDrop={handleEventDrop}
            onEventResize={handleEventResize}
            resizable
            selectable
            onSelectSlot={(slotInfo) => {
              setViewDate(slotInfo.start);
              setCurrentView(Views.DAY);
            }}
            draggableAccessor={() => true}
            components={{
              event: ({ event }: EventProps<CalendarEvent>) => (
                <div className="flex flex-col h-full leading-tight overflow-hidden">
                  <span className="font-bold text-[11px] truncate">{event.title}</span>
                  <span className="text-[9px] opacity-90 truncate">{event.resource.project.name}</span>
                </div>
              )
            }}
            tooltipAccessor={(event) => `${event.title} (${event.resource.project.name})\nAssignee: ${event.resource.assignee.name}\nDrag to reschedule`}
          />
        </div>
      </div>
    </div>
  );
}
