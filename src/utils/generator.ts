import type { PantryItem, UserProfile, DayPlan, Meal, Nutrition, FoodCategory } from '../types';
import { calculateDailyTargets } from './calculations';

// Meal configuration
const MEAL_CONFIG = {
    breakfast: { name: 'Colazione', targetRatio: 0.25, type: 'breakfast' as const },
    snack_am: { name: 'Spuntino Mattina', targetRatio: 0.10, type: 'snack_am' as const },
    lunch: { name: 'Pranzo', targetRatio: 0.35, type: 'lunch' as const },
    snack_pm: { name: 'Spuntino Pomeriggio', targetRatio: 0.10, type: 'snack_pm' as const },
    dinner: { name: 'Cena', targetRatio: 0.20, type: 'dinner' as const },
};

export function generateMealPlan(inventory: PantryItem[], profile: UserProfile): DayPlan[] {
    const targets = calculateDailyTargets(profile);
    const plan: DayPlan[] = [];

    // Clone inventory for tracking usage across the week
    const virtualInventory = inventory.map(i => ({ ...i }));

    for (let day = 0; day < 7; day++) {
        const date = new Date();
        date.setDate(date.getDate() + day);

        const meals: Meal[] = [];
        let dayCalories = 0;

        for (const [key, config] of Object.entries(MEAL_CONFIG)) {
            const mealTarget = Math.round(targets.calories * config.targetRatio);

            // Filter candidates based on meal type strictly
            // Logic: Breakfast -> Colazione items, Lunch/Dinner -> PranzoCena, Snacks -> Spuntino
            let allowedCategories: FoodCategory[] = [];
            if (key === 'breakfast') allowedCategories = ['Colazione'];
            else if (key === 'lunch' || key === 'dinner') allowedCategories = ['PranzoCena'];
            else allowedCategories = ['Spuntino'];

            // Strategy: 
            // 1. Try exact match (correct category + quantity > 5g)
            // 2. Fallback: Try ANY item (ignore category strictness if starving)
            let candidates = virtualInventory.filter(i =>
                i.categories?.some(cat => allowedCategories.includes(cat)) && i.quantity > 5
            );

            // If no candidates found for this specific meal type, relax category constraint to find ANYTHING edible
            if (candidates.length === 0) {
                // Try searching ignoring category, but maybe prefer not Condiments as main
                candidates = virtualInventory.filter(i =>
                    i.quantity > 5 && !i.categories?.includes('Condimento')
                );
                // If STILL nothing, look at condiments or anything
                if (candidates.length === 0) {
                    candidates = virtualInventory.filter(i => i.quantity > 5);
                }
            }

            // Sorting: Prioritize NutriScore A/B
            candidates.sort((a, b) => {
                const scoreA = a.nutriScore || 'e';
                const scoreB = b.nutriScore || 'e';
                return scoreA.localeCompare(scoreB);
            });

            // Simplified Solver: Pick 1 random candidate from top 50% of quality if possible
            const poolSize = Math.max(1, Math.floor(candidates.length / 2));
            const selectedItem = candidates.length > 0
                ? candidates[Math.floor(Math.random() * Math.min(candidates.length, poolSize))]
                : null;

            const ingredients: { item: PantryItem; amount: number }[] = [];
            let mealNutrition: Nutrition = { calories: 0, protein: 0, carbs: 0, fat: 0, sugar: 0, fiber: 0, salt: 0, saturatedFat: 0 };

            let method = "Nessun ingrediente in dispensa. Aggiungi cibi per generare.";

            if (selectedItem) {
                // Determine Quantity
                // Calories needed = mealTarget
                // Calories per unit = (nutrition.calories / (unit === 'pz' ? 1 : 100))
                const calPerUnit = selectedItem.nutrition.calories / (selectedItem.unit === 'pz' ? 1 : 100);

                let amountNeeded = 0;
                if (calPerUnit > 0) {
                    amountNeeded = mealTarget / calPerUnit;
                }

                // Adjust for Pantry Inventory (Soft limit: don't block meal if low stock, just warn or use what's there?
                // Logic: Use what is available.
                // However, to fill the plan, user requested BEST EFFORT.
                // We will use min(amountNeeded, quantity). 
                // BUT if quantity is super low, maybe we shouldn't even pick it? 
                // Constraints: We filtered for > 5.

                let available = selectedItem.quantity;
                let actualAmount = Math.min(amountNeeded, available);

                // If unit is 'pz', round to nearest integer (or 0.5)
                if (selectedItem.unit === 'pz') {
                    // Round to nearest 0.5
                    actualAmount = Math.max(0.5, Math.floor(actualAmount * 2) / 2);
                } else {
                    actualAmount = Math.max(5, Math.floor(actualAmount)); // Minimum 5g
                }

                // Deduct from Virtual Inventory
                selectedItem.quantity = Math.max(0, selectedItem.quantity - actualAmount);

                // Add to Meal
                // We push a CLONE of the item to the meal, because the item state in virtualInventory changes
                ingredients.push({ item: { ...selectedItem }, amount: actualAmount });

                // Update Nutrition
                const ratio = actualAmount / (selectedItem.unit === 'pz' ? 1 : 100);
                mealNutrition = {
                    calories: selectedItem.nutrition.calories * ratio,
                    protein: selectedItem.nutrition.protein * ratio,
                    carbs: selectedItem.nutrition.carbs * ratio,
                    fat: selectedItem.nutrition.fat * ratio,
                    sugar: selectedItem.nutrition.sugar * ratio,
                    fiber: selectedItem.nutrition.fiber * ratio,
                    salt: selectedItem.nutrition.salt * ratio,
                    saturatedFat: selectedItem.nutrition.saturatedFat * ratio
                };

                // Recipe Method Generation
                const mainName = selectedItem.name;
                const cats = selectedItem.categories || [];

                if (cats.includes('Colazione')) method = `Prepara ${mainName} come preferisci per una colazione energetica.`;
                else if (cats.includes('Spuntino')) method = `Gusta ${mainName} come spezza-fame rapido.`;
                else if (cats.includes('PranzoCena')) {
                    if (mainName.toLowerCase().includes('pasta') || mainName.toLowerCase().includes('riso')) {
                        method = `Cuoci ${mainName} in abbondante acqua salata.`;
                    } else if (mainName.toLowerCase().includes('pollo') || mainName.toLowerCase().includes('manzo') || mainName.toLowerCase().includes('pesce')) {
                        method = `Griglia o cuoci in padella ${mainName}. Aggiungi spezie a piacere.`;
                    } else {
                        method = `Cucina ${mainName} secondo la tua ricetta preferita mantenendo le quantità indicate.`;
                    }
                } else {
                    method = `Consuma ${mainName} nella quantità indicata.`;
                }
            } else {
                // Check if inventory is empty
                const totalItems = inventory.length;
                if (totalItems === 0) {
                    method = "⚠️ Dispensa vuota. Aggiungi alimenti.";
                } else {
                    method = "Impossibile trovare alimenti adatti. Prova a variare la dispensa.";
                }
            }

            meals.push({
                id: `meal-${day}-${key}`,
                name: selectedItem ? config.name : "Niente in Dispensa",
                type: config.type,
                ingredients,
                totalNutrition: mealNutrition,
                prepTime: 5,
                method
            });

            dayCalories += mealNutrition.calories;
        }

        plan.push({
            date: date.toISOString(),
            meals,
            dailyTarget: targets
        });
    }

    return plan;
}
