import { useState } from 'react';
import { useInventory } from '../context/InventoryContext';
import type { PantryItem, FoodCategory } from '../types';
import { Plus, Trash2, Search } from 'lucide-react'; // Zap changed to Edit2 if available, or just use text/click
import { Edit2 } from 'lucide-react';
import { clsx } from 'clsx';

export function PantryManager() {
    const { items, addItem, removeItem, updateItem } = useInventory();
    const [editingItem, setEditingItem] = useState<PantryItem | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [filter, setFilter] = useState<'all' | 'condiment' | 'food'>('all');

    const filteredItems = items.filter(item => {
        if (filter === 'condiment') return item.isCondiment;
        if (filter === 'food') return !item.isCondiment;
        return true;
    });

    const handleEdit = (item: PantryItem) => {
        setEditingItem(item);
        setIsModalOpen(true);
    };

    const handleAdd = () => {
        setEditingItem(null);
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
        <div className="p-6 pb-24">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">La Mia Dispensa</h1>
                <button
                    onClick={handleAdd}
                    className="w-10 h-10 bg-black text-white rounded-full flex items-center justify-center shadow-lg active:scale-90 transition-transform"
                >
                    <Plus size={24} />
                </button>
            </div>

            {/* Filter Tabs */}
            <div className="flex bg-gray-100 p-1 rounded-xl mb-6">
                {(['all', 'food', 'condiment'] as const).map(f => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={clsx(
                            "flex-1 py-2 text-xs font-semibold uppercase tracking-wider rounded-lg transition-all",
                            filter === f ? "bg-white text-black shadow-sm" : "text-gray-500"
                        )}
                    >
                        {f === 'food' ? "Cibo" : f === 'condiment' ? "Extra" : "Tutti"}
                    </button>
                ))}
            </div>

            <div className="space-y-3">
                {filteredItems.length === 0 ? (
                    <div className="text-center py-12 text-gray-400">
                        <Search size={48} className="mx-auto mb-4 opacity-20" />
                        <p>La dispensa è vuota.</p>
                        <p className="text-sm">Aggiungi ingredienti per iniziare.</p>
                    </div>
                ) : (
                    filteredItems.map(item => (
                        <div
                            key={item.id}
                            onClick={() => handleEdit(item)}
                            className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center cursor-pointer hover:border-gray-300 transition-colors"
                        >
                            <div className="flex-1">
                                <div className="font-bold text-gray-900 flex items-center gap-2">
                                    {item.name}
                                    {item.isCondiment && <span className="text-[10px] bg-yellow-100 text-yellow-800 px-1.5 py-0.5 rounded font-medium">EXTRA</span>}
                                </div>
                                <div className="text-xs text-gray-500 mt-1">
                                    <span className="font-semibold text-gray-900">{item.quantity}{item.unit}</span>
                                    <span className="mx-1">•</span>
                                    <span>{item.nutrition.calories} kcal/100g</span>
                                </div>
                                <div className="text-[10px] text-gray-400 mt-1 flex gap-2">
                                    <span>P: {item.nutrition.protein}g</span>
                                    <span>C: {item.nutrition.carbs}g</span>
                                    <span>F: {item.nutrition.fat}g</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Edit2 size={16} className="text-gray-300" />
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (confirm('Eliminare questo alimento?')) removeItem(item.id);
                                    }}
                                    className="p-2 text-gray-300 hover:text-red-500 transition-colors z-10"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
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


interface PantryItemModalProps {
    onClose: () => void;
    onSave: (item: PantryItem) => void;
    initialData: PantryItem | null;
}

function PantryItemModal({ onClose, onSave, initialData }: PantryItemModalProps) {
    const [name, setName] = useState(initialData?.name || '');
    const [quantity, setQuantity] = useState(initialData?.quantity || 100);
    const [isCondiment, setIsCondiment] = useState(initialData?.isCondiment || false);

    // Nutrition State
    const [calories, setCalories] = useState(initialData?.nutrition.calories || 0);
    const [protein, setProtein] = useState(initialData?.nutrition.protein || 0);
    const [carbs, setCarbs] = useState(initialData?.nutrition.carbs || 0);
    const [fat, setFat] = useState(initialData?.nutrition.fat || 0);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Manual Category Logic
        let category: FoodCategory = 'other';
        if (protein >= carbs && protein >= fat) category = 'protein';
        else if (carbs >= protein && carbs >= fat) category = 'carb';
        else if (fat >= protein && fat >= carbs) category = 'fat';

        // Refine if condiment
        if (isCondiment) category = 'flavor';

        const newItem: PantryItem = {
            id: initialData?.id || Date.now().toString(),
            name,
            quantity,
            unit: 'g',
            nutrition: {
                calories,
                protein,
                carbs,
                fat,
                sugar: 0,
                fiber: 0,
                salt: 0
            },
            isCondiment,
            category
        };

        onSave(newItem);
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-end sm:items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-2xl animate-in slide-in-from-bottom duration-300 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold">{initialData ? 'Modifica Alimento' : 'Aggiungi Alimento'}</h2>
                    <button onClick={onClose} className="p-2 bg-gray-100 rounded-full">✕</button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nome Alimento</label>
                        <input
                            autoFocus={!initialData}
                            type="text"
                            required
                            className="w-full p-3 rounded-lg bg-gray-50 border border-gray-200"
                            placeholder="es. Petto di pollo"
                            value={name}
                            onChange={e => setName(e.target.value)}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Quantità (g)</label>
                            <input
                                type="number"
                                required
                                min="0"
                                className="w-full p-3 rounded-lg bg-gray-50 border border-gray-200"
                                value={quantity}
                                onChange={e => setQuantity(Number(e.target.value))}
                            />
                        </div>
                        <div className="flex items-center pt-6">
                            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={isCondiment}
                                    onChange={e => setIsCondiment(e.target.checked)}
                                    className="w-5 h-5 rounded border-gray-300 text-blue-600"
                                />
                                È un condimento
                            </label>
                        </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-xl space-y-3">
                        <h3 className="text-sm font-bold text-gray-900 flex justify-between">
                            <span>Valori Nutrizionali (per 100g)</span>
                            <span className="text-xs font-normal text-gray-500">Manual Input</span>
                        </h3>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-xs text-gray-500">Calorie (kcal)</label>
                                <input type="number" required min="0" value={calories} onChange={e => setCalories(Number(e.target.value))} className="w-full p-2 rounded border border-gray-200 text-sm" />
                            </div>
                            <div>
                                <label className="text-xs text-gray-500">Proteine (g)</label>
                                <input type="number" required min="0" value={protein} onChange={e => setProtein(Number(e.target.value))} className="w-full p-2 rounded border border-gray-200 text-sm" />
                            </div>
                            <div>
                                <label className="text-xs text-gray-500">Carboidrati (g)</label>
                                <input type="number" required min="0" value={carbs} onChange={e => setCarbs(Number(e.target.value))} className="w-full p-2 rounded border border-gray-200 text-sm" />
                            </div>
                            <div>
                                <label className="text-xs text-gray-500">Grassi (g)</label>
                                <input type="number" required min="0" value={fat} onChange={e => setFat(Number(e.target.value))} className="w-full p-2 rounded border border-gray-200 text-sm" />
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={!name}
                        className="w-full py-4 bg-black text-white font-bold rounded-xl mt-4 hover:bg-gray-800 disabled:opacity-50"
                    >
                        {initialData ? 'Salva Modifiche' : 'Aggiungi alla Dispensa'}
                    </button>

                    {initialData && (
                        <p className="text-center text-xs text-gray-400">
                            Modificare i valori non cambierà le diete già generate.
                        </p>
                    )}
                </form>
            </div>
        </div>
    )
}
