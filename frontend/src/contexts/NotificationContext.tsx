import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { useAuth } from './AuthContext';
import socketService from '../services/socket';

interface NotificationContextType {
  showNotification: (message: string, type?: 'success' | 'error' | 'info') => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated && user?.id) {
      // Connect to WebSocket
      socketService.connect(user.id);

      // Listen for task assignment notifications
      const handleTaskAssigned = (data: any) => {
        toast.success(
          <div className="flex flex-col">
            <span className="font-bold">New Task Assigned!</span>
            <span className="text-sm">{data.message}</span>
            <span className="text-xs text-gray-500 mt-1">Project: {data.projectName}</span>
          </div>,
          {
            duration: 5000,
            position: 'top-right',
            icon: '📋',
          }
        );
      };

      socketService.on('task_assigned', handleTaskAssigned);

      // Cleanup: only remove event listener, don't disconnect
      // (socket will disconnect when user logs out)
      return () => {
        socketService.off('task_assigned', handleTaskAssigned);
      };
    } else {
      // Disconnect only if user logs out
      socketService.disconnect();
    }
  }, [isAuthenticated, user?.id]);

  const showNotification = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    switch (type) {
      case 'success':
        toast.success(message);
        break;
      case 'error':
        toast.error(message);
        break;
      case 'info':
      default:
        toast(message);
        break;
    }
  };

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#fff',
            color: '#363636',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            borderRadius: '0.5rem',
            padding: '1rem',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

