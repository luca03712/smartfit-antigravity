export type Gender = 'male' | 'female';
export type TrainingType = 'bodybuilding' | 'cardio' | 'powerlifting' | 'crossfit' | 'martial_arts';
export type Goal = 'loss' | 'maintenance' | 'bulking';
export type ActivityLevel = 'sedentary' | 'lightly_active' | 'moderate' | 'very_active';

export interface WeeklySchedule {
    // Key: day index (0-6, 0=Monday), Value: Workout time string "18:00" or null if rest day
    [day: number]: string | null;
}

export interface UserProfile {
    age: number;
    weight: number; // kg
    height: number; // cm
    gender: Gender;
    activityLevel: ActivityLevel;
    trainingType: TrainingType;
    trainingFrequency: number; // days per week
    goal: Goal;
    schedule: WeeklySchedule;
    waterIntake: {
        current: number; // ml
        target: number; // ml
    };
    workoutTime?: string; // e.g. "18:00"
}

export interface Nutrition {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    sugar: number;
    fiber: number;
    salt: number;
    saturatedFat: number;
}

export type FoodCategory = 'Colazione' | 'PranzoCena' | 'Spuntino' | 'Condimento';
export type Unit = 'g' | 'ml' | 'pz';
export type NutriScore = 'a' | 'b' | 'c' | 'd' | 'e';

export interface PantryItem {
    id: string;
    name: string;
    brand?: string;
    quantity: number;
    unit: Unit;
    nutrition: Nutrition; // per 100g/ml or per 1 conversionFactor
    nutriScore?: NutriScore;
    category: FoodCategory;
    conversionFactor?: number; // if unit is 'pz', grams per piece
    barcode?: string;
}

export interface Meal {
    id: string;
    name: string;
    type: 'breakfast' | 'snack_am' | 'lunch' | 'snack_pm' | 'dinner';
    ingredients: { item: PantryItem; amount: number }[]; // amount in 'g' or 'ml' usually, or 'pz' if handled
    totalNutrition: Nutrition;
    prepTime: number; // minutes
    method: string; // generated procedural instructions
}

export interface DayPlan {
    date: string; // ISO date
    meals: Meal[];
    dailyTarget: Nutrition;
}
