import type { UserProfile, Nutrition } from '../types';

export function calculateTDEE(profile: UserProfile): number {
    // Mifflin-St Jeor Equation
    let bmr = 10 * profile.weight + 6.25 * profile.height - 5 * profile.age;

    if (profile.gender === 'male') {
        bmr += 5;
    } else {
        bmr -= 161;
    }

    // Activity Multiplier
    // Base it on training frequency mostly, but could ask for activity level. 
    // For now, map training frequency to approximate activity level.
    let activityMultiplier = 1.2; // Sedentary

    if (profile.trainingFrequency >= 1 && profile.trainingFrequency <= 2) activityMultiplier = 1.375; // Light
    else if (profile.trainingFrequency >= 3 && profile.trainingFrequency <= 4) activityMultiplier = 1.55; // Moderate
    else if (profile.trainingFrequency >= 5 && profile.trainingFrequency <= 6) activityMultiplier = 1.725; // Active
    else if (profile.trainingFrequency >= 7) activityMultiplier = 1.9; // Very Active

    // Adjust slightly for "trainingType" intensity if needed, but frequency is a good proxy.
    // Exception: 'bodybuilding' or 'crossfit' might imply higher intensity than 'cardio'.
    if (profile.trainingType === 'crossfit' || profile.trainingType === 'martial_arts') {
        activityMultiplier += 0.05;
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
    // Standard bodybuilding: 40/40/20 or similar.
    // Loss: High Protein.
    // Bulking: Moderate Protein, High Carb.

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
    // Protein = 4 kcal/g
    // Carbs = 4 kcal/g
    // Fat = 9 kcal/g

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
    };
}
