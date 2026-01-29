export type Gender = 'male' | 'female';
export type TrainingType = 'bodybuilding' | 'cardio' | 'powerlifting' | 'crossfit' | 'martial_arts';
export type Goal = 'loss' | 'maintenance' | 'bulking';
export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';

export interface WeeklySchedule {
    // Key: day index (0-6, 0=Monday), Value: Workout time string "18:00" or null if rest day
    [day: number]: string | null;
}

export interface UserProfile {
    age: number;
    weight: number; // kg
    height: number; // cm
    gender: Gender;
    trainingType: TrainingType;
    trainingFrequency: number; // days per week
    goal: Goal;
    schedule: WeeklySchedule;
}

export interface Nutrition {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    sugar: number;
    fiber: number;
    salt: number;
}

export type FoodCategory = 'protein' | 'carb' | 'fat' | 'veg' | 'flavor' | 'fruit' | 'other';
export type Unit = 'g' | 'ml' | 'unit';

export interface PantryItem {
    id: string;
    name: string;
    brand?: string;
    cost?: number;
    quantity: number;
    unit: Unit;
    nutrition: Nutrition; // per 100g/ml or per unit
    isCondiment: boolean;
    category: FoodCategory;
}

export interface Meal {
    id: string;
    name: string;
    type: 'breakfast' | 'snack_am' | 'lunch' | 'snack_pm' | 'dinner';
    ingredients: { item: PantryItem; amount: number }[];
    totalNutrition: Nutrition;
    prepTime: number; // minutes
    instructions: string[];
}

export interface DayPlan {
    date: string; // ISO date
    meals: Meal[];
    dailyTarget: Nutrition;
}
