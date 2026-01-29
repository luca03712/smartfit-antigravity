import type { PantryItem, UserProfile, DayPlan, Meal, Nutrition, FoodCategory } from '../types';
import { calculateDailyTargets } from './calculations';

const MEAL_TYPES = ['breakfast', 'snack_am', 'lunch', 'snack_pm', 'dinner'] as const;

function getRequiredCategory(mealType: string): FoodCategory[] {
    switch (mealType) {
        case 'breakfast': return ['protein', 'carb'];
        case 'snack_am': return ['fruit', 'carb'];
        case 'lunch': return ['protein', 'carb', 'veg'];
        case 'snack_pm': return ['protein', 'carb'];
        case 'dinner': return ['protein', 'fat', 'veg'];
        default: return ['protein', 'carb'];
    }
}

// Helper to manage virtual inventory during generation
class InventoryManager {
    private items: PantryItem[];

    constructor(initialItems: PantryItem[]) {
        // Deep copy to simulate consumption without affecting real state yet
        this.items = JSON.parse(JSON.stringify(initialItems));
    }

    findAndConsume(category: FoodCategory, amountNeeded: number = 0): { item: PantryItem, amount: number } | null {
        // Simple logic: Find first item of category with quantity > 0
        // Improvement: could prioritize expiring items or open packages if we tracked that

        // Filter candidates
        const candidates = this.items.filter(i => i.category === category && i.quantity > 5); // buffer of 5g

        if (candidates.length === 0) return null;

        // Pick random or first? Let's pick random to vary diet if user has multiple options
        const itemIndex = Math.floor(Math.random() * candidates.length);
        const item = candidates[itemIndex];

        // Determine amount to consume
        // If amountNeeded is 0 (dynamic), we pick a standard portion based on item type
        let consumeAmount = amountNeeded;
        if (consumeAmount === 0) {
            // Standard portions logic
            if (item.unit === 'g') {
                switch (category) {
                    case 'protein': consumeAmount = 150; break;
                    case 'carb': consumeAmount = 80; break; // Raw weight usually
                    case 'fat': consumeAmount = 20; break;
                    case 'veg': consumeAmount = 200; break;
                    case 'fruit': consumeAmount = 150; break;
                    case 'flavor': consumeAmount = 10; break;
                    default: consumeAmount = 100;
                }
            } else {
                consumeAmount = 1; // 1 unit
            }
        }

        // Check if we have enough
        if (item.quantity < consumeAmount) {
            // Use what's left? Or fail? 
            // Let's use what's left if it's at least 50% of portion, otherwise skip/fail.
            if (item.quantity > consumeAmount * 0.5) {
                consumeAmount = item.quantity;
            } else {
                // Not enough for a meaningful portion -> try another candidate?
                // For simplicity v1: fail this item
                return null;
            }
        }

        // Deduct
        item.quantity -= consumeAmount;

        return { item, amount: Math.round(consumeAmount) };
    }
}

export function generateMealPlan(
    inventory: PantryItem[],
    profile: UserProfile
): DayPlan[] {
    const targets = calculateDailyTargets(profile);
    const plan: DayPlan[] = [];

    // Initialize Virtual Inventory
    const invManager = new InventoryManager(inventory);

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
            const categories = getRequiredCategory(mealType);

            // Adjust categories for workout logic
            if (mealType === 'snack_pm' && isTrainingDay) {
                if (!categories.includes('carb')) categories.push('carb');
            }

            const ingredients: { item: PantryItem; amount: number }[] = [];
            let mealNutrition: Nutrition = { calories: 0, protein: 0, carbs: 0, fat: 0, sugar: 0, fiber: 0, salt: 0 };

            // Attempt to fill meal
            let missingIngredients = false;

            for (const cat of categories) {
                const result = invManager.findAndConsume(cat);

                if (result) {
                    // Calculate Source Macros based on EXACT amount used
                    const { item, amount } = result;

                    // Normalize to 100g/ml or 1 unit
                    const isWeight = item.unit === 'g' || item.unit === 'ml';
                    const ratio = amount / (isWeight ? 100 : 1);

                    const n = item.nutrition;
                    mealNutrition.calories += n.calories * ratio;
                    mealNutrition.protein += n.protein * ratio;
                    mealNutrition.carbs += n.carbs * ratio;
                    mealNutrition.fat += n.fat * ratio;

                    ingredients.push({ item, amount });
                } else {
                    missingIngredients = true;
                }
            }

            if (missingIngredients && ingredients.length === 0) {
                // Completely empty meal -> Warning
                meals.push({
                    id: `meal-${i}-${mealType}`,
                    name: "NOT ENOUGH FOOD",
                    type: mealType,
                    ingredients: [],
                    totalNutrition: { calories: 0, protein: 0, carbs: 0, fat: 0, sugar: 0, fiber: 0, salt: 0 },
                    prepTime: 0,
                    instructions: ["You do not have enough ingredients in your pantry for this meal."]
                });
            } else {
                meals.push({
                    id: `meal-${i}-${mealType}`,
                    name: missingIngredients ? `${mealType.toUpperCase()} (Incomplete)` : mealType.replace('_', ' ').toUpperCase(),
                    type: mealType,
                    ingredients,
                    totalNutrition: mealNutrition,
                    prepTime: 15,
                    instructions: ['Combine ingredients.', 'Cook if necessary.', 'Serve.']
                });
            }

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
