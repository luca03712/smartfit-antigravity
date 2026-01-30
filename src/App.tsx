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

// Simple Read-Only Profile View
function ProfileView({ profile }: { profile: UserProfile }) {
  const { updateProfile } = useUser();
  const { calories, protein, carbs, fat } = calculateDailyTargets(profile); // We'd need to import this or just show base

  const handleUpdate = (updates: Partial<UserProfile>) => {
    updateProfile({ ...profile, ...updates });
  };

  return (
    <div className="p-6 pb-24">
      <h1 className="text-2xl font-black mb-6 tracking-tight">Il Tuo Profilo</h1>

      {/* Cards Grid */}
      <div className="space-y-4">

        {/* Physical Stats */}
        <div className="bg-white p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 flex justify-between items-center">
          <div>
            <p className="text-gray-400 text-xs font-bold uppercase mb-1">Peso attuale</p>
            <div className="text-3xl font-black tracking-tighter">{profile.weight}<span className="text-lg text-gray-400 font-medium ml-1">kg</span></div>
          </div>
          <div>
            <p className="text-gray-400 text-xs font-bold uppercase mb-1">Altezza</p>
            <div className="text-3xl font-black tracking-tighter">{profile.height}<span className="text-lg text-gray-400 font-medium ml-1">cm</span></div>
          </div>
          <div>
            <p className="text-gray-400 text-xs font-bold uppercase mb-1">Età</p>
            <div className="text-3xl font-black tracking-tighter">{profile.age}<span className="text-lg text-gray-400 font-medium ml-1">anni</span></div>
          </div>
        </div>

        {/* Activity & Goals */}
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
              <option value="sedentary">Sedentario (Ufficio, poco movimento)</option>
              <option value="lightly_active">Leggermente Attivo (1-3 allenamenti)</option>
              <option value="moderate">Moderato (3-5 allenamenti)</option>
              <option value="very_active">Molto Attivo (Lavoro fisico / sport intenso)</option>
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
            <p className="text-[10px] text-gray-400 mt-2 font-medium">Usato per inviarti notifiche pre-workout.</p>
          </div>
        </div>

        {/* Info */}
        <div className="text-center py-6">
          <p className="text-xs text-gray-400 font-medium">
            Il tuo piano nutrizionale si aggiorna automaticamente in base a queste impostazioni.
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
