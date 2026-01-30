import type { PantryItem, NutriScore, Nutrition, FoodCategory } from '../types';

const INTERNAL_DB: Record<string, Partial<PantryItem>> = {
    "petto di pollo": {
        nutrition: { calories: 165, protein: 31, carbs: 0, fat: 3.6, sugar: 0, fiber: 0, salt: 0.1, saturatedFat: 1 },
        categories: ['PranzoCena'],
        nutriScore: 'a',
        unit: 'g'
    },
    "mela": {
        nutrition: { calories: 52, protein: 0.3, carbs: 14, fat: 0.2, sugar: 10, fiber: 2.4, salt: 0, saturatedFat: 0 },
        categories: ['Spuntino'],
        nutriScore: 'a',
        unit: 'pz',
        conversionFactor: 180 // approx 180g per apple
    },
    "uovo": {
        nutrition: { calories: 155, protein: 13, carbs: 1.1, fat: 11, sugar: 1.1, fiber: 0, salt: 0.1, saturatedFat: 3.3 },
        categories: ['Colazione', 'PranzoCena'],
        nutriScore: 'b',
        unit: 'pz',
        conversionFactor: 55 // approx 55g per egg
    },
    "pasta": {
        nutrition: { calories: 350, protein: 12, carbs: 72, fat: 1.5, sugar: 3, fiber: 2.5, salt: 0, saturatedFat: 0.3 },
        categories: ['PranzoCena'],
        nutriScore: 'a',
        unit: 'g'
    },
    "riso": {
        nutrition: { calories: 360, protein: 7, carbs: 80, fat: 0.6, sugar: 0.1, fiber: 1, salt: 0, saturatedFat: 0.1 },
        categories: ['PranzoCena'],
        nutriScore: 'a',
        unit: 'g'
    },
    "olio d'oliva": {
        nutrition: { calories: 884, protein: 0, carbs: 0, fat: 100, sugar: 0, fiber: 0, salt: 0, saturatedFat: 14 },
        categories: ['Condimento'],
        nutriScore: 'c',
        unit: 'ml'
    },
    "avena": {
        nutrition: { calories: 389, protein: 16.9, carbs: 66, fat: 6.9, sugar: 0, fiber: 10.6, salt: 0, saturatedFat: 1.2 },
        categories: ['Colazione'],
        nutriScore: 'a',
        unit: 'g'
    },
    "burro di arachidi": {
        nutrition: { calories: 588, protein: 25, carbs: 20, fat: 50, sugar: 9, fiber: 6, salt: 0, saturatedFat: 10 },
        categories: ['Spuntino', 'Condimento'],
        nutriScore: 'd',
        unit: 'g'
    },
    "yogurt greco": {
        nutrition: { calories: 59, protein: 10, carbs: 3.6, fat: 0.4, sugar: 3.2, fiber: 0, salt: 0.1, saturatedFat: 0 },
        categories: ['Colazione', 'Spuntino'],
        nutriScore: 'a',
        unit: 'g'
    },
    "banana": {
        nutrition: { calories: 89, protein: 1.1, carbs: 22.8, fat: 0.3, sugar: 12.2, fiber: 2.6, salt: 0, saturatedFat: 0.1 },
        categories: ['Spuntino', 'Colazione'],
        nutriScore: 'b',
        unit: 'pz',
        conversionFactor: 120
    }
};

// Heuristic NutriScore Calculator
export function calculateNutriScore(n: Nutrition): NutriScore {
    let score = 0;

    // Penalties
    if (n.calories > 335) score += 4; // Energy density
    if (n.sugar > 13.5) score += 6;
    if (n.saturatedFat > 4) score += 4;
    if (n.salt > 0.9) score += 4;

    // Rewards (Fiber and Protein usually reduce the score, lower is better for NutriScore)
    if (n.fiber > 2.8) score -= 3;
    if (n.protein > 8) score -= 4;

    // Mapping approximate scores to grades
    if (score <= -1) return 'a';
    if (score <= 2) return 'b';
    if (score <= 10) return 'c';
    if (score <= 18) return 'd';
    return 'e';
}

export async function fetchProductByBarcode(barcode: string): Promise<Partial<PantryItem> | null> {
    try {
        const response = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`);
        const data = await response.json();

        if (data.status === 1 && data.product) {
            const p = data.product;
            const nutriments = p.nutriments;

            const nutrition: Nutrition = {
                calories: nutriments['energy-kcal_100g'] || 0,
                protein: nutriments['proteins_100g'] || 0,
                carbs: nutriments['carbohydrates_100g'] || 0,
                fat: nutriments['fat_100g'] || 0,
                sugar: nutriments['sugars_100g'] || 0,
                fiber: nutriments['fiber_100g'] || 0,
                salt: nutriments['salt_100g'] || 0,
                saturatedFat: nutriments['saturated-fat_100g'] || 0
            };

            const mapCategories = (tags: string[] = []): FoodCategory[] => {
                const t = tags.join(' ').toLowerCase();
                const cats: FoodCategory[] = [];

                if (t.includes('breakfast') || t.includes('cereal') || t.includes('petit-déjeuner') || t.includes('yogurt')) cats.push('Colazione');
                if (t.includes('snack') || t.includes('dessert') || t.includes('bar') || t.includes('fruit')) cats.push('Spuntino');
                if (t.includes('sauce') || t.includes('oil') || t.includes('vinegar') || t.includes('condiment') || t.includes('spice')) cats.push('Condimento');

                // If no specific category found, or if it's a main meal item
                if (cats.length === 0 || t.includes('meat') || t.includes('pasta') || t.includes('rice') || t.includes('vegetable')) {
                    cats.push('PranzoCena');
                }

                return [...new Set(cats)]; // Unique
            };

            return {
                name: p.product_name || "Prodotto sconosciuto",
                brand: p.brands,
                nutrition,
                nutriScore: (p.nutriscore_grade || calculateNutriScore(nutrition)) as NutriScore,
                categories: mapCategories(p.hierarchy_categories),
                barcode,
                unit: 'g' // Default to grams from API
            };
        }
    } catch (e) {
        console.error("API Fetch Error", e);
    }
    return null;
}

export function searchInternalDatabase(query: string): Partial<PantryItem> | null {
    const q = query.toLowerCase().trim();
    // Exact match or partial match logic
    for (const key in INTERNAL_DB) {
        if (q.includes(key)) { // simple "contains"
            const item = INTERNAL_DB[key];
            return {
                ...item,
                name: key.charAt(0).toUpperCase() + key.slice(1)
            };
        }
    }
    return null;
}
