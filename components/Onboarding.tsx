import React, { useState } from 'react';
import { UserProfile } from '../types';
import { Activity, ArrowRight, User, Ruler, Weight, Target, CheckCircle, ChevronLeft } from 'lucide-react';

interface OnboardingProps {
  user: UserProfile;
  onComplete: (updatedUser: UserProfile) => void;
}

export const Onboarding: React.FC<OnboardingProps> = ({ user, onComplete }) => {
  const [step, setStep] = useState(1);
  const totalSteps = 3;
  
  const [formData, setFormData] = useState<Partial<UserProfile>>({
    age: undefined,
    gender: 'male',
    height: undefined,
    weight: undefined,
    goalWeight: undefined,
    activityLevel: 'moderate',
    goal: 'fitness'
  });

  // Unit State
  const [heightUnit, setHeightUnit] = useState<'cm' | 'ft'>('cm');
  const [weightUnit, setWeightUnit] = useState<'kg' | 'lbs'>('kg');
  
  // Input State
  const [heightCm, setHeightCm] = useState('');
  const [heightFt, setHeightFt] = useState('');
  const [heightIn, setHeightIn] = useState('');
  const [weightInput, setWeightInput] = useState('');
  const [goalWeightInput, setGoalWeightInput] = useState('');

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      finishOnboarding();
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const finishOnboarding = () => {
    // Finalize data conversion
    let finalHeight = formData.height;
    if (heightUnit === 'cm') {
      finalHeight = parseInt(heightCm);
    } else {
      finalHeight = Math.round(((parseInt(heightFt) || 0) * 12 + (parseInt(heightIn) || 0)) * 2.54);
    }

    let finalWeight = formData.weight;
    if (weightUnit === 'kg') {
      finalWeight = parseFloat(weightInput);
    } else {
      finalWeight = parseFloat(weightInput) / 2.20462;
    }

    let finalGoalWeight = formData.goalWeight;
    if (goalWeightInput) {
        if (weightUnit === 'kg') {
            finalGoalWeight = parseFloat(goalWeightInput);
        } else {
            finalGoalWeight = parseFloat(goalWeightInput) / 2.20462;
        }
    }

    // Round to 1 decimal
    if (finalWeight) finalWeight = Math.round(finalWeight * 10) / 10;
    if (finalGoalWeight) finalGoalWeight = Math.round(finalGoalWeight * 10) / 10;

    const updatedUser: UserProfile = {
      ...user,
      ...formData,
      height: finalHeight,
      weight: finalWeight,
      goalWeight: finalGoalWeight,
      onboardingCompleted: true,
    };
    
    onComplete(updatedUser);
  };

  // Validation logic
  const isStepValid = () => {
    if (step === 1) {
      return formData.age && formData.gender;
    }
    if (step === 2) {
      const hValid = heightUnit === 'cm' ? !!heightCm : (!!heightFt);
      const wValid = !!weightInput;
      return hValid && wValid;
    }
    if (step === 3) {
      return formData.activityLevel && formData.goal;
    }
    return false;
  };

  return (
    <div className="min-h-screen bg-dark-950 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-xs text-slate-500 mb-2 uppercase tracking-wider font-bold">
            <span>Basics</span>
            <span>Body Metrics</span>
            <span>Goals</span>
          </div>
          <div className="h-2 bg-dark-900 rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary-500 transition-all duration-500 ease-out"
              style={{ width: `${(step / totalSteps) * 100}%` }}
            ></div>
          </div>
        </div>

        <div className="bg-dark-900 border border-slate-800 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
          {/* Decorative background blur */}
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-primary-500/5 rounded-full blur-3xl pointer-events-none"></div>

          <div className="relative z-10">
            {step === 1 && (
              <div className="animate-fade-in space-y-6">
                <div className="text-center mb-8">
                  <div className="inline-flex p-3 rounded-full bg-primary-500/10 text-primary-500 mb-4">
                    <User size={32} />
                  </div>
                  <h2 className="text-2xl font-bold text-white">Let's get to know you</h2>
                  <p className="text-slate-400">We need a few details to calibrate your health metrics.</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">How old are you?</label>
                    <input 
                      type="number" 
                      value={formData.age || ''}
                      onChange={e => setFormData({...formData, age: parseInt(e.target.value)})}
                      placeholder="Age"
                      className="w-full bg-dark-950 border border-slate-800 rounded-xl p-4 text-white focus:border-primary-500 focus:outline-none text-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Biological Sex</label>
                    <div className="grid grid-cols-2 gap-4">
                      <button 
                        onClick={() => setFormData({...formData, gender: 'male'})}
                        className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${formData.gender === 'male' ? 'bg-primary-500/10 border-primary-500 text-primary-500' : 'bg-dark-950 border-slate-800 text-slate-400 hover:bg-slate-800'}`}
                      >
                         <span className="font-bold">Male</span>
                      </button>
                      <button 
                        onClick={() => setFormData({...formData, gender: 'female'})}
                        className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${formData.gender === 'female' ? 'bg-primary-500/10 border-primary-500 text-primary-500' : 'bg-dark-950 border-slate-800 text-slate-400 hover:bg-slate-800'}`}
                      >
                         <span className="font-bold">Female</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="animate-fade-in space-y-6">
                 <div className="text-center mb-8">
                  <div className="inline-flex p-3 rounded-full bg-blue-500/10 text-blue-500 mb-4">
                    <Ruler size={32} />
                  </div>
                  <h2 className="text-2xl font-bold text-white">Body Metrics</h2>
                  <p className="text-slate-400">Accurate measurements help us calculate your BMR and calorie needs.</p>
                </div>

                <div className="space-y-6">
                  {/* Height */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                       <label className="text-sm font-medium text-slate-400">Height</label>
                       <div className="flex bg-dark-950 rounded-lg p-1 border border-slate-800">
                          <button onClick={() => setHeightUnit('cm')} className={`px-3 py-1 text-xs font-bold rounded ${heightUnit === 'cm' ? 'bg-blue-600 text-white' : 'text-slate-500'}`}>CM</button>
                          <button onClick={() => setHeightUnit('ft')} className={`px-3 py-1 text-xs font-bold rounded ${heightUnit === 'ft' ? 'bg-blue-600 text-white' : 'text-slate-500'}`}>FT</button>
                       </div>
                    </div>
                    {heightUnit === 'cm' ? (
                       <input 
                         type="number" 
                         value={heightCm}
                         onChange={e => setHeightCm(e.target.value)}
                         placeholder="175" 
                         className="w-full bg-dark-950 border border-slate-800 rounded-xl p-4 text-white focus:border-blue-500 focus:outline-none"
                       />
                    ) : (
                      <div className="flex gap-4">
                         <input 
                           type="number" 
                           value={heightFt}
                           onChange={e => setHeightFt(e.target.value)}
                           placeholder="5" 
                           className="w-full bg-dark-950 border border-slate-800 rounded-xl p-4 text-white focus:border-blue-500 focus:outline-none"
                         />
                         <input 
                           type="number" 
                           value={heightIn}
                           onChange={e => setHeightIn(e.target.value)}
                           placeholder="9" 
                           className="w-full bg-dark-950 border border-slate-800 rounded-xl p-4 text-white focus:border-blue-500 focus:outline-none"
                         />
                      </div>
                    )}
                  </div>

                  {/* Weight */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                       <label className="text-sm font-medium text-slate-400">Current Weight</label>
                       <div className="flex bg-dark-950 rounded-lg p-1 border border-slate-800">
                          <button onClick={() => setWeightUnit('kg')} className={`px-3 py-1 text-xs font-bold rounded ${weightUnit === 'kg' ? 'bg-blue-600 text-white' : 'text-slate-500'}`}>KG</button>
                          <button onClick={() => setWeightUnit('lbs')} className={`px-3 py-1 text-xs font-bold rounded ${weightUnit === 'lbs' ? 'bg-blue-600 text-white' : 'text-slate-500'}`}>LBS</button>
                       </div>
                    </div>
                    <div className="relative">
                      <Weight className="absolute left-4 top-4 text-slate-500" size={20} />
                      <input 
                        type="number"
                        value={weightInput}
                        onChange={e => setWeightInput(e.target.value)}
                        placeholder={weightUnit === 'kg' ? "75.5" : "166"}
                        className="w-full bg-dark-950 border border-slate-800 rounded-xl p-4 pl-12 text-white focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
               <div className="animate-fade-in space-y-6">
                <div className="text-center mb-8">
                  <div className="inline-flex p-3 rounded-full bg-purple-500/10 text-purple-500 mb-4">
                    <Target size={32} />
                  </div>
                  <h2 className="text-2xl font-bold text-white">Your Goals</h2>
                  <p className="text-slate-400">What are you striving for? We'll customize your dashboard.</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Primary Goal</label>
                    <select 
                      value={formData.goal}
                      onChange={e => setFormData({...formData, goal: e.target.value as any})}
                      className="w-full bg-dark-950 border border-slate-800 rounded-xl p-4 text-white focus:border-purple-500 focus:outline-none"
                    >
                       <option value="fitness">Improve Fitness</option>
                       <option value="loss">Lose Weight</option>
                       <option value="gain">Gain Muscle</option>
                       <option value="maintain">Maintain Weight</option>
                    </select>
                  </div>

                  <div>
                     <label className="block text-sm font-medium text-slate-400 mb-2">Activity Level</label>
                     <select 
                      value={formData.activityLevel}
                      onChange={e => setFormData({...formData, activityLevel: e.target.value as any})}
                      className="w-full bg-dark-950 border border-slate-800 rounded-xl p-4 text-white focus:border-purple-500 focus:outline-none"
                    >
                       <option value="sedentary">Sedentary (Office Job)</option>
                       <option value="light">Light Active (1-3 days)</option>
                       <option value="moderate">Moderate Active (3-5 days)</option>
                       <option value="active">Very Active (6-7 days)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Goal Weight (Optional)</label>
                    <div className="relative">
                      <Target className="absolute left-4 top-4 text-slate-500" size={20} />
                      <input 
                        type="number"
                        value={goalWeightInput}
                        onChange={e => setGoalWeightInput(e.target.value)}
                        placeholder={weightUnit === 'kg' ? "70.0" : "155"}
                        className="w-full bg-dark-950 border border-slate-800 rounded-xl p-4 pl-12 text-white focus:border-purple-500 focus:outline-none"
                      />
                      <span className="absolute right-4 top-4 text-slate-500 text-sm font-bold">{weightUnit.toUpperCase()}</span>
                    </div>
                  </div>
                </div>
               </div>
            )}

            {/* Navigation Buttons */}
            <div className="mt-10 flex gap-4">
              {step > 1 && (
                <button 
                  onClick={handleBack}
                  className="px-6 py-4 rounded-xl bg-dark-950 text-slate-400 border border-slate-800 hover:text-white hover:border-slate-600 transition-colors"
                >
                  <ChevronLeft size={20} />
                </button>
              )}
              
              <button 
                onClick={handleNext}
                disabled={!isStepValid()}
                className={`flex-1 py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                  isStepValid() 
                    ? 'bg-primary-600 hover:bg-primary-500 text-white shadow-lg shadow-primary-500/20 transform hover:-translate-y-0.5' 
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                }`}
              >
                <span>{step === totalSteps ? 'Complete Setup' : 'Next Step'}</span>
                {step === totalSteps ? <CheckCircle size={20} /> : <ArrowRight size={20} />}
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};