import { useState } from 'react';
import { UserProvider, useUser } from './context/UserContext';
import { PantryProvider } from './context/PantryContext';
import { MealPlannerProvider } from './context/MealPlannerContext';
import { Onboarding } from './components/Onboarding';
import { Layout } from './components/Layout';
import { PantryManager } from './components/PantryManager';
import { MealPlanView } from './components/MealPlanView';
import type { UserProfile } from './types';
import { Target, Weight, Activity, Clock } from 'lucide-react';
import { calculateDailyTargets } from './utils/calculations';

import { Dashboard } from './components/Dashboard';

function AppContent() {
  const { hasOnboarded, profile } = useUser();
  const [activeTab, setActiveTab] = useState<'home' | 'pantry' | 'planner' | 'profile'>('home');

  // If not onboarded, show onboarding flow
  if (!hasOnboarded) {
    return <Onboarding />;
  }

  return (
    <Layout activeTab={activeTab} onTabChange={setActiveTab}>
      {activeTab === 'home' && <Dashboard />}
      {activeTab === 'pantry' && <PantryManager />}
      {activeTab === 'planner' && <MealPlanView />}
      {activeTab === 'profile' && profile && (
        <ProfileView profile={profile} />
      )}
    </Layout>
  );
}

// Editable Profile View
function ProfileView({ profile }: { profile: UserProfile }) {
  const { updateProfile } = useUser();
  const targets = calculateDailyTargets(profile);

  const handleUpdate = (updates: Partial<UserProfile>) => {
    updateProfile({ ...profile, ...updates });
  };

  return (
    <div className="p-6 pb-24">
      <h1 className="text-2xl font-black mb-6 tracking-tight">Il Tuo Profilo</h1>

      <div className="space-y-6">

        {/* Stats Grid */}
        <div className="bg-white p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="text-gray-400 text-xs font-bold uppercase mb-1 block">Peso (kg)</label>
            <input
              type="number"
              value={profile.weight}
              onChange={e => handleUpdate({ weight: Number(e.target.value) })}
              className="w-full text-4xl font-black text-gray-900 border-b-2 border-transparent focus:border-black outline-none bg-transparent"
            />
          </div>

          <div>
            <label className="text-gray-400 text-xs font-bold uppercase mb-1 block">Altezza (cm)</label>
            <input
              type="number"
              value={profile.height}
              onChange={e => handleUpdate({ height: Number(e.target.value) })}
              className="w-full text-2xl font-bold text-gray-900 border-b-2 border-transparent focus:border-black outline-none bg-transparent"
            />
          </div>

          <div>
            <label className="text-gray-400 text-xs font-bold uppercase mb-1 block">Età</label>
            <input
              type="number"
              value={profile.age}
              onChange={e => handleUpdate({ age: Number(e.target.value) })}
              className="w-full text-2xl font-bold text-gray-900 border-b-2 border-transparent focus:border-black outline-none bg-transparent"
            />
          </div>
        </div>

        {/* TDEE Summary */}
        <div className="bg-black text-white p-6 rounded-3xl shadow-xl flex justify-between items-center">
          <div>
            <p className="text-xs font-bold uppercase text-gray-400 mb-1">Obiettivo Giornaliero</p>
            <div className="text-4xl font-black tracking-tighter">{Math.round(targets.calories)}<span className="text-lg text-gray-500 ml-1">kcal</span></div>
          </div>
          <div className="text-right space-y-1">
            <div className="text-xs font-bold"><span className="text-blue-400">{targets.protein}g</span> Prot</div>
            <div className="text-xs font-bold"><span className="text-amber-400">{targets.carbs}g</span> Carb</div>
            <div className="text-xs font-bold"><span className="text-rose-400">{targets.fat}g</span> Gras</div>
          </div>
        </div>

        {/* Configurations */}
        <div className="bg-white p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 space-y-6">

          {/* Activity Level */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Activity size={18} className="text-orange-500" />
              <label className="text-sm font-bold text-gray-900">Livello Attività</label>
            </div>
            <select
              value={profile.activityLevel}
              onChange={(e) => handleUpdate({ activityLevel: e.target.value as any })}
              className="w-full bg-orange-50/50 hover:bg-orange-50 border border-orange-100 rounded-xl p-3 text-sm font-medium outline-none focus:ring-2 focus:ring-orange-500 transition-all"
            >
              <option value="sedentary">Sedentario (Ufficio)</option>
              <option value="lightly_active">Leggermente Attivo (1-3 allenamenti)</option>
              <option value="moderate">Moderatamente Attivo (3-5 allenamenti)</option>
              <option value="very_active">Molto Attivo (Sport Intenso)</option>
            </select>
          </div>

          {/* Goal */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Target size={18} className="text-blue-500" />
              <label className="text-sm font-bold text-gray-900">Obiettivo</label>
            </div>
            <select
              value={profile.goal}
              onChange={(e) => handleUpdate({ goal: e.target.value as any })}
              className="w-full bg-blue-50/50 hover:bg-blue-50 border border-blue-100 rounded-xl p-3 text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            >
              <option value="loss">Perdita Peso</option>
              <option value="maintenance">Mantenimento</option>
              <option value="bulking">Aumento Massa</option>
            </select>
          </div>

          {/* Training Type */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Weight size={18} className="text-indigo-500" />
              <label className="text-sm font-bold text-gray-900">Tipo Allenamento</label>
            </div>
            <select
              value={profile.trainingType}
              onChange={(e) => handleUpdate({ trainingType: e.target.value as any })}
              className="w-full bg-indigo-50/50 hover:bg-indigo-50 border border-indigo-100 rounded-xl p-3 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            >
              <option value="bodybuilding">Bodybuilding</option>
              <option value="powerlifting">Powerlifting</option>
              <option value="crossfit">Crossfit</option>
              <option value="calisthenics">Calisthenics</option>
              <option value="cardio">Cardio / Corsa</option>
            </select>
          </div>

          {/* Workout Time */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Clock size={18} className="text-purple-500" />
              <label className="text-sm font-bold text-gray-900">Orario Allenamento</label>
            </div>
            <input
              type="time"
              value={profile.workoutTime || "18:00"}
              onChange={(e) => handleUpdate({ workoutTime: e.target.value })}
              className="w-full bg-purple-50/50 hover:bg-purple-50 border border-purple-100 rounded-xl p-3 text-sm font-medium outline-none focus:ring-2 focus:ring-purple-500 transition-all"
            />
          </div>
        </div>

        <div className="text-center py-6">
          <p className="text-xs text-gray-400 font-medium">
            v1.1 - SmartFit Pantry
          </p>
        </div>

      </div>
    </div>
  )
}

export default function App() {
  return (
    <UserProvider>
      <PantryProvider>
        <MealPlannerProvider>
          <AppContent />
        </MealPlannerProvider>
      </PantryProvider>
    </UserProvider>
  );
}
