import { createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import type { PantryItem } from '../types';
import { useLocalStorage } from '../hooks/useLocalStorage';

interface PantryContextType {
    items: PantryItem[];
    addItem: (item: PantryItem) => void;
    removeItem: (id: string) => void;
    updateItem: (id: string, updates: Partial<PantryItem>) => void;
    getCondiments: () => PantryItem[];
    getMainItems: () => PantryItem[];
}

const PantryContext = createContext<PantryContextType | undefined>(undefined);

export const PantryProvider = ({ children }: { children: ReactNode }) => {
    const [items, setItems] = useLocalStorage<PantryItem[]>('sfp_pantry_items', []);

    const addItem = (item: PantryItem) => {
        setItems((prev) => [...prev, item]);
    };

    const removeItem = (id: string) => {
        setItems((prev) => prev.filter((item) => item.id !== id));
    };

    const updateItem = (id: string, updates: Partial<PantryItem>) => {
        setItems((prev) =>
            prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
        );
    };

    const getCondiments = () => items.filter((i) => i.categories?.includes('Condimento'));
    const getMainItems = () => items.filter((i) => !i.categories?.includes('Condimento'));

    return (
        <PantryContext.Provider value={{ items, addItem, removeItem, updateItem, getCondiments, getMainItems }}>
            {children}
        </PantryContext.Provider>
    );
};

export const usePantry = () => {
    const context = useContext(PantryContext);
    if (context === undefined) {
        throw new Error('usePantry must be used within a PantryProvider');
    }
    return context;
};
