
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';

const Navbar = () => {
  const { user } = useAuth();
  const location = useLocation();
  
  // Don't show navbar on customer order page
  if (location.pathname.includes('/stall/')) {
    return null;
  }
  
  // Show authenticated navigation
  if (user) {
    return (
      <header className="fixed top-0 left-0 right-0 h-16 md:h-20 bg-white border-b z-50 px-4">
        <div className="container mx-auto h-full flex items-center justify-between">
          <Link to="/hawker/dashboard" className="flex items-center">
            <span className="font-bold text-xl">HawkerGo</span>
          </Link>
        </div>
      </header>
    );
  }

  return (
    <header className="fixed top-0 left-0 right-0 h-16 md:h-20 bg-white border-b z-50 px-4">
      <div className="container mx-auto h-full flex items-center justify-between">
        <Link to="/" className="flex items-center">
          <span className="font-bold text-xl">HawkerGo</span>
        </Link>
        
        <div className="flex items-center space-x-4">
          <Link to="/hawker/login">
            <Button variant="outline" size="sm">
              Log in
            </Button>
          </Link>
          <Link to="/hawker/register">
            <Button size="sm">
              Get Started
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
