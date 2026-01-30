import { useUser } from '../context/UserContext';
import { useMealPlanner } from '../context/MealPlannerContext';
import { Droplets, Dumbbell, Flame, Plus } from 'lucide-react';

export function Dashboard() {
    const { profile, addWater } = useUser();
    const { plan } = useMealPlanner();

    if (!profile) return null;

    // Get today's plan if available
    // Use plan[0] if it matches today? Or just find match. 
    // Since generator makes 7 days from "now", index 0 is today effectively.
    // Check date to be sure? For now assume index 0 is valid "current" plan.
    const todayPlan = plan ? plan[0] : null;

    // Calculate totals
    const consumed = {
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0
    };

    // In a real app we'd track "eaten" meals. For now, we show "Planned vs Goal".
    // Or we show "Target" since we don't have "check off meal" feature yet.
    // User request: "Show circular or bar progress for Calories... vs Daily Goal"
    // Since we don't track consumption yet, showing the PLAN totals vs TARGET makes sense.

    if (todayPlan) {
        todayPlan.meals.forEach(m => {
            consumed.calories += m.totalNutrition.calories;
            consumed.protein += m.totalNutrition.protein;
            consumed.carbs += m.totalNutrition.carbs;
            consumed.fat += m.totalNutrition.fat;
        });
    }

    // Targets from profile logic (re-calculate or use stored)
    // Actually todayPlan.dailyTarget has strict targets.
    const targets = todayPlan?.dailyTarget || { calories: 2000, protein: 150, carbs: 200, fat: 60 };

    const ProgressRing = ({ value, max, color, label }: any) => {
        const radius = 30;
        const circumference = 2 * Math.PI * radius;
        const percent = Math.min(100, Math.max(0, (value / max) * 100));
        const offset = circumference - (percent / 100) * circumference;

        return (
            <div className="flex flex-col items-center">
                <div className="relative w-20 h-20">
                    <svg className="w-full h-full transform -rotate-90">
                        <circle
                            cx="40"
                            cy="40"
                            r={radius}
                            stroke="currentColor"
                            strokeWidth="6"
                            fill="transparent"
                            className="text-gray-100"
                        />
                        <circle
                            cx="40"
                            cy="40"
                            r={radius}
                            stroke="currentColor"
                            strokeWidth="6"
                            fill="transparent"
                            strokeDasharray={circumference}
                            strokeDashoffset={offset}
                            strokeLinecap="round"
                            className={color}
                        />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center flex-col">
                        <span className="text-xs font-black">{Math.round(value)}</span>
                        <span className="text-[8px] text-gray-400 font-bold uppercase">{label}</span>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="p-6 pb-24">
            <header className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Benvenuto</h1>
                    <h2 className="text-2xl font-black text-gray-900">Today's Focus</h2>
                </div>
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-lg">
                    👋
                </div>
            </header>

            {/* Macro Rings */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 mb-6">
                <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Flame size={16} className="text-orange-500" />
                    Nutrizione Giornaliera (Pianificata)
                </h3>
                <div className="flex justify-between items-center">
                    <ProgressRing value={consumed.calories} max={targets.calories} color="text-black" label="Kcal" />
                    <ProgressRing value={consumed.protein} max={targets.protein} color="text-blue-500" label="Prot" />
                    <ProgressRing value={consumed.carbs} max={targets.carbs} color="text-yellow-500" label="Carb" />
                    <ProgressRing value={consumed.fat} max={targets.fat} color="text-red-500" label="Fat" />
                </div>
                {!todayPlan && (
                    <div className="mt-4 text-center">
                        <p className="text-xs text-red-500">Nessun piano generato per oggi.</p>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-2 gap-4">
                {/* Water Tracker */}
                <div className="bg-blue-500 text-white p-5 rounded-3xl relative overflow-hidden">
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-2">
                            <Droplets size={20} className="text-blue-200" />
                            <span className="text-sm font-bold text-blue-100">Idratazione</span>
                        </div>
                        <div className="text-3xl font-black mb-1">
                            {profile.waterIntake?.current || 0}
                            <span className="text-base font-medium text-blue-200 ml-1">ml</span>
                        </div>
                        <div className="text-xs text-blue-200 mb-4">
                            Target: {profile.waterIntake?.target || 2500}ml
                        </div>
                        <button
                            onClick={() => addWater(250)}
                            className="bg-white/20 hover:bg-white/30 backdrop-blur-sm w-full py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors"
                        >
                            <Plus size={14} /> Add 250ml
                        </button>
                    </div>
                    {/* Background decoration */}
                    <div className="absolute -bottom-4 -right-4 text-blue-400/20">
                        <Droplets size={120} />
                    </div>
                </div>

                {/* Workout Tracker */}
                <div className="bg-black text-white p-5 rounded-3xl relative overflow-hidden">
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-2">
                            <Dumbbell size={20} className="text-gray-400" />
                            <span className="text-sm font-bold text-gray-400">Allenamento</span>
                        </div>

                        {profile.workoutTime ? (
                            <>
                                <div className="text-2xl font-black mb-1">
                                    {profile.workoutTime}
                                </div>
                                <div className="text-xs text-gray-400 mb-4">
                                    Programmato
                                </div>
                                <div className="mt-4 inline-block px-3 py-1 bg-white/10 rounded-full text-[10px] font-bold uppercase text-green-400">
                                    Next Session
                                </div>
                            </>
                        ) : (
                            <div className="h-full flex flex-col justify-center">
                                <p className="text-gray-400 text-sm">Rest Day</p>
                                <p className="text-xs text-gray-600 mt-1">Riposa e recupera</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Quick Actions or Tips could go here */}
        </div>
    );
}
