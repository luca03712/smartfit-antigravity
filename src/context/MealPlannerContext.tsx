import { createContext, useContext, useState } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import type { ReactNode } from 'react';
import type { DayPlan } from '../types';
import { generateMealPlan } from '../utils/generator';
import { useUser } from './UserContext';
import { useInventory } from './InventoryContext';

interface MealPlannerContextType {
    plan: DayPlan[] | null;
    generatePlan: () => void;
    isGenerating: boolean;
}

const MealPlannerContext = createContext<MealPlannerContextType | undefined>(undefined);

export const MealPlannerProvider = ({ children }: { children: ReactNode }) => {
    const [plan, setPlan] = useLocalStorage<DayPlan[] | null>('sfp_meal_plan', null);
    const [isGenerating, setIsGenerating] = useState(false);
    const { profile } = useUser();
    const { items: inventory } = useInventory();

    const generate = () => {
        if (!profile) return;
        setIsGenerating(true);
        // Simulate async for UX
        setTimeout(() => {
            const newPlan = generateMealPlan(inventory, profile);
            setPlan(newPlan);
            setIsGenerating(false);
        }, 1000);
    };

    return (
        <MealPlannerContext.Provider value={{ plan, generatePlan: generate, isGenerating }}>
            {children}
        </MealPlannerContext.Provider>
    );
};

export const useMealPlanner = () => {
    const context = useContext(MealPlannerContext);
    if (context === undefined) {
        throw new Error('useMealPlanner must be used within a MealPlannerProvider');
    }
    return context;
};
