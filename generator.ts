import type { PantryItem, UserProfile, DayPlan, Meal, Nutrition, FoodCategory } from '../types';
import { calculateDailyTargets } from './calculations';
import { foodDatabase } from '../data/foodDatabase';

const MEAL_TYPES = ['breakfast', 'snack_am', 'lunch', 'snack_pm', 'dinner'] as const;

function getRequiredCategory(mealType: string): FoodCategory[] {
    switch (mealType) {
        case 'breakfast': return ['protein', 'carb']; // Eggs + Toast / Oats + Whey
        case 'snack_am': return ['fruit', 'carb']; // Fruit / Nuts (mapped to correct category in db?)
        case 'lunch': return ['protein', 'carb', 'veg'];
        case 'snack_pm': return ['protein', 'carb']; // Pre-workout basically
        case 'dinner': return ['protein', 'fat', 'veg']; // Often lighter on carbs if cutting, but depends.
        default: return ['protein', 'carb'];
    }
}

// Helper to find item in inventory or database
function findBestItem(
    category: FoodCategory,
    inventory: PantryItem[],
    excludeIds: string[]
): { item: PantryItem | any, source: 'inventory' | 'db' } | null {

    // 1. Try Inventory
    const inPantry = inventory.find(i => i.category === category && !excludeIds.includes(i.id) && i.quantity > 0);
    if (inPantry) return { item: inPantry, source: 'inventory' };

    // 2. Try DB (Mock fallback)
    const dbKeys = Object.keys(foodDatabase);
    const dbMatchKey = dbKeys.find(k => foodDatabase[k].category === category);
    if (dbMatchKey) {
        const dbItem = foodDatabase[dbMatchKey];
        return {
            item: {
                id: `db-${dbMatchKey}`,
                name: dbItem.name,
                nutrition: dbItem.nutrition,
                category: dbItem.category,
                unit: dbItem.unit,
                isCondiment: false,
                quantity: 0
            },
            source: 'db'
        };
    }

    return null;
}

export function generateMealPlan(
    inventory: PantryItem[],
    profile: UserProfile
): DayPlan[] {
    const targets = calculateDailyTargets(profile);
    const plan: DayPlan[] = [];

    // Generate 7 days
    for (let i = 0; i < 7; i++) {
        const date = new Date();
        date.setDate(date.getDate() + i);

        const dayIndex = (date.getDay() + 6) % 7; // Monday = 0

        const workoutTime = profile.schedule[dayIndex];
        const isTrainingDay = !!workoutTime;

        const meals: Meal[] = [];
        let currentCalories = 0;

        MEAL_TYPES.forEach(mealType => {
            // Determine strategy based on workout
            // If workout is at 18:00, snack_pm (taken around 16:00-17:00) should be Carb heavy.
            // If workout is at 08:00, breakfast should be Carb heavy.

            const categories = getRequiredCategory(mealType);
            const ingredients: { item: PantryItem; amount: number }[] = [];
            let mealNutrition: Nutrition = { calories: 0, protein: 0, carbs: 0, fat: 0, sugar: 0, fiber: 0, salt: 0 };
            let prepTime = 15;

            // Smart Schedule Logic: Pre-workout check
            // Simple heuristic: If meal is 'snack_pm' and workout is evening, ensure Carbs.
            if (mealType === 'snack_pm' && isTrainingDay) {
                // Force carb focus
                if (!categories.includes('carb')) categories.push('carb');
                prepTime = 5; // Quick snack
            }

            categories.forEach(cat => {
                // Find ingredient
                const found = findBestItem(cat, inventory, []);
                if (found) {
                    // Calculate amount (Placeholder logic: standard portion)
                    // Real logic would calculate based on remaining macro needs for the day.
                    // Simplified: Use "Default Quantity" from DB or standard 100g/unit for now.
                    const amount = 100; // Default 100g/unit for simplicity in v1

                    // Calc macro contribution
                    const ratio = amount / (found.item.unit === 'g' || found.item.unit === 'ml' ? 100 : 1);

                    const n = found.item.nutrition;
                    mealNutrition.calories += n.calories * ratio;
                    mealNutrition.protein += n.protein * ratio;
                    mealNutrition.carbs += n.carbs * ratio;
                    mealNutrition.fat += n.fat * ratio;

                    ingredients.push({ item: found.item, amount });
                }
            });

            meals.push({
                id: `meal-${i}-${mealType}`,
                name: `${mealType.replace('_', ' ').toUpperCase()}`,
                type: mealType,
                ingredients,
                totalNutrition: mealNutrition,
                prepTime,
                instructions: ['Combine ingredients.', 'Cook if necessary.', 'Serve.']
            });

            currentCalories += mealNutrition.calories;
        });

        plan.push({
            date: date.toISOString(),
            meals,
            dailyTarget: targets
        });
    }

    return plan;
}
