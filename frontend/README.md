# Frontend Dashboard - Task & Schedule Manager

Modern React dashboard with real-time notifications, drag-and-drop scheduling, and responsive design.

## 🏗️ Technology Stack

- **React 19** - Latest React with concurrent features
- **TypeScript 6.0** - Type-safe development
- **Vite 8** - Lightning-fast build tool
- **Tailwind CSS 3.4** - Utility-first styling
- **React Router 7** - Client-side routing
- **React Hook Form 7** - Form management
- **Axios 1.16** - HTTP client
- **Socket.io Client 4.8** - WebSocket for real-time notifications
- **React Hot Toast** - Toast notifications
- **@dnd-kit** - Drag and drop functionality
- **React Big Calendar** - Calendar/schedule view
- **Lucide React** - Icon library

---

## 📁 Project Structure

```
src/
├── components/              # Reusable UI components
│   ├── Layout.tsx           # Main layout with navbar
│   ├── PrivateRoute.tsx     # Protected route wrapper
│   ├── ProjectCard.tsx      # Project display card
│   ├── TaskCard.tsx         # Task display card
│   ├── TaskForm.tsx         # Task create/edit form
│   ├── StatusBadge.tsx      # Status indicator badge
│   ├── PriorityBadge.tsx    # Priority indicator badge
│   └── LoadingSpinner.tsx   # Loading indicator
│
├── pages/                   # Page components
│   ├── Login.tsx            # Login page
│   ├── Register.tsx         # Registration page
│   ├── ProjectsList.tsx     # Projects list view
│   ├── ProjectDetails.tsx   # Project detail with tasks
│   ├── ScheduleView.tsx     # Calendar/timeline view
│   └── NotFound.tsx         # 404 page
│
├── contexts/                # React contexts
│   ├── AuthContext.tsx      # Authentication state
│   └── NotificationContext.tsx  # WebSocket notifications
│
├── services/                # External services
│   ├── api.ts               # Axios API client
│   └── socket.ts            # Socket.io WebSocket service
│
├── types/                   # TypeScript definitions
│   └── index.ts             # Shared type definitions
│
├── App.tsx                  # Root component with routing
├── main.tsx                 # Application entry point
└── index.css                # Global styles (Tailwind)

public/                      # Static assets
├── vite.svg                 # Favicon
└── ...

```

---

## 🚀 Setup & Installation

### Prerequisites

- Node.js 18+ and npm
- Backend API running (see backend/README.md)

### Installation Steps

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables:**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env`:
   ```env
   VITE_API_BASE_URL=http://localhost:3000
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```

Application will be available at: **http://localhost:5173**

---

## 🔧 Development Commands

### Running the Application

```bash
# Development mode (with hot reload)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Type checking
npx tsc --noEmit

# Linting
npm run lint
```

### Build Output

Production build creates optimized files in `dist/`:
- Minified JavaScript bundles
- Optimized CSS
- Static assets
- HTML entry point

---

## 🎨 Features

### Authentication
- ✅ Login with email/password
- ✅ User registration
- ✅ JWT token management
- ✅ Automatic token refresh
- ✅ Protected routes
- ✅ Logout functionality

### Project Management
- ✅ List all projects with search
- ✅ Create new projects
- ✅ View project details
- ✅ Edit project information
- ✅ Archive projects
- ✅ Task summary per project

### Task Management
- ✅ List tasks with filters (status, priority, assignee)
- ✅ Create tasks with scheduling
- ✅ Edit task details
- ✅ Update task status
- ✅ Delete tasks
- ✅ Sort by various fields
- ✅ Pagination support

### Schedule View
- ✅ Calendar view of all tasks
- ✅ Timeline view option
- ✅ Date range filtering
- ✅ Drag-and-drop rescheduling
- ✅ Visual conflict indicators
- ✅ Month/week/day views

### Real-time Notifications
- ✅ WebSocket connection
- ✅ Task assignment notifications
- ✅ Toast notifications
- ✅ Connection status indicator
- ✅ Automatic reconnection
- ✅ Multi-tab support

### UI/UX
- ✅ Responsive design (mobile, tablet, desktop)
- ✅ Loading states
- ✅ Error handling
- ✅ Form validation
- ✅ Confirmation dialogs
- ✅ Keyboard shortcuts
- ✅ Accessible components

---

## 🔌 API Integration

### API Client Configuration

**Axios instance** (`src/services/api.ts`):
```typescript
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor - Handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redirect to login
    }
    return Promise.reject(error);
  }
);
```

### API Endpoints Used

**Authentication:**
```typescript
POST /auth/login
POST /auth/register
GET  /auth/me
```

**Projects:**
```typescript
GET    /projects
POST   /projects
GET    /projects/:id
PATCH  /projects/:id
DELETE /projects/:id
```

**Tasks:**
```typescript
GET    /projects/:projectId/tasks
POST   /projects/:projectId/tasks
PATCH  /tasks/:id
DELETE /tasks/:id
```

**Schedule:**
```typescript
GET /schedule?start=DATE&end=DATE
GET /schedule/conflicts
```

---

## 🔔 WebSocket Integration

### Socket Service

**Singleton service** (`src/services/socket.ts`):
```typescript
class SocketService {
  private socket: Socket | null = null;
  
