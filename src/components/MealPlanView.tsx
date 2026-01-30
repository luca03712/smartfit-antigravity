import { useState } from 'react';
import { useMealPlanner } from '../context/MealPlannerContext';
import { useUser } from '../context/UserContext';
import { RefreshCw, Clock, Flame, ChevronDown, ChevronUp } from 'lucide-react';
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
                    className="px-8 py-4 bg-black text-white font-bold rounded-xl shadow-lg active:scale-95 transition-all"
                >
                    {isGenerating ? "In elaborazione..." : "Genera Piano Settimanale"}
                </button>
            </div>
        )
    }

    const currentDay = plan[selectedDayIndex];
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
                                    "flex flex-col items-center px-4 py-2 rounded-xl border transition-all min-w-[64px]",
                                    isSelected ? "bg-black text-white border-black shadow-md" : "bg-white text-gray-500 border-gray-100"
                                )}
                            >
                                <span className="text-[10px] font-bold uppercase">{date.toLocaleDateString('it-IT', { weekday: 'short' })}</span>
                                <span className="text-xl font-black">{date.getDate()}</span>
                            </button>
                        )
                    })}
                </div>
            </div>

            {/* Day Summary */}
            <div className="p-6 pb-2">
                <div className="flex justify-between items-end mb-4">
                    <div>
                        <h2 className="text-3xl font-black text-gray-900 capitalize tracking-tight">
                            {dayDate.toLocaleDateString('it-IT', { weekday: 'long' })}
                        </h2>
                        <div className="flex items-center gap-3 mt-1">
                            <span className="text-sm font-bold text-gray-900">
                                {Math.round(currentDay.dailyTarget.calories)} kcal
                            </span>
                            {dayHasWorkout && (
                                <span className="text-[10px] bg-black text-white px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                                    Gym Day
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Meals List */}
            <div className="px-4 space-y-4">
                {currentDay.meals.map((meal) => (
                    <MealCard key={meal.id} meal={meal} />
                ))}
            </div>

            <div className="p-6 text-center">
                <button onClick={generatePlan} className="text-sm text-gray-400 font-medium underline">
                    Rigenera Piano Settimanale
                </button>
            </div>
        </div>
    );
}

function MealCard({ meal }: { meal: Meal }) {
    const isWarning = meal.name === "NOT ENOUGH FOOD";
    const [expanded, setExpanded] = useState(false);

    return (
        <div className={clsx(
            "relative overflow-hidden rounded-2xl border transition-all",
            isWarning ? "bg-red-50 border-red-200" : "bg-white border-gray-100 shadow-sm"
        )}>
            {/* Left accent bar */}
            {!isWarning && (
                <div className={clsx(
                    "absolute left-0 top-0 bottom-0 w-1",
                    meal.type.includes('snack') ? "bg-yellow-400" : "bg-black"
                )} />
            )}

            <div className="p-4 pl-5">
                <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{meal.name}</span>
                    {!isWarning && (
                        <div className="flex items-center gap-1 text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                            <Clock size={10} />
                            {meal.prepTime} MIN
                        </div>
                    )}
                </div>

                <div className="mb-2">
                    {isWarning ? (
                        <div className="text-red-600 font-bold text-sm">
                            ⚠️ Ingredienti Insufficienti
                        </div>
                    ) : (
                        <div>
                            {/* Ingredients List */}
                            <div className="space-y-2 mt-2">
                                {meal.ingredients.map((ing, idx) => (
                                    <div key={idx} className="flex justify-between items-center text-sm border-b border-gray-50 pb-1 last:border-0">
                                        <span className="text-gray-900 font-bold">
                                            {ing.item.name}
                                        </span>
                                        <span className="font-mono text-gray-600 bg-gray-50 px-1.5 rounded text-xs">
                                            {ing.amount}{ing.item.unit}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            {/* Method Toggle */}
                            <button
                                onClick={() => setExpanded(!expanded)}
                                className="mt-3 flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors"
                            >
                                {expanded ? "Nascondi Metodo" : "Mostra Metodo"}
                                {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                            </button>

                            {expanded && (
                                <div className="mt-2 text-sm text-gray-600 bg-blue-50 p-3 rounded-lg leading-relaxed animate-in slide-in-from-top duration-200">
                                    {meal.method}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Macros Footer */}
                {!isWarning && (
                    <div className="flex gap-3 text-xs pt-3 border-t border-gray-50 mt-1">
                        <div className="flex items-center gap-1">
                            <Flame size={12} className="text-orange-500 fill-orange-500" />
                            <span className="font-black text-gray-900">{Math.round(meal.totalNutrition.calories)}</span>
                        </div>
                        <div className="text-gray-400">
                            <span className="font-bold text-gray-900">{Math.round(meal.totalNutrition.protein)}</span>p
                        </div>
                        <div className="text-gray-400">
                            <span className="font-bold text-gray-900">{Math.round(meal.totalNutrition.carbs)}</span>c
                        </div>
                        <div className="text-gray-400">
                            <span className="font-bold text-gray-900">{Math.round(meal.totalNutrition.fat)}</span>f
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
