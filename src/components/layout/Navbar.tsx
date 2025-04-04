import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import {
  LayoutDashboard,
  Utensils,
  Settings,
  LogOut,
  Menu as MenuIcon,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  // Don't show navbar on customer order page
  if (location.pathname.includes("/stall/")) {
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

          <nav className="hidden md:flex items-center space-x-4">
            <Link to="/hawker/dashboard">
              <Button variant="ghost" size="sm">
                <LayoutDashboard className="h-4 w-4 mr-2" />
                Dashboard
              </Button>
            </Link>
            <Link to="/hawker/menu">
              <Button variant="ghost" size="sm">
                <Utensils className="h-4 w-4 mr-2" />
                Menu
              </Button>
            </Link>
            <Link to="/hawker/settings">
              <Button variant="ghost" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </Link>
          </nav>

          <div className="md:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MenuIcon className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Menu</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/hawker/dashboard">
                    <LayoutDashboard className="h-4 w-4 mr-2" />
                    Dashboard
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/hawker/menu">
                    <Utensils className="h-4 w-4 mr-2" />
                    Menu
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/hawker/settings">
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
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
          <Link to="/hawker/login">
            <Button size="sm">Get Started</Button>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