  connect(userId: string) {
    this.socket = io(API_URL, {
      query: { userId },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
    });
  }
  
  on(event: string, callback: Function) {
    this.socket?.on(event, callback);
  }
  
  disconnect() {
    this.socket?.disconnect();
  }
}
```

### Notification Context

**React Context** (`src/contexts/NotificationContext.tsx`):
```typescript
export const NotificationProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  
  useEffect(() => {
    if (isAuthenticated && user?.id) {
      socketService.connect(user.id);
      
      socketService.on('task_assigned', (data) => {
        toast.success(
          <div>
            <span className="font-bold">New Task Assigned!</span>
            <span>{data.message}</span>
          </div>
        );
      });
      
      return () => {
        socketService.disconnect();
      };
    }
  }, [isAuthenticated, user?.id]);
  
  return (
    <NotificationContext.Provider value={{}}>
      <Toaster />
      {children}
    </NotificationContext.Provider>
  );
};
```

### Connection Status Indicator

Visual indicator in navbar:
- 🟢 Green WiFi icon = Connected
- ⚪ Gray WiFi-off icon = Disconnected
- Tooltip shows connection status

---

## 🎨 Styling

### Tailwind CSS

**Configuration** (`tailwind.config.js`):
```javascript
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#3b82f6',
        secondary: '#8b5cf6',
      },
    },
  },
  plugins: [],
};
```

### Component Styling

**Example - Button:**
```tsx
<button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
  Click Me
</button>
```

**Example - Card:**
```tsx
<div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
  <h3 className="text-xl font-bold mb-2">Title</h3>
  <p className="text-gray-600">Description</p>
</div>
```

### Responsive Design

**Breakpoints:**
- `sm:` - 640px and up (mobile landscape)
- `md:` - 768px and up (tablet)
- `lg:` - 1024px and up (desktop)
- `xl:` - 1280px and up (large desktop)

**Example:**
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* Responsive grid */}
</div>
```

---

## 🧩 Key Components

### Layout Component

**Main layout with navbar and routing:**
```tsx
<Layout>
  <nav>
    <Link to="/projects">Projects</Link>
    <Link to="/schedule">Schedule</Link>
    <UserMenu />
    <ConnectionStatus />
  </nav>
  <main>
    <Outlet />
  </main>
</Layout>
```

### PrivateRoute Component

**Protected route wrapper:**
```tsx
<PrivateRoute>
  <ProjectsList />
</PrivateRoute>
```

Redirects to login if not authenticated.

### TaskForm Component

**Reusable form for create/edit:**
```tsx
<TaskForm
  projectId={projectId}
  task={existingTask}
  onSubmit={handleSubmit}
  onCancel={handleCancel}
/>
```

Features:
- React Hook Form validation
- Date/time pickers
- User selection dropdown
- Priority/status selectors

### StatusBadge Component

**Visual status indicator:**
```tsx
<StatusBadge status="IN_PROGRESS" />
```

Colors:
- TODO: Gray
- IN_PROGRESS: Blue
- DONE: Green

### PriorityBadge Component

**Visual priority indicator:**
```tsx
<PriorityBadge priority="HIGH" />
```

Colors:
- LOW: Gray
- MEDIUM: Yellow
- HIGH: Orange
- URGENT: Red

