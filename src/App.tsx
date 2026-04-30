import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AppProvider } from './contexts/AppContext';
import { Navbar } from './components/Layout/Navbar';
import { LoginForm } from './components/Auth/LoginForm';
import { RegisterForm } from './components/Auth/RegisterForm';
import { Dashboard } from './components/Dashboard/Dashboard';
import { Directory } from './components/Directory/Directory';
import { Events } from './components/Events/Events';
import { Announcements } from './components/Announcements/Announcements';
import { Mentorship } from './components/Mentorship/Mentorship';
import { Donations } from './components/Donations/Donations';
import { AdminDashboard } from './components/Admin/AdminDashboard';
import { ProfileForm } from './components/Profile/ProfileForm';
import Jobs from './components/Jobs/Jobs';

function AppContent() {
  const { currentUser } = useAuth();
  const [showProfile, setShowProfile] = React.useState(false);

  // Handle profile editing
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'p' && (e.ctrlKey || e.metaKey) && currentUser) {
        e.preventDefault();
        setShowProfile(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentUser]);

  if (!currentUser) {
    return (
      <Router>
        <Routes>
          <Route
            path="/login"
            element={<LoginForm onSuccess={() => window.location.reload()} />}
          />
          <Route
            path="/register"
            element={<RegisterForm onSuccess={() => window.location.reload()} />}
          />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main>
          <Routes>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/directory" element={<Directory />} />
            <Route path="/events" element={<Events />} />
            <Route path="/announcements" element={<Announcements />} />
            <Route path="/mentorship" element={<Mentorship />} />
            <Route path="/jobs" element={<Jobs />} />
            <Route path="/donate" element={<Donations />} />
            {currentUser.role === 'admin' && (
              <Route path="/admin" element={<AdminDashboard />} />
            )}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>

        {showProfile && (
          <ProfileForm onClose={() => setShowProfile(false)} />
        )}
      </div>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </AuthProvider>
  );
}

export default App;