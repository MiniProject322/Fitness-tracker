import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { Auth } from './components/Auth';
import { Onboarding } from './components/Onboarding';
import { Dashboard } from './components/Dashboard';
import { Workouts } from './components/Workouts';
import { Tools } from './components/Tools';
import { ProfileSettings } from './components/ProfileSettings';
import { StorageService } from './services/storage';
import { UserProfile, AppEntry } from './types';
import { Book, Calendar, PenTool, Save, CheckCircle, Trash2 } from 'lucide-react';

function App() {
  const [auth, setAuth] = useState(StorageService.getAuth());
  const [currentView, setCurrentView] = useState('dashboard');
  const [entries, setEntries] = useState<AppEntry[]>([]);

  // Journal State
  const [journalTitle, setJournalTitle] = useState('');
  const [journalContent, setJournalContent] = useState('');
  const [journalSaved, setJournalSaved] = useState(false);

  // Load entries when user changes
  useEffect(() => {
    if (auth.user) {
      const data = StorageService.getEntries(auth.user.username);
      setEntries(data);
    }
  }, [auth.user]);

  const handleLogin = (user: UserProfile) => {
    const newAuth = { isAuthenticated: true, user };
    StorageService.saveAuth(newAuth);
    setAuth(newAuth);
  };

  const handleLogout = () => {
    StorageService.clearAuth();
    setAuth({ isAuthenticated: false, user: null });
  };

  const handleUpdateProfile = (updatedUser: UserProfile) => {
    const newAuth = { ...auth, user: updatedUser };
    
    // Update both session and persistent registry
    StorageService.saveAuth(newAuth);
    StorageService.updateUser(updatedUser);
    
    setAuth(newAuth);
    
    // Also log weight change if weight is different
    if (auth.user && updatedUser.weight && auth.user.weight !== updatedUser.weight) {
      const weightEntry: any = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        type: 'biometrics',
        weight: updatedUser.weight,
        bmi: updatedUser.height ? (updatedUser.weight / Math.pow(updatedUser.height/100, 2)).toFixed(1) : 0
      };
      handleSaveEntry(weightEntry);
    }
  };

  const handleOnboardingComplete = (updatedUser: UserProfile) => {
      const newAuth = { ...auth, user: updatedUser };
      
      // Update both session and persistent registry
      StorageService.saveAuth(newAuth);
      StorageService.updateUser(updatedUser);
      
      setAuth(newAuth);
      
      // Save initial weight entry
      if (updatedUser.weight) {
        const weightEntry: any = {
            id: Date.now().toString(),
            timestamp: new Date().toISOString(),
            type: 'biometrics',
            weight: updatedUser.weight,
            bmi: updatedUser.height ? (updatedUser.weight / Math.pow(updatedUser.height/100, 2)).toFixed(1) : 0
        };
        const updatedEntries = StorageService.saveEntry(updatedUser.username, weightEntry);
        setEntries(updatedEntries);
      }
  };

  const handleSaveEntry = (entry: AppEntry) => {
    if (!auth.user) return;
    const updatedEntries = StorageService.saveEntry(auth.user.username, entry);
    setEntries(updatedEntries);
  };

  const handleQuickLog = (type: string) => {
    if (type === 'workout') setCurrentView('workouts');
    if (type === 'hydration') {
      const entry: AppEntry = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        type: 'hydration',
        amountMl: 250 // Default quick log amount
      };
      handleSaveEntry(entry);
    }
    if (type === 'journal') setCurrentView('journal');
  };

  // Specific handler for Journal to manage form state
  const handleSaveJournal = () => {
    if (!journalTitle.trim() || !journalContent.trim()) return;
    
    const entry: any = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      type: 'journal',
      title: journalTitle,
      content: journalContent
    };
    
    handleSaveEntry(entry);
    setJournalSaved(true);
    setJournalTitle('');
    setJournalContent('');
    
    setTimeout(() => setJournalSaved(false), 2000);
  };

  const handleDeleteEntry = (timestamp: string) => {
    // This is a simplified delete (filter from state + update storage)
    if (!auth.user) return;
    const newEntries = entries.filter(e => e.timestamp !== timestamp);
    setEntries(newEntries);
    localStorage.setItem(`ironpulse_entries_${auth.user.username}`, JSON.stringify(newEntries));
  };

  if (!auth.isAuthenticated || !auth.user) {
    return <Auth onLogin={handleLogin} />;
  }

  // Intercept user if onboarding is not complete
  if (!auth.user.onboardingCompleted) {
    return <Onboarding user={auth.user} onComplete={handleOnboardingComplete} />;
  }

  return (
    <Layout 
      user={auth.user} 
      currentView={currentView} 
      onNavigate={setCurrentView}
      onLogout={handleLogout}
    >
      {currentView === 'dashboard' && (
        <Dashboard 
          user={auth.user} 
          entries={entries}
          onQuickLog={handleQuickLog}
        />
      )}
      
      {currentView === 'workouts' && (
        <Workouts 
          userWeight={auth.user.weight} 
          onSave={handleSaveEntry}
        />
      )}

      {currentView === 'nutrition' && (
        <Tools 
          type="nutrition" 
          user={auth.user} 
          onSave={handleSaveEntry} 
        />
      )}

      {currentView === 'sleep' && (
        <Tools 
          type="sleep" 
          user={auth.user} 
          onSave={handleSaveEntry} 
        />
      )}

      {currentView === 'hydration' && (
        <Tools 
          type="hydration" 
          user={auth.user} 
          onSave={handleSaveEntry} 
        />
      )}

      {currentView === 'profile' && (
        <ProfileSettings 
          user={auth.user} 
          entries={entries}
          onUpdate={handleUpdateProfile} 
        />
      )}

      {currentView === 'journal' && (
        <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-20 md:pb-0">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-indigo-500/10 rounded-lg">
              <Book className="text-indigo-400" size={32} />
            </div>
            <div>
               <h2 className="text-2xl font-bold text-white">Training Journal</h2>
               <p className="text-slate-400">Reflect on your progress and mental state.</p>
            </div>
          </div>
          
          <div className="bg-dark-900 p-6 rounded-2xl border border-slate-800 shadow-lg">
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-400 mb-2">Title</label>
              <div className="relative">
                <PenTool className="absolute left-3 top-3.5 text-slate-500" size={18} />
                <input 
                  type="text" 
                  value={journalTitle}
                  onChange={(e) => setJournalTitle(e.target.value)}
                  placeholder="e.g. Leg Day Breakthrough"
                  className="w-full bg-dark-950 text-slate-200 pl-10 pr-4 py-3 rounded-xl border border-slate-800 focus:border-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-400 mb-2">Entry</label>
              <textarea 
                value={journalContent}
                onChange={(e) => setJournalContent(e.target.value)}
                className="w-full bg-dark-950 text-slate-200 p-4 rounded-xl border border-slate-800 focus:border-indigo-500 focus:outline-none min-h-[150px] resize-y"
                placeholder="How was your workout today? How do you feel? Any PBs?"
              ></textarea>
            </div>
            
            <div className="flex justify-end">
              <button 
                onClick={handleSaveJournal}
                disabled={!journalTitle || !journalContent || journalSaved}
                className={`px-8 py-3 rounded-xl font-bold flex items-center gap-2 transition-all ${
                  journalSaved 
                    ? 'bg-green-500 text-white cursor-default' 
                    : (!journalTitle || !journalContent)
                      ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-900/20 active:scale-95'
                }`}
              >
                {journalSaved ? (
                  <>
                    <CheckCircle size={20} />
                    <span>Entry Saved</span>
                  </>
                ) : (
                  <>
                    <Save size={20} />
                    <span>Save Entry</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-200 flex items-center gap-2">
              <Calendar size={20} />
              Previous Entries
            </h3>
            
            <div className="space-y-4">
              {entries.filter(e => e.type === 'journal').length === 0 ? (
                <div className="text-center py-12 bg-dark-900/50 rounded-2xl border border-slate-800 border-dashed">
                  <Book className="mx-auto text-slate-600 mb-3" size={48} />
                  <p className="text-slate-500">No journal entries yet. Start writing your story.</p>
                </div>
              ) : (
                entries
                  .filter(e => e.type === 'journal')
                  .map((entry: any) => (
                    <div key={entry.id} className="bg-dark-900 p-6 rounded-2xl border border-slate-800 hover:border-indigo-500/50 transition-colors group">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="text-xl font-bold text-white">{entry.title}</h4>
                          <p className="text-xs text-indigo-400 font-mono mt-1">
                            {new Date(entry.timestamp).toLocaleDateString(undefined, {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                        <button 
                          onClick={() => handleDeleteEntry(entry.timestamp)}
                          className="text-slate-600 hover:text-red-400 transition-colors p-2 rounded-lg hover:bg-red-500/10 opacity-0 group-hover:opacity-100"
                          title="Delete Entry"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                      <p className="text-slate-300 whitespace-pre-line leading-relaxed">
                        {entry.content}
                      </p>
                    </div>
                  ))
              )}
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}

export default App;