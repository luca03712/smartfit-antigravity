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

            // Find items that match category AND have quantity > 0
            const candidates = virtualInventory.filter(i =>
                allowedCategories.includes(i.category) && i.quantity > 5
            );

            // Sorting: Prioritize NutriScore A/B
            candidates.sort((a, b) => {
                const scoreA = a.nutriScore || 'e';
                const scoreB = b.nutriScore || 'e';
                return scoreA.localeCompare(scoreB);
            });

            // Selection Logic:
            // 1. Pick a Main Item (Protein/Carb dense)
            // 2. Calculate amount needed to hit ~90% of meal target (leave room for condiments/veg if we had them separate)
            // For now, since categories are broad ('PranzoCena'), just pick one main item + potentially a condiment.

            // Simplified Solver: Pick 1 random candidate from top 50% of quality if possible
            const poolSize = Math.max(1, Math.floor(candidates.length / 2));
            const selectedItem = candidates.length > 0
                ? candidates[Math.floor(Math.random() * Math.min(candidates.length, poolSize))]
                : null;

            const ingredients: { item: PantryItem; amount: number }[] = [];
            let mealNutrition: Nutrition = { calories: 0, protein: 0, carbs: 0, fat: 0, sugar: 0, fiber: 0, salt: 0, saturatedFat: 0 };

            if (selectedItem) {
                // Determine Quantity
                // Calories needed = mealTarget
                // Calories per unit = (nutrition.calories / (unit === 'pz' ? 1 : 100))
                const calPerUnit = selectedItem.nutrition.calories / (selectedItem.unit === 'pz' ? 1 : 100);

                let amountNeeded = 0;
                if (calPerUnit > 0) {
                    amountNeeded = mealTarget / calPerUnit;
                }

                // Adjust for Pantry Inventory
                if (amountNeeded > selectedItem.quantity) {
                    amountNeeded = selectedItem.quantity; // Use all remaining
                }

                // If unit is 'pz', round to nearest integer or 0.5? Let's round to 0.5 if loose, or integer.
                if (selectedItem.unit === 'pz') {
                    amountNeeded = Math.round(amountNeeded * 2) / 2;
                    if (amountNeeded < 0.5) amountNeeded = 0.5;
                } else {
                    amountNeeded = Math.round(amountNeeded); // Grams integer
                }

                // Deduct from Virtual Inventory
                selectedItem.quantity -= amountNeeded;

                // Add to Meal
                ingredients.push({ item: selectedItem, amount: amountNeeded });

                // Update Nutrition
                const ratio = amountNeeded / (selectedItem.unit === 'pz' ? 1 : 100);
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
            }

            // Recipe Method Generation
            let method = "Nessun ingrediente disponibile.";
            if (ingredients.length > 0) {
                const mainName = ingredients[0].item.name;
                const cat = ingredients[0].item.category;

                if (cat === 'Colazione') method = `Prepara ${mainName} come preferisci per una colazione energetica.`;
                else if (cat === 'Spuntino') method = `Gusta ${mainName} come spezza-fame rapido.`;
                else if (cat === 'PranzoCena') {
                    if (mainName.toLowerCase().includes('pasta') || mainName.toLowerCase().includes('riso')) {
                        method = `Cuoci ${mainName} in abbondante acqua salata. Condisci a piacere (ricorda di tracciare l'olio!).`;
                    } else if (mainName.toLowerCase().includes('pollo') || mainName.toLowerCase().includes('manzo') || mainName.toLowerCase().includes('pesce')) {
                        method = `Griglia o cuoci in padella ${mainName}. Aggiungi spezie a piacere.`;
                    } else {
                        method = `Cucina ${mainName} secondo la tua ricetta preferita mantenendo le quantità indicate.`;
                    }
                }
            }

            meals.push({
                id: `meal-${day}-${key}`,
                name: config.name,
                type: config.type,
                ingredients,
                totalNutrition: mealNutrition,
                prepTime: 10,
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
