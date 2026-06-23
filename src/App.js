import './App.css';
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom';
import Home from './Components/Home/Home';
import Layout from './Components/Layout/Layout';
import About from './Components/About/About';
import Login from './Components/Login/Login';
import Messages from './Components/Messages/Messages';
import Register from './Components/Register/Register';
import HowItWorks from './Components/HowItWorks/HowItWorks';
import Profile from './Components/Profile/Profile';
import Complaints from './Components/Complaints/Complaints';
import AdminDashboard from './Components/Admin/AdminDashboard';
import CapsuleView from './Components/CapsuleView/CapsuleView';
import Splash from './Components/Splash/Splash';
import { isAuthenticated, getStoredUser } from './services/authService';

function ProtectedRoute({ children }) {
  if (isAuthenticated()) {
    return children;
  }
  const hasSeenSplash = localStorage.getItem('splashSeen');
  return hasSeenSplash ? <Navigate to="/login" replace /> : <Navigate to="/splash" replace />;
}

function InverseProtectedRoute({ children }) {
  return isAuthenticated() ? <Navigate to="/" replace /> : children;
}

function AdminRoute({ children }) {
  const user = getStoredUser();
  return isAuthenticated() && user?.is_admin ? children : <Navigate to="/" replace />;
}

function HomeOrAdminRoute() {
  const user = getStoredUser();
  if (user?.is_admin) {
    return <Navigate to="/admin/complaints" replace />;
  }
  return <Home />;
}

let router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: (
          <ProtectedRoute>
            <HomeOrAdminRoute />
          </ProtectedRoute>
        ),
      },
      {
        path: 'splash',
        element: <Splash />,
      },
      {
        path: 'about',
        element: (
          <ProtectedRoute>
            <About />
          </ProtectedRoute>
        ),
      },
      {
        path: 'login',
        element: (
          <InverseProtectedRoute>
            <Login />
          </InverseProtectedRoute>
        ),
      },
      {
        path: 'messages',
        element: (
          <ProtectedRoute>
            <Messages />
          </ProtectedRoute>
        ),
      },
      {
        path: 'register',
        element: (
          <InverseProtectedRoute>
            <Register />
          </InverseProtectedRoute>
        ),
      },
      {
        path: 'howitworks',
        element: (
          <ProtectedRoute>
            <HowItWorks />
          </ProtectedRoute>
        ),
      },
      {
        path: 'profile',
        element: (
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        ),
      },
      {
        path: 'complaints',
        element: (
          <ProtectedRoute>
            <Complaints />
          </ProtectedRoute>
        ),
      },
      {
        path: 'admin/complaints',
        element: (
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        ),
      },
      {
        path: 'view-capsule/:id',
        element: <CapsuleView />,
      },
      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;