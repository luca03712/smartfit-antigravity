import { useState, useEffect } from 'react';
import { usePantry } from '../context/PantryContext';
import type { PantryItem, FoodCategory, NutriScore, Nutrition } from '../types';
import { Plus, Trash2, Search, Scan, X } from 'lucide-react';
import { Scanner } from './Scanner';
import { fetchProductByBarcode, searchInternalDatabase } from '../utils/foodApi';
import { clsx } from 'clsx';

export function PantryManager() {
    const { items, addItem, removeItem, updateItem } = usePantry();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<PantryItem | null>(null);
    const [filter, setFilter] = useState<FoodCategory | 'All'>('All');

    // Body scroll lock effect
    useEffect(() => {
        if (isModalOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [isModalOpen]);

    // Derived state for list - check if category array includes filter
    const filteredItems = items.filter(item =>
        filter === 'All' ? true : item.categories?.includes(filter)
    );

    const handleAdd = () => {
        setEditingItem(null);
        setIsModalOpen(true);
    };

    const handleEdit = (item: PantryItem) => {
        setEditingItem(item);
        setIsModalOpen(true);
    };

    const handleSave = (item: PantryItem) => {
        if (editingItem) {
            updateItem(item.id, item);
        } else {
            addItem(item);
        }
        setIsModalOpen(false);
        setEditingItem(null);
    };

    return (
        <div className="p-4 pb-24 max-w-lg mx-auto">
            <header className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-black text-gray-900 tracking-tight">Dispensa</h1>
                <button
                    onClick={handleAdd}
                    className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center shadow-xl active:scale-90 transition-transform"
                >
                    <Plus size={24} />
                </button>
            </header>

            {/* Category Filter */}
            <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar">
                {(['All', 'Colazione', 'PranzoCena', 'Spuntino', 'Condimento'] as const).map(cat => (
                    <button
                        key={cat}
                        onClick={() => setFilter(cat)}
                        className={clsx(
                            "px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-colors border",
                            filter === cat
                                ? "bg-black text-white border-black"
                                : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
                        )}
                    >
                        {cat === 'All' ? 'Tutti' : cat}
                    </button>
                ))}
            </div>

            {/* List */}
            <div className="space-y-3">
                {filteredItems.length === 0 ? (
                    <div className="text-center py-12 text-gray-400">
                        <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Search size={24} className="opacity-20" />
                        </div>
                        <p className="font-medium">Nessun alimento trovato</p>
                    </div>
                ) : (
                    filteredItems.map(item => (
                        <PantryCard
                            key={item.id}
                            item={item}
                            onClick={() => handleEdit(item)}
                            onDelete={() => removeItem(item.id)}
                        />
                    ))
                )}
            </div>

            {isModalOpen && (
                <PantryItemModal
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleSave}
                    initialData={editingItem}
                />
            )}
        </div>
    );
}

function PantryCard({ item, onClick, onDelete }: { item: PantryItem, onClick: () => void, onDelete: () => void }) {
    const scoreColor = {
        'a': 'bg-green-500',
        'b': 'bg-green-400',
        'c': 'bg-yellow-400',
        'd': 'bg-orange-400',
        'e': 'bg-red-500'
    }[item.nutriScore || 'e'];

    return (
        <div
            onClick={onClick}
            className="group relative bg-white p-4 rounded-2xl shadow-sm border border-gray-100 active:scale-[0.99] transition-all cursor-pointer overflow-hidden"
        >
            <div className="flex justify-between items-start">
                <div>
                    <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-900">{item.name}</span>
                        {item.brand && <span className="text-[10px] text-gray-400 uppercase tracking-wider">{item.brand}</span>}
                    </div>
                    <div className="flex flex-wrap gap-1 mt-1">
                        {item.categories?.map(c => (
                            <span key={c} className="text-[9px] font-bold uppercase bg-gray-100 text-gray-500 px-1 rounded">{c}</span>
                        ))}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs font-mono bg-gray-100 px-2 py-0.5 rounded text-gray-600">
                            {item.quantity}{item.unit}
                        </span>
                        <span className="text-xs text-gray-400">
                            {item.nutrition.calories} kcal/100g
                        </span>
                    </div>
                </div>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold uppercase text-xs ${scoreColor}`}>
                    {item.nutriScore || '?'}
                </div>
            </div>

            {/* Macros Mini Bar */}
            <div className="flex gap-1 mt-3">
                <div className="h-1 bg-blue-500 rounded-full" style={{ flex: item.nutrition.protein }} />
                <div className="h-1 bg-amber-500 rounded-full" style={{ flex: item.nutrition.carbs }} />
                <div className="h-1 bg-rose-500 rounded-full" style={{ flex: item.nutrition.fat }} />
            </div>

            <button
                onClick={(e) => { e.stopPropagation(); if (confirm('Eliminare?')) onDelete(); }}
                className="absolute top-4 right-14 p-2 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
            >
                <Trash2 size={16} />
            </button>
        </div>
    );
}

interface ModalProps {
    onClose: () => void;
    onSave: (item: PantryItem) => void;
    initialData: PantryItem | null;
}

function PantryItemModal({ onClose, onSave, initialData }: ModalProps) {
    const [isScanning, setIsScanning] = useState(false);

    // Form State
    const [name, setName] = useState(initialData?.name || '');
    const [brand, setBrand] = useState(initialData?.brand || '');
    const [categories, setCategories] = useState<FoodCategory[]>(initialData?.categories || ['Colazione']);
    const [nutriScore, setNutriScore] = useState<NutriScore>(initialData?.nutriScore || 'c');

    // Quantity State
    const [unit, setUnit] = useState<'g' | 'ml' | 'pz'>(initialData?.unit || 'g');
    const [quantity, setQuantity] = useState<number | ''>(initialData?.quantity || '');
    const [conversion, setConversion] = useState<number | ''>(initialData?.conversionFactor || '');

    // Nutrition State
    const [nutrition, setNutrition] = useState<Nutrition>(initialData?.nutrition || {
        calories: 0, protein: 0, carbs: 0, fat: 0, sugar: 0, fiber: 0, salt: 0, saturatedFat: 0
    });

    // Auto-fill effect
    useEffect(() => {
        if (!initialData && name.length > 2) {
            const match = searchInternalDatabase(name);
            if (match) {
                if (match.nutrition) setNutrition({ ...nutrition, ...match.nutrition });
                if (match.categories) setCategories(match.categories);
                if (match.nutriScore) setNutriScore(match.nutriScore);
                if (match.unit) setUnit(match.unit);
                if (match.conversionFactor) setConversion(match.conversionFactor);
            }
        }
    }, [name, initialData]);

    const handleScan = async (code: string) => {
        setIsScanning(false);
        const data = await fetchProductByBarcode(code);
        if (data) {
            setName(data.name || name);
            if (data.brand) setBrand(data.brand);
            if (data.nutrition) setNutrition({ ...nutrition, ...data.nutrition });
            if (data.nutriScore) setNutriScore(data.nutriScore);
            if (data.categories) setCategories(data.categories);
        }
    };

    const handleSubmit = (e?: React.FormEvent) => {
        if (e) e.preventDefault();

        // Manual validation to allow button to be clickable
        if (!name.trim()) {
            alert("Inserisci il nome del prodotto per continuare.");
            return;
        }

        onSave({
            id: initialData?.id || crypto.randomUUID(),
            name,
            brand,
            categories,
            nutriScore,
            unit,
            quantity: Number(quantity) || 0,
            conversionFactor: unit === 'pz' ? Number(conversion) || 50 : undefined,
            nutrition
        });
    };

    const toggleCategory = (cat: FoodCategory) => {
        setCategories(prev =>
            prev.includes(cat)
                ? prev.filter(c => c !== cat)
                : [...prev, cat]
        );
    };

    const NumInput = ({ label, value, onChange, step = "0.1" }: { label: string, value: number, onChange: (v: number) => void, step?: string }) => (
        <div>
            <label className="text-[10px] uppercase font-bold text-gray-400 mb-1 block">{label}</label>
            <input
                type="number"
                step={step}
                min="0"
                className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-black outline-none transition-all"
                value={value === 0 ? '' : value}
                onChange={e => onChange(e.target.value === '' ? 0 : parseFloat(e.target.value))}
                placeholder="0"
            />
        </div>
    );

    if (isScanning) {
        return <Scanner onScan={handleScan} onClose={() => setIsScanning(false)} />;
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center sm:p-4">
            {/* Backdrop for Desktop */}
            <div className="hidden sm:block absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

            {/* Modal Container */}
            <div className="relative bg-white w-full h-full sm:w-full sm:max-w-lg sm:h-auto sm:max-h-[90vh] sm:rounded-3xl flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-bottom sm:zoom-in-95 duration-200">

                {/* Header (Sticky Top) */}
                <div className="flex justify-between items-center p-4 border-b border-gray-100 bg-white z-10 shrink-0">
                    <button onClick={onClose} className="p-2 -ml-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors">
                        <X size={24} />
                    </button>

                    <h2 className="text-lg font-black tracking-tight">
                        {initialData ? 'Modifica' : 'Aggiungi'}
                    </h2>

                    <button
                        onClick={() => handleSubmit()}
                        className="text-blue-600 font-bold text-base px-2 py-1 active:opacity-60"
                    >
                        Salva
                    </button>
                </div>

                {/* Scrollable Body */}
                <div className="flex-1 overflow-y-auto p-5 pb-24 space-y-6">
                    {/* Scanner Button */}
                    {!initialData && (
                        <button
                            type="button"
                            onClick={() => setIsScanning(true)}
                            className="w-full py-3 bg-blue-50 text-blue-600 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-blue-100 transition-colors"
                        >
                            <Scan size={20} />
                            Scansiona Barcode
                        </button>
                    )}

                    {/* Main Info */}
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Nome Prodotto</label>
                            <input
                                value={name}
                                onChange={e => setName(e.target.value)}
                                className="w-full text-lg font-bold border-b-2 border-gray-200 focus:border-black outline-none py-1 bg-transparent placeholder-gray-300"
                                placeholder="es. Avena"
                            />
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Categorie (Seleziona multiple)</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {(['Colazione', 'PranzoCena', 'Spuntino', 'Condimento'] as FoodCategory[]).map(cat => (
                                        <label key={cat} className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                                            <input
                                                type="checkbox"
                                                checked={categories.includes(cat)}
                                                onChange={() => toggleCategory(cat)}
                                                className="w-5 h-5 rounded border-gray-300 text-black focus:ring-black"
                                            />
                                            <span className="text-sm font-medium">{cat}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Nutri-Score</label>
                                <div className="flex bg-gray-50 rounded-lg p-1">
                                    {(['a', 'b', 'c', 'd', 'e'] as const).map(s => (
                                        <button
                                            key={s}
                                            type="button"
                                            onClick={() => setNutriScore(s)}
                                            className={clsx(
                                                "flex-1 py-1 rounded text-xs font-bold uppercase transition-all",
                                                nutriScore === s
                                                    ? "bg-black text-white shadow-sm"
                                                    : "text-gray-400 hover:text-gray-600"
                                            )}
                                        >
                                            {s}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quantity Section */}
                    <div className="bg-gray-50 p-4 rounded-xl space-y-4">
                        <div className="flex gap-4">
                            <div className="w-1/3">
                                <label className="block text-xs font-bold uppercase text-gray-400 mb-1">Unità</label>
                                <select
                                    value={unit}
                                    onChange={e => setUnit(e.target.value as any)}
                                    className="w-full p-2 bg-white rounded-lg border border-gray-200 text-sm"
                                >
                                    <option value="g">Grammi (g)</option>
                                    <option value="ml">Millilitri (ml)</option>
                                    <option value="pz">Pezzi (pz)</option>
                                </select>
                            </div>
                            <div className="flex-1">
                                <label className="block text-xs font-bold uppercase text-gray-400 mb-1">Quantità Dispensa</label>
                                <input
                                    type="number"
                                    value={quantity}
                                    onChange={e => setQuantity(Number(e.target.value))}
                                    className="w-full p-2 bg-white rounded-lg border border-gray-200 text-sm font-mono"
                                    placeholder="0"
                                />
                            </div>
                        </div>
                        {unit === 'pz' && (
                            <div>
                                <label className="block text-xs font-bold uppercase text-gray-400 mb-1">Peso per pezzo (g)</label>
                                <input
                                    type="number"
                                    value={conversion}
                                    onChange={e => setConversion(Number(e.target.value))}
                                    className="w-full p-2 bg-white rounded-lg border border-gray-200 text-sm"
                                    placeholder="Es. 50g per un uovo"
                                />
                            </div>
                        )}
                    </div>

                    {/* Nutrition Grid */}
                    <div>
                        <h3 className="text-sm font-bold mb-3">Valori Nutrizionali (su 100g)</h3>
                        <div className="grid grid-cols-4 gap-3">
                            <NumInput label="Kcal" value={nutrition.calories} onChange={v => setNutrition({ ...nutrition, calories: v })} step="1" />
                            <NumInput label="Prot" value={nutrition.protein} onChange={v => setNutrition({ ...nutrition, protein: v })} />
                            <NumInput label="Carb" value={nutrition.carbs} onChange={v => setNutrition({ ...nutrition, carbs: v })} />
                            <NumInput label="Fat" value={nutrition.fat} onChange={v => setNutrition({ ...nutrition, fat: v })} />
                            <NumInput label="Zuc" value={nutrition.sugar} onChange={v => setNutrition({ ...nutrition, sugar: v })} />
                            <NumInput label="Fib" value={nutrition.fiber} onChange={v => setNutrition({ ...nutrition, fiber: v })} />
                            <NumInput label="Sale" value={nutrition.salt} onChange={v => setNutrition({ ...nutrition, salt: v })} />
                            <NumInput label="Sat.F" value={nutrition.saturatedFat} onChange={v => setNutrition({ ...nutrition, saturatedFat: v })} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