---

## 🔐 Authentication Flow

### Login Process

1. User enters email/password
2. POST to `/auth/login`
3. Receive JWT token
4. Store token in localStorage
5. Store user data in AuthContext
6. Redirect to projects page
7. Connect WebSocket with userId

### Token Management

**Storage:**
```typescript
localStorage.setItem('token', jwtToken);
localStorage.setItem('user', JSON.stringify(user));
```

**Retrieval:**
```typescript
const token = localStorage.getItem('token');
const user = JSON.parse(localStorage.getItem('user') || '{}');
```

**Automatic Injection:**
```typescript
// Axios interceptor adds token to all requests
config.headers.Authorization = `Bearer ${token}`;
```

### Logout Process

1. Clear localStorage
2. Clear AuthContext
3. Disconnect WebSocket
4. Redirect to login page

---

## 📱 Responsive Design

### Mobile View (< 768px)

- Hamburger menu for navigation
- Stacked layout
- Touch-friendly buttons
- Simplified forms
- Bottom navigation

### Tablet View (768px - 1024px)

- Side navigation
- 2-column grid layouts
- Larger touch targets
- Optimized spacing

### Desktop View (> 1024px)

- Full navigation bar
- 3-column grid layouts
- Hover effects
- Keyboard shortcuts
- Dense information display

---

## 🚀 Production Build

### Build Process

```bash
# Build for production
npm run build

# Output in dist/ directory
dist/
├── assets/
│   ├── index-[hash].js
│   ├── index-[hash].css
│   └── ...
└── index.html
```

### Optimization

Vite automatically:
- ✅ Minifies JavaScript
- ✅ Minifies CSS
- ✅ Tree-shakes unused code
- ✅ Code splits by route
- ✅ Optimizes images
- ✅ Generates source maps

### Environment Variables

**Production `.env`:**
```env
VITE_API_BASE_URL=https://api.your-domain.com
```

**Access in code:**
```typescript
const apiUrl = import.meta.env.VITE_API_BASE_URL;
```

---

## 🐳 Docker Deployment

### Dockerfile

Multi-stage build:
1. Build stage (Node.js)
2. Production stage (Nginx)

```dockerfile
# Build stage
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Nginx Configuration

**nginx.conf:**
```nginx
server {
  listen 80;
  root /usr/share/nginx/html;
  index index.html;
  
  location / {
    try_files $uri $uri/ /index.html;
  }
  
  location /api {
    proxy_pass http://backend:3000;
  }
}
```

---

## 🐛 Troubleshooting

### API Connection Issues

```bash
# Check backend is running
curl http://localhost:3000

# Check CORS configuration
# Verify VITE_API_BASE_URL in .env

# Check browser console for errors
```

### WebSocket Not Connecting

```bash
# Check connection status indicator
# Verify user is logged in
# Check backend WebSocket is running
# Check browser console for WebSocket errors
```

### Build Failures

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear Vite cache
rm -rf node_modules/.vite

# Type check
npx tsc --noEmit
```

### Hot Reload Not Working

```bash
# Restart dev server
npm run dev

# Check file watchers limit (Linux)
echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
sudo sysctl -p
```

---

## 📝 Development Notes

### Code Style

- Use functional components with hooks
- Use TypeScript for type safety
- Follow React best practices
- Use meaningful component names
- Extract reusable logic to custom hooks
- Keep components small and focused

### Best Practices

- ✅ Use TypeScript for all components
- ✅ Validate forms with React Hook Form
- ✅ Handle loading and error states
- ✅ Use React Context for global state
- ✅ Memoize expensive computations
- ✅ Use proper key props in lists
- ✅ Clean up effects and subscriptions
- ✅ Use semantic HTML
- ✅ Ensure accessibility (ARIA labels)
- ✅ Optimize images and assets

### Performance Tips

- Use `React.memo()` for expensive components
- Use `useMemo()` for expensive calculations
- Use `useCallback()` for stable function references
- Lazy load routes with `React.lazy()`
- Optimize images (WebP format)
- Use code splitting
- Minimize bundle size

---

## 📄 License

This project is a take-home assessment for Eterna Indonesia.

---

**Built with React and TypeScript** ⚛️
