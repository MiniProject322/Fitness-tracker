import React, { useMemo } from 'react';
import { UserProfile, AppEntry } from '../types';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Scale, Droplets, Flame, TrendingUp, Dumbbell, Book, Quote } from 'lucide-react';

interface DashboardProps {
  user: UserProfile;
  entries: AppEntry[];
  onQuickLog: (type: string) => void;
}

const DAILY_QUOTES = [
  "The only bad workout is the one that didn't happen.",
  "Take care of your body. It’s the only place you have to live.",
  "Success starts with self-discipline.",
  "Don’t count the days, make the days count.",
  "Pain is weakness leaving the body.",
  "Your body can stand almost anything. It’s your mind that you have to convince.",
  "Fitness is not about being better than someone else. It’s about being better than you were yesterday.",
  "Motivation is what gets you started. Habit is what keeps you going.",
  "A one hour workout is only 4% of your day. No excuses.",
  "Sweat is just fat crying.",
  "Discipline is doing what needs to be done, even if you don't want to do it.",
  "You don't have to be extreme, just consistent.",
  "Strength does not come from physical capacity. It comes from an indomitable will.",
  "Train insane or remain the same.",
  "If it doesn't challenge you, it doesn't change you.",
  "Action is the foundational key to all success.",
  "Believe you can and you're halfway there."
];

