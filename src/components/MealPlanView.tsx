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

    if (!plan || plan.length === 0) {
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
    if (!currentDay) return null;

    const dayDate = new Date(currentDay.date);
    const dayHasWorkout = !!profile?.schedule[(dayDate.getDay() + 6) % 7];
    const dailyCalories = Math.round(currentDay.meals.reduce((acc, meal) => acc + meal.totalNutrition.calories, 0));

    return (
        <div className="pb-24">
            {/* Header / Tabs & Regenerate Button */}
            <div className="sticky top-0 bg-white z-20 border-b border-gray-100 shadow-sm flex items-center justify-between p-2 pl-4">
                {/* Day Selector - Horizontal Scroll */}
                <div className="flex gap-2 overflow-x-auto no-scrollbar flex-1 mr-4 py-2">
                    {plan.map((day, idx) => {
                        const date = new Date(day.date);
                        const isSelected = idx === selectedDayIndex;
                        return (
                            <button
                                key={idx}
                                onClick={() => setSelectedDayIndex(idx)}
                                className={clsx(
                                    "flex flex-col items-center justify-center min-w-[50px] h-14 rounded-2xl transition-all border flex-shrink-0",
                                    isSelected
                                        ? "bg-black text-white border-black scale-105 shadow-md"
                                        : "bg-white text-gray-400 border-gray-100 hover:border-gray-300"
                                )}
                            >
                                <span className="text-[10px] font-bold uppercase">{date.toLocaleDateString('it-IT', { weekday: 'short' })}</span>
                                <span className="text-lg font-black leading-none">{date.getDate()}</span>
                            </button>
                        )
                    })}
                </div>

                {/* Compact Regenerate Button */}
                <button
                    onClick={generatePlan}
                    disabled={isGenerating}
                    className="w-10 h-10 bg-gray-100 text-gray-900 rounded-full flex items-center justify-center hover:bg-gray-200 active:scale-95 transition-all shrink-0 shadow-sm"
                    title="Rigenera Piano"
                >
                    <RefreshCw size={18} className={clsx(isGenerating && "animate-spin")} />
                </button>
            </div>

            {/* Content w/ Padding */}
            <div className="p-4 space-y-6">

                {/* Daily Summary Cards */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-black text-white p-5 rounded-3xl shadow-lg relative overflow-hidden">
                        <div className="relative z-10">
                            <p className="text-[10px] font-bold uppercase text-gray-400 mb-1">Target Calorie</p>
                            <div className="text-3xl font-black tracking-tighter">
                                {Math.round(currentDay.dailyTarget.calories)}
                                <span className="text-sm font-normal text-gray-500 ml-1">kcal</span>
                            </div>
                        </div>
                        {/* Decoration: Workout Indicator */}
                        {dayHasWorkout && (
                            <div className="absolute top-3 right-3">
                                <span className="text-[8px] bg-white/20 text-white px-2 py-1 rounded font-bold uppercase tracking-wider backdrop-blur-sm">
                                    Gym Day
                                </span>
                            </div>
                        )}
                    </div>
                    <div className="bg-orange-50 text-orange-900 p-5 rounded-3xl border border-orange-100">
                        <p className="text-[10px] font-bold uppercase text-orange-400 mb-1">Totale Pasti</p>
                        <div className="text-3xl font-black tracking-tighter">
                            {dailyCalories}
                            <span className="text-sm font-normal text-orange-300 ml-1">kcal</span>
                        </div>
                    </div>
                </div>

                {/* Day Header Title */}
                <div>
                    <h2 className="text-2xl font-black text-gray-900 capitalize tracking-tight flex items-center gap-2">
                        {dayDate.toLocaleDateString('it-IT', { weekday: 'long' })}
                        <span className="text-gray-300 text-lg font-medium">
                            {dayDate.toLocaleDateString('it-IT', { day: 'numeric', month: 'long' })}
                        </span>
                    </h2>
                </div>

                {/* Meals List */}
                <div className="space-y-4">
                    {currentDay.meals.map((meal) => (
                        <MealCard key={meal.id} meal={meal} />
                    ))}
                </div>
            </div>
        </div>
    );
}

function MealCard({ meal }: { meal: Meal }) {
    const isWarning = meal.name === "NOT ENOUGH FOOD" || meal.name === "Mancano Ingredienti" || meal.name.includes("Mancano");
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
                        <div>
                            <div className="text-red-600 font-bold text-sm mb-1">
                                ⚠️ {meal.name}
                            </div>
                            <p className="text-xs text-red-500">{meal.method}</p>
                        </div>
                    ) : (
                        <div>
                            {/* Ingredients List */}
                            <div className="space-y-2 mt-2">
                                {meal.ingredients.map((ing, idx) => (
                                    <div key={idx} className="flex justify-between items-center text-sm border-b border-gray-50 pb-1 last:border-0 hover:bg-gray-50 px-1 -mx-1 rounded transition-colors">
                                        <span className="text-gray-900 font-bold">
                                            {ing.item.name}
                                        </span>
                                        <span className="font-mono text-gray-600 bg-gray-100 px-1.5 rounded text-xs">
                                            {ing.amount}{ing.item.unit}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            {/* Method Toggle */}
                            <button
                                onClick={() => setExpanded(!expanded)}
                                className="mt-4 flex items-center gap-1 text-[10px] font-bold uppercase text-blue-600 hover:text-blue-800 transition-colors bg-blue-50 px-3 py-1.5 rounded-full w-full justify-center"
                            >
                                {expanded ? "Nascondi Metodo" : "Mostra Preparazione"}
                                {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                            </button>

                            {expanded && (
                                <div className="mt-3 text-sm text-gray-600 bg-gray-50 p-4 rounded-xl leading-relaxed animate-in slide-in-from-top duration-200 border border-gray-100">
                                    <p className="font-medium">{meal.method}</p>
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
