import React, { useState } from 'react';
import { Droplets, Moon, Utensils, Plus, Info, CheckCircle, Clock, Activity, Battery } from 'lucide-react';
import { AppEntry, UserProfile } from '../types';

interface ToolsProps {
  type: 'hydration' | 'sleep' | 'nutrition';
  onSave: (entry: AppEntry) => void;
  user: UserProfile;
}

export const Tools: React.FC<ToolsProps> = ({ type, onSave, user }) => {
  return (
    <div className="max-w-4xl mx-auto animate-fade-in pb-20 md:pb-0">
      {type === 'hydration' && <HydrationTool onSave={onSave} />}
      {type === 'sleep' && <SleepTool onSave={onSave} />}
      {type === 'nutrition' && <NutritionTool goal={user.goal || 'maintain'} />}
    </div>
  );
};

const HydrationTool = ({ onSave }: { onSave: (e: any) => void }) => {
  const [amount, setAmount] = useState(250);
  const [isSaved, setIsSaved] = useState(false);
  
  const handleAdd = () => {
    onSave({
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      type: 'hydration',
      amountMl: amount
    });
    
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className="grid md:grid-cols-2 gap-8 items-center">
      <div className="bg-dark-900 p-8 rounded-2xl border border-slate-800 text-center shadow-lg">
        <div className="w-32 h-32 bg-cyan-900/30 rounded-full flex items-center justify-center mx-auto mb-6 relative overflow-hidden group">
          <div className="absolute bottom-0 left-0 right-0 bg-cyan-500/20 h-1/2 animate-pulse group-hover:h-3/4 transition-all duration-500"></div>
          <Droplets className="text-cyan-400 w-12 h-12 relative z-10" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Hydration Log</h2>
        <p className="text-slate-400 mb-6">Stay fluid. Performance drops 10% with just 2% dehydration.</p>
        
        <div className="flex items-center justify-center space-x-4 mb-6">
          <button 
            onClick={() => setAmount(Math.max(50, amount - 50))} 
            className="w-10 h-10 flex items-center justify-center bg-slate-800 rounded-lg text-white hover:bg-slate-700 active:scale-95 transition-all"
          >
            -
          </button>
          <div className="text-3xl font-mono font-bold text-cyan-400 w-32">{amount}ml</div>
          <button 
            onClick={() => setAmount(amount + 50)} 
            className="w-10 h-10 flex items-center justify-center bg-slate-800 rounded-lg text-white hover:bg-slate-700 active:scale-95 transition-all"
          >
            +
          </button>
        </div>

        <button 
          onClick={handleAdd} 
          disabled={isSaved}
          className={`w-full font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 transform active:scale-[0.98] ${
            isSaved 
              ? 'bg-green-500 text-white cursor-default' 
              : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg shadow-cyan-900/20'
          }`}
        >
          {isSaved ? (
            <>
              <CheckCircle size={20} />
              <span>Logged!</span>
            </>
          ) : (
            <>
              <Plus size={20} />
              <span>Add Water</span>
            </>
          )}
        </button>
      </div>
      
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-white">Why it matters</h3>
        <div className="bg-slate-800/50 p-4 rounded-xl border-l-4 border-cyan-500">
          <h4 className="font-bold text-slate-200">Muscle Function</h4>
          <p className="text-sm text-slate-400 mt-1">Water is essential for transporting nutrients to give you energy and keep you healthy.</p>
        </div>
        <div className="bg-slate-800/50 p-4 rounded-xl border-l-4 border-cyan-500">
          <h4 className="font-bold text-slate-200">Temperature Control</h4>
          <p className="text-sm text-slate-400 mt-1">Allows the body to release heat when ambient temperature is higher than body temperature.</p>
        </div>
        <div className="bg-slate-800/50 p-4 rounded-xl border-l-4 border-cyan-500">
          <h4 className="font-bold text-slate-200">Joint Lubrication</h4>
          <p className="text-sm text-slate-400 mt-1">Keeps cartilage soft and hydrated, reducing friction and pain during heavy lifts.</p>
        </div>
      </div>
    </div>
  );
};