export const Dashboard: React.FC<DashboardProps> = ({ user, entries, onQuickLog }) => {
  // Calculate specific metrics
  const today = new Date().toISOString().split('T')[0];
  
  const todaysEntries = entries.filter(e => e.timestamp.startsWith(today));
  
  const waterIntake = todaysEntries
    .filter(e => e.type === 'hydration')
    .reduce((acc, curr: any) => acc + curr.amountMl, 0);
  
  const caloriesBurned = todaysEntries
    .filter(e => e.type === 'workout')
    .reduce((acc, curr: any) => acc + curr.caloriesBurned, 0);

  const weightData = entries
    .filter(e => e.type === 'biometrics')
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
    .map((e: any) => ({
      date: new Date(e.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      weight: e.weight
    }))
    .slice(-7); // Last 7 entries

  const getBMI = () => {
    if (!user.weight || !user.height) return 0;
    const h = user.height / 100;
    return (user.weight / (h * h)).toFixed(1);
  };

  // Memoize the quote so it doesn't change on re-renders, only on day change
  const dailyThought = useMemo(() => {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const diff = now.getTime() - start.getTime();
    const oneDay = 1000 * 60 * 60 * 24;
    const dayOfYear = Math.floor(diff / oneDay);
    return DAILY_QUOTES[dayOfYear % DAILY_QUOTES.length];
  }, [today]); // Recalculate if 'today' changes (though today string is stable for the day)

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Hero Section */}
      <div className="relative rounded-2xl overflow-hidden bg-slate-800 border border-slate-700 p-8 shadow-xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500 rounded-full blur-[100px] opacity-10"></div>
        <div className="relative z-10">
          <h2 className="text-3xl font-bold text-white mb-6">Welcome back, {user.username}.</h2>
          
          {/* Daily Thought Card */}
          <div className="mb-6 p-5 bg-dark-950/40 rounded-xl border-l-4 border-primary-500 backdrop-blur-sm">
            <div className="flex items-start gap-3">
              <Quote className="text-primary-500 shrink-0 opacity-50" size={20} />
              <div>
                <p className="text-xs font-bold text-primary-400 uppercase tracking-wider mb-1">Thought for the day</p>
                <p className="text-slate-200 italic font-medium text-lg leading-relaxed">"{dailyThought}"</p>
              </div>
            </div>
          </div>

          <p className="text-slate-400 max-w-lg flex items-center gap-2">
            You've burned <span className="text-primary-500 font-bold bg-primary-500/10 px-2 py-0.5 rounded text-lg">{caloriesBurned} kcal</span> today. Keep the streak alive.
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Current Weight" 
          value={`${user.weight || '--'} kg`} 
          subtitle={`BMI: ${getBMI()}`} 
          icon={Scale} 
          color="text-blue-400" 
          bg="bg-blue-400/10"
        />
        <StatCard 
          title="Hydration" 
          value={`${waterIntake} ml`} 
          subtitle="Target: 2500 ml" 
          icon={Droplets} 
          color="text-cyan-400" 
          bg="bg-cyan-400/10"
        />
        <StatCard 
          title="Calories Burned" 
          value={`${caloriesBurned}`} 
          subtitle="Today's Active Energy" 
          icon={Flame} 
          color="text-orange-400" 
          bg="bg-orange-400/10"
        />
        <StatCard 
          title="Activity Level" 
          value={user.activityLevel?.toUpperCase() || 'SET UP'} 
          subtitle={user.goal?.toUpperCase() || 'NO GOAL'} 
          icon={TrendingUp} 
          color="text-primary-500" 
          bg="bg-primary-500/10"
        />
      </div>

      {/* Charts & Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Chart */}
        <div className="lg:col-span-2 bg-dark-900 border border-slate-800 rounded-2xl p-6 shadow-lg">
          <h3 className="text-lg font-bold text-white mb-6">Weight Progression</h3>
          <div className="h-64 w-full">
            {weightData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={weightData}>
                  <defs>
                    <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#84cc16" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#84cc16" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                  <XAxis dataKey="date" stroke="#94a3b8" tick={{fontSize: 12}} />
                  <YAxis domain={['dataMin - 2', 'dataMax + 2']} stroke="#94a3b8" tick={{fontSize: 12}} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Area type="monotone" dataKey="weight" stroke="#84cc16" strokeWidth={3} fillOpacity={1} fill="url(#colorWeight)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-500">
                Not enough data yet. Log your weight to see trends.
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-dark-900 border border-slate-800 rounded-2xl p-6 flex flex-col shadow-lg">
          <h3 className="text-lg font-bold text-white mb-6">Quick Actions</h3>
          <div className="space-y-3 flex-1">
            <button onClick={() => onQuickLog('workout')} className="w-full p-4 rounded-xl bg-slate-800 hover:bg-slate-700 flex items-center justify-between group transition-colors border border-slate-700/50 hover:border-slate-600">
              <span className="font-medium text-slate-200">Log Workout</span>
              <Dumbbell size={20} className="text-primary-500 group-hover:scale-110 transition-transform" />
            </button>
            <button onClick={() => onQuickLog('hydration')} className="w-full p-4 rounded-xl bg-slate-800 hover:bg-slate-700 flex items-center justify-between group transition-colors border border-slate-700/50 hover:border-slate-600">
              <span className="font-medium text-slate-200">Log Water (250ml)</span>
              <Droplets size={20} className="text-cyan-400 group-hover:scale-110 transition-transform" />
            </button>
             <button onClick={() => onQuickLog('journal')} className="w-full p-4 rounded-xl bg-slate-800 hover:bg-slate-700 flex items-center justify-between group transition-colors border border-slate-700/50 hover:border-slate-600">
              <span className="font-medium text-slate-200">Write Journal</span>
              <Book size={20} className="text-purple-400 group-hover:scale-110 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, subtitle, icon: Icon, color, bg }: any) => (
  <div className="bg-dark-900 border border-slate-800 rounded-2xl p-6 hover:border-slate-600 transition-colors shadow-lg">
    <div className="flex justify-between items-start mb-4">
      <div className={`p-3 rounded-lg ${bg}`}>
        <Icon className={color} size={24} />
      </div>
    </div>
    <div className="space-y-1">
      <h4 className="text-slate-400 text-sm font-medium">{title}</h4>
      <p className="text-2xl font-bold text-white tracking-tight">{value}</p>
      <p className="text-xs text-slate-500">{subtitle}</p>
    </div>
  </div>
);