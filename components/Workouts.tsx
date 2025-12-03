import React, { useState } from 'react';
import { EXERCISE_METS, AppEntry } from '../types';
import { Dumbbell, Timer, Flame, CheckCircle } from 'lucide-react';

interface WorkoutsProps {
  onSave: (entry: AppEntry) => void;
  userWeight?: number;
}

export const Workouts: React.FC<WorkoutsProps> = ({ onSave, userWeight = 75 }) => {
  const [selectedType, setSelectedType] = useState<string>('running');
  const [duration, setDuration] = useState<number>(30);
  const [saved, setSaved] = useState(false);

  const calculateCalories = () => {
    const met = EXERCISE_METS[selectedType] || 1;
    return Math.round(met * userWeight * (duration / 60));
  };

  const handleSave = () => {
    const entry: any = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      type: 'workout',
      exerciseType: selectedType,
      duration: duration,
      caloriesBurned: calculateCalories(),
    };
    onSave(entry);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
      {/* Left Column: Form */}
      <div className="lg:col-span-1 space-y-6">
        <div className="bg-dark-900 border border-slate-800 rounded-2xl p-6">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <Dumbbell className="text-primary-500" />
            Track Session
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-slate-400 text-sm font-medium mb-2">Exercise Type</label>
              <select 
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full bg-dark-950 border border-slate-800 rounded-lg p-3 text-white focus:outline-none focus:border-primary-500 capitalize"
              >
                {Object.keys(EXERCISE_METS).map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-400 text-sm font-medium mb-2">Duration (Minutes)</label>
              <div className="flex items-center space-x-4">
                <input 
                  type="range" 
                  min="5" 
                  max="180" 
                  step="5"
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-primary-500"
                />
                <span className="text-white font-mono min-w-[3ch]">{duration}</span>
              </div>
            </div>

            <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700 flex justify-between items-center">
              <div>
                <p className="text-slate-400 text-xs uppercase tracking-wider">Estimated Burn</p>
                <p className="text-2xl font-bold text-primary-400">{calculateCalories()} <span className="text-sm text-slate-500">kcal</span></p>
              </div>
              <Flame className="text-orange-500" size={24} />
            </div>

            <button 
              onClick={handleSave}
              className={`w-full py-3 rounded-lg font-bold flex items-center justify-center space-x-2 transition-all ${
                saved 
                  ? 'bg-green-500 text-white' 
                  : 'bg-primary-600 hover:bg-primary-500 text-white'
              }`}
            >
              {saved ? (
                <>
                  <CheckCircle size={20} />
                  <span>Session Logged</span>
                </>
              ) : (
                <span>Save Workout</span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Right Column: Visuals & Info */}
      <div className="lg:col-span-2 space-y-6">
        <div className="relative h-64 md:h-80 rounded-2xl overflow-hidden group">
          <img 
            src={`https://picsum.photos/800/600?grayscale&blur=2&random=${selectedType.length}`}
            alt="Workout Motivation" 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-dark-900 via-dark-900/40 to-transparent flex items-end p-8">
             <div>
                <h3 className="text-3xl font-bold text-white capitalize mb-2">{selectedType}</h3>
                <p className="text-slate-300 max-w-xl">
                  {selectedType === 'running' && "Run the mile you're in. Endurance builds character."}
                  {selectedType === 'boxing' && "It's not about how hard you hit. It's about how hard you can get hit and keep moving forward."}
                  {selectedType === 'yoga' && "Quiet the mind, and the soul will speak."}
                  {selectedType === 'weightlifting' && "The only person you need to be better than is the person you were yesterday."}
                  {!['running','boxing','yoga','weightlifting'].includes(selectedType) && "Push your limits. Break your barriers."}
                </p>
             </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-dark-900 border border-slate-800 p-6 rounded-2xl">
            <h4 className="text-white font-bold mb-2 flex items-center gap-2">
              <Timer className="text-blue-400" size={18} />
              Recommended Routine
            </h4>
            <ul className="text-slate-400 text-sm space-y-2 list-disc list-inside">
              <li>Warm up for 5-10 minutes.</li>
              <li>Maintain consistent form.</li>
              <li>Hydrate between sets.</li>
              <li>Cool down and stretch.</li>
            </ul>
          </div>
          <div className="bg-dark-900 border border-slate-800 p-6 rounded-2xl">
             <h4 className="text-white font-bold mb-2">Pro Tip</h4>
             <p className="text-slate-400 text-sm">
               Consistency beats intensity. It's better to do a 20-minute workout 5 times a week than a 2-hour workout once.
             </p>
          </div>
        </div>
      </div>
    </div>
  );
};