const SleepTool = ({ onSave }: { onSave: (e: any) => void }) => {
  const [bedTime, setBedTime] = useState('22:00');
  const [wakeTime, setWakeTime] = useState('06:00');
  const [isSaved, setIsSaved] = useState(false);

  const calculate = () => {
    const [h1, m1] = bedTime.split(':').map(Number);
    const [h2, m2] = wakeTime.split(':').map(Number);
    let min1 = h1 * 60 + m1;
    let min2 = h2 * 60 + m2;
    if (min2 < min1) min2 += 1440; // Next day
    const diff = min2 - min1;
    const hours = Number((diff / 60).toFixed(1));
    const cycles = Math.floor(diff / 90);

    onSave({
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      type: 'sleep',
      bedTime,
      wakeTime,
      durationHours: hours,
      cycles
    });

    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  // Quick calc for display
  const getDurationDisplay = () => {
    const [h1, m1] = bedTime.split(':').map(Number);
    const [h2, m2] = wakeTime.split(':').map(Number);
    if (isNaN(h1) || isNaN(h2)) return "0h";
    let min1 = h1 * 60 + m1;
    let min2 = h2 * 60 + m2;
    if (min2 < min1) min2 += 1440;
    const diff = min2 - min1;
    const hours = Math.floor(diff / 60);
    const mins = diff % 60;
    return `${hours}h ${mins > 0 ? mins + 'm' : ''}`;
  };

  return (
    <div className="bg-dark-900 border border-slate-800 rounded-2xl p-6 md:p-10 shadow-lg">
      <div className="flex items-center gap-3 mb-8 border-b border-slate-800 pb-6">
        <div className="p-3 bg-purple-500/10 rounded-lg">
          <Moon className="text-purple-400" size={28} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">Sleep Calculator</h2>
          <p className="text-slate-400 text-sm">Optimize your circadian rhythm.</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-12">
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-400 text-sm font-bold mb-2 uppercase tracking-wider">Bed Time</label>
              <div className="relative">
                <input 
                  type="time" 
                  value={bedTime} 
                  onChange={e => setBedTime(e.target.value)} 
                  className="w-full bg-dark-950 border border-slate-800 rounded-xl p-4 text-white text-lg focus:border-purple-500 focus:outline-none" 
                />
              </div>
            </div>
            <div>
              <label className="block text-slate-400 text-sm font-bold mb-2 uppercase tracking-wider">Wake Time</label>
              <div className="relative">
                <input 
                  type="time" 
                  value={wakeTime} 
                  onChange={e => setWakeTime(e.target.value)} 
                  className="w-full bg-dark-950 border border-slate-800 rounded-xl p-4 text-white text-lg focus:border-purple-500 focus:outline-none" 
                />
              </div>
            </div>
          </div>
          
          <div className="bg-slate-800/30 p-4 rounded-xl flex justify-between items-center border border-slate-700">
            <span className="text-slate-400 text-sm font-medium">Estimated Duration:</span>
            <span className="text-2xl font-bold text-white">{getDurationDisplay()}</span>
          </div>

          <button 
            onClick={calculate} 
            disabled={isSaved}
            className={`w-full font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 transform active:scale-[0.98] ${
              isSaved 
                ? 'bg-green-500 text-white cursor-default' 
                : 'bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-900/20'
            }`}
          >
            {isSaved ? (
              <>
                <CheckCircle size={20} />
                <span>Sleep Logged</span>
              </>
            ) : (
              <>
                <Clock size={20} />
                <span>Calculate & Log Sleep</span>
              </>
            )}
          </button>
        </div>

        <div className="flex flex-col justify-center space-y-4">
           {/* New Card: Recommended Duration */}
           <div className="p-5 bg-slate-800/40 rounded-xl border border-slate-700 hover:border-purple-500/50 transition-colors">
              <h4 className="text-purple-300 font-bold mb-1 flex items-center gap-2">
                <Battery size={16} /> Recommended Duration
              </h4>
              <p className="text-sm text-slate-400 leading-relaxed mb-2">
                Most healthy adults need <span className="text-white font-bold">7 to 9 hours</span> of sleep per night to function at their best.
              </p>
              <div className="w-full bg-slate-700 h-1.5 rounded-full mt-2">
                <div className="bg-purple-500 h-1.5 rounded-full w-[75%]"></div>
              </div>
           </div>

           <div className="p-5 bg-slate-800/40 rounded-xl border border-slate-700 hover:border-purple-500/50 transition-colors">
              <h4 className="text-purple-300 font-bold mb-1 flex items-center gap-2">
                <Moon size={16} /> Deep Sleep (Cycles)
              </h4>
              <p className="text-sm text-slate-400 leading-relaxed">Sleep occurs in 90-minute cycles. Waking up at the end of a cycle makes you feel more refreshed.</p>
           </div>
           
           <div className="p-5 bg-slate-800/40 rounded-xl border border-slate-700 hover:border-purple-500/50 transition-colors">
              <h4 className="text-purple-300 font-bold mb-1 flex items-center gap-2">
                <Activity size={16} /> Growth Hormone
              </h4>
              <p className="text-sm text-slate-400 leading-relaxed">Peak HGH release happens during deep sleep stages III & IV. This is essential for muscle repair and recovery.</p>
           </div>
        </div>
      </div>
    </div>
  );
};

const NutritionTool = ({ goal }: { goal: string }) => {
  const suggestions = {
    gain: [
      { name: "Avocado", cal: "160kcal/100g", desc: "Healthy fats" },
      { name: "Nuts & Butters", cal: "600kcal/100g", desc: "Calorie dense" },
      { name: "Lean Red Meat", cal: "250kcal/100g", desc: "Protein & Iron" },
      { name: "Oats", cal: "389kcal/100g", desc: "Complex Carbs" },
      { name: "Whole Eggs", cal: "155kcal/100g", desc: "Complete Protein" } // Added
    ],
    loss: [
      { name: "Leafy Greens", cal: "25kcal/100g", desc: "High volume" },
      { name: "White Fish", cal: "90kcal/100g", desc: "Lean Protein" },
      { name: "Berries", cal: "50kcal/100g", desc: "Antioxidants" },
      { name: "Egg Whites", cal: "52kcal/100g", desc: "Pure Protein" },
      { name: "Cucumber", cal: "16kcal/100g", desc: "Hydration & Fiber" } // Added
    ],
    maintain: [
      { name: "Whole Grains", cal: "120kcal/100g", desc: "Fiber" },
      { name: "Chicken Breast", cal: "165kcal/100g", desc: "Protein" },
      { name: "Greek Yogurt", cal: "59kcal/100g", desc: "Probiotics" },
      { name: "Sweet Potato", cal: "86kcal/100g", desc: "Vitamins" },
      { name: "Quinoa", cal: "120kcal/100g", desc: "Complete Amino Profile" } // Added
    ]
  } as any;

  const currentList = suggestions[goal === 'fitness' ? 'maintain' : goal] || suggestions.maintain;

  return (
    <div className="bg-dark-900 border border-slate-800 rounded-2xl p-6 shadow-lg">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-green-500/10 rounded-lg">
            <Utensils className="text-green-500" size={28} />
          </div>
          <div>
             <h2 className="text-2xl font-bold text-white">Fuel Your Body</h2>
             <p className="text-slate-400 text-sm uppercase tracking-wide">Goal: {goal}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {currentList.map((item: any, idx: number) => (
          <div key={idx} className="bg-slate-800/50 p-6 rounded-xl border border-slate-700 hover:border-green-500 transition-all hover:-translate-y-1 group">
            <h3 className="text-lg font-bold text-white group-hover:text-green-400 transition-colors">{item.name}</h3>
            <p className="text-green-500 font-mono text-sm mt-1">{item.cal}</p>
            <p className="text-slate-400 text-sm mt-2">{item.desc}</p>
          </div>
        ))}
      </div>
      
      <div className="mt-8 p-6 bg-green-900/10 border border-green-900/30 rounded-xl flex items-start gap-4">
        <Info className="text-green-500 shrink-0 mt-1" />
        <div>
          <h4 className="text-green-400 font-bold">Dietary Tip</h4>
          <p className="text-slate-400 text-sm mt-1">
            "Abs are made in the kitchen." No amount of training can out-work a bad diet. Prioritize protein intake (1.6g - 2.2g per kg of bodyweight) for muscle retention.
          </p>
        </div>
      </div>
    </div>
  );
};
