
import React from 'react';
import { Home, LogOut } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { api } from '@/lib/api';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const Logo = () => (
  <div className="flex items-center">
    <div className="bg-cpost-red p-1.5 rounded-md mr-2">
      <svg width="24" height="17" viewBox="0 0 350 280" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M312 0L225 87L175 37L125 87L38 0H0V38L87 125L0 212V250H38L125 163L175 213L225 163L312 250H350V212L263 125L350 38V0H312Z" fill="white"/>
      </svg>
    </div>
    <span className="text-xl font-bold">CPost</span>
  </div>
);

const signOut = () => {
  api.logout().catch(() => {});
};

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const location = useLocation();

  const navigation = [
    { name: 'Home', path: '/dashboard', icon: Home }
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar (large screens) */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 bg-white border-r shadow-sm">
        <div className="p-4 border-b">
          <Logo />
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navigation.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className={`
                flex items-center px-4 py-3 text-sm rounded-lg transition-colors
                ${isActive(item.path)
                  ? 'bg-cpost-blue/10 text-cpost-blue font-medium'
                  : 'text-gray-700 hover:bg-gray-100'}
              `}
            >
              <item.icon className={`h-5 w-5 mr-3 ${isActive(item.path) ? 'text-cpost-blue' : 'text-gray-500'}`} />
              {item.name}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t">
          <Link
            to="/signin"
            onClick={signOut}
            className="flex items-center px-4 py-3 text-sm rounded-lg text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut className="h-5 w-5 mr-3" />
            Sign Out
          </Link>
        </div>
      </aside>

      <div className="flex flex-col flex-1 min-w-0">
        {/* Top header (phones and tablets) */}
        <header className="lg:hidden bg-white border-b px-4 py-3">
          <div className="flex items-center justify-between">
            <Logo />
            <Link
              to="/signin"
              onClick={signOut}
              className="flex items-center px-3 py-2 text-sm rounded-lg text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Link>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="max-w-4xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
