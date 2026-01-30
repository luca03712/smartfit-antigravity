import type { PantryItem, NutriScore, Nutrition, FoodCategory } from '../types';

const INTERNAL_DB: Record<string, Partial<PantryItem>> = {
    "petto di pollo": {
        nutrition: { calories: 165, protein: 31, carbs: 0, fat: 3.6, sugar: 0, fiber: 0, salt: 0.1, saturatedFat: 1 },
        category: 'PranzoCena',
        nutriScore: 'a'
    },
    "mela": {
        nutrition: { calories: 52, protein: 0.3, carbs: 14, fat: 0.2, sugar: 10, fiber: 2.4, salt: 0, saturatedFat: 0 },
        category: 'Spuntino',
        nutriScore: 'a'
    },
    "uovo": {
        nutrition: { calories: 155, protein: 13, carbs: 1.1, fat: 11, sugar: 1.1, fiber: 0, salt: 0.1, saturatedFat: 3.3 },
        category: 'Colazione',
        nutriScore: 'b',
        unit: 'pz',
        conversionFactor: 50 // approx 50g per egg
    },
    "pasta": {
        nutrition: { calories: 350, protein: 12, carbs: 72, fat: 1.5, sugar: 3, fiber: 2.5, salt: 0, saturatedFat: 0.3 },
        category: 'PranzoCena',
        nutriScore: 'a'
    },
    "riso": {
        nutrition: { calories: 360, protein: 7, carbs: 80, fat: 0.6, sugar: 0.1, fiber: 1, salt: 0, saturatedFat: 0.1 },
        category: 'PranzoCena',
        nutriScore: 'a'
    },
    "olio d'oliva": {
        nutrition: { calories: 884, protein: 0, carbs: 0, fat: 100, sugar: 0, fiber: 0, salt: 0, saturatedFat: 14 },
        category: 'Condimento',
        nutriScore: 'c'
    },
    "avena": {
        nutrition: { calories: 389, protein: 16.9, carbs: 66, fat: 6.9, sugar: 0, fiber: 10.6, salt: 0, saturatedFat: 1.2 },
        category: 'Colazione',
        nutriScore: 'a'
    },
    "burro di arachidi": {
        nutrition: { calories: 588, protein: 25, carbs: 20, fat: 50, sugar: 9, fiber: 6, salt: 0, saturatedFat: 10 },
        category: 'Spuntino', // or Condimento
        nutriScore: 'd'
    }
};

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

            const mapCategory = (tags: string[] = []): FoodCategory => {
                const t = tags.join(' ').toLowerCase();
                if (t.includes('breakfast') || t.includes('cereal') || t.includes('petit-déjeuner')) return 'Colazione';
                if (t.includes('snack') || t.includes('dessert') || t.includes('bar')) return 'Spuntino';
                if (t.includes('sauce') || t.includes('oil') || t.includes('vinegar') || t.includes('condiment')) return 'Condimento';
                return 'PranzoCena';
            };

            return {
                name: p.product_name || "Prodotto sconosciuto",
                brand: p.brands,
                nutrition,
                nutriScore: (p.nutriscore_grade || 'e') as NutriScore,
                category: mapCategory(p.hierarchy_categories),
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
    // Exact match or partial match logic could go here
    // For now simple lookup
    for (const key in INTERNAL_DB) {
        if (q.includes(key)) { // simple "contains"
            const item = INTERNAL_DB[key];
            return { ...item, name: key.charAt(0).toUpperCase() + key.slice(1) };
        }
    }
    return null;
}
