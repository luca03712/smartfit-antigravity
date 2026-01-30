import type { UserProfile, Nutrition } from '../types';

export function calculateTDEE(profile: UserProfile): number {
    // Mifflin-St Jeor Equation
    let bmr = 10 * profile.weight + 6.25 * profile.height - 5 * profile.age;

    if (profile.gender === 'male') {
        bmr += 5;
    } else {
        bmr -= 161;
    }

    // Activity Multiplier from explicit profile setting
    let activityMultiplier = 1.2;
    switch (profile.activityLevel) {
        case 'sedentary': activityMultiplier = 1.2; break;
        case 'lightly_active': activityMultiplier = 1.375; break;
        case 'moderate': activityMultiplier = 1.55; break;
        case 'very_active': activityMultiplier = 1.725; break;
        default: activityMultiplier = 1.2;
    }

    const tdee = bmr * activityMultiplier;

    // Goal Adjustment
    switch (profile.goal) {
        case 'loss': return Math.round(tdee - 500); // 500 calorie deficit
        case 'bulking': return Math.round(tdee + 300); // 300 calorie surplus
        case 'maintenance':
        default: return Math.round(tdee);
    }
}

export function calculateDailyTargets(profile: UserProfile): Nutrition {
    const calories = calculateTDEE(profile);

    // Macro Split (Protein/Carb/Fat)
    let proteinRatio = 0.3;
    let fatRatio = 0.3;
    let carbRatio = 0.4;

    if (profile.goal === 'loss') {
        proteinRatio = 0.4;
        fatRatio = 0.3;
        carbRatio = 0.3;
    } else if (profile.goal === 'bulking') {
        proteinRatio = 0.3;
        fatRatio = 0.2;
        carbRatio = 0.5;
    }

    // Gram calculations
    // Protein = 4 kcal/g, Carbs = 4 kcal/g, Fat = 9 kcal/g
    const protein = Math.round((calories * proteinRatio) / 4);
    const fat = Math.round((calories * fatRatio) / 9);
    const carbs = Math.round((calories * carbRatio) / 4);

    return {
        calories,
        protein,
        carbs,
        fat,
        sugar: 30, // Recommended limit
        fiber: 30, // Recommended
        salt: 6, // Recommended
        saturatedFat: 20
    };
}
