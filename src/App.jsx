import { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Library from './pages/Library';
import Auth from './pages/Auth';
import api from './services/api'; // Ensure you import your api helper

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentView, setCurrentView] = useState('dashboard');
  const [user, setUser] = useState(null); // <--- 1. CREATE USER STATE

  // Check login on refresh
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsLoggedIn(true);
      fetchUser(); // <--- 2. FETCH USER INFO
    }
  }, []);

  const fetchUser = async () => {
    try {
      const res = await api.get('/auth/me'); // Hits the new route we just added
      setUser(res.data);
    } catch (err) {
      console.error("Session expired");
      handleLogout();
    }
  };

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    fetchUser(); // Fetch user info immediately after login
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    setUser(null);
    window.location.reload();
  };

  if (!isLoggedIn) {
    return <Auth onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="flex h-screen bg-[#F9FBF9] font-sans overflow-hidden">
      <Sidebar
        user={user} // <--- 3. PASS TO SIDEBAR
        activeView={currentView}
        onNavigate={setCurrentView}
        onLogout={handleLogout}
      />

      <main className="flex-1 overflow-y-auto">
        {currentView === 'dashboard' && (
          <Dashboard
            user={user}
            onNavigate={setCurrentView}
          />
        )}
        {currentView === 'library' && <Library user={user} />} {/* <--- 4. PASS TO LIBRARY */}
      </main>
    </div>
  );
}

export default App;