import type { Nutrition, FoodCategory, Unit } from '../types';

interface FoodTemplate {
    name: string;
    nutrition: Nutrition; // per 100g/ml
    category: FoodCategory;
    unit: Unit;
    defaultQuantity: number; // typical serving
}

export const foodDatabase: Record<string, FoodTemplate> = {
    // Proteins
    'chicken breast': {
        name: 'Chicken Breast',
        nutrition: { calories: 165, protein: 31, carbs: 0, fat: 3.6, sugar: 0, fiber: 0, salt: 0.2 },
        category: 'protein',
        unit: 'g',
        defaultQuantity: 150
    },
    'egg': {
        name: 'Egg',
        nutrition: { calories: 155, protein: 13, carbs: 1.1, fat: 11, sugar: 1.1, fiber: 0, salt: 0.3 }, // approx per 100g (~2 eggs)
        category: 'protein',
        unit: 'unit',
        defaultQuantity: 2 // 2 eggs
    },
    'salmon': {
        name: 'Salmon',
        nutrition: { calories: 208, protein: 20, carbs: 0, fat: 13, sugar: 0, fiber: 0, salt: 0.1 },
        category: 'protein',
        unit: 'g',
        defaultQuantity: 150
    },
    'minced beef': {
        name: 'Minced Beef (5% fat)',
        nutrition: { calories: 137, protein: 21, carbs: 0, fat: 5, sugar: 0, fiber: 0, salt: 0.2 },
        category: 'protein',
        unit: 'g',
        defaultQuantity: 150
    },
    'tofu': {
        name: 'Tofu',
        nutrition: { calories: 76, protein: 8, carbs: 1.9, fat: 4.8, sugar: 0.4, fiber: 0.3, salt: 0.1 },
        category: 'protein',
        unit: 'g',
        defaultQuantity: 150
    },

    // Carbs
    'rice': {
        name: 'White Rice (Raw)',
        nutrition: { calories: 360, protein: 7, carbs: 79, fat: 0.6, sugar: 0.1, fiber: 1.3, salt: 0 },
        category: 'carb',
        unit: 'g',
        defaultQuantity: 80
    },
    'potato': {
        name: 'Potato',
        nutrition: { calories: 77, protein: 2, carbs: 17, fat: 0.1, sugar: 0.8, fiber: 2.2, salt: 0 },
        category: 'carb',
        unit: 'g',
        defaultQuantity: 250
    },
    'oats': {
        name: 'Oats',
        nutrition: { calories: 389, protein: 16.9, carbs: 66, fat: 6.9, sugar: 0, fiber: 10.6, salt: 0 },
        category: 'carb',
        unit: 'g',
        defaultQuantity: 50
    },
    'pasta': {
        name: 'Pasta (Raw)',
        nutrition: { calories: 357, protein: 12, carbs: 73, fat: 1.4, sugar: 2, fiber: 2.7, salt: 0 },
        category: 'carb',
        unit: 'g',
        defaultQuantity: 80
    },
    'apple': {
        name: 'Apple',
        nutrition: { calories: 52, protein: 0.3, carbs: 14, fat: 0.2, sugar: 10, fiber: 2.4, salt: 0 },
        category: 'carb',
        unit: 'unit',
        defaultQuantity: 1
    },
    'banana': {
        name: 'Banana',
        nutrition: { calories: 89, protein: 1.1, carbs: 22.8, fat: 0.3, sugar: 12.2, fiber: 2.6, salt: 0 },
        category: 'carb',
        unit: 'unit',
        defaultQuantity: 1
    },

    // Fats
    'olive oil': {
        name: 'Olive Oil',
        nutrition: { calories: 884, protein: 0, carbs: 0, fat: 100, sugar: 0, fiber: 0, salt: 0 },
        category: 'fat',
        unit: 'ml',
        defaultQuantity: 10
    },
    'avocado': {
        name: 'Avocado',
        nutrition: { calories: 160, protein: 2, carbs: 8.5, fat: 14.7, sugar: 0.7, fiber: 6.7, salt: 0 },
        category: 'fat',
        unit: 'unit',
        defaultQuantity: 1
    },
    'nuts': {
        name: 'Mixed Nuts',
        nutrition: { calories: 607, protein: 20, carbs: 7, fat: 54, sugar: 4, fiber: 7, salt: 0 },
        category: 'fat',
        unit: 'g',
        defaultQuantity: 30
    },

    // Pranzo/Cena
    'broccoli': {
        name: 'Broccoli',
        nutrition: { calories: 34, protein: 2.8, carbs: 7, fat: 0.4, sugar: 1.7, fiber: 2.6, salt: 0 },
        category: 'Pranzo/Cena',
        unit: 'g',
        defaultQuantity: 100
    },
    'spinach': {
        name: 'Spinach',
        nutrition: { calories: 23, protein: 2.9, carbs: 3.6, fat: 0.4, sugar: 0.4, fiber: 2.2, salt: 0.1 },
        category: 'Pranzo/Cena',
        unit: 'g',
        defaultQuantity: 100
    },
};

// Basic Italian mapping
const ITALIAN_MAP: Record<string, string> = {
    'petto di pollo': 'chicken breast',
    'pollo': 'chicken breast',
    'uovo': 'egg',
    'uova': 'egg',
    'salmone': 'salmon',
    'macinato': 'minced beef',
    'manzo': 'minced beef',
    'carne trita': 'minced beef',
    'riso': 'rice',
    'patata': 'potato',
    'patate': 'potato',
    'avena': 'oats',
    'fiocchi di avena': 'oats',
    'pasta': 'pasta',
    'mela': 'apple',
    'banana': 'banana',
    'olio': 'olive oil',
    'olio d\'oliva': 'olive oil',
    'olio di oliva': 'olive oil',
    'avocado': 'avocado',
    'noci': 'nuts',
    'frutta secca': 'nuts',
    'broccoli': 'broccoli',
    'spinaci': 'spinach'
};

export function enrichFoodData(query: string): FoodTemplate | null {
    const normalized = query.toLowerCase().trim();

    // Check Italian Map first
    const englishKey = ITALIAN_MAP[normalized] || Object.keys(ITALIAN_MAP).find(k => normalized.includes(k)) && ITALIAN_MAP[Object.keys(ITALIAN_MAP).find(k => normalized.includes(k)) as string];

    const searchKey = englishKey || normalized;

    // Exact match
    if (foodDatabase[searchKey]) return foodDatabase[searchKey];

    // Partial match on English keys
    const found = Object.keys(foodDatabase).find(k => searchKey.includes(k) || k.includes(searchKey));
    return found ? foodDatabase[found] : null;
}

