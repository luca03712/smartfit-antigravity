import { useState } from 'react';
import { useMealPlanner } from '../context/MealPlannerContext';
import { useUser } from '../context/UserContext';
import { RefreshCw, Clock, Flame } from 'lucide-react';
import { clsx } from 'clsx';
import type { Meal } from '../types';

export function MealPlanView() {
    const { plan, generatePlan, isGenerating } = useMealPlanner();
    const { profile } = useUser();
    const [selectedDayIndex, setSelectedDayIndex] = useState(0);

    if (!plan) {
        return (
            <div className="flex flex-col items-center justify-center p-8 text-center h-[60vh]">
                <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-6 text-blue-500">
                    <RefreshCw size={40} />
                </div>
                <h2 className="text-xl font-bold mb-2">Nessun Piano</h2>
                <p className="text-gray-500 mb-8 max-w-xs">
                    Genereremo un piano di 7 giorni basato sulla tua dispensa e i tuoi obiettivi.
                </p>
                <button
                    onClick={generatePlan}
                    disabled={isGenerating}
                    className="px-8 py-4 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-200 active:scale-95 transition-all"
                >
                    {isGenerating ? "In elaborazione..." : "Genera Piano"}
                </button>
            </div>
        )
    }

    const currentDay = plan[selectedDayIndex];
    // Simple date format
    const dayDate = new Date(currentDay?.date || new Date());
    const dayHasWorkout = !!profile?.schedule[(dayDate.getDay() + 6) % 7];

    return (
        <div className="pb-24">
            {/* Date Header / Tabs */}
            <div className="sticky top-0 bg-white z-10 border-b border-gray-100 shadow-sm overflow-x-auto no-scrollbar">
                <div className="flex p-2 gap-2 min-w-max">
                    {plan.map((day, idx) => {
                        const date = new Date(day.date);
                        const isSelected = idx === selectedDayIndex;


                        return (
                            <button
                                key={idx}
                                onClick={() => setSelectedDayIndex(idx)}
                                className={clsx(
                                    "flex flex-col items-center px-4 py-2 rounded-xl border transition-all min-w-[60px]",
                                    isSelected ? "bg-black text-white border-black" : "bg-white text-gray-500 border-gray-200"
                                )}
                            >
                                <span className="text-[10px] font-bold uppercase">{date.toLocaleDateString('it-IT', { weekday: 'short' })}</span>
                                <span className="text-lg font-bold">{date.getDate()}</span>
                            </button>
                        )
                    })}
                </div>
            </div>

            {/* Day Summary */}
            <div className="p-6 pb-2">
                <div className="flex justify-between items-end mb-4">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 capitalize">
                            {dayDate.toLocaleDateString('it-IT', { weekday: 'long' })}
                        </h2>
                        <p className="text-sm text-gray-500 flex items-center gap-2">
                            {Math.round(currentDay.dailyTarget.calories)} kcal Target
                            {dayHasWorkout && <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-bold">Allenamento</span>}
                        </p>
                    </div>
                    <button onClick={generatePlan} className="p-2 bg-gray-100 rounded-full text-gray-500">
                        <RefreshCw size={16} />
                    </button>
                </div>
            </div>

            {/* Meals List */}
            <div className="px-6 space-y-6">
                {currentDay.meals.map((meal) => (
                    <MealCard key={meal.id} meal={meal} />
                ))}
            </div>
        </div>
    );
}

function MealCard({ meal }: { meal: Meal }) {
    const isMain = meal.type === 'lunch' || meal.type === 'dinner' || meal.type === 'breakfast';

    return (
        <div className={clsx(
            "relative overflow-hidden rounded-2xl border transition-all",
            isMain ? "bg-white border-gray-200 shadow-sm" : "bg-gray-50 border-transparent"
        )}>
            {/* Left accent bar */}
            <div className={clsx(
                "absolute left-0 top-0 bottom-0 w-1",
                meal.type.includes('snack') ? "bg-yellow-400" : "bg-blue-500"
            )} />

            <div className="p-4 pl-6">
                <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{meal.name}</span>
                    <div className="flex items-center gap-1 text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                        <Clock size={12} />
                        {meal.prepTime} min
                    </div>
                </div>

                <div className="mb-3">
                    <div className="font-bold text-lg text-gray-800">
                        {meal.ingredients.map(i => i.item.name).join(' + ')}
                    </div>
                </div>

                {/* Macros */}
                <div className="flex gap-4 text-xs">
                    <div className="flex items-center gap-1">
                        <Flame size={12} className="text-orange-500" />
                        <span className="font-bold">{Math.round(meal.totalNutrition.calories)}</span>
                        <span className="text-gray-400">kcal</span>
                    </div>
                    <div>
                        <span className="font-bold text-gray-700">{Math.round(meal.totalNutrition.protein)}g</span>
                        <span className="text-gray-400"> Pro</span>
                    </div>
                    <div>
                        <span className="font-bold text-gray-700">{Math.round(meal.totalNutrition.carbs)}g</span>
                        <span className="text-gray-400"> Carb</span>
                    </div>
                    <div>
                        <span className="font-bold text-gray-700">{Math.round(meal.totalNutrition.fat)}g</span>
                        <span className="text-gray-400"> Fat</span>
                    </div>
                </div>
            </div>
        </div>
    )
}
