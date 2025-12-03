import React, { useState } from 'react';
import { UserProfile } from '../types';
import { StorageService } from '../services/storage';
import { Activity, ArrowRight, User, Lock, Mail, AlertCircle } from 'lucide-react';

interface AuthProps {
  onLogin: (user: UserProfile) => void;
}

export const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    email: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (isLogin) {
      // Handle Login
      const user = StorageService.loginUser(formData.username, formData.password);
      if (user) {
        onLogin(user);
      } else {
        setError("Invalid username or password. If you haven't signed up yet, please create an account.");
      }
    } else {
      // Handle Signup
      if (!formData.email) {
        setError("Email is required.");
        return;
      }

      const newUser: UserProfile = {
        username: formData.username,
        email: formData.email,
        joinedAt: new Date().toISOString(),
        onboardingCompleted: false,
        activityLevel: 'moderate',
        goal: 'fitness',
      };

      const success = StorageService.registerUser(newUser, formData.password);
      if (success) {
        onLogin(newUser);
      } else {
        setError("Username is already taken. Please choose another.");
      }
    }
  };

  return (
    <div className="min-h-screen bg-dark-950 flex items-center justify-center p-4 animate-fade-in">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <div className="flex justify-center mb-4">
            <div className="bg-primary-500/10 p-4 rounded-full">
              <Activity className="w-12 h-12 text-primary-500" />
            </div>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight mb-2">Personal Fitness Tracker</h1>
          <p className="text-slate-400">Forging elite fitness, one rep at a time.</p>
        </div>

        <div className="bg-dark-900 border border-slate-800 rounded-2xl p-8 shadow-2xl">
          <h2 className="text-xl font-bold text-white mb-6 text-center">
            {isLogin ? 'Member Login' : 'Create Account'}
          </h2>
          
          {error && (
            <div className="mb-6 bg-red-500/10 border border-red-500/50 rounded-lg p-3 flex items-start gap-3">
              <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={18} />
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <User className="absolute left-3 top-3.5 text-slate-500" size={18} />
              <input 
                type="text" 
                placeholder="Username" 
                className="w-full bg-dark-950 border border-slate-800 rounded-lg py-3 pl-10 text-white placeholder:text-slate-600 focus:outline-none focus:border-primary-500 transition-colors"
                value={formData.username}
                onChange={(e) => setFormData({...formData, username: e.target.value})}
                required
              />
            </div>
            
            {!isLogin && (
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 text-slate-500" size={18} />
                <input 
                  type="email" 
                  placeholder="Email Address" 
                  className="w-full bg-dark-950 border border-slate-800 rounded-lg py-3 pl-10 text-white placeholder:text-slate-600 focus:outline-none focus:border-primary-500 transition-colors"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required
                />
              </div>
            )}

            <div className="relative">
              <Lock className="absolute left-3 top-3.5 text-slate-500" size={18} />
              <input 
                type="password" 
                placeholder="Password" 
                className="w-full bg-dark-950 border border-slate-800 rounded-lg py-3 pl-10 text-white placeholder:text-slate-600 focus:outline-none focus:border-primary-500 transition-colors"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                required
              />
            </div>

            <button 
              type="submit" 
              className="w-full bg-primary-600 hover:bg-primary-500 text-white font-bold py-3 rounded-lg flex items-center justify-center space-x-2 transition-all transform hover:scale-[1.02]"
            >
              <span>{isLogin ? 'Enter Gym' : 'Start Journey'}</span>
              <ArrowRight size={18} />
            </button>
          </form>

          <div className="mt-6 text-center">
            <button 
              onClick={() => {
                setIsLogin(!isLogin);
                setError(null);
                setFormData({ username: '', password: '', email: '' });
              }}
              className="text-sm text-slate-400 hover:text-white transition-colors"
            >
              {isLogin ? "New here? Create an account" : "Already a member? Login"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};