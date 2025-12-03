import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Dumbbell, 
  Utensils, 
  Moon, 
  Droplets, 
  Book, 
  LogOut, 
  Menu, 
  X,
  Activity,
  UserCog
} from 'lucide-react';
import { UserProfile } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  user: UserProfile | null;
  currentView: string;
  onNavigate: (view: string) => void;
  onLogout: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, user, currentView, onNavigate, onLogout }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'workouts', label: 'Workouts', icon: Dumbbell },
    { id: 'nutrition', label: 'Nutrition', icon: Utensils },
    { id: 'sleep', label: 'Sleep & Recovery', icon: Moon },
    { id: 'hydration', label: 'Hydration', icon: Droplets },
    { id: 'journal', label: 'Journal', icon: Book },
    { id: 'profile', label: 'Profile', icon: UserCog },
  ];

  return (
    <div className="flex h-screen bg-dark-950 text-slate-200 overflow-hidden">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-dark-900 border-r border-slate-800">
        <div className="p-6 flex items-center space-x-2 border-b border-slate-800">
          <Activity className="w-8 h-8 text-primary-500 flex-shrink-0" />
          <h1 className="text-lg font-bold tracking-tight text-white leading-tight">
            Personal <span className="text-primary-500">Fitness Tracker</span>
          </h1>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                currentView === item.id 
                  ? 'bg-primary-500/10 text-primary-500 border-r-2 border-primary-500' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <item.icon size={20} />
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center space-x-3 mb-4 px-2">
            <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-lg font-bold text-white">
              {user?.username.charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium text-white truncate">{user?.username}</p>
              <p className="text-xs text-slate-500 truncate">{user?.goal || 'Athlete'}</p>
            </div>
          </div>
          <button 
            onClick={onLogout}
            className="w-full flex items-center justify-center space-x-2 bg-slate-800 hover:bg-red-500/20 hover:text-red-400 text-slate-400 py-2 rounded-lg transition-colors"
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Mobile Header & Overlay */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        <header className="md:hidden flex items-center justify-between p-4 bg-dark-900 border-b border-slate-800 z-20">
          <div className="flex items-center space-x-2">
            <Activity className="w-6 h-6 text-primary-500" />
            <span className="text-lg font-bold text-white">Personal Fitness Tracker</span>
          </div>
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-white">
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </header>

        {mobileMenuOpen && (
          <div className="md:hidden absolute inset-0 bg-dark-950/95 z-10 p-4 pt-20 flex flex-col space-y-4">
             {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center space-x-4 px-4 py-4 rounded-xl text-lg ${
                  currentView === item.id 
                    ? 'bg-primary-500 text-dark-950 font-bold' 
                    : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <item.icon size={24} />
                <span>{item.label}</span>
              </button>
            ))}
            <button 
              onClick={onLogout}
              className="mt-auto w-full flex items-center space-x-4 px-4 py-4 rounded-xl text-lg text-red-400 hover:bg-red-900/20"
            >
              <LogOut size={24} />
              <span>Sign Out</span>
            </button>
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 relative">
           {children}
        </main>
      </div>
    </div>
  );
};