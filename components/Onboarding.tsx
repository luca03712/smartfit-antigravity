import { useState } from 'react';
import { useUser } from '../context/UserContext';
import type { UserProfile, WeeklySchedule, Gender, TrainingType, Goal } from '../types';
import { Target, Clock, Check } from 'lucide-react';
import { clsx } from 'clsx';

const DAYS = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'];

export function Onboarding() {
    const { updateProfile } = useUser();
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState<Partial<UserProfile>>({
        gender: 'male',
        trainingType: 'bodybuilding',
        goal: 'maintenance',
        trainingFrequency: 3,
        schedule: { 0: null, 1: null, 2: null, 3: null, 4: null, 5: null, 6: null } as WeeklySchedule
    });

    const handleNext = () => {
        if (step < 3) setStep(s => s + 1);
        else handleSubmit();
    };

    const handleSubmit = () => {
        if (formData.age && formData.weight && formData.height) {
            // Safe cast as we enforce validation visually
            updateProfile(formData as UserProfile);
        }
    };

    const toggleSchedule = (dayIdx: number) => {
        const current = formData.schedule?.[dayIdx];
        const newSchedule = { ...formData.schedule };
        // Toggle: if null -> 18:00, if set -> null. Simple toggle for now.
        // Enhanced: Could show time picker. For now, default to "18:00" for simplicity or user prompt.
        newSchedule[dayIdx] = current ? null : "18:00";
        setFormData({ ...formData, schedule: newSchedule });
    };

    return (
        <div className="flex flex-col h-screen bg-gray-50 p-6 items-center justify-center">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                        {step === 1 && "Profilo"}
                        {step === 2 && "Obiettivo"}
                        {step === 3 && "Allenamento"}
                    </h1>
                    <div className="flex gap-2">
                        {[1, 2, 3].map(i => (
                            <div key={i} className={clsx("h-1 flex-1 rounded-full bg-blue-100", i <= step && "bg-blue-600")} />
                        ))}
                    </div>
                </div>

                {step === 1 && (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <label className="block">
                                <span className="text-gray-700 text-sm font-semibold">Età</span>
                                <input type="number" className="mt-1 block w-full rounded-md bg-gray-50 border-gray-200 p-3"
                                    placeholder="25"
                                    value={formData.age || ''}
                                    onChange={e => setFormData({ ...formData, age: Number(e.target.value) })}
                                />
                            </label>
                            <label className="block">
                                <span className="text-gray-700 text-sm font-semibold">Sesso</span>
                                <select className="mt-1 block w-full rounded-md bg-gray-50 border-gray-200 p-3"
                                    value={formData.gender}
                                    onChange={(e) => setFormData({ ...formData, gender: e.target.value as Gender })}
                                >
                                    <option value="male">Uomo</option>
                                    <option value="female">Donna</option>
                                </select>
                            </label>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <label className="block">
                                <span className="text-gray-700 text-sm font-semibold">Peso (kg)</span>
                                <input type="number" className="mt-1 block w-full rounded-md bg-gray-50 border-gray-200 p-3"
                                    placeholder="75"
                                    value={formData.weight || ''}
                                    onChange={e => setFormData({ ...formData, weight: Number(e.target.value) })}
                                />
                            </label>
                            <label className="block">
                                <span className="text-gray-700 text-sm font-semibold">Altezza (cm)</span>
                                <input type="number" className="mt-1 block w-full rounded-md bg-gray-50 border-gray-200 p-3"
                                    placeholder="180"
                                    value={formData.height || ''}
                                    onChange={e => setFormData({ ...formData, height: Number(e.target.value) })}
                                />
                            </label>
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div className="space-y-6">
                        <div>
                            <span className="text-gray-700 text-sm font-semibold mb-2 block">Tipo di Allenamento</span>
                            <div className="grid grid-cols-2 gap-3">
                                {(['bodybuilding', 'cardio', 'powerlifting', 'crossfit', 'martial_arts'] as TrainingType[]).map(type => (
                                    <button key={type}
                                        onClick={() => setFormData({ ...formData, trainingType: type })}
                                        className={clsx(
                                            "p-3 rounded-lg border text-sm capitalize transition-all",
                                            formData.trainingType === type ? "border-blue-500 bg-blue-50 text-blue-700 font-bold shadow-sm" : "border-gray-200 text-gray-600 hover:bg-gray-50"
                                        )}
                                    >
                                        {type.replace('_', ' ')}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <span className="text-gray-700 text-sm font-semibold mb-2 block">Obiettivo Principale</span>
                            <div className="space-y-2">
                                {(['loss', 'maintenance', 'bulking'] as Goal[]).map(g => (
                                    <button key={g}
                                        onClick={() => setFormData({ ...formData, goal: g })}
                                        className={clsx(
                                            "w-full p-4 rounded-xl border flex items-center gap-3 transition-all",
                                            formData.goal === g ? "border-blue-500 bg-blue-50 ring-1 ring-blue-500" : "border-gray-200 hover:bg-gray-50"
                                        )}
                                    >
                                        <div className={clsx("p-2 rounded-full", formData.goal === g ? "bg-blue-200 text-blue-700" : "bg-gray-100 text-gray-500")}>
                                            <Target size={20} />
                                        </div>
                                        <div className="text-left">
                                            <div className={clsx("font-bold text-sm uppercase", formData.goal === g ? "text-blue-900" : "text-gray-900")}>
                                                {g === 'loss' && "Dimagrimento"}
                                                {g === 'maintenance' && "Mantenimento"}
                                                {g === 'bulking' && "Massa"}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {g === 'loss' && "Deficit Calorico"}
                                                {g === 'maintenance' && "Ricomposizione"}
                                                {g === 'bulking' && "Surplus Calorico"}
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div className="space-y-6">
                        <div className="bg-blue-50 p-4 rounded-lg text-sm text-blue-800">
                            <Clock className="inline w-4 h-4 mr-1 mb-0.5" />
                            Seleziona i giorni di allenamento. Imposetremo <b>18:00</b> come orario predefinito.
                        </div>

                        <div className="grid grid-cols-7 gap-2">
                            {DAYS.map((day, idx) => {
                                const isSelected = !!formData.schedule?.[idx];
                                return (
                                    <div key={day} className="flex flex-col items-center gap-1">
                                        <button
                                            onClick={() => toggleSchedule(idx)}
                                            className={clsx(
                                                "w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all",
                                                isSelected ? "bg-blue-600 text-white shadow-md shadow-blue-200" : "bg-gray-100 text-gray-400"
                                            )}
                                        >
                                            {day.charAt(0)}
                                        </button>
                                        {isSelected && <span className="text-[10px] text-gray-500">18:00</span>}
                                    </div>
                                )
                            })}
                        </div>

                        <div className="mt-8 pt-4 border-t border-gray-100">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-500">Frequenza Settimanale:</span>
                                <span className="font-bold text-gray-900">
                                    {Object.values(formData.schedule || {}).filter(Boolean).length} Giorni
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                <button
                    onClick={handleNext}
                    disabled={step === 1 && (!formData.weight || !formData.height || !formData.age)}
                    className="w-full mt-8 bg-black text-white py-4 rounded-xl font-bold text-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                >
                    {step === 3 ? "Completato" : "Continua"}
                    {step === 3 && <Check size={20} />}
                </button>
            </div>
        </div>
    );
}
