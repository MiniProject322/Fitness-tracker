import React, { useState, useEffect } from 'react';
import { UserProfile, AppEntry } from '../types';
import { User, Ruler, Weight, Activity, Target, Save, Mail, Calendar, UserCog, CheckCircle, TrendingUp, Info } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

interface ProfileSettingsProps {
  user: UserProfile;
  entries: AppEntry[];
  onUpdate: (updatedUser: UserProfile) => void;
}

export const ProfileSettings: React.FC<ProfileSettingsProps> = ({ user, entries, onUpdate }) => {
  const [formData, setFormData] = useState<UserProfile>(user);
  const [success, setSuccess] = useState(false);
  
  // Unit State
  const [weightUnit, setWeightUnit] = useState<'kg' | 'lbs'>('kg');
  const [heightUnit, setHeightUnit] = useState<'cm' | 'ft'>('cm');

  // Input State (Strings allow for better typing experience, e.g. "70." or empty state)
  const [weightInput, setWeightInput] = useState<string>('');
  const [goalWeightInput, setGoalWeightInput] = useState<string>('');
  const [heightCmInput, setHeightCmInput] = useState<string>('');
  const [heightFtInput, setHeightFtInput] = useState<string>('');
  const [heightInInput, setHeightInInput] = useState<string>('');

  // Constants
  const KG_TO_LBS = 2.20462;
  const INCH_TO_CM = 2.54;

  // Initialize inputs on load or user change
  useEffect(() => {
    initializeInputs(user);
  }, [user]);

  const initializeInputs = (u: UserProfile) => {
    // Weight Initialization
    if (u.weight) {
      if (weightUnit === 'lbs') {
        setWeightInput((u.weight * KG_TO_LBS).toFixed(1));
      } else {
        setWeightInput(u.weight.toString());
      }
    } else {
      setWeightInput('');
    }

    // Goal Weight Initialization
    if (u.goalWeight) {
      if (weightUnit === 'lbs') {
        setGoalWeightInput((u.goalWeight * KG_TO_LBS).toFixed(1));
      } else {
        setGoalWeightInput(u.goalWeight.toString());
      }
    } else {
      setGoalWeightInput('');
    }

    // Height Initialization
    if (u.height) {
      if (heightUnit === 'ft') {
        const { ft, inch } = cmToFtIn(u.height);
        setHeightFtInput(ft.toString());
        setHeightInInput(inch.toString());
      } else {
        setHeightCmInput(u.height.toString());
      }
    } else {
      setHeightCmInput('');
      setHeightFtInput('');
      setHeightInInput('');
    }
  };

  // Helper: CM to FT/IN
  const cmToFtIn = (cm: number) => {
    const totalInches = cm / INCH_TO_CM;
    let ft = Math.floor(totalInches / 12);
    let inch = Math.round(totalInches % 12);
    if (inch === 12) {
      ft += 1;
      inch = 0;
    }
    return { ft, inch };
  };

  // Toggle Handlers
  const toggleWeightUnit = (unit: 'kg' | 'lbs') => {
    if (unit === weightUnit) return;
    setWeightUnit(unit);
    
    // Recalculate input value based on stored formData to ensure precision
    const currentWeightKg = formData.weight;
    const currentGoalWeightKg = formData.goalWeight;
    
    if (currentWeightKg !== undefined && currentWeightKg !== null && !isNaN(currentWeightKg)) {
      if (unit === 'lbs') {
        setWeightInput((currentWeightKg * KG_TO_LBS).toFixed(1));
      } else {
        setWeightInput(currentWeightKg.toString());
      }
    } else {
      setWeightInput('');
    }

    if (currentGoalWeightKg !== undefined && currentGoalWeightKg !== null && !isNaN(currentGoalWeightKg)) {
      if (unit === 'lbs') {
        setGoalWeightInput((currentGoalWeightKg * KG_TO_LBS).toFixed(1));
      } else {
        setGoalWeightInput(currentGoalWeightKg.toString());
      }
    } else {
      setGoalWeightInput('');
    }
  };

  const toggleHeightUnit = (unit: 'cm' | 'ft') => {
    if (unit === heightUnit) return;
    setHeightUnit(unit);

    // Recalculate input values based on stored formData
    const currentHeightCm = formData.height;

    if (currentHeightCm !== undefined && currentHeightCm !== null && !isNaN(currentHeightCm)) {
      if (unit === 'ft') {
        const { ft, inch } = cmToFtIn(currentHeightCm);
        setHeightFtInput(ft.toString());
        setHeightInInput(inch.toString());
      } else {
        setHeightCmInput(currentHeightCm.toString());
      }
    } else {
      setHeightCmInput('');
      setHeightFtInput('');
      setHeightInInput('');
    }
  };

  // Input Change Handlers
  const handleWeightChange = (val: string) => {
    setWeightInput(val);
    const num = parseFloat(val);
    
    if (isNaN(num)) {
      setFormData(prev => ({ ...prev, weight: undefined }));
      return;
    }

    if (weightUnit === 'kg') {
      setFormData(prev => ({ ...prev, weight: num }));
    } else {
      const kg = num / KG_TO_LBS;
      setFormData(prev => ({ ...prev, weight: parseFloat(kg.toFixed(2)) }));
    }
  };

  const handleGoalWeightChange = (val: string) => {
    setGoalWeightInput(val);
    const num = parseFloat(val);
    
    if (isNaN(num)) {
      setFormData(prev => ({ ...prev, goalWeight: undefined }));
      return;
    }

    if (weightUnit === 'kg') {
      setFormData(prev => ({ ...prev, goalWeight: num }));
    } else {
      const kg = num / KG_TO_LBS;
      setFormData(prev => ({ ...prev, goalWeight: parseFloat(kg.toFixed(2)) }));
    }
  };

  const handleHeightCmChange = (val: string) => {
    setHeightCmInput(val);
    const num = parseInt(val);
    setFormData(prev => ({ ...prev, height: isNaN(num) ? undefined : num }));
  };

  const handleHeightFtInChange = (ftVal: string, inVal: string) => {
    setHeightFtInput(ftVal);
    setHeightInInput(inVal);

    const ft = parseInt(ftVal) || 0;
    const inch = parseInt(inVal) || 0;
    
    if (!ftVal && !inVal) {
       setFormData(prev => ({ ...prev, height: undefined }));
       return;
    }
    
    const totalInches = (ft * 12) + inch;
    const cm = Math.round(totalInches * INCH_TO_CM);
    setFormData(prev => ({ ...prev, height: cm }));
  };

  const handleGenericChange = (field: keyof UserProfile, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate(formData);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  // Helper descriptions
  const getActivityDescription = (level: string) => {
    switch(level) {
      case 'sedentary': return 'Little or no exercise, desk job.';
      case 'light': return 'Light exercise/sports 1-3 days/week.';
      case 'moderate': return 'Moderate exercise/sports 3-5 days/week.';
      case 'active': return 'Hard exercise/sports 6-7 days/week.';
      default: return '';
    }
  };

  const getGoalDescription = (goal: string) => {
    switch(goal) {
      case 'gain': return 'Focus on hypertrophy and strength. Caloric surplus required.';
      case 'loss': return 'Focus on fat reduction. Caloric deficit required.';
      case 'maintain': return 'Keep current body composition.';
      case 'fitness': return 'General health and well-being improvement.';
      default: return '';
    }
  };

  // Chart Data Preparation
  const weightHistory = entries
    .filter(e => e.type === 'biometrics')
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
    .map(e => ({
      date: new Date(e.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      weight: weightUnit === 'kg' ? (e as any).weight : ((e as any).weight * KG_TO_LBS)
    }));
  
  const goalValue = formData.goalWeight 
    ? (weightUnit === 'kg' ? formData.goalWeight : formData.goalWeight * KG_TO_LBS)
    : null;

  const currentWeightValue = formData.weight
    ? (weightUnit === 'kg' ? formData.weight : formData.weight * KG_TO_LBS)
    : 0;

  const startWeightValue = weightHistory.length > 0 ? weightHistory[0].weight : currentWeightValue;
  
  // Calculate Progress Logic
  let progressPercentage = 0;
  let gapValue = 0;
  
  if (currentWeightValue && goalValue) {
      gapValue = Math.abs(goalValue - currentWeightValue);
      
      const totalDistance = Math.abs(goalValue - startWeightValue);
      
      // Prevent division by zero if start == goal (Maintenance or already there)
      if (totalDistance === 0) {
        progressPercentage = 100;
      } else {
        // Check if aiming for loss or gain based on start vs goal
        const aimingForLoss = startWeightValue > goalValue;
        
        if (aimingForLoss) {
          // LOSS Scenario: Goal is lower than Start
          if (currentWeightValue <= goalValue) {
            progressPercentage = 100; // Goal Reached or Exceeded
          } else if (currentWeightValue >= startWeightValue) {
            progressPercentage = 0; // Regressed or stayed same
          } else {
            // In progress
            const lostSoFar = startWeightValue - currentWeightValue;
            progressPercentage = (lostSoFar / totalDistance) * 100;
          }
        } else {
          // GAIN Scenario: Goal is higher than Start
          if (currentWeightValue >= goalValue) {
            progressPercentage = 100; // Goal Reached or Exceeded
          } else if (currentWeightValue <= startWeightValue) {
            progressPercentage = 0; // Regressed or stayed same
          } else {
            // In progress
            const gainedSoFar = currentWeightValue - startWeightValue;
            progressPercentage = (gainedSoFar / totalDistance) * 100;
          }
        }
      }
  }

  return (
    <div className="max-w-4xl mx-auto animate-fade-in space-y-6 pb-20 md:pb-0">
      <div className="bg-dark-900 border border-slate-800 rounded-2xl p-6 md:p-8">
        <div className="flex items-center gap-4 mb-8 border-b border-slate-800 pb-6">
          <div className="w-16 h-16 rounded-full bg-primary-500/10 flex items-center justify-center text-primary-500">
             <UserCog size={32} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Profile Settings</h2>
            <p className="text-slate-400">Update your biometrics and fitness goals to get personalized recommendations.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* Section 1: Physical Stats */}
          <div>
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Activity className="text-primary-500" size={20} />
              Physical Statistics
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-400">Age</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3.5 text-slate-500" size={18} />
                  <input 
                    type="number" 
                    value={formData.age || ''} 
                    onChange={(e) => handleGenericChange('age', parseInt(e.target.value) || undefined)}
                    className="w-full bg-dark-950 border border-slate-800 rounded-lg py-3 pl-10 text-white focus:border-primary-500 focus:outline-none"
                    placeholder="Years"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-400">Gender</label>
                <div className="relative">
                  <User className="absolute left-3 top-3.5 text-slate-500" size={18} />
                  <select 
                    value={formData.gender || ''}
                    onChange={(e) => handleGenericChange('gender', e.target.value)}
                    className="w-full bg-dark-950 border border-slate-800 rounded-lg py-3 pl-10 text-white focus:border-primary-500 focus:outline-none appearance-none"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              {/* Height Input with Unit Toggle */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium text-slate-400">Height</label>
                  <div className="flex bg-dark-950 rounded-md p-1 border border-slate-800">
                    <button
                      type="button"
                      onClick={() => toggleHeightUnit('cm')}
                      className={`cursor-pointer px-3 py-1 text-xs font-bold rounded transition-colors ${heightUnit === 'cm' ? 'bg-primary-600 text-white shadow-md' : 'text-slate-500 hover:text-white hover:bg-slate-800'}`}
                    >
                      CM
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleHeightUnit('ft')}
                      className={`cursor-pointer px-3 py-1 text-xs font-bold rounded transition-colors ${heightUnit === 'ft' ? 'bg-primary-600 text-white shadow-md' : 'text-slate-500 hover:text-white hover:bg-slate-800'}`}
                    >
                      FT
                    </button>
                  </div>
                </div>
                
                <div className="relative">
                  <Ruler className="absolute left-3 top-3.5 text-slate-500" size={18} />
                  {heightUnit === 'cm' ? (
                    <input 
                      type="number" 
                      value={heightCmInput} 
                      onChange={(e) => handleHeightCmChange(e.target.value)}
                      className="w-full bg-dark-950 border border-slate-800 rounded-lg py-3 pl-10 text-white focus:border-primary-500 focus:outline-none placeholder:text-slate-600"
                      placeholder="e.g. 180"
                    />
                  ) : (
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <input 
                          type="number" 
                          value={heightFtInput}
                          onChange={(e) => handleHeightFtInChange(e.target.value, heightInInput)}
                          className="w-full bg-dark-950 border border-slate-800 rounded-lg py-3 pl-10 text-white focus:border-primary-500 focus:outline-none placeholder:text-slate-600"
                          placeholder="ft"
                        />
                        <span className="absolute right-3 top-3.5 text-slate-500 text-sm font-medium">ft</span>
                      </div>
                      <div className="relative flex-1">
                        <input 
                          type="number" 
                          value={heightInInput}
                          onChange={(e) => handleHeightFtInChange(heightFtInput, e.target.value)}
                          className="w-full bg-dark-950 border border-slate-800 rounded-lg py-3 px-4 text-white focus:border-primary-500 focus:outline-none placeholder:text-slate-600"
                          placeholder="in"
                        />
                        <span className="absolute right-3 top-3.5 text-slate-500 text-sm font-medium">in</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Weight Input with Unit Toggle */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium text-slate-400">Current Weight</label>
                   <div className="flex bg-dark-950 rounded-md p-1 border border-slate-800">
                    <button
                      type="button"
                      onClick={() => toggleWeightUnit('kg')}
                      className={`cursor-pointer px-3 py-1 text-xs font-bold rounded transition-colors ${weightUnit === 'kg' ? 'bg-primary-600 text-white shadow-md' : 'text-slate-500 hover:text-white hover:bg-slate-800'}`}
                    >
                      KG
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleWeightUnit('lbs')}
                      className={`cursor-pointer px-3 py-1 text-xs font-bold rounded transition-colors ${weightUnit === 'lbs' ? 'bg-primary-600 text-white shadow-md' : 'text-slate-500 hover:text-white hover:bg-slate-800'}`}
                    >
                      LBS
                    </button>
                  </div>
                </div>
                <div className="relative">
                  <Weight className="absolute left-3 top-3.5 text-slate-500" size={18} />
                  <input 
                    type="number" 
                    value={weightInput} 
                    onChange={(e) => handleWeightChange(e.target.value)}
                    className="w-full bg-dark-950 border border-slate-800 rounded-lg py-3 pl-10 text-white focus:border-primary-500 focus:outline-none placeholder:text-slate-600"
                    placeholder={weightUnit === 'kg' ? 'e.g. 75.5' : 'e.g. 165'}
                    step={weightUnit === 'kg' ? "0.1" : "0.1"}
                  />
                  <span className="absolute right-3 top-3.5 text-slate-500 text-sm font-medium uppercase">{weightUnit}</span>
                </div>
              </div>

               {/* Goal Weight Input */}
               <div className="space-y-2">
                <label className="text-sm font-medium text-slate-400">Goal Weight</label>
                <div className="relative">
                  <Target className="absolute left-3 top-3.5 text-slate-500" size={18} />
                  <input 
                    type="number" 
                    value={goalWeightInput} 
                    onChange={(e) => handleGoalWeightChange(e.target.value)}
                    className="w-full bg-dark-950 border border-slate-800 rounded-lg py-3 pl-10 text-white focus:border-primary-500 focus:outline-none placeholder:text-slate-600"
                    placeholder={weightUnit === 'kg' ? 'e.g. 70.0' : 'e.g. 155'}
                    step="0.1"
                  />
                  <span className="absolute right-3 top-3.5 text-slate-500 text-sm font-medium uppercase">{weightUnit}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Visualization Section */}
          {(formData.goalWeight || weightHistory.length > 0) && (
            <div className="border-t border-slate-800 pt-6">
              <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <TrendingUp className="text-primary-500" size={20} />
                Progress Tracker
              </h3>
              
              {goalValue && currentWeightValue && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                  {/* Stats Card */}
                  <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700 flex flex-col justify-center">
                    <span className="text-slate-400 text-sm font-medium mb-1">Current Gap</span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-bold text-white">
                        {gapValue.toFixed(1)}
                      </span>
                      <span className="text-sm font-bold text-slate-500 uppercase">{weightUnit}</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-2">
                      {goalValue && currentWeightValue 
                        ? (currentWeightValue > goalValue ? 'To Lose' : 'To Gain') 
                        : 'Difference'}
                    </p>
                  </div>

                  {/* Progress Bar */}
                  <div className="lg:col-span-2 bg-slate-800/50 rounded-xl p-5 border border-slate-700 flex flex-col justify-center">
                     <div className="flex justify-between items-end mb-3">
                        <div>
                          <span className="text-slate-400 text-sm font-medium">Goal Progress</span>
                          <div className="flex gap-4 mt-1 text-xs text-slate-500">
                             <span>Start: {startWeightValue.toFixed(1)}</span>
                             <span>Current: {currentWeightValue.toFixed(1)}</span>
                             <span>Goal: {goalValue?.toFixed(1) || '--'}</span>
                          </div>
                        </div>
                        <span className="text-2xl font-bold text-primary-500">{progressPercentage.toFixed(0)}%</span>
                     </div>
                     <div className="w-full bg-slate-700 rounded-full h-3 overflow-hidden">
                        <div 
                          className="bg-primary-500 h-full rounded-full transition-all duration-1000 ease-out" 
                          style={{ width: `${progressPercentage}%` }}
                        ></div>
                     </div>
                  </div>
                </div>
              )}

              <div className="bg-dark-950 border border-slate-800 rounded-xl p-4 h-72">
                 {/* Chart */}
                 {weightHistory.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={weightHistory} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#84cc16" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#84cc16" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                        <XAxis 
                          dataKey="date" 
                          stroke="#94a3b8" 
                          tick={{fontSize: 12}} 
                          tickMargin={10}
                        />
                        <YAxis 
                          domain={['auto', 'auto']} 
                          stroke="#94a3b8" 
                          tick={{fontSize: 12}} 
                          tickFormatter={(value) => value.toFixed(0)}
                        />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: '#fff' }}
                          itemStyle={{ color: '#84cc16' }}
                          labelStyle={{ color: '#94a3b8', marginBottom: '0.25rem' }}
                          formatter={(value: number) => [`${value.toFixed(1)} ${weightUnit}`, 'Weight']}
                        />
                        {goalValue && (
                          <ReferenceLine 
                            y={goalValue} 
                            stroke="#ef4444" 
                            strokeDasharray="3 3" 
                            label={{ position: 'right', value: 'Goal', fill: '#ef4444', fontSize: 12 }} 
                          />
                        )}
                        <Line 
                          type="monotone" 
                          dataKey="weight" 
                          stroke="#84cc16" 
                          strokeWidth={3} 
                          dot={{ r: 4, fill: '#0f172a', stroke: '#84cc16', strokeWidth: 2 }} 
                          activeDot={{ r: 6, fill: '#84cc16' }} 
                        />
                      </LineChart>
                    </ResponsiveContainer>
                 ) : (
                    <div className="flex flex-col items-center justify-center h-full text-slate-500">
                      <TrendingUp size={48} className="mb-4 opacity-20" />
                      <p>Log your weight in the Biometrics section to see your trends.</p>
                    </div>
                 )}
              </div>
            </div>
          )}

          <div className="border-t border-slate-800 pt-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Target className="text-primary-500" size={20} />
              Goals & Activity
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <label className="text-sm font-medium text-slate-400">Primary Goal</label>
                <div className="relative">
                  <select 
                    value={formData.goal || 'fitness'}
                    onChange={(e) => handleGenericChange('goal', e.target.value)}
                    className="w-full bg-dark-950 border border-slate-800 rounded-lg py-3 px-4 text-white focus:border-primary-500 focus:outline-none appearance-none cursor-pointer hover:bg-slate-800/50 transition-colors"
                  >
                    <option value="gain">Muscle Gain</option>
                    <option value="loss">Weight Loss</option>
                    <option value="maintain">Maintenance</option>
                    <option value="fitness">General Fitness</option>
                  </select>
                </div>
                {formData.goal && (
                  <div className="flex gap-2 items-start bg-slate-800/30 p-3 rounded-lg border border-slate-800">
                    <Info size={16} className="text-slate-500 mt-0.5 shrink-0" />
                    <p className="text-xs text-slate-400">{getGoalDescription(formData.goal)}</p>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <label className="text-sm font-medium text-slate-400">Activity Level</label>
                <div className="relative">
                  <select 
                    value={formData.activityLevel || 'moderate'}
                    onChange={(e) => handleGenericChange('activityLevel', e.target.value)}
                    className="w-full bg-dark-950 border border-slate-800 rounded-lg py-3 px-4 text-white focus:border-primary-500 focus:outline-none appearance-none cursor-pointer hover:bg-slate-800/50 transition-colors"
                  >
                    <option value="sedentary">Sedentary (Office Job)</option>
                    <option value="light">Light Active (1-3 days/week)</option>
                    <option value="moderate">Moderately Active (3-5 days/week)</option>
                    <option value="active">Very Active (6-7 days/week)</option>
                  </select>
                </div>
                {formData.activityLevel && (
                  <div className="flex gap-2 items-start bg-slate-800/30 p-3 rounded-lg border border-slate-800">
                    <Info size={16} className="text-slate-500 mt-0.5 shrink-0" />
                    <p className="text-xs text-slate-400">{getActivityDescription(formData.activityLevel)}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <User className="text-primary-500" size={20} />
              Account Info
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="space-y-2">
                <label className="text-sm font-medium text-slate-400">Username</label>
                <div className="relative opacity-60">
                  <User className="absolute left-3 top-3.5 text-slate-500" size={18} />
                  <input 
                    type="text" 
                    value={formData.username} 
                    readOnly
                    className="w-full bg-dark-950 border border-slate-800 rounded-lg py-3 pl-10 text-slate-400 cursor-not-allowed"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-400">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3.5 text-slate-500" size={18} />
                  <input 
                    type="email" 
                    value={formData.email || ''} 
                    onChange={(e) => handleGenericChange('email', e.target.value)}
                    className="w-full bg-dark-950 border border-slate-800 rounded-lg py-3 pl-10 text-white focus:border-primary-500 focus:outline-none placeholder:text-slate-600"
                    placeholder="your@email.com"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button 
              type="submit" 
              className={`px-8 py-3 rounded-xl font-bold flex items-center gap-2 transition-all transform active:scale-95 cursor-pointer ${
                success 
                  ? 'bg-green-500 text-white hover:bg-green-600' 
                  : 'bg-primary-600 hover:bg-primary-500 text-white shadow-lg shadow-primary-500/20'
              }`}
            >
              {success ? (
                <>
                  <CheckCircle size={20} />
                  <span>Saved Successfully</span>
                </>
              ) : (
                <>
                  <Save size={20} />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};