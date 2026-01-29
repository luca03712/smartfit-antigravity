import { useState } from 'react';
import { UserProvider, useUser } from './context/UserContext';
import { InventoryProvider } from './context/InventoryContext';
import { MealPlannerProvider } from './context/MealPlannerContext';
import { Onboarding } from './components/Onboarding';
import { Layout } from './components/Layout';
import { PantryManager } from './components/PantryManager';
import { MealPlanView } from './components/MealPlanView';
import type { UserProfile } from './types';
import { Target, Weight } from 'lucide-react';

function AppContent() {
  const { hasOnboarded, profile } = useUser();
  const [activeTab, setActiveTab] = useState<'pantry' | 'planner' | 'profile'>('pantry');

  // If not onboarded, show onboarding flow
  if (!hasOnboarded) {
    return <Onboarding />;
  }

  return (
    <Layout activeTab={activeTab} onTabChange={setActiveTab}>
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
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Your Profile</h1>
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
        <div className="flex items-center gap-4 border-b border-gray-100 pb-4">
          <div className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center font-bold text-lg">
            {profile.weight}
          </div>
          <div>
            <div className="text-xs text-gray-400 font-bold uppercase">Weight</div>
            <div className="font-medium text-gray-900">kg</div>
          </div>
        </div>
        <div className="flex items-center gap-4 border-b border-gray-100 pb-4">
          <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
            <Target size={24} />
          </div>
          <div>
            <div className="text-xs text-gray-400 font-bold uppercase">Goal</div>
            <div className="font-medium text-gray-900 capitalize">{profile.goal}</div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center">
            <Weight size={24} />
          </div>
          <div>
            <div className="text-xs text-gray-400 font-bold uppercase">Training</div>
            <div className="font-medium text-gray-900 capitalize">{profile.trainingType.replace('_', ' ')}</div>
          </div>
        </div>
      </div>

      <div className="mt-8 text-center">
        <p className="text-xs text-gray-400">
          SmartFit Pantry v1.0
        </p>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <UserProvider>
      <InventoryProvider>
        <MealPlannerProvider>
          <AppContent />
        </MealPlannerProvider>
      </InventoryProvider>
    </UserProvider>
  );
}
