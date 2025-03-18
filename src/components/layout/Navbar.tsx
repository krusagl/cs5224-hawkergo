
import React, { useState, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Menu, X, ChevronDown, User, LogOut } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white/90 backdrop-blur-sm shadow-sm' : 'bg-transparent'
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          <NavLink to="/" className="flex items-center space-x-2">
            <span className="text-xl font-bold text-primary">HawkerGo</span>
          </NavLink>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <NavLink
              to="/"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                isActive('/') ? 'text-primary' : 'text-foreground/80'
              }`}
            >
              Home
            </NavLink>
            <NavLink
              to="/about"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                isActive('/about') ? 'text-primary' : 'text-foreground/80'
              }`}
            >
              About
            </NavLink>
            <NavLink
              to="/pricing"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                isActive('/pricing') ? 'text-primary' : 'text-foreground/80'
              }`}
            >
              Pricing
            </NavLink>
            <NavLink
              to="/contact"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                isActive('/contact') ? 'text-primary' : 'text-foreground/80'
              }`}
            >
              Contact
            </NavLink>
          </nav>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="px-2">
                    <User className="h-4 w-4 mr-2" />
                    {user.name}
                    <ChevronDown className="h-4 w-4 ml-1" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem onClick={() => navigate('/hawker/dashboard')}>
                    Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/hawker/profile')}>
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button
                  variant="ghost"
                  onClick={() => navigate('/hawker/login')}
                  className="text-sm font-medium"
                >
                  Login
                </Button>
                <Button
                  onClick={() => navigate('/hawker/register')}
                  className="text-sm font-medium"
                >
                  Register
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Menu"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-sm shadow-md">
          <div className="pt-2 pb-4 space-y-1 px-4">
            <NavLink
              to="/"
              className={`block py-2 px-3 rounded-md ${
                isActive('/') ? 'bg-primary/10 text-primary' : 'hover:bg-primary/5'
              }`}
            >
              Home
            </NavLink>
            <NavLink
              to="/about"
              className={`block py-2 px-3 rounded-md ${
                isActive('/about') ? 'bg-primary/10 text-primary' : 'hover:bg-primary/5'
              }`}
            >
              About
            </NavLink>
            <NavLink
              to="/pricing"
              className={`block py-2 px-3 rounded-md ${
                isActive('/pricing') ? 'bg-primary/10 text-primary' : 'hover:bg-primary/5'
              }`}
            >
              Pricing
            </NavLink>
            <NavLink
              to="/contact"
              className={`block py-2 px-3 rounded-md ${
                isActive('/contact') ? 'bg-primary/10 text-primary' : 'hover:bg-primary/5'
              }`}
            >
              Contact
            </NavLink>
            
            {/* Mobile Auth */}
            <div className="pt-4 border-t border-gray-200">
              {user ? (
                <>
                  <div className="flex items-center px-3 py-2 text-sm font-medium">
                    <User className="h-4 w-4 mr-2" />
                    {user.name}
                  </div>
                  <NavLink
                    to="/hawker/dashboard"
                    className="block py-2 px-3 rounded-md hover:bg-primary/5"
                  >
                    Dashboard
                  </NavLink>
                  <NavLink
                    to="/hawker/profile"
                    className="block py-2 px-3 rounded-md hover:bg-primary/5"
                  >
                    Profile
                  </NavLink>
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full text-left py-2 px-3 rounded-md hover:bg-primary/5"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </button>
                </>
              ) : (
                <div className="flex flex-col space-y-2">
                  <Button
                    variant="outline"
                    onClick={() => navigate('/hawker/login')}
                    className="w-full"
                  >
                    Login
                  </Button>
                  <Button
                    onClick={() => navigate('/hawker/register')}
                    className="w-full"
                  >
                    Register
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
