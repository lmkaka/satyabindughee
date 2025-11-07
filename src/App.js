import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Home from './pages/Home';
import AboutUs from './pages/AboutUs';
import AdminPanel from './components/AdminPanel';
import ContactUs from './pages/ContactUs';
import './index.css';
import ScrollToTop from './components/ScrollToTop'; // ✅ ADD THIS IMPORT
function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <Router>
      <ScrollToTop /> {/* ✅ Add this INSIDE Router but BEFORE Routes */}
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50">
        <Navbar onMenuClick={() => setIsSidebarOpen(true)} />
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        
        <motion.main
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<AboutUs />} />
            <Route path="/contact" element={<ContactUs />} />
            <Route path="/adminhu" element={<AdminPanel />} />
          </Routes>
        </motion.main>
      </div>
    </Router>
  );
}

export default App;
