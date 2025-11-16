import React, { useState, useEffect, createContext, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from './supabaseClient';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Home from './pages/Home';
import AboutUs from './pages/AboutUs';
import AdminPanel from './components/AdminPanel';
import ContactUs from './pages/ContactUs';
import GoogleAuth from './components/GoogleAuth';
import UserProfile from './components/UserProfile';
import TrackOrders from './components/TrackOrders';
import './index.css';
import ScrollToTop from './components/ScrollToTop';

// Create Auth Context
const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

// Auth Provider Component
const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes (Google redirect callback)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      
      // Google OAuth successful - user redirected back
      if (_event === 'SIGNED_IN' && session?.user) {
        console.log('Google Sign In Successful:', session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const value = {
    user,
    signOut,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Main App Component
function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <Router>
      <AuthProvider>
        <ScrollToTop />
        <AppContent 
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
        />
      </AuthProvider>
    </Router>
  );
}

// App Content with Auth Logic
function AppContent({ isSidebarOpen, setIsSidebarOpen }) {
  const { user, loading } = useAuth();
  const [showAuth, setShowAuth] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showTrackOrders, setShowTrackOrders] = useState(false); // ✅ Track Orders state

  // Check if profile is completed for new users
  useEffect(() => {
    if (user) {
      // Check if user has completed profile
      const hasPhone = user.user_metadata?.phone;
      const hasAddress = user.user_metadata?.address;
      const isProfileComplete = user.user_metadata?.profile_completed;
      
      // Show profile modal if ANY of these are missing
      if (!hasPhone || !hasAddress || !isProfileComplete) {
        console.log('First-time user detected - showing profile form');
        setShowProfile(true);
      } else {
        console.log('Returning user - profile already complete');
        setShowProfile(false);
      }
    }
  }, [user]);

  const handleProfileComplete = () => {
    setShowProfile(false);
    // Refresh user data to get updated metadata
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Profile completed, updated user:', session?.user);
    });
  };

  // Handle login click from Navbar or Sidebar
  const handleLoginClick = () => {
    console.log('App: Opening GoogleAuth modal');
    setShowAuth(true);
    setIsSidebarOpen(false); // Close sidebar if open
  };

  // ✅ Handle Track Orders click
  const handleTrackOrdersClick = () => {
    console.log('App: Opening Track Orders');
    setShowTrackOrders(true);
    setIsSidebarOpen(false); // Close sidebar if open
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 via-white to-orange-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-amber-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-amber-800 font-semibold">Loading SB Ghee...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50">
      {/* Navbar with Login Handler */}
      <Navbar 
        onMenuClick={() => setIsSidebarOpen(true)}
        onLoginClick={handleLoginClick}
        user={user}
      />
      
      {/* Sidebar with Login & Track Orders Handlers */}
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)}
        onLoginClick={handleLoginClick}
        onTrackOrdersClick={handleTrackOrdersClick} // ✅ Pass track orders handler
      />
      
      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Routes>
          <Route path="/" element={<Home user={user} />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/contact" element={<ContactUs />} />
          <Route path="/adminhu" element={<AdminPanel />} />
        </Routes>
      </motion.main>

      {/* Google Auth Modal */}
      {showAuth && !user && (
        <GoogleAuth
          onClose={() => {
            console.log('Closing GoogleAuth modal');
            setShowAuth(false);
          }}
          onSuccess={(userData) => {
            console.log('User logged in with Google:', userData);
            setShowAuth(false);
          }}
        />
      )}

      {/* Profile Completion Modal (First-time users only) */}
      {showProfile && user && (
        <UserProfile
          user={user}
          onProfileComplete={handleProfileComplete}
        />
      )}

      {/* ✅ Track Orders Modal */}
      <TrackOrders
        isOpen={showTrackOrders}
        onClose={() => setShowTrackOrders(false)}
      />
    </div>
  );
}

export default App;